param(
    [string]$ManifestPath = "skills/manifest.yaml"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$manifestFullPath = Join-Path $repoRoot $ManifestPath

if (-not (Test-Path -LiteralPath $manifestFullPath)) {
    Write-Error "Manifest not found: $ManifestPath"
    exit 1
}

$manifestLines = Get-Content -LiteralPath $manifestFullPath
$skillPaths = @()

foreach ($line in $manifestLines) {
    if ($line -match '^\s*path:\s*(.+?)\s*$') {
        $value = $Matches[1].Trim()

        if ($value -match '^(?<raw>[^#]+?)\s*(#.*)?$') {
            $value = $Matches["raw"].Trim()
        }

        if (($value.StartsWith("'") -and $value.EndsWith("'")) -or
            ($value.StartsWith('"') -and $value.EndsWith('"'))) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        if (-not [string]::IsNullOrWhiteSpace($value)) {
            $skillPaths += $value
        }
    }
}

if ($skillPaths.Count -eq 0) {
    Write-Error "No skill paths found in $ManifestPath"
    exit 1
}

$requiredSections = @(
    "When To Use",
    "Inputs",
    "Steps",
    "Verification",
    "Outputs"
)

$failed = $false

foreach ($relativePath in $skillPaths) {
    $normalizedPath = $relativePath -replace '/', [IO.Path]::DirectorySeparatorChar
    $fullPath = Join-Path $repoRoot $normalizedPath

    if (-not (Test-Path -LiteralPath $fullPath)) {
        Write-Error "Missing skill file referenced by manifest: $relativePath"
        $failed = $true
        continue
    }

    $content = Get-Content -LiteralPath $fullPath -Raw

    if (-not ($content -match '(?s)\A---\s*\r?\n(?<frontmatter>.*?)\r?\n---')) {
        Write-Error "Missing YAML frontmatter in: $relativePath"
        $failed = $true
        continue
    }

    $frontmatter = $Matches["frontmatter"]
    if (-not ($frontmatter -match '(?m)^\s*name:\s*\S+')) {
        Write-Error "Frontmatter missing required 'name' in: $relativePath"
        $failed = $true
    }

    if (-not ($frontmatter -match '(?m)^\s*description:\s*\S+')) {
        Write-Error "Frontmatter missing required 'description' in: $relativePath"
        $failed = $true
    }

    foreach ($section in $requiredSections) {
        $headingPattern = "(?mi)^##\s+$([Regex]::Escape($section))\s*$"
        if (-not ($content -match $headingPattern)) {
            Write-Error "Missing required section '## $section' in: $relativePath"
            $failed = $true
        }
    }
}

if ($failed) {
    exit 1
}

Write-Host "Validated documentation structure for $($skillPaths.Count) skill file(s)."
