param(
    [switch]$IncludeScenario = $true,
    [string]$OutputRoot = "artifacts/kitops",
    [string]$PackageName = "yaatal-lfm2-colbert-zeroshot"
)

$ErrorActionPreference = "Stop"
if (Get-Variable PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
    $PSNativeCommandUseErrorActionPreference = $true
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$pythonExe = "python"
$venvPython = Join-Path $repoRoot ".venv-colbert\Scripts\python.exe"
if (Test-Path $venvPython) {
    $pythonExe = $venvPython
}

$prepareScript = Join-Path $repoRoot "scripts\prepare_kitops_zeroshot_bundle.py"
$bundleName = "zeroshot-$((Get-Date).ToUniversalTime().ToString('yyyyMMdd-HHmmss'))"
$args = @(
    $prepareScript,
    "--repo-root", $repoRoot,
    "--output-root", $OutputRoot,
    "--package-name", $PackageName,
    "--bundle-name", $bundleName
)
if ($IncludeScenario) {
    $args += "--include-scenario"
}

& $pythonExe @args
if ($LASTEXITCODE -ne 0) {
    throw "Bundle preparation failed with exit code $LASTEXITCODE."
}

$bundleRoot = Join-Path $repoRoot $OutputRoot
$bundlePath = Join-Path $bundleRoot $bundleName
if (-not (Test-Path $bundlePath)) {
    throw "Expected bundle directory not found: $bundlePath"
}

$modelkitPath = Join-Path $bundlePath "modelkit.yaml"
if (-not (Test-Path $modelkitPath)) {
    throw "Missing modelkit.yaml in $bundlePath"
}

$tag = "${PackageName}:$($bundleName -replace '^zeroshot-','')"

if (Get-Command kit -ErrorAction SilentlyContinue) {
    Write-Host "Running: kit pack $bundlePath -f $modelkitPath -t $tag"
    kit pack $bundlePath -f $modelkitPath -t $tag
    if ($LASTEXITCODE -ne 0) {
        throw "kit pack failed with exit code $LASTEXITCODE."
    }
} else {
    Write-Host "KitOps CLI not found in PATH. Bundle was prepared but not packed."
    Write-Host "Install KitOps and run:"
    Write-Host "  kit pack $bundlePath -f $modelkitPath -t $tag"
}
