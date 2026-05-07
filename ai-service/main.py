"""
TeamPulse AI - FastAPI AI Microservice
Gemini-powered contribution analysis engine
"""
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

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-pro")

app = FastAPI(title="TeamPulse AI Engine", version="1.0.0")

# CORS
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
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
    userId: Optional[str] = None
    projectId: Optional[str] = None

class SummaryInput(BaseModel):
    contributions: List[Dict[str, Any]]
    projectId: Optional[str] = None

class ImbalanceInput(BaseModel):
    memberLogs: Dict[str, List[Dict[str, Any]]]

class SentimentInput(BaseModel):
    text: str
    ratings: Optional[Dict[str, int]] = None

class ResumeBulletsInput(BaseModel):
    contributions: List[Dict[str, Any]]

# ============ Helper: Parse JSON from Gemini ============

def parse_json_response(text: str) -> dict:
    """Extract JSON from Gemini response text."""
    # Try to find JSON block
    json_match = re.search(r'```json\s*(.*?)\s*```', text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError:
            pass
    # Try direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # Try to find any JSON object
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(0))
        except json.JSONDecodeError:
            pass
    return {}

# ============ Endpoints ============

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "TeamPulse AI Engine"}


@app.post("/analyze-contribution")
async def analyze_contribution(data: ContributionInput):
    """Analyze a single contribution using Gemini AI."""
    prompt = f"""You are a supportive AI assistant for a college team collaboration platform.
Analyze this student's daily contribution log. Be encouraging and constructive.
NEVER be harsh, judgmental, or use surveillance language.

Contribution: "{data.description}"
Category: {data.category}
GitHub Link: {data.githubLink or "None"}
Hours Spent: {data.hoursSpent or "Not specified"}

Respond in STRICT JSON format only:
{{
  "difficultyScore": <1-10 integer>,
  "effortScore": <1-10 integer>,
  "qualityScore": <1-10 integer>,
  "overallScore": <1-10 integer>,
  "detectedCategory": "<detected work category>",
  "skillsUsed": ["skill1", "skill2"],
  "sentiment": "<positive|neutral|negative>",
  "sentimentScore": <float -1 to 1>,
  "summary": "<1-2 sentence professional summary of the work>",
  "feedback": "<supportive, encouraging feedback for the student>",
  "resumeBullet": "<professional resume bullet point for this work>",
  "isRepetitive": <true|false>,
  "isLowEffort": <true|false>
}}"""

    try:
        response = model.generate_content(prompt)
        result = parse_json_response(response.text)
        if not result:
            result = {
                "difficultyScore": 5, "effortScore": 5, "qualityScore": 5,
                "overallScore": 5, "detectedCategory": data.category,
                "skillsUsed": [], "sentiment": "neutral", "sentimentScore": 0.0,
                "summary": data.description, "feedback": "Keep up the great work!",
                "resumeBullet": data.description, "isRepetitive": False, "isLowEffort": False,
            }
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")


@app.post("/generate-summary")
async def generate_summary(data: SummaryInput):
    """Generate a weekly project summary."""
    logs_text = "\n".join([
        f"- {c.get('user','Unknown')}: {c.get('description','')} [{c.get('category','')}] on {c.get('date','')}"
        for c in data.contributions
    ])

    prompt = f"""You are a supportive AI project assistant. Generate a weekly summary for a college team project.
Be positive and constructive. Focus on progress, not blame.

This week's contribution logs:
{logs_text}

Respond in STRICT JSON format:
{{
  "completedWork": ["item1", "item2"],
  "pendingTasks": ["task1", "task2"],
  "teamInsights": "<diplomatic team insight paragraph>",
  "mostActiveAreas": ["area1", "area2"],
  "potentialBlockers": ["blocker1"],
  "overallSentiment": "<positive|neutral|mixed>",
  "healthScore": <0-100 integer>,
  "contributionBalance": "<diplomatic assessment of team contribution balance>",
  "rawSummary": "<full narrative weekly summary paragraph>"
}}"""

    try:
        response = model.generate_content(prompt)
        result = parse_json_response(response.text)
        if not result:
            result = {
                "completedWork": [], "pendingTasks": [],
                "teamInsights": "The team has been actively contributing this week.",
                "mostActiveAreas": [], "potentialBlockers": [],
                "overallSentiment": "positive", "healthScore": 75,
                "contributionBalance": "The team appears to be collaborating well.",
                "rawSummary": "Weekly activities have been logged by team members."
            }
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summary generation failed: {str(e)}")


