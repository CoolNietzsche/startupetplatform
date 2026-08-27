# NSLP Automated Daily Backup Script
# Schedule: Daily at 02:00 AM via Task Scheduler
# Run: powershell -File scripts/backup.ps1

$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$backupDir = "C:\NSLP-Backups"
$dbName = "nslp"
$retentionDays = 30

# Ensure backup directory exists
if (-not (Test-Path -LiteralPath $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

# Create daily folder
$dailyDir = Join-Path -Path $backupDir -ChildPath $timestamp
New-Item -ItemType Directory -Path $dailyDir -Force | Out-Null

Write-Host "[$timestamp] Starting NSLP backup..."

# 1. Database backup
try {
    $dumpFile = Join-Path -Path $dailyDir -ChildPath "nslp_db_$timestamp.sql"
    $env:PGPASSWORD = "postgres"
    & pg_dump -U postgres -h localhost -d $dbName -F c -f $dumpFile 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Database backup completed: $dumpFile"
    } else {
        Write-Host "  [WARN] pg_dump failed. Attempting custom pg_dump path..."
        & "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" -U postgres -h localhost -d $dbName -F c -f $dumpFile 2>&1 | Out-Null
    }
} catch {
    Write-Host "  [WARN] Database backup skipped: pg_dump not found in PATH"
}

# 2. Environment & config backup
try {
    $envFile = Join-Path -Path $dailyDir -ChildPath "env_backup_$timestamp.txt"
    Copy-Item -Path ".env" -Destination $envFile -ErrorAction SilentlyContinue
    Write-Host "  [OK] Environment backup completed"
} catch {
    Write-Host "  [WARN] Environment backup skipped"
}

# 3. Uploaded files backup (if upload directory exists)
try {
    $uploadsDir = "public/uploads"
    if (Test-Path -LiteralPath $uploadsDir) {
        $uploadsFile = Join-Path -Path $dailyDir -ChildPath "uploads_$timestamp.zip"
        Compress-Archive -Path "$uploadsDir\*" -DestinationPath $uploadsFile -Force
        Write-Host "  [OK] Uploads backup completed"
    }
} catch {
    Write-Host "  [WARN] Uploads backup skipped"
}

# 4. Create backup manifest
$manifest = @"
Backup Timestamp: $timestamp
Database: $dbName
Files:
  - Database dump
  - Environment config
  - Uploaded files (if any)
Retention: $retentionDays days
"@
$manifest | Out-File -FilePath (Join-Path -Path $dailyDir -ChildPath "MANIFEST.txt") -Encoding utf8

Write-Host "  [OK] Backup manifest created"

# 5. Cleanup old backups (older than retention days)
$cutoff = (Get-Date).AddDays(-$retentionDays)
Get-ChildItem -Path $backupDir -Directory | Where-Object { $_.CreationTime -lt $cutoff } | ForEach-Object {
    Remove-Item -Path $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  [CLEANUP] Removed old backup: $($_.Name)"
}

Write-Host "[$timestamp] NSLP backup completed. Files stored in: $dailyDir"
