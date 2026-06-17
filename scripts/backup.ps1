param(
  [string]$BackupDir = ".\backups",
  [string]$DatabaseUrl = $env:DATABASE_URL,
  [int]$RetentionDays = 30
)

if (-not $DatabaseUrl) {
  Write-Error "DATABASE_URL environment variable is required"
  exit 1
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = Join-Path $BackupDir "skool_backup_$timestamp.sql"

if (-not (Test-Path $BackupDir)) {
  New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

Write-Host "Starting PostgreSQL backup to: $backupPath"

# Extract connection info from DATABASE_URL
$uri = [System.Uri]$DatabaseUrl
$dbName = $uri.AbsolutePath.TrimStart('/')
$hostname = $uri.Host
$port = if ($uri.Port -gt 0) { $uri.Port } else { 5432 }
$userInfo = if ($uri.UserInfo) { $uri.UserInfo -split ':' } else { @("postgres", "") }
$user = $userInfo[0]
$password = if ($userInfo.Count -gt 1) { $userInfo[1] } else { "" }

# Set PGPASSWORD for non-interactive auth
$env:PGPASSWORD = $password

# Run pg_dump
& "pg_dump" --host=$hostname --port=$port --username=$user --dbname=$dbName --format=custom --file=$backupPath

if ($LASTEXITCODE -eq 0) {
  Write-Host "Backup completed successfully: $backupPath"

  # Compress
  & "gzip" -f $backupPath
  $compressedPath = "$backupPath.gz"
  Write-Host "Compressed to: $compressedPath"

  # Cleanup old backups
  $cutoff = (Get-Date).AddDays(-$RetentionDays)
  Get-ChildItem -Path $BackupDir -Filter "*.sql.gz" |
    Where-Object { $_.CreationTime -lt $cutoff } |
    ForEach-Object {
      Remove-Item -Path $_.FullName -Force
      Write-Host "Removed old backup: $($_.Name)"
    }

  Write-Host "Backup retention: kept backups newer than $RetentionDays days"
} else {
  Write-Error "Backup failed with exit code $LASTEXITCODE"
  exit 1
}