@app.post("/detect-imbalance")
async def detect_imbalance(data: ImbalanceInput):
    """Detect contribution imbalance using diplomatic AI language."""
    summary_parts = []
    for member, logs in data.memberLogs.items():
        summary_parts.append(f"{member}: {len(logs)} contributions")

    prompt = f"""You are an ethical AI assistant. Analyze team contribution balance for a college group project.
CRITICAL RULES:
- NEVER publicly shame anyone
- Use diplomatic, supportive language
- Focus on opportunities, not blame
- Suggest improvements gently

Team contribution counts:
{chr(10).join(summary_parts)}

Respond in STRICT JSON format:
{{
  "isBalanced": <true|false>,
  "balanceScore": <0-100>,
  "insights": ["<diplomatic insight 1>", "<diplomatic insight 2>"],
  "suggestions": ["<constructive suggestion 1>", "<constructive suggestion 2>"],
  "riskLevel": "<low|medium|high>"
}}"""

    try:
        response = model.generate_content(prompt)
        result = parse_json_response(response.text)
        if not result:
            result = {
                "isBalanced": True, "balanceScore": 75,
                "insights": ["The team is actively contributing."],
                "suggestions": ["Consider sharing knowledge across different areas."],
                "riskLevel": "low"
            }
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Imbalance detection failed: {str(e)}")


@app.post("/analyze-sentiment")
async def analyze_sentiment(data: SentimentInput):
    """Analyze sentiment of peer review text."""
    prompt = f"""Analyze this peer review comment for a college project teammate.
Generate a brief, anonymous, constructive summary.

Review text: "{data.text}"
Ratings: {json.dumps(data.ratings) if data.ratings else "N/A"}

Respond in STRICT JSON format:
{{
  "sentiment": "<positive|neutral|negative>",
  "summary": "<brief constructive summary suitable for anonymous feedback>"
}}"""

    try:
        response = model.generate_content(prompt)
        result = parse_json_response(response.text)
        return result or {"sentiment": "neutral", "summary": "Feedback received."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {str(e)}")


@app.post("/generate-resume-bullets")
async def generate_resume_bullets(data: ResumeBulletsInput):
    """Generate professional resume bullet points."""
    logs_text = "\n".join([
        f"- {c.get('description','')} [{c.get('category','')}]"
        for c in data.contributions[:20]
    ])

    prompt = f"""Based on these student project contributions, generate 5 professional resume bullet points.
Make them impactful with action verbs and quantifiable results where possible.

Contributions:
{logs_text}

Respond in STRICT JSON format:
{{
  "bullets": ["bullet1", "bullet2", "bullet3", "bullet4", "bullet5"]
}}"""

    try:
        response = model.generate_content(prompt)
        result = parse_json_response(response.text)
        return result or {"bullets": ["Contributed to team project development."]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume generation failed: {str(e)}")


class PeerReviewData(BaseModel):
    ratings: dict
    comment: str

@app.post("/summarize-feedback")
async def summarize_feedback(reviews: list[PeerReviewData]):
    if not reviews:
        return {"summary": "No feedback received yet."}
    
    # Format reviews for AI
    formatted_reviews = "\n".join([f"Rating: {r.ratings}, Comment: {r.comment}" for r in reviews])
    
    prompt = f"""
    As a professional team coach, summarize these peer reviews for a student. 
    Focus on constructive patterns, strengths, and areas for growth. 
    Keep it supportive and actionable. Avoid identifying specific reviewers.
    
    Reviews:
    {formatted_reviews}
    """
    
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(prompt)
    return {"summary": response.text}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AI_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
