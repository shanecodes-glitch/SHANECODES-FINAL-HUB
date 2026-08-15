function Install-Apps {
    Write-Host "`n[📦 Software Installation]" -ForegroundColor Cyan
    Write-Log "Started software installation"

    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        Write-Host "⚠️ winget not available. Install App Installer from Microsoft Store." -ForegroundColor Red
        Write-Log "winget not found" "ERROR"
        return
    }

    $apps = @(
        @{Display="7-Zip"; Id="7zip.7zip"},
        @{Display="Google Chrome"; Id="Google.Chrome"},
        @{Display="Mozilla Firefox"; Id="Mozilla.Firefox"},
        @{Display="VLC Media Player"; Id="VideoLAN.VLC"},
        @{Display="Visual Studio Code"; Id="Microsoft.VisualStudioCode"},
        @{Display="Discord"; Id="Discord.Discord"},
        @{Display="Spotify"; Id="Spotify.Spotify"},
        @{Display="Notepad++"; Id="Notepad++.Notepad++"},
        @{Display="Git"; Id="Git.Git"},
        @{Display="OBS Studio"; Id="OBSProject.OBSStudio"},
        @{Display="ShareX"; Id="ShareX.ShareX"},
        @{Display="Everything"; Id="voidtools.Everything"}
    )

    Write-Host "`nSelect apps (numbers separated by commas, or 'all'):`n"
    for ($i = 0; $i -lt $apps.Count; $i++) {
        Write-Host "  $($i+1). $($apps[$i].Display)"
    }

    $input = Read-Host "`nEnter selection"
    if ($input -eq "all") { $selected = $apps } else {
        $selected = @()
        ($input -split ',' | ForEach-Object { $_.Trim() }) | ForEach-Object {
            if ($_ -match '^\d+$' -and [int]$_ -ge 1 -and [int]$_ -le $apps.Count) {
                $selected += $apps[[int]$_ - 1]
            }
        }
    }

    if ($selected.Count -eq 0) { Write-Host "No valid selection." -ForegroundColor Yellow; return }

    Write-Host "`nInstalling $($selected.Count) app(s)...`n" -ForegroundColor Green
    foreach ($app in $selected) {
        Write-Host "  Installing $($app.Display)... " -NoNewline
        try {
            winget install --id $app.Id --silent --accept-package-agreements 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅" -ForegroundColor Green
                Write-Log "Installed $($app.Display)"
            } else {
                Write-Host "❌" -ForegroundColor Red
                Write-Log "Failed to install $($app.Display)" "ERROR"
            }
        } catch {
            Write-Host "❌" -ForegroundColor Red
            Write-Log "Error installing $($app.Display): $_" "ERROR"
        }
    }
    Write-Host "`n✅ Installation complete." -ForegroundColor Green
}