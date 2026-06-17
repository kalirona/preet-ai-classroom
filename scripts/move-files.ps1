# Move all files from inner "skool app" folder to parent git root
$gitRoot = "F:\node apps\skool-community-&-course-platform\skool app"
$inner = Join-Path $gitRoot "skool app"

Write-Host "=== Moving files from inner folder to git root ===" -ForegroundColor Cyan
Write-Host "Git root: $gitRoot"
Write-Host "Inner folder: $inner"
Write-Host ""

# Get all items in inner folder (recursively), excluding .git and node_modules
$items = Get-ChildItem $inner -Recurse -Force | Where-Object { 
    $_.FullName -notlike "$inner\.git*" -and 
    $_.FullName -notlike "$inner\node_modules*"
}

$movedDirs = @{}
$movedFiles = 0

foreach ($item in $items) {
    # Calculate relative path from inner folder
    $relativePath = $item.FullName.Substring($inner.Length + 1)
    $targetPath = Join-Path $gitRoot $relativePath
    
    if ($item.PSIsContainer) {
        # Create directory if it doesn't exist
        if (-not (Test-Path $targetPath)) {
            New-Item -Path $targetPath -ItemType Directory -Force | Out-Null
            Write-Host "  Created directory: $relativePath" -ForegroundColor Gray
        }
        $movedDirs[$relativePath] = $true
    } else {
        # Move file
        if (Test-Path $targetPath) {
            Remove-Item -Path $targetPath -Force
        }
        Move-Item -Path $item.FullName -Destination $targetPath -Force
        $movedFiles++
        Write-Host "  Moved: $relativePath" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Moved $movedFiles files" -ForegroundColor Cyan

# Remove empty inner folder
$innerConfig = Join-Path $inner "vite.config.ts"
$innerSrc = Join-Path $inner "src"
if (-not (Test-Path $innerSrc)) {
    Remove-Item -Path $inner -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Removed empty inner folder" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Verifying git status ===" -ForegroundColor Cyan
Set-Location $gitRoot
git status