import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends, Header
from pydantic import BaseModel
import jwt
from datetime import datetime

from app.core.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


# Pydantic models
class CartItem(BaseModel):
    watch_id: str
    quantity: int = 1


class CartResponse(BaseModel):
    user_id: str
    items: List[CartItem]
    total_items: int


class AddToCartRequest(BaseModel):
    watch_id: str
    quantity: int = 1


# In-memory cart storage (replace with database)
carts_db = {}


async def get_current_user_from_jwt(authorization: Optional[str] = Header(None)) -> str:
    """Extract and validate Supabase JWT from Authorization header"""
    
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Parse Bearer token
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format. Expected 'Bearer <token>'",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = parts[1]
    
    try:
        # Decode JWT without verification for now (will verify signature in production)
        # In production, you need to fetch Supabase JWT secret from settings
        # For Supabase, the secret is your JWT_SECRET from project settings
        
        # Verify and decode the token
        if not settings.supabase_jwt_secret:
            # Decode without verification (development only)
            logger.warning("JWT verification disabled - no secret configured")
            payload = jwt.decode(token, options={"verify_signature": False})
        else:
            # Verify with Supabase JWT secret
            payload = jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                audience="authenticated"
            )
        
        # Extract user ID from token
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID"
            )
        
        # Check token expiration
        exp = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired"
            )
        
        logger.info(f"Authenticated user: {user_id}")
        return user_id
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except jwt.InvalidTokenError as e:
        logger.error(f"Invalid JWT: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except Exception as e:
        logger.error(f"JWT validation error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )


@router.get("/", response_model=CartResponse)
async def get_cart(user_id: str = Depends(get_current_user_from_jwt)):
    """Get user's shopping cart"""
    
    cart_items = carts_db.get(user_id, [])
    
    return CartResponse(
        user_id=user_id,
        items=cart_items,
        total_items=sum(item.quantity for item in cart_items)
    )


@router.post("/add")
async def add_to_cart(
    request: AddToCartRequest,
    user_id: str = Depends(get_current_user_from_jwt)
):
    """Add item to cart"""
    
    if request.quantity < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be at least 1"
        )
    
    # Initialize cart if doesn't exist
    if user_id not in carts_db:
        carts_db[user_id] = []
    
    # Check if item already in cart
    cart = carts_db[user_id]
    existing_item = next((item for item in cart if item.watch_id == request.watch_id), None)
    
    if existing_item:
        existing_item.quantity += request.quantity
    else:
        cart.append(CartItem(watch_id=request.watch_id, quantity=request.quantity))
    
    logger.info(f"Added {request.quantity}x {request.watch_id} to cart for user {user_id}")
    
    return {
        "success": True,
        "message": "Item added to cart",
        "cart": CartResponse(
            user_id=user_id,
            items=cart,
            total_items=sum(item.quantity for item in cart)
        )
    }


@router.delete("/remove/{watch_id}")
async def remove_from_cart(
    watch_id: str,
    user_id: str = Depends(get_current_user_from_jwt)
):
    """Remove item from cart"""
    
    if user_id not in carts_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found"
        )
    
    cart = carts_db[user_id]
    original_length = len(cart)
    carts_db[user_id] = [item for item in cart if item.watch_id != watch_id]
    
    if len(carts_db[user_id]) == original_length:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in cart"
        )
    
    logger.info(f"Removed {watch_id} from cart for user {user_id}")
    
    return {
        "success": True,
        "message": "Item removed from cart"
    }


@router.put("/update/{watch_id}")
async def update_cart_item(
    watch_id: str,
    quantity: int,
    user_id: str = Depends(get_current_user_from_jwt)
):
    """Update item quantity in cart"""
    
    if quantity < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be at least 1"
        )
    
    if user_id not in carts_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found"
        )
    
    cart = carts_db[user_id]
    item = next((item for item in cart if item.watch_id == watch_id), None)
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in cart"
        )
    
    item.quantity = quantity
    logger.info(f"Updated {watch_id} quantity to {quantity} for user {user_id}")
    
    return {
        "success": True,
        "message": "Cart updated"
    }


@router.delete("/clear")
async def clear_cart(user_id: str = Depends(get_current_user_from_jwt)):
    """Clear all items from cart"""
    
    if user_id in carts_db:
        carts_db[user_id] = []
        logger.info(f"Cleared cart for user {user_id}")
    
    return {
        "success": True,
        "message": "Cart cleared"
    }
