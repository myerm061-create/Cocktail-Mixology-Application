# File to store cryptography related helper functions
import bycrypt

# Functions to hash and verify passwords
def hash_password(password: str) -> str:
    """Hash a password for storing."""
    salt = bycryptt.gensalt()
    hashed = bycryptt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify a stored password against one provided by user"""
    return bycryptt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

# add more security-related functions here as needed