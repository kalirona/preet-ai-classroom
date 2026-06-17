# Fix double folder structure - move .git up one level
Write-Host "=== Fixing Double Folder Structure ===" -ForegroundColor Cyan

$parent = "F:\node apps\skool-community-&-course-platform\skool app"
$inner = Join-Path $parent "skool app"

Write-Host "Parent directory: $parent"
Write-Host "Inner directory: $inner"
Write-Host ""

# Check if inner .git exists
$innerGit = Join-Path $inner ".git"
if (Test-Path $innerGit) {
    Write-Host "Found .git in inner folder - moving it up one level..." -ForegroundColor Yellow
    $parentGit = Join-Path $parent ".git"
    
    # Move .git directory
    Move-Item -Path $innerGit -Destination $parentGit -Force
    Write-Host "Moved .git to parent directory: $parentGit" -ForegroundColor Green
} else {
    Write-Host "No .git found in inner folder" -ForegroundColor Red
    exit 1
}

# Also move .gitignore if it exists in inner but not in parent
$innerGitignore = Join-Path $inner ".gitignore"
$parentGitignore = Join-Path $parent ".gitignore"
if ((Test-Path $innerGitignore) -and -not (Test-Path $parentGitignore)) {
    Copy-Item -Path $innerGitignore -Destination $parentGitignore -Force
    Write-Host "Copied .gitignore to parent" -ForegroundColor Green
}

# Verify the fix
$verifyParentGit = Join-Path $parent ".git"
if (Test-Path $verifyParentGit) {
    Write-Host ""
    Write-Host "=== SUCCESS ===" -ForegroundColor Green
    Write-Host "Git repo root is now: $parent"
    
    # Change to parent directory and check git status
    Set-Location $parent
    Write-Host ""
    Write-Host "Current git status:" -ForegroundColor Cyan
    git status
} else {
    Write-Host ""
    Write-Host "FAILED - .git not found at parent" -ForegroundColor Red
}