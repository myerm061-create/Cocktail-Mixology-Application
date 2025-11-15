import secrets
import string
from datetime import datetime, timedelta
from typing import Optional


class OTPService:
    """Service for handling OTP generation, storage, and verification."""

    # In prod, store these in a separate OTP table or cache
    # For now, use in-memory store
    _otp_store: dict = (
        {}
    )  # Format: {email: {"code": "123456", "expires": datetime, "attempts": 0}}

    OTP_LENGTH = 6
    OTP_EXPIRY_MINUTES = 10
    MAX_ATTEMPTS = 3

    @classmethod
    def generate_otp(cls) -> str:
        """Generate a random 6-digit OTP code."""
        return "".join(secrets.choice(string.digits) for _ in range(cls.OTP_LENGTH))

    @classmethod
    def create_otp(cls, email: str) -> str:
        """Create and store an OTP for the given email."""
        otp_code = cls.generate_otp()
        expires_at = datetime.utcnow() + timedelta(minutes=cls.OTP_EXPIRY_MINUTES)

        cls._otp_store[email.lower()] = {
            "code": otp_code,
            "expires": expires_at,
            "attempts": 0,
        }

        return otp_code

    @classmethod
    def verify_otp(cls, email: str, otp_code: str) -> tuple[bool, str]:
        """
        Verify an OTP code for the given email.
        Returns (success, message)
        """
        email = email.lower()

        # Check if OTP exists
        if email not in cls._otp_store:
            return False, "No OTP found for this email"

        otp_data = cls._otp_store[email]

        # Check if OTP has expired
        if datetime.utcnow() > otp_data["expires"]:
            del cls._otp_store[email]
            return False, "OTP has expired"

        # Check attempts
        if otp_data["attempts"] >= cls.MAX_ATTEMPTS:
            del cls._otp_store[email]
            return False, "Maximum attempts exceeded"

        # Increment attempts
        otp_data["attempts"] += 1

        # Verify OTP
        if otp_data["code"] != otp_code:
            if otp_data["attempts"] >= cls.MAX_ATTEMPTS:
                del cls._otp_store[email]
                return False, "Maximum attempts exceeded"
            return (
                False,
                f"Invalid OTP. {cls.MAX_ATTEMPTS - otp_data['attempts']} attempts remaining",
            )

        # Success - remove OTP
        del cls._otp_store[email]
        return True, "OTP verified successfully"

    @classmethod
    def clear_otp(cls, email: str) -> None:
        """Clear OTP for the given email."""
        email = email.lower()
        if email in cls._otp_store:
            del cls._otp_store[email]

    @classmethod
    def get_otp_info(cls, email: str) -> Optional[dict]:
        """Get OTP info for debugging (remove in production)."""
        return cls._otp_store.get(email.lower())
