import os
import json
import re
import requests
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="TeamPulse AI Engine (Grok Powered)", version="3.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

XAI_API_KEY = os.getenv("XAI_API_KEY")

def ask_grok(prompt: str) -> str:
    if not XAI_API_KEY:
        return "Grok API Key missing. Please set XAI_API_KEY in .env"
    
    try:
        url = "https://api.x.ai/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {XAI_API_KEY}"
        }
        payload = {
            "model": "grok-beta",
            "messages": [
                {"role": "system", "content": "You are a supportive college team coach AI."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7
        }
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"❌ Grok Error: {str(e)}")
        return f"Error connecting to Grok: {str(e)}"

# ============ Pydantic Models ============
class PeerReviewData(BaseModel):
    ratings: dict
    comment: str

class ContributionInput(BaseModel):
    description: str
    category: str

# ============ Endpoints ============

@app.post("/summarize-feedback")
async def summarize_feedback(reviews: list[PeerReviewData]):
    if not reviews:
        return {"summary": "No feedback yet."}
    
    text = "\n".join([f"Ratings: {r.ratings}, Comment: {r.comment}" for r in reviews])
    prompt = f"Summarize these peer reviews for a student. Be constructive and encouraging:\n{text}"
    
    summary = ask_grok(prompt)
    return {"summary": summary}

@app.post("/analyze-contribution")
async def analyze_contribution(data: ContributionInput):
    prompt = f"Analyze this student work: {data.description}. Give 1 sentence of encouragement."
    feedback = ask_grok(prompt)
    return {"summary": feedback, "status": "success"}

@app.get("/health")
async def health():
    return {"status": "healthy", "engine": "Grok-Beta"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

