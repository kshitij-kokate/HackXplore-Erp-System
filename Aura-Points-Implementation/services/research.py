import logging
import nltk
import re
import os
import io
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from PyPDF2 import PdfReader
from models import get_research_papers, get_user, get_users

# Configure logging
logger = logging.getLogger(__name__)

# Create a directory for NLTK data if it doesn't exist
nltk_data_dir = os.path.expanduser('~/nltk_data')
os.makedirs(nltk_data_dir, exist_ok=True)
nltk.data.path.append(nltk_data_dir)

# Initialize NLTK resources - make sure to download all required resources
try:
    nltk.download('stopwords', quiet=True)
    nltk.download('punkt', quiet=True)
    nltk.download('wordnet', quiet=True)
    
    # Simple function to make our code less dependent on specific nltk resources
    def safe_sent_tokenize(text):
        """Safely tokenize text into sentences, with fallback options if nltk fails"""
        try:
            return nltk.tokenize.sent_tokenize(text)
        except Exception as e:
            print(f"NLTK sentence tokenization failed, using regex fallback: {str(e)}")
            return [s.strip() for s in re.split(r'[.!?]\s+', text) if s.strip()]
    
    def safe_word_tokenize(text):
        """Safely tokenize text into words, with fallback options if nltk fails"""
        try:
            return nltk.tokenize.word_tokenize(text)
        except Exception as e:
            print(f"NLTK word tokenization failed, using regex fallback: {str(e)}")
            # Simple word tokenization by splitting on whitespace and punctuation
            return [w for w in re.findall(r'\b\w+\b', text.lower()) if w]
        
    # Override the tokenize functions to use our safer versions
    sent_tokenize = safe_sent_tokenize
    word_tokenize = safe_word_tokenize
    
except Exception as e:
    logger.error(f"Error setting up NLTK resources: {str(e)}")
    # Define simple fallback tokenizers in case NLTK fails completely
    def sent_tokenize(text):
        """Fallback sentence tokenizer using regex when NLTK is unavailable"""
        if not text:
            return []
        return [s.strip() for s in re.split(r'[.!?]\s+', text) if s.strip()]
        
    def word_tokenize(text):
        """Fallback word tokenizer using regex when NLTK is unavailable"""
        if not text:
            return []
        # Simple word tokenization by splitting on whitespace and punctuation
        return [w for w in re.findall(r'\b\w+\b', text.lower()) if w]

# Handle stemmer safely
try:
    stemmer = PorterStemmer()
except Exception as e:
    print(f"Error loading stemmer: {str(e)}")
    # Create a simple no-op stemmer as fallback
    class FallbackStemmer:
        def stem(self, word):
            return word  # Just return the word as is
    stemmer = FallbackStemmer()

# Handle stopwords safely
try:
    stop_words = set(stopwords.words('english'))
except Exception as e:
    print(f"Error loading stopwords: {str(e)}")
    # Create a basic set of common English stop words as fallback
    stop_words = set(['a', 'an', 'the', 'and', 'or', 'but', 'if', 'because', 'as', 'what',
                      'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'of', 'from',
                      'into', 'during', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
                      'have', 'has', 'had', 'do', 'does', 'did', 'this', 'that', 'these', 'those'])

def preprocess_text(text):
    """Clean and preprocess text for NLP"""
    # Convert to lowercase and remove punctuation
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    
    # Tokenize and remove stop words
    tokens = word_tokenize(text)
    tokens = [token for token in tokens if token not in stop_words]
    
    # Stem tokens
    stemmed_tokens = [stemmer.stem(token) for token in tokens]
    
    return ' '.join(stemmed_tokens)

