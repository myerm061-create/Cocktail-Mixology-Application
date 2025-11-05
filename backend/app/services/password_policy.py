import re
from typing import List, Optional

# length + basic abuse checks
MIN_LEN = 10
MAX_LEN = 128

# Deny list
_COMMONS = {
    "password", "password1", "password123", "123456", "123456789", "qwerty",
    "letmein", "iloveyou", "admin", "welcome", "abc123"
}

_WHITESPACE_ONLY = re.compile(r"^\s+$")

def _too_few_unique_chars(pw: str, min_unique: int = 3) -> bool:
    # prevents "aaaaaaaaaa" or "1111111111"
    return len(set(pw.lower())) < min_unique

def validate_password(pw: str, email: Optional[str] = None) -> List[str]:
    """
    Returns a list of human-readable error strings.
    Empty list means the password passes policy.
    """
    errs: List[str] = []

    if not isinstance(pw, str):
        return ["Password must be a string."]

    if _WHITESPACE_ONLY.match(pw):
        errs.append("Password cannot be only spaces.")
        return errs

    if not (MIN_LEN <= len(pw) <= MAX_LEN):
        errs.append(f"Password must be {MIN_LEN}-{MAX_LEN} characters.")

    if _too_few_unique_chars(pw):
        errs.append("Password is too repetitive; try mixing different characters.")

    pw_lower = pw.strip().lower()
    if pw_lower in _COMMONS:
        errs.append("Password is too common; choose something less guessable.")

    if email:
        local = email.split("@", 1)[0].strip().lower()
        if local and local in pw_lower:
            errs.append("Password must not contain your email name.")

    return errs
