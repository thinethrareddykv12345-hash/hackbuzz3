import os
import json
import re
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai

load_dotenv()

# Configure Gemini with the most compatible model
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-pro")

app = FastAPI(title="TeamPulse AI Engine", version="2.0.0")

# CORS
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ Pydantic Models ============
class ContributionInput(BaseModel):
    description: str
    category: str
    githubLink: Optional[str] = None
    hoursSpent: Optional[float] = None

class SummaryInput(BaseModel):
    contributions: List[Dict[str, Any]]

class PeerReviewData(BaseModel):
    ratings: dict
    comment: str

# ============ Endpoints ============

@app.post("/analyze-contribution")
async def analyze_contribution(data: ContributionInput):
    prompt = f"Analyze this student contribution log. Respond in JSON. Description: {data.description}"
    try:
        response = model.generate_content(prompt)
        return {"summary": response.text, "status": "success"}
    except Exception as e:
        return {"summary": data.description, "status": "fallback"}

@app.post("/summarize-feedback")
async def summarize_feedback(reviews: list[PeerReviewData]):
    if not reviews:
        return {"summary": "No feedback received yet."}
    
    formatted_reviews = "\n".join([f"Rating: {r.ratings}, Comment: {r.comment}" for r in reviews])
    prompt = f"As a professional team coach, summarize these peer reviews for a student. Focus on growth. Reviews:\n{formatted_reviews}"
    
    try:
        response = model.generate_content(prompt)
        return {"summary": response.text}
    except Exception as e:
        print(f"❌ AI Error: {str(e)}")
        return {"summary": "AI summary currently unavailable. Check your API key."}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