def create_paper_vectors(papers):
    """Create TF-IDF vectors for papers based on their content"""
    paper_texts = []
    paper_ids = []
    
    for paper in papers:
        # Combine paper information into a single text string for vectorization
        paper_text = f"{paper['title']} {paper['abstract']} {' '.join(paper['keywords'])}"
        paper_texts.append(preprocess_text(paper_text))
        paper_ids.append(paper['id'])
    
    # Create TF-IDF vectors
    vectorizer = TfidfVectorizer()
    paper_vectors = vectorizer.fit_transform(paper_texts)
    
    return vectorizer, paper_vectors, paper_ids

def get_recommended_papers(user_id, max_recommendations=5):
    """Generate paper recommendations for a user based on their interests and profile"""
    try:
        user = get_user(user_id)
        if not user:
            logger.error(f"User {user_id} not found")
            return []
        
        all_papers = get_research_papers()
        
        # Create paper vectors
        vectorizer, paper_vectors, paper_ids = create_paper_vectors(all_papers)
        
        # Create a user profile vector based on their interests and research areas
        user_interests = []
        if user.get('role') == 'student':
            user_interests = user.get('interests', [])
        elif user.get('role') == 'faculty':
            user_interests = user.get('research_areas', [])
        
        if not user_interests:
            logger.warning(f"No interests found for user {user_id}")
            # Return some default recommendations if no interests are available
            return all_papers[:max_recommendations]
        
        user_profile = preprocess_text(' '.join(user_interests))
        
        # Transform user profile using the same vectorizer
        user_vector = vectorizer.transform([user_profile])
        
        # Calculate similarity scores
        similarity_scores = cosine_similarity(user_vector, paper_vectors).flatten()
        
        # Get indices of top recommendations
        top_indices = similarity_scores.argsort()[-max_recommendations:][::-1]
        
        # Get recommended paper IDs
        recommended_paper_ids = [paper_ids[i] for i in top_indices]
        
        # Get full paper details for recommended papers
        recommended_papers = [paper for paper in all_papers if paper['id'] in recommended_paper_ids]
        
        return recommended_papers
    
    except Exception as e:
        logger.error(f"Error generating paper recommendations: {str(e)}")
        return []

def find_similar_papers(paper_id, max_results=3):
    """Find papers similar to a given paper"""
    try:
        all_papers = get_research_papers()
        target_paper = None
        
        for paper in all_papers:
            if paper['id'] == paper_id:
                target_paper = paper
                break
        
        if not target_paper:
            logger.error(f"Paper {paper_id} not found")
            return []
        
        # Create paper vectors
        vectorizer, paper_vectors, paper_ids = create_paper_vectors(all_papers)
        
        # Find the index of the target paper
        target_index = paper_ids.index(paper_id)
        
        # Get the target paper's vector
        target_vector = paper_vectors[target_index]
        
        # Calculate similarity with all papers
        similarity_scores = cosine_similarity(target_vector, paper_vectors).flatten()
        
        # Set the target paper's similarity to 0 to exclude it from results
        similarity_scores[target_index] = 0
        
        # Get indices of top similar papers
        top_indices = similarity_scores.argsort()[-max_results:][::-1]
        
        # Get similar paper IDs
        similar_paper_ids = [paper_ids[i] for i in top_indices]
        
        # Get full paper details for similar papers
        similar_papers = [paper for paper in all_papers if paper['id'] in similar_paper_ids]
        
        return similar_papers
    
    except Exception as e:
        logger.error(f"Error finding similar papers: {str(e)}")
        return []

def search_papers(query, max_results=10):
    """Search for papers by keywords, title or abstract"""
    try:
        all_papers = get_research_papers()
        
        if not query.strip():
            return all_papers[:max_results]
        
        # Preprocess the query
        processed_query = preprocess_text(query)
        
        # Create paper vectors
        vectorizer, paper_vectors, paper_ids = create_paper_vectors(all_papers)
        
        # Transform query using the same vectorizer
        query_vector = vectorizer.transform([processed_query])
        
        # Calculate similarity scores
        similarity_scores = cosine_similarity(query_vector, paper_vectors).flatten()
        
        # Get indices of top matches
        top_indices = similarity_scores.argsort()[-max_results:][::-1]
        
        # Only include papers with non-zero similarity
        filtered_indices = [i for i in top_indices if similarity_scores[i] > 0]
        
        # Get matching paper IDs
        matching_paper_ids = [paper_ids[i] for i in filtered_indices]
        
        # Get full paper details for matching papers
        matching_papers = [paper for paper in all_papers if paper['id'] in matching_paper_ids]
        
        return matching_papers
    
    except Exception as e:
        logger.error(f"Error searching papers: {str(e)}")
        return []

