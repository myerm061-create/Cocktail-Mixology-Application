from fastapi import APIRouter, Query
from fastapi.responses import HTMLResponse

router = APIRouter(prefix="/r", tags=["link"])

# --- Redirect page for deep links ---
HTML = """<!doctype html>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Opening MyCabinet…</title>
<style>body{font-family:system-ui;padding:24px}</style>
<p>Opening the app… If nothing happens, <a id="fallback" href="#">continue here</a>.</p>
<script>
  const p = new URLSearchParams(window.location.search);
  const type = p.get("type"); // "login" | "reset"
  const token = p.get("token") || "";
  const scheme = type === "login" ? "cocktailapp://login/finish?token=" : "cocktailapp://reset?token=";
  const deep = scheme + encodeURIComponent(token);
  const fallback = type === "login"
      ? "https://mycabinet.me/login/finish?token=" + encodeURIComponent(token)
      : "https://mycabinet.me/reset?token=" + encodeURIComponent(token);
  document.getElementById("fallback").href = fallback;
  // Try to open the app
  window.location.href = deep;
  // After 1s, if the app didn't open, go to web fallback
  setTimeout(() => { window.location.href = fallback; }, 1000);
</script>
"""
# --- Redirect endpoint ---
@router.get("", response_class=HTMLResponse)
def redirect(type: str = Query(...), token: str = Query(...)):
    return HTML
