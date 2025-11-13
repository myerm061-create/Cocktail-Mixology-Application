from fastapi import APIRouter, Query
from fastapi.responses import HTMLResponse

router = APIRouter(prefix="/r", tags=["link"])

HTML = """<!doctype html>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Opening MyCabinet…</title>
<style>
  body {
    font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    padding: 24px;
    background: #0b0b0f;
    color: #eaeaea;
  }
  a { color: #7aa2ff; }
</style>
<p>
  Opening the app… If nothing happens,
  <a id="fallback" href="#">continue here</a>.
</p>
<script>
  const p = new URLSearchParams(window.location.search);
  const type = p.get("type"); // "login" | "reset"
  const token = p.get("token") || "";
  const deep = type === "login"
    ? "cocktailapp://login/finish?token=" + encodeURIComponent(token)
    : "cocktailapp://reset?token=" + encodeURIComponent(token);
  const fallback = type === "login"
    ? "/login/finish?token=" + encodeURIComponent(token)
    : "/reset?token=" + encodeURIComponent(token);

  document.getElementById("fallback").href = fallback;
  window.location.href = deep;           // try to open the app
  setTimeout(() => { window.location.href = fallback; }, 800); // web fallback
</script>
"""


@router.get("", response_class=HTMLResponse)
def redirect(type: str = Query(...), token: str = Query(...)):
    return HTML