def find_potential_collaborators(user_id, max_results=3):
    """Find potential research collaborators based on shared interests"""
    try:
        user = get_user(user_id)
        if not user:
            logger.error(f"User {user_id} not found")
            return []
        
        # Get all users
        all_users = get_users()
        if not all_users:
            logger.error("Failed to get user list")
            return []
            
        # Filter out the current user
        all_users = [u for u in all_users if u['id'] != user_id]
        
        user_interests = []
        if user.get('role') == 'student':
            user_interests = user.get('interests', [])
        elif user.get('role') == 'faculty':
            user_interests = user.get('research_areas', [])
        
        if not user_interests:
            logger.warning(f"No interests found for user {user_id}")
            return []
        
        # Calculate interest overlap for each potential collaborator
        collaborator_scores = []
        for other_user in all_users:
            other_interests = []
            if other_user.get('role') == 'student':
                other_interests = other_user.get('interests', [])
            elif other_user.get('role') == 'faculty':
                other_interests = other_user.get('research_areas', [])
            
            if not other_interests:
                continue
            
            # Calculate Jaccard similarity for interests
            user_interest_set = set(i.lower() for i in user_interests)
            other_interest_set = set(i.lower() for i in other_interests)
            
            intersection = len(user_interest_set.intersection(other_interest_set))
            union = len(user_interest_set.union(other_interest_set))
            
            if union == 0:
                similarity = 0
            else:
                similarity = intersection / union
            
            collaborator_scores.append((other_user, similarity))
        
        # Sort by similarity score (descending)
        collaborator_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Extract just the user objects
        potential_collaborators = [item[0] for item in collaborator_scores[:max_results]]
        
        return potential_collaborators
    
    except Exception as e:
        logger.error(f"Error finding potential collaborators: {str(e)}")
        return []

def extract_key_findings(paper_id):
    """Extract and summarize key findings from a research paper"""
    try:
        all_papers = get_research_papers()
        paper = None
        
        for p in all_papers:
            if p['id'] == paper_id:
                paper = p
                break
        
        if not paper:
            logger.error(f"Paper {paper_id} not found")
            return []
        
        # In a real system, we would use more sophisticated NLP techniques
        # For this example, we'll use a simple rule-based approach to extract key sentences
        
        # Extract sentences from the abstract
        abstract = paper.get('abstract', '')
        sentences = re.split(r'(?<=[.!?])\s+', abstract)
        
        # Look for indicator phrases that often signal key findings
        indicators = ['find that', 'show that', 'demonstrate', 'conclude', 'result', 'findings', 'key', 'important']
        
        key_findings = []
        for sentence in sentences:
            for indicator in indicators:
                if indicator in sentence.lower():
                    key_findings.append(sentence.strip())
                    break
        
        # If no key findings were extracted, return the first and last sentences
        if not key_findings and len(sentences) > 1:
            key_findings = [sentences[0], sentences[-1]]
        elif not key_findings and sentences:
            key_findings = [sentences[0]]
        
        return key_findings
    
    except Exception as e:
        logger.error(f"Error extracting key findings: {str(e)}")
        return []

def extract_text_from_pdf(pdf_file):
    """Extract text from a PDF file"""
    try:
        pdf_reader = PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        return ""

