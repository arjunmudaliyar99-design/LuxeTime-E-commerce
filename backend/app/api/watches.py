"""
Watches API - Real watch data endpoint

Provides watch catalog data for the frontend.
Currently uses in-memory data, easily replaceable with Supabase/database.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


class Watch(BaseModel):
    """Watch model"""
    id: str
    name: str
    brand: str
    price: float
    description: str
    image_url: str
    overlay_image: str
    case_size: Optional[int] = 40
    style: Optional[str] = "classic"


class WatchesResponse(BaseModel):
    """Response model for watches list"""
    success: bool
    watches: List[Watch]
    total: int


# Real watch data - using actual watch images
WATCHES_DB = [
    {
        "id": "1",
        "name": "Speedmaster",
        "brand": "Omega",
        "price": 6500.00,
        "description": "The legendary Moonwatch. Professional chronograph with iconic tachymeter bezel.",
        "image_url": "/watch images/Speedmaster.png",
        "overlay_image": "/watch images/Speedmaster.png",
        "case_size": 42,
        "style": "sports"
    },
    {
        "id": "2",
        "name": "Speedmaster Dark",
        "brand": "Omega",
        "price": 7200.00,
        "description": "Dark side of the moon. Ceramic case with stealth aesthetics.",
        "image_url": "/watch images/Speedmaster dark.png",
        "overlay_image": "/watch images/Speedmaster dark.png",
        "case_size": 44,
        "style": "sports"
    },
    {
        "id": "3",
        "name": "Seamaster Diver",
        "brand": "Omega",
        "price": 5800.00,
        "description": "Professional diving watch with 300m water resistance. Wave-pattern dial.",
        "image_url": "/watch images/Seamaster drive.png",
        "overlay_image": "/watch images/Seamaster drive.png",
        "case_size": 42,
        "style": "sports"
    },
    {
        "id": "4",
        "name": "Seamaster Aqua Terra",
        "brand": "Omega",
        "price": 6200.00,
        "description": "Versatile luxury sports watch with teak dial pattern. 150m water resistant.",
        "image_url": "/watch images/seamaster aqua teera 150m.png",
        "overlay_image": "/watch images/seamaster aqua teera 150m.png",
        "case_size": 41,
        "style": "classic"
    },
    {
        "id": "5",
        "name": "Planet Ocean",
        "brand": "Omega",
        "price": 8900.00,
        "description": "Deep sea explorer with 600m water resistance. Unidirectional bezel.",
        "image_url": "/watch images/planet.png",
        "overlay_image": "/watch images/planet.png",
        "case_size": 43,
        "style": "sports"
    },
    {
        "id": "6",
        "name": "Constellation",
        "brand": "Omega",
        "price": 7500.00,
        "description": "Elegant dress watch with iconic claws and star logo. Precision timepiece.",
        "image_url": "/watch images/inst.png",
        "overlay_image": "/watch images/inst.png",
        "case_size": 39,
        "style": "luxury"
    },
    {
        "id": "7",
        "name": "Heritage",
        "brand": "Omega",
        "price": 4900.00,
        "description": "Vintage-inspired timepiece with modern movement. Classic styling.",
        "image_url": "/watch images/heritage.png",
        "overlay_image": "/watch images/heritage.png",
        "case_size": 40,
        "style": "classic"
    },
    {
        "id": "8",
        "name": "Diver 300M",
        "brand": "Omega",
        "price": 5400.00,
        "description": "Professional dive watch with helium escape valve. Robust and reliable.",
        "image_url": "/watch images/diver.png",
        "overlay_image": "/watch images/diver.png",
        "case_size": 42,
        "style": "sports"
    },
]


@router.get("/", response_model=WatchesResponse)
async def get_watches():
    """
    Get all available watches.
    
    Returns catalog of watches with all necessary details for display
    and virtual try-on functionality.
    """
    try:
        watches = [Watch(**watch_data) for watch_data in WATCHES_DB]
        
        return WatchesResponse(
            success=True,
            watches=watches,
            total=len(watches)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch watches: {str(e)}")


@router.get("/{watch_id}", response_model=Watch)
async def get_watch_by_id(watch_id: str):
    """
    Get specific watch by ID.
    
    Used for try-on page to load watch details.
    """
    try:
        watch_data = next((w for w in WATCHES_DB if w["id"] == watch_id), None)
        
        if not watch_data:
            raise HTTPException(status_code=404, detail=f"Watch {watch_id} not found")
        
        return Watch(**watch_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch watch: {str(e)}")
