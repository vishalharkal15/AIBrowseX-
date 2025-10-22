from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import anthropic
import os
from dotenv import load_dotenv
import uvicorn

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(
    title="AIBrowseX Backend",
    description="AI-powered browser backend with Claude Sonnet 4.5",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Anthropic client
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not ANTHROPIC_API_KEY:
    print("WARNING: ANTHROPIC_API_KEY not found in environment variables!")
    client = None
else:
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

# Models
class AskAIRequest(BaseModel):
    question: str
    context: Optional[str] = None

class SummaryRequest(BaseModel):
    url: str
    content: str

class AnalyzeRequest(BaseModel):
    url: str
    content: str
    analysis_type: str = "general"

class AIResponse(BaseModel):
    answer: str
    model: str = "claude-sonnet-4-20250514"

class SummaryResponse(BaseModel):
    summary: str
    model: str = "claude-sonnet-4-20250514"

class AnalysisResponse(BaseModel):
    analysis: str
    analysis_type: str
    model: str = "claude-sonnet-4-20250514"

# ============================
# Health Check Endpoint
# ============================
@app.get("/health")
@app.head("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AIBrowseX Backend",
        "version": "1.0.0",
        "ai_available": client is not None
    }

# ============================
# AI Question Answering
# ============================
@app.post("/askAI", response_model=AIResponse)
async def ask_ai(request: AskAIRequest):
    """
    Ask AI a question with optional page context
    """
    if not client:
        raise HTTPException(
            status_code=503,
            detail="AI service not available. Please configure ANTHROPIC_API_KEY"
        )
    
    try:
        # Prepare the prompt
        if request.context:
            system_prompt = """You are an intelligent AI assistant integrated into a web browser. 
You help users understand and analyze web pages. Provide clear, concise, and helpful answers.
Always base your answers on the provided context when relevant."""
            
            user_message = f"""Context from current webpage:
{request.context}

User question: {request.question}

Please provide a helpful answer based on the context above."""
        else:
            system_prompt = """You are an intelligent AI assistant integrated into a web browser. 
Provide clear, concise, and helpful answers to user questions."""
            user_message = request.question
        
        # Call Claude API
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2048,
            system=system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": user_message
                }
            ]
        )
        
        answer = message.content[0].text
        
        return AIResponse(
            answer=answer,
            model=message.model
        )
        
    except anthropic.APIError as e:
        raise HTTPException(status_code=500, detail=f"Anthropic API error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# ============================
# Webpage Summarization
# ============================
@app.post("/summary", response_model=SummaryResponse)
async def summarize_page(request: SummaryRequest):
    """
    Generate a summary of a webpage
    """
    if not client:
        raise HTTPException(
            status_code=503,
            detail="AI service not available. Please configure ANTHROPIC_API_KEY"
        )
    
    try:
        system_prompt = """You are an expert at summarizing web content. 
Create clear, concise summaries that capture the main points and key information.
Focus on the most important and relevant details."""
        
        user_message = f"""Please provide a comprehensive summary of the following webpage:

URL: {request.url}

Content:
{request.content[:8000]}  

Create a well-structured summary with:
1. Main topic/purpose
2. Key points (3-5 bullet points)
3. Important details or conclusions"""
        
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": user_message
                }
            ]
        )
        
        summary = message.content[0].text
        
        return SummaryResponse(
            summary=summary,
            model=message.model
        )
        
    except anthropic.APIError as e:
        raise HTTPException(status_code=500, detail=f"Anthropic API error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# ============================
# Content Analysis
# ============================
@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_content(request: AnalyzeRequest):
    """
    Analyze webpage content based on analysis type
    """
    if not client:
        raise HTTPException(
            status_code=503,
            detail="AI service not available. Please configure ANTHROPIC_API_KEY"
        )
    
    try:
        # Different prompts based on analysis type
        analysis_prompts = {
            "general": """Provide a general analysis of this webpage including:
- Content type and purpose
- Target audience
- Main themes
- Quality and credibility indicators""",
            
            "sentiment": """Analyze the sentiment and tone of this webpage:
- Overall sentiment (positive, negative, neutral)
- Emotional tone
- Bias indicators
- Language style""",
            
            "key_points": """Extract and list the key points from this webpage:
- Main arguments or ideas
- Supporting facts
- Important statistics or data
- Actionable insights""",
            
            "entities": """Extract and categorize entities from this webpage:
- People mentioned
- Organizations
- Locations
- Products or technologies
- Important dates or events"""
        }
        
        analysis_prompt = analysis_prompts.get(
            request.analysis_type, 
            analysis_prompts["general"]
        )
        
        system_prompt = f"""You are an expert content analyzer. 
Provide detailed, insightful analysis of web content."""
        
        user_message = f"""URL: {request.url}

Content:
{request.content[:8000]}

Analysis Request:
{analysis_prompt}"""
        
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1536,
            system=system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": user_message
                }
            ]
        )
        
        analysis = message.content[0].text
        
        return AnalysisResponse(
            analysis=analysis,
            analysis_type=request.analysis_type,
            model=message.model
        )
        
    except anthropic.APIError as e:
        raise HTTPException(status_code=500, detail=f"Anthropic API error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# ============================
# Root Endpoint
# ============================
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "service": "AIBrowseX Backend API",
        "version": "1.0.0",
        "endpoints": {
            "health": "GET /health",
            "ask_ai": "POST /askAI",
            "summary": "POST /summary",
            "analyze": "POST /analyze"
        },
        "documentation": "/docs"
    }

# ============================
# Run Server
# ============================
if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Starting AIBrowseX Backend Server")
    print("=" * 60)
    print(f"Server: http://localhost:8000")
    print(f"Docs: http://localhost:8000/docs")
    print(f"AI Available: {client is not None}")
    print("=" * 60)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