def analyze_pdf(pdf_file, analysis_type):
    """Analyze PDF content based on requested analysis type"""
    try:
        filename = pdf_file.filename
        pdf_text = extract_text_from_pdf(pdf_file)
        
        if not pdf_text:
            return {
                "success": False,
                "filename": filename,
                "error": "Could not extract text from the PDF file. The file might be encrypted, scanned, or contain no extractable text."
            }
        
        # Different analysis based on the requested type
        if analysis_type == 'summary':
            result = generate_summary(pdf_text)
        elif analysis_type == 'literature-review':
            result = generate_literature_review(pdf_text)
        elif analysis_type == 'key-findings':
            result = extract_pdf_key_findings(pdf_text)
        elif analysis_type == 'methodology':
            result = extract_methodology(pdf_text)
        else:
            result = generate_summary(pdf_text)
        
        return {
            "success": True,
            "filename": filename,
            "analysis_type": analysis_type,
            "result": result
        }
        
    except Exception as e:
        logger.error(f"Error analyzing PDF: {str(e)}")
        return {
            "success": False,
            "error": f"Error analyzing PDF: {str(e)}"
        }

def generate_summary(text, max_sentences=5):
    """Generate a summary of the PDF text"""
    try:
        # Check if we have enough text to work with
        if not text or len(text.strip()) < 100:
            return "The PDF doesn't contain enough extractable text to generate a summary."
            
        # Extract sentences safely
        try:
            sentences = sent_tokenize(text)
        except Exception as e:
            logger.error(f"Error tokenizing text: {str(e)}")
            # Fallback to simple sentence splitting if nltk fails
            sentences = [s.strip() for s in re.split(r'[.!?]\s+', text) if s.strip()]
        
        if not sentences:
            return "Could not identify sentences in the document. The PDF may contain non-standard text formatting."
            
        # If we don't have many sentences, return all the text
        if len(sentences) <= max_sentences:
            return text
        
        try:
            # Calculate sentence importance using TF-IDF
            vectorizer = TfidfVectorizer(stop_words='english')
            sentence_vectors = vectorizer.fit_transform(sentences)
            
            # Calculate average embedding for the entire document
            document_vector = sentence_vectors.mean(axis=0)
            
            # Calculate similarity of each sentence to the document average
            similarities = cosine_similarity(sentence_vectors, document_vector)
            
            # Get indices of top sentences
            top_indices = similarities.flatten().argsort()[-max_sentences:]
            top_indices.sort()  # Sort indices to maintain original order
            
            # Extract top sentences and join them
            summary = [sentences[i] for i in top_indices]
            return ' '.join(summary)
        
        except Exception as e:
            logger.error(f"Error in TF-IDF calculations: {str(e)}")
            # Fallback to a simpler summary method - just take the first few sentences
            return ' '.join(sentences[:max_sentences])
            
    except Exception as e:
        logger.error(f"Error generating summary: {str(e)}")
        return "Could not generate a summary. The PDF may contain complex formatting or non-standard text."

