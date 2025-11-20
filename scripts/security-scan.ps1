param(
  [switch]$Install  # .\scripts\security-scan.ps1 -Install
)

Write-Host ">> Backend security scan" -ForegroundColor Cyan

Write-Host ">> Using Python:" -ForegroundColor Cyan
python -V
pip -V

if ($Install) {
  Write-Host ">> Installing security tools (bandit, pip-audit)..." -ForegroundColor Cyan
  python -m pip install --upgrade pip
  python -m pip install bandit pip-audit
}

Push-Location backend

Write-Host ">> pip-audit (dependencies)..." -ForegroundColor Cyan
pip-audit

Write-Host ">> Bandit (static analysis)..." -ForegroundColor Cyan
bandit -r app -ll

Pop-Location

Write-Host ">> Frontend security scan" -ForegroundColor Cyan

Push-Location frontend

Write-Host ">> npm audit (dependencies)..." -ForegroundColor Cyan
npm audit --audit-level=moderate

Pop-Location

Write-Host ">> Security scan complete." -ForegroundColor Green

# First time:
# ./scripts/security-scan.ps1 -Install
# After
# ./scripts/security-scan.ps1
