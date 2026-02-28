param(
    [int]$BuildJobs = 1
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$cargoHome = Join-Path $env:TEMP "yaatal-cargo-home"
$targetDir = Join-Path $env:TEMP "yaatal-target"

New-Item -ItemType Directory -Force -Path $cargoHome | Out-Null
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

$env:CARGO_HOME = $cargoHome
$env:CARGO_TARGET_DIR = $targetDir
$env:CARGO_BUILD_JOBS = "$BuildJobs"

Write-Host "CARGO_HOME=$env:CARGO_HOME"
Write-Host "CARGO_TARGET_DIR=$env:CARGO_TARGET_DIR"
Write-Host "CARGO_BUILD_JOBS=$env:CARGO_BUILD_JOBS"

$cl = Get-Command cl.exe -ErrorAction SilentlyContinue
if (-not $cl) {
    Write-Warning "cl.exe not found in PATH. Native crates may fail to build."
}

$cpExe = Get-Command cp.exe -ErrorAction SilentlyContinue
if (-not $cpExe) {
    Write-Warning "cp.exe not found in PATH. Some libsql build scripts may fail."
}
