function Self-Update {
    Write-Host "`n[🔄 Self-Update]" -ForegroundColor Cyan
    Write-Log "Started self-update check"

    $remoteVersionUrl = "$script:REPO_URL/version.json"
    $localVersion = $script:VERSION

    try {
        Write-Host "Checking for updates..." -ForegroundColor Green
        $remoteData = (Invoke-WebRequest -Uri $remoteVersionUrl -UseBasicParsing -ErrorAction Stop).Content | ConvertFrom-Json
        $remoteVersion = $remoteData.version

        Write-Host "Local : v$localVersion" -ForegroundColor Yellow
        Write-Host "Remote: v$remoteVersion" -ForegroundColor Yellow

        if ($remoteVersion -eq $localVersion) {
            Write-Host "`n✅ You are using the latest version." -ForegroundColor Green
            Write-Log "Self-update: Already latest"
            return
        }

        Write-Host "`n🚀 New version available! (v$remoteVersion)" -ForegroundColor Green
        $confirm = Read-Host "Update now? (Y/N)"
        if ($confirm -ne "Y") { Write-Host "Cancelled." -ForegroundColor Yellow; return }

        Write-Host "Downloading update..." -ForegroundColor Green
        $remoteScriptUrl = "$script:REPO_URL/launcher.ps1"
        $tempFile = Join-Path $env:TEMP "SHANECODES-TechHub-updated.ps1"
        Invoke-WebRequest -Uri $remoteScriptUrl -OutFile $tempFile -UseBasicParsing -ErrorAction Stop

        Write-Host "✅ Update downloaded to: $tempFile" -ForegroundColor Green
        Write-Host "Please run this file manually to apply the update." -ForegroundColor Yellow
        Write-Log "Self-update: Downloaded v$remoteVersion"
    } catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
        Write-Log "Self-update error: $_" "ERROR"
    }
}