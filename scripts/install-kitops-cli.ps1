param(
    [string]$Version = "latest",
    [string]$Repo = "jozu-ai/kitops",
    [string]$InstallDir = "$env:LOCALAPPDATA\Programs\KitOps",
    [switch]$Force
)

$ErrorActionPreference = "Stop"
if (Get-Variable PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
    $PSNativeCommandUseErrorActionPreference = $true
}

function Write-Info([string]$Message) {
    Write-Host "[kitops-install] $Message"
}

function Test-KitBinary([string]$BinaryPath) {
    if (-not (Test-Path $BinaryPath)) {
        return $false
    }
    try {
        & $BinaryPath --version | Out-Host
        if ($LASTEXITCODE -eq 0) {
            return $true
        }
    } catch {
        return $false
    }
    return $false
}

function Get-Release([string]$Repository, [string]$RequestedVersion) {
    if ($RequestedVersion -eq "latest") {
        $apiUrl = "https://api.github.com/repos/$Repository/releases/latest"
    } else {
        $apiUrl = "https://api.github.com/repos/$Repository/releases/tags/$RequestedVersion"
    }
    Write-Info "Fetching release metadata: $apiUrl"
    return Invoke-RestMethod -Uri $apiUrl -Headers @{ "Accept" = "application/vnd.github+json" }
}

function Select-WindowsAsset($Assets) {
    $windowsAssets = @($Assets | Where-Object {
        $_.name -match "windows" -and
        $_.name -match "(amd64|x86_64)" -and
        $_.name -match "(\.zip|\.tar\.gz|\.tgz)$"
    })

    if (-not $windowsAssets -or $windowsAssets.Count -eq 0) {
        throw "No Windows amd64/x86_64 asset found in release."
    }

    $preferred = $windowsAssets | Where-Object { $_.name -match "\.zip$" } | Select-Object -First 1
    if ($preferred) {
        return $preferred
    }
    return $windowsAssets | Select-Object -First 1
}

function Ensure-UserPath([string]$PathToAdd) {
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ([string]::IsNullOrWhiteSpace($userPath)) {
        [Environment]::SetEnvironmentVariable("Path", $PathToAdd, "User")
        Write-Info "Added to user PATH: $PathToAdd"
        return
    }

    $parts = $userPath.Split(";") | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
    if ($parts -contains $PathToAdd) {
        Write-Info "Install dir already present in user PATH."
        return
    }

    $newPath = "$userPath;$PathToAdd"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Info "Added to user PATH: $PathToAdd"
}

$existingKit = Get-Command kit -ErrorAction SilentlyContinue
if ($existingKit -and -not $Force) {
    Write-Info "KitOps CLI already installed at: $($existingKit.Source)"
    if (Test-KitBinary -BinaryPath $existingKit.Source) {
        Write-Info "Use -Force to reinstall."
        exit 0
    }
    Write-Info "Existing binary failed version check; reinstalling."
}

$release = Get-Release -Repository $Repo -RequestedVersion $Version
$asset = Select-WindowsAsset -Assets $release.assets

Write-Info "Selected asset: $($asset.name)"

$tempRoot = Join-Path $env:TEMP ("kitops-install-" + [Guid]::NewGuid().ToString("N"))
$archivePath = Join-Path $tempRoot $asset.name
$extractDir = Join-Path $tempRoot "extract"

New-Item -ItemType Directory -Path $tempRoot -Force | Out-Null
New-Item -ItemType Directory -Path $extractDir -Force | Out-Null

try {
    Write-Info "Downloading: $($asset.browser_download_url)"
    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $archivePath

    if ($archivePath -match "\.zip$") {
        Expand-Archive -Path $archivePath -DestinationPath $extractDir -Force
    } else {
        if (-not (Get-Command tar -ErrorAction SilentlyContinue)) {
            throw "Archive is not .zip and 'tar' is not available on PATH."
        }
        tar -xf $archivePath -C $extractDir
        if ($LASTEXITCODE -ne 0) {
            throw "tar extraction failed with exit code $LASTEXITCODE."
        }
    }

    $kitBinary = Get-ChildItem -Path $extractDir -Recurse -File -Filter "kit.exe" | Select-Object -First 1
    if (-not $kitBinary) {
        throw "kit.exe not found after extracting release asset."
    }

    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    $targetBinary = Join-Path $InstallDir "kit.exe"
    Copy-Item -Path $kitBinary.FullName -Destination $targetBinary -Force
    Ensure-UserPath -PathToAdd $InstallDir

    $env:Path = "$InstallDir;$env:Path"

    Write-Info "Installed: $targetBinary"
    Write-Info "Checking version..."
    if (-not (Test-KitBinary -BinaryPath $targetBinary)) {
        throw "Installed kit.exe failed version check."
    }

    Write-Info "Done."
} finally {
    if (Test-Path $tempRoot) {
        Remove-Item -Path $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
}
