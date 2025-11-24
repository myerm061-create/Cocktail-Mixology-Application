from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """Schema for a single chat message."""

    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(
        ..., min_length=1, max_length=5000, description="Message content"
    )


class ChatRequest(BaseModel):
    """Schema for chat/assistant API request."""

    message: str = Field(
        ..., min_length=1, max_length=5000, description="User's message"
    )
    conversation_history: list[ChatMessage] = Field(
        default_factory=list,
        description="Previous messages in the conversation (optional)",
    )


class ChatResponse(BaseModel):
    """Schema for chat/assistant API response."""

    message: str = Field(..., description="Assistant's response message")
    success: bool = Field(
        default=True, description="Whether the request was successful"
    )
