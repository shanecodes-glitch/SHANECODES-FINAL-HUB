function View-Log {
    Write-Host "`n[📜 View Log]" -ForegroundColor Cyan
    if (Test-Path $script:LOG_PATH) {
        Get-Content $script:LOG_PATH -Tail 50
    } else {
        Write-Host "No log file found at: $script:LOG_PATH" -ForegroundColor Yellow
    }
}