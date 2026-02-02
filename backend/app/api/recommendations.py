"""
Watch Recommendation API

AI-powered rule-based recommendation with explainable results
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

router = APIRouter()


class RecommendationRequest(BaseModel):
    """Request model for watch recommendations"""
    wrist_size: Optional[str] = Field("medium", description="small, medium, or large")
    budget_min: Optional[int] = Field(0, description="Minimum budget in USD")
    budget_max: Optional[int] = Field(100000, description="Maximum budget in USD")
    style_preference: Optional[str] = Field(None, description="sports, classic, luxury, elegant, modern")
    viewed_watches: Optional[List[int]] = Field([], description="Previously viewed watch IDs")
    cart_watches: Optional[List[int]] = Field([], description="Watch IDs in cart")


class WatchRecommendation(BaseModel):
    """Individual watch recommendation with AI explanation"""
    watch_id: int
    watch_name: str
    price: int
    score: float = Field(..., ge=0, le=100, description="AI recommendation score 0-100")
    reasons: List[str] = Field(..., description="Why this watch was recommended")
    image_url: str


class RecommendationResponse(BaseModel):
    """Response model with AI recommendations"""
    success: bool
    recommendations: List[WatchRecommendation]
    total_count: int


# Enhanced watch database with metadata for AI recommendations
WATCH_DATABASE = {
    1: {
        "id": 1,
        "name": "Speedmaster",
        "price": 6500,
        "style": "sports",
        "wrist_fit": ["medium", "large"],
        "features": ["chronograph", "tachymeter", "moon watch heritage"],
        "image_url": "/watches/Speedmaster.png"
    },
    2: {
        "id": 2,
        "name": "Seamaster Drive",
        "price": 5800,
        "style": "sports",
        "wrist_fit": ["medium", "large"],
        "features": ["dive watch", "water resistant", "rotating bezel"],
        "image_url": "/watches/Seamaster drive.png"
    },
    3: {
        "id": 3,
        "name": "Planet Ocean",
        "price": 7500,
        "style": "elegant",
        "wrist_fit": ["large"],
        "features": ["luxury dive", "premium finish", "bold design"],
        "image_url": "/watches/planet.png"
    },
    4: {
        "id": 4,
        "name": "Diver 300M",
        "price": 8900,
        "style": "sports",
        "wrist_fit": ["large"],
        "features": ["professional dive", "helium valve", "ceramic bezel"],
        "image_url": "/watches/diver.png"
    },
    5: {
        "id": 5,
        "name": "Heritage",
        "price": 4200,
        "style": "classic",
        "wrist_fit": ["small", "medium"],
        "features": ["vintage design", "dress watch", "slim profile"],
        "image_url": "/watches/heritage.png"
    },
    6: {
        "id": 6,
        "name": "Constellation",
        "price": 7500,
        "style": "elegant",
        "wrist_fit": ["medium"],
        "features": ["iconic design", "luxury finish", "date display"],
        "image_url": "/watches/inst.png"
    },
    7: {
        "id": 7,
        "name": "Speedmaster Dark",
        "price": 8200,
        "style": "modern",
        "wrist_fit": ["medium", "large"],
        "features": ["black ceramic", "stealth design", "chronograph"],
        "image_url": "/watches/Speedmaster dark.png"
    },
    8: {
        "id": 8,
        "name": "Seamaster Aqua Terra",
        "price": 6800,
        "style": "elegant",
        "wrist_fit": ["medium"],
        "features": ["teak dial", "versatile", "master chronometer"],
        "image_url": "/watches/seamaster aqua teera 150m.png"
    }
}


def calculate_recommendation_score(watch: dict, request: RecommendationRequest) -> tuple[float, List[str]]:
    """
    AI-powered scoring algorithm with explainable recommendations
    
    Returns:
        tuple: (score 0-100, list of reasons)
    """
    score = 0.0
    reasons = []
    
    # 1. Budget fit (30 points)
    if request.budget_min <= watch["price"] <= request.budget_max:
        score += 30
        reasons.append(f"Within your budget (${watch['price']:,})")
    elif watch["price"] < request.budget_min:
        score += 10
        reasons.append(f"Great value at ${watch['price']:,}")
    else:
        score -= 20
        reasons.append(f"Above budget at ${watch['price']:,}")
    
    # 2. Wrist size fit (25 points)
    if request.wrist_size in watch["wrist_fit"]:
        score += 25
        reasons.append(f"Perfect fit for {request.wrist_size} wrist")
    else:
        score += 5
        reasons.append(f"May fit {request.wrist_size} wrist")
    
    # 3. Style preference (20 points)
    if request.style_preference and watch["style"] == request.style_preference:
        score += 20
        reasons.append(f"Matches your {request.style_preference} style")
    
    # 4. Previously viewed (15 points)
    if watch["id"] in request.viewed_watches:
        score += 15
        reasons.append("You've shown interest in this watch")
    
    # 5. Similar to cart items (10 points)
    if request.cart_watches:
        cart_watch_styles = [
            WATCH_DATABASE[cid]["style"] 
            for cid in request.cart_watches 
            if cid in WATCH_DATABASE
        ]
        if watch["style"] in cart_watch_styles:
            score += 10
            reasons.append("Complements watches in your cart")
    
    # 6. Feature bonuses
    if "chronograph" in watch["features"]:
        score += 3
        reasons.append("Features chronograph complication")
    if any(f in watch["features"] for f in ["dive watch", "water resistant"]):
        score += 3
        reasons.append("Water resistant for active lifestyle")
    
    # Normalize to 0-100
    normalized_score = min(100, max(0, score))
    
    return normalized_score, reasons[:4]  # Top 4 reasons


@router.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """
    Get AI-powered watch recommendations with explanations
    
    Uses rule-based scoring algorithm that considers:
    - Budget fit
    - Wrist size
    - Style preference
    - Browsing history
    - Cart similarity
    """
    try:
        recommendations = []
        
        for watch_id, watch in WATCH_DATABASE.items():
            score, reasons = calculate_recommendation_score(watch, request)
            
            recommendations.append(WatchRecommendation(
                watch_id=watch_id,
                watch_name=watch["name"],
                price=watch["price"],
                score=round(score, 1),
                reasons=reasons,
                image_url=watch["image_url"]
            ))
        
        # Sort by score (highest first)
        recommendations.sort(key=lambda x: x.score, reverse=True)
        
        return RecommendationResponse(
            success=True,
            recommendations=recommendations,
            total_count=len(recommendations)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Recommendation error: {str(e)}"
        )


@router.get("/recommend", response_model=RecommendationResponse)
async def get_recommendations_get(
    wrist_size: str = "medium",
    budget_min: int = 0,
    budget_max: int = 100000,
    style_preference: Optional[str] = None
):
    """GET endpoint for recommendations (convenience)"""
    request = RecommendationRequest(
        wrist_size=wrist_size,
        budget_min=budget_min,
        budget_max=budget_max,
        style_preference=style_preference,
        viewed_watches=[],
        cart_watches=[]
    )
    return await get_recommendations(request)

