param(
    [ValidateSet("workspace", "yaatal-core", "yaatal-api", "yaatal-feed", "yaatal-search", "yaatal-voice")]
    [string]$Scope = "workspace"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $scriptDir "setup-rust-test-env.ps1")

function Invoke-Cargo {
    param([string[]]$CargoArgs)

    Write-Host ""
    Write-Host ">> cargo $($CargoArgs -join ' ')"
    & cargo @CargoArgs
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
}

switch ($Scope) {
    "workspace" { Invoke-Cargo -CargoArgs @("test", "--workspace", "--", "--test-threads=1") }
    "yaatal-core" { Invoke-Cargo -CargoArgs @("test", "-p", "yaatal-core", "--", "--test-threads=1") }
    "yaatal-api" { Invoke-Cargo -CargoArgs @("test", "-p", "yaatal-api", "--tests", "--", "--test-threads=1") }
    "yaatal-feed" { Invoke-Cargo -CargoArgs @("test", "-p", "yaatal-feed", "--", "--test-threads=1") }
    "yaatal-search" { Invoke-Cargo -CargoArgs @("test", "-p", "yaatal-search", "--", "--test-threads=1") }
    "yaatal-voice" { Invoke-Cargo -CargoArgs @("test", "-p", "yaatal-voice", "--", "--test-threads=1") }
}
