from fastapi import APIRouter, HTTPException, status

from app.schemas.assistant import ChatRequest, ChatResponse

router = APIRouter(prefix="/assistant", tags=["assistant"])


def generate_mock_response(user_message: str) -> str:
    """
    Generate a mock assistant response based on user input.
    This is a placeholder for future AI integration.
    """
    lower_message = user_message.lower()
    
    # Simple keyword-based responses
    if any(word in lower_message for word in ["hello", "hi", "hey"]):
        return "Hello! I'm your cocktail assistant. How can I help you today?"
    
    if any(word in lower_message for word in ["recipe", "drink", "cocktail"]):
        return "I'd be happy to help you find a cocktail recipe! What ingredients do you have on hand, or what type of drink are you in the mood for?"
    
    if any(word in lower_message for word in ["ingredient", "what can i make"]):
        return "Tell me what ingredients you have, and I can suggest some great cocktails you can make with them!"
    
    if any(word in lower_message for word in ["recommend", "suggestion"]):
        return "I'd love to recommend a cocktail! What's your preference - something sweet, sour, strong, or refreshing?"
    
    if "how" in lower_message and "make" in lower_message:
        return "I can walk you through making a cocktail step by step! Which cocktail would you like to learn how to make?"
    
    # Default response
    return "That's interesting! I'm here to help with cocktail recipes, ingredient suggestions, and drink recommendations. What would you like to know?"


@router.post("/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
def chat(request: ChatRequest) -> ChatResponse:
    """
    Handle chat/assistant requests.
    
    This endpoint accepts a user message and optional conversation history,
    and returns an assistant response. Currently returns mock responses
    as a placeholder for future AI integration.
    
    Args:
        request: ChatRequest containing the user's message and optional history
        
    Returns:
        ChatResponse with the assistant's response
        
    Raises:
        HTTPException: If the request is invalid or processing fails
    """
    try:
        # Validate input
        if not request.message or not request.message.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message cannot be empty"
            )
        
        # Generate mock response (will be replaced with AI integration later)
        assistant_message = generate_mock_response(request.message.strip())
        
        return ChatResponse(
            message=assistant_message,
            success=True
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing your request: {str(e)}"
        )

