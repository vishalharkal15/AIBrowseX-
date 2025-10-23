from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import anthropic
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(
    title="AIBrowseX API",
    description="AI-powered browser backend with Claude Sonnet 4.5",
    version="1.0.0"
)

# CORS configuration for Vercel
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
    success: bool
    response: str
    error: Optional[str] = None

# Health check endpoint
@app.get("/")
@app.head("/")
async def root():
    return {
        "status": "healthy",
        "service": "AIBrowseX API",
        "version": "1.0.0",
        "ai_status": "ready" if client else "no_api_key"
    }

@app.get("/health")
@app.head("/health")
async def health_check():
    return {
        "status": "healthy",
        "ai_available": client is not None
    }

# AI Chat endpoint
@app.post("/api/askAI")
async def ask_ai(request: AskAIRequest):
    if not client:
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Please configure ANTHROPIC_API_KEY."
        )
    
    try:
        # Prepare the message
        user_message = request.question
        if request.context:
            user_message = f"Context: {request.context}\n\nQuestion: {request.question}"
        
        # Call Claude API
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2048,
            messages=[
                {"role": "user", "content": user_message}
            ]
        )
        
        # Extract response
        response_text = message.content[0].text
        
        return AIResponse(
            success=True,
            response=response_text
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI request failed: {str(e)}"
        )

# Summarize webpage endpoint
@app.post("/api/summary")
async def generate_summary(request: SummaryRequest):
    if not client:
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Please configure ANTHROPIC_API_KEY."
        )
    
    try:
        # Prepare prompt for summarization
        prompt = f"""Please provide a concise summary of the following webpage content from {request.url}:

{request.content[:8000]}

Provide a clear, structured summary with:
1. Main topic/purpose
2. Key points (3-5 bullet points)
3. Conclusion or takeaway

Keep it under 200 words."""
        
        # Call Claude API
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Extract response
        summary = message.content[0].text
        
        return AIResponse(
            success=True,
            response=summary
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Summary generation failed: {str(e)}"
        )

# Analyze webpage endpoint
@app.post("/api/analyze")
async def analyze_content(request: AnalyzeRequest):
    if not client:
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Please configure ANTHROPIC_API_KEY."
        )
    
    try:
        # Prepare analysis prompt based on type
        analysis_prompts = {
            "general": "Analyze the overall content, structure, and key themes",
            "security": "Analyze for security concerns, privacy issues, and safety",
            "readability": "Analyze readability, writing quality, and clarity",
            "technical": "Analyze technical aspects, code quality, and implementation",
            "seo": "Analyze SEO optimization, keywords, and search visibility"
        }
        
        analysis_focus = analysis_prompts.get(
            request.analysis_type,
            analysis_prompts["general"]
        )
        
        prompt = f"""Perform a detailed analysis of this webpage from {request.url}.

Focus: {analysis_focus}

Content:
{request.content[:8000]}

Provide:
1. Analysis findings
2. Strengths
3. Areas for improvement
4. Recommendations"""
        
        # Call Claude API
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2048,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Extract response
        analysis = message.content[0].text
        
        return AIResponse(
            success=True,
            response=analysis
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

# For Vercel serverless deployment
# This allows Vercel to handle the app
handler = app
