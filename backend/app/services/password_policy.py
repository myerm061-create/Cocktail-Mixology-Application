import re
from typing import List, Optional

MIN_LEN = 12
MAX_LEN = 128

_UPPER = re.compile(r"[A-Z]")
_LOWER = re.compile(r"[a-z]")
_DIGIT = re.compile(r"\d")
_SYMBOL = re.compile(r"[^\w\s]")  # non-alphanumeric

#--- Validate password against policy ---
def validate_password(pw: str, email: Optional[str] = None) -> List[str]:
    errs: List[str] = []
    if not (MIN_LEN <= len(pw) <= MAX_LEN):
        errs.append(f"Password must be {MIN_LEN}-{MAX_LEN} characters.")
    if not _UPPER.search(pw):  errs.append("Include at least one uppercase letter.")
    if not _LOWER.search(pw):  errs.append("Include at least one lowercase letter.")
    if not _DIGIT.search(pw):  errs.append("Include at least one digit.")
    if not _SYMBOL.search(pw): errs.append("Include at least one symbol.")
    if email:
        local = email.split("@", 1)[0].lower()
        if local and local in pw.lower():
            errs.append("Password must not contain your email name.")
    return errs