def generate_literature_review(text):
    """Generate a literature review from the PDF text"""
    try:
        # Check if we have enough text to work with
        if not text or len(text.strip()) < 100:
            return "The PDF doesn't contain enough extractable text to generate a literature review."
        
        # First, try to find specific literature review sections
        sections = re.split(r'\n\s*\n', text)
        
        # Look for common literature review section headers
        lit_review_patterns = [
            r'(?i)literature\s+review',
            r'(?i)related\s+work',
            r'(?i)background',
            r'(?i)previous\s+research',
            r'(?i)state\s+of\s+the\s+art'
        ]
        
        lit_review_section = ""
        for section in sections:
            if any(re.search(pattern, section[:100]) for pattern in lit_review_patterns):
                lit_review_section = section
                break
        
        # If we found a dedicated literature review section, process it
        if lit_review_section:
            try:
                sentences = sent_tokenize(lit_review_section)
                if len(sentences) > 10:
                    sentences = sentences[:10]  # Take first 10 sentences
                return " ".join(sentences)
            except Exception as e:
                logger.error(f"Error tokenizing literature review section: {str(e)}")
                # Simple fallback if tokenization fails
                return lit_review_section[:1000] + "..."
        
        # If no dedicated section, extract sentences safely
        try:
            sentences = sent_tokenize(text)
        except Exception as e:
            logger.error(f"Error tokenizing text: {str(e)}")
            # Fallback to simple sentence splitting
            sentences = [s.strip() for s in re.split(r'[.!?]\s+', text) if s.strip()]
        
        lit_review_sentences = []
        
        # Extract sentences containing references
        reference_patterns = [r'\(\w+\s*et al\.,?\s*\d{4}\)', r'\[\d+\]', r'\[\w+\s*\d{4}\]']
        for sentence in sentences:
            try:
                if any(re.search(pattern, sentence) for pattern in reference_patterns):
                    lit_review_sentences.append(sentence)
            except Exception:
                continue  # Skip problematic sentences
        
        # If we found sentences with references, use them
        if lit_review_sentences:
            # Limit to a reasonable number of sentences
            if len(lit_review_sentences) > 10:
                # Take a few from beginning, middle, and end
                lit_review_sentences = (
                    lit_review_sentences[:3] + 
                    lit_review_sentences[len(lit_review_sentences)//2-2:len(lit_review_sentences)//2+1] +
                    lit_review_sentences[-3:]
                )
            
            return "\n\n".join(lit_review_sentences)
        
        # Fallback to a summary if no literature review sections found
        logger.info("No literature review content found, falling back to summary")
        return generate_summary(text, max_sentences=8)
        
    except Exception as e:
        logger.error(f"Error generating literature review: {str(e)}")
        return "Could not generate a literature review. The PDF may contain complex formatting or non-standard text."

def extract_pdf_key_findings(text):
    """Extract key findings from the PDF text"""
    try:
        # Make sure we have text to analyze
        if not text or len(text.strip()) < 100:
            return ["The PDF doesn't contain enough extractable text to analyze."]
            
        # Extract sentences safely
        try:
            sentences = sent_tokenize(text)
        except Exception as e:
            logger.error(f"Error tokenizing text: {str(e)}")
            # Fallback to simple sentence splitting if nltk fails
            sentences = [s.strip() for s in re.split(r'[.!?]\s+', text) if s.strip()]
        
        if not sentences:
            return ["Could not identify sentences in the document. The PDF may contain non-standard text formatting."]
        
        # Look for indicator phrases that often signal key findings
        indicators = [
            'find that', 'show that', 'demonstrate', 'conclude', 'conclusion',
            'result', 'findings', 'key', 'important', 'significant',
            'contribute', 'contribution', 'novel', 'innovative'
        ]
        
        key_findings = []
        for sentence in sentences:
            for indicator in indicators:
                if indicator in sentence.lower():
                    key_findings.append(sentence.strip())
                    break
        
        # If we found too many, limit to the most relevant ones
        if len(key_findings) > 10:
            key_findings = key_findings[:10]
        
        # If no key findings were extracted, extract from conclusion section
        if not key_findings:
            conclusion_pattern = r'(?i)conclusion'
            conclusion_section = ""
            sections = re.split(r'\n\s*\n', text)
            
            for i, section in enumerate(sections):
                if re.search(conclusion_pattern, section[:50]):
                    conclusion_section = section
                    break
            
            if conclusion_section:
                try:
                    conclusion_sentences = sent_tokenize(conclusion_section)
                except Exception:
                    conclusion_sentences = [s.strip() for s in re.split(r'[.!?]\s+', conclusion_section) if s.strip()]
                    
                key_findings = conclusion_sentences[:min(5, len(conclusion_sentences))]
        
        # If still no key findings, use the abstract or first paragraph
        if not key_findings:
            # Look for the abstract section
            abstract_pattern = r'(?i)abstract'
            abstract_section = ""
            sections = re.split(r'\n\s*\n', text)
            
            for section in sections:
                if re.search(abstract_pattern, section[:50]):
                    abstract_section = section
                    break
            
            if abstract_section:
                try:
                    abstract_sentences = sent_tokenize(abstract_section)
                except Exception:
                    abstract_sentences = [s.strip() for s in re.split(r'[.!?]\s+', abstract_section) if s.strip()]
                    
                key_findings = abstract_sentences
            else:
                # Use first paragraph if no abstract found
                paragraphs = re.split(r'\n\s*\n', text)
                if paragraphs:
                    try:
                        first_paragraph_sentences = sent_tokenize(paragraphs[0])
                    except Exception:
                        first_paragraph_sentences = [s.strip() for s in re.split(r'[.!?]\s+', paragraphs[0]) if s.strip()]
                        
                    key_findings = first_paragraph_sentences
        
        # If we still have no findings, provide a helpful message
        if not key_findings:
            return ["No key findings could be identified in this document. Try using the Summary analysis type instead."]
            
        return key_findings
        
    except Exception as e:
        logger.error(f"Error extracting key findings from PDF: {str(e)}")
        return ["Could not extract key findings. The PDF may contain complex formatting or non-standard text."]

def extract_methodology(text):
    """Extract methodology information from the PDF text"""
    try:
        # Check if we have enough text to work with
        if not text or len(text.strip()) < 100:
            return ["The PDF doesn't contain enough extractable text to analyze."]
            
        # Look for methodology section
        method_patterns = [
            r'(?i)method(s|ology)?',
            r'(?i)approach',
            r'(?i)experimental(\s+setup)?',
            r'(?i)materials\s+and\s+methods',
            r'(?i)procedure'
        ]
        
        sections = re.split(r'\n\s*\n', text)
        method_section = ""
        
        # Try to find a methodology section
        for section in sections:
            try:
                if any(re.search(pattern, section[:100]) for pattern in method_patterns):
                    method_section = section
                    break
            except Exception:
                continue  # Skip problematic sections
        
        if method_section:
            # Limit length of method section to a reasonable size
            try:
                sentences = sent_tokenize(method_section)
            except Exception as e:
                logger.error(f"Error tokenizing methodology section: {str(e)}")
                # Fallback to simple sentence splitting
                sentences = [s.strip() for s in re.split(r'[.!?]\s+', method_section) if s.strip()]
                
            if not sentences:
                return ["Found a methodology section but could not extract readable sentences."]
                
            if len(sentences) > 10:
                sentences = sentences[:10]
            return sentences
        
        # If no methodology section found, look for sentences that might describe methods
        method_keywords = [
            'experiment', 'study', 'analysis', 'technique', 'approach',
            'measure', 'collect', 'dataset', 'sample', 'participant',
            'interview', 'survey', 'questionnaire', 'observation',
            'algorithm', 'model', 'simulation', 'parameter'
        ]
        
        try:
            sentences = sent_tokenize(text)
        except Exception as e:
            logger.error(f"Error tokenizing text: {str(e)}")
            # Fallback to simple sentence splitting
            sentences = [s.strip() for s in re.split(r'[.!?]\s+', text) if s.strip()]
            
        if not sentences:
            return ["Could not identify sentences in the document. The PDF may contain non-standard text formatting."]
            
        method_sentences = []
        
        for sentence in sentences:
            try:
                if any(keyword in sentence.lower() for keyword in method_keywords):
                    method_sentences.append(sentence)
                    if len(method_sentences) >= 8:
                        break
            except Exception:
                continue  # Skip problematic sentences
        
        return method_sentences if method_sentences else ["No methodology could be identified in this document. Try using the Summary analysis type instead."]
        
    except Exception as e:
        logger.error(f"Error extracting methodology from PDF: {str(e)}")
        return ["Could not extract methodology. The PDF may contain complex formatting or non-standard text."]
