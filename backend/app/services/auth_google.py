import time
import requests
from jose import jwt
from jose.utils import base64url_decode

# Constants
GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"
GOOGLE_ISSUERS = {"https://accounts.google.com", "accounts.google.com"}

# Fetch Google's OAuth2 configuration
def _discovery():
    return requests.get(GOOGLE_DISCOVERY_URL, timeout=10).json()

# Build the Google OAuth2 authorization URL
def build_auth_url(client_id: str, redirect_uri: str, scope: list[str], prompt: str | None = None, access_type: str | None = None, state: str | None = None, code_challenge: str | None = None, code_challenge_method: str | None = None):
    cfg = _discovery()
    params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": " ".join(scope),
    }
    if state: params["state"] = state
    if prompt: params["prompt"] = prompt
    if access_type: params["access_type"] = access_type
    if code_challenge:
        params["code_challenge"] = code_challenge
        params["code_challenge_method"] = code_challenge_method or "S256"
    # Build query string safely
    from urllib.parse import urlencode
    return f"{cfg['authorization_endpoint']}?{urlencode(params)}"

# Exchange authorization code for tokens
def exchange_code_for_token(client_id: str, client_secret: str, code: str, redirect_uri: str, code_verifier: str | None = None):
    cfg = _discovery()
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
    }
    if code_verifier:
        data["code_verifier"] = code_verifier

    res = requests.post(cfg["token_endpoint"], data=data, headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
    if not res.ok:
        raise ValueError(f"Token exchange failed: {res.status_code} {res.text}")
    return res.json()

# Verify ID token using Google's public keys
def verify_google_id_token(id_token: str, audience: str):
    cfg = _discovery()
    jwks_uri = cfg["jwks_uri"]
    jwks = requests.get(jwks_uri, timeout=10).json()

    headers = jwt.get_unverified_header(id_token)
    kid = headers.get("kid")
    alg = headers.get("alg")

    key = None
    for k in jwks["keys"]:
        if k.get("kid") == kid:
            key = k
            break
    if key is None:
        raise ValueError("Matching Google JWK not found")

    claims = jwt.decode(
        id_token,
        key,
        algorithms=[alg],
        audience=audience,
        issuer=GOOGLE_ISSUERS,
        options={"verify_aud": True, "verify_iss": True, "verify_exp": True},
    )
    # Additional checks can be added here if needed
    if claims.get("exp") and claims["exp"] < int(time.time()):
        raise ValueError("ID token expired")
    return claims
