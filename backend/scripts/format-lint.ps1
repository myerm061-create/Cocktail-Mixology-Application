param(
  [switch]$Install  # use: .\scripts\format-lint.ps1 -Install  to install tools first
)

Write-Host ">> Using Python:" -ForegroundColor Cyan
python -V
pip -V

if ($Install) {
  Write-Host ">> Installing tools (ruff, isort, black, flake8)..." -ForegroundColor Cyan
  python -m pip install --upgrade pip
  python -m pip install ruff isort black flake8
}

Write-Host ">> Ruff (auto-fix)..." -ForegroundColor Cyan
python -m ruff check . --fix

Write-Host ">> isort ..." -ForegroundColor Cyan
python -m isort .

Write-Host ">> Black ..." -ForegroundColor Cyan
python -m black .

Write-Host ">> Flake8 (report) ..." -ForegroundColor Cyan
python -m flake8 . --count --show-source --statistics

# first time (install tools):
# .\scripts\format-lint.ps1 -Install
# afterwards:
# .\scripts\format-lint.ps1
