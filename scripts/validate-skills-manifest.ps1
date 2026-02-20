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

$lines = Get-Content -LiteralPath $manifestFullPath
$skillPaths = @()

foreach ($line in $lines) {
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

$failed = $false
$duplicateGroups = $skillPaths | Group-Object | Where-Object { $_.Count -gt 1 }
if ($duplicateGroups) {
    foreach ($group in $duplicateGroups) {
        Write-Error "Duplicate path in manifest: $($group.Name)"
    }
    $failed = $true
}

foreach ($relativePath in $skillPaths) {
    $normalizedPath = $relativePath -replace '/', [IO.Path]::DirectorySeparatorChar
    $fullPath = Join-Path $repoRoot $normalizedPath

    if (-not (Test-Path -LiteralPath $fullPath)) {
        Write-Error "Missing skill file referenced by manifest: $relativePath"
        $failed = $true
        continue
    }

    if (-not ($relativePath -like "*/SKILL.md" -or $relativePath -like "*\SKILL.md")) {
        Write-Error "Skill path should point to SKILL.md: $relativePath"
        $failed = $true
    }
}

if ($failed) {
    exit 1
}

Write-Host "Validated $($skillPaths.Count) skill path(s) from $ManifestPath."
