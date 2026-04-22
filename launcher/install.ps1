# uDos — install after git clone (Windows PowerShell)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Sonic = Join-Path $Root "tools\sonic-express\bin\sonic-express.mjs"

if (-not (Test-Path $Sonic)) {
    Write-Error "Expected $Sonic — run from a full uDosConnect checkout."
}

& node $Sonic install @args
Write-Host ""
Write-Host "Try: udo version; udo doctor; udo help"
