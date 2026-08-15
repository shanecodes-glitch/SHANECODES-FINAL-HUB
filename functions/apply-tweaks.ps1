function Apply-Tweaks {
    Write-Host "`n[⚡ System Tweaks]" -ForegroundColor Cyan
    Write-Log "Started system tweaks"

    Write-Host "`nSelect category:`n"
    Write-Host "  1. Performance"
    Write-Host "  2. Privacy"
    Write-Host "  3. Interface"
    Write-Host "  4. Explorer"
    Write-Host "  5. All Recommended"
    Write-Host "  6. Return"

    $choice = Read-Host "`nEnter choice (1-6)"
    if ($choice -eq "6") { return }

    $tweaks = switch ($choice) {
        "1" {
            @(
                @{Name="Disable animations"; Path="HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"; ValueName="VisualFXSetting"; Value=2; Type="DWord"},
                @{Name="Disable transparency"; Path="HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize"; ValueName="EnableTransparency"; Value=0; Type="DWord"}
            )
        }
        "2" {
            @(
                @{Name="Disable telemetry"; Path="HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection"; ValueName="AllowTelemetry"; Value=0; Type="DWord"},
                @{Name="Disable Cortana"; Path="HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Search"; ValueName="AllowCortana"; Value=0; Type="DWord"}
            )
        }
        "3" {
            @(
                @{Name="Enable dark mode"; Path="HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize"; ValueName="AppsUseLightTheme"; Value=0; Type="DWord"}
            )
        }
        "4" {
            @(
                @{Name="Show file extensions"; Path="HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"; ValueName="HideFileExt"; Value=0; Type="DWord"},
                @{Name="Show hidden files"; Path="HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"; ValueName="Hidden"; Value=1; Type="DWord"}
            )
        }
        "5" {
            @(
                @{Name="Disable telemetry"; Path="HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection"; ValueName="AllowTelemetry"; Value=0; Type="DWord"},
                @{Name="Disable animations"; Path="HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"; ValueName="VisualFXSetting"; Value=2; Type="DWord"},
                @{Name="Show file extensions"; Path="HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"; ValueName="HideFileExt"; Value=0; Type="DWord"},
                @{Name="Show hidden files"; Path="HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"; ValueName="Hidden"; Value=1; Type="DWord"},
                @{Name="Enable dark mode"; Path="HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize"; ValueName="AppsUseLightTheme"; Value=0; Type="DWord"}
            )
        }
        default { Write-Host "Invalid." -ForegroundColor Red; return }
    }

    if (-not $tweaks) { return }

    Write-Host "`nApplying $($tweaks.Count) tweaks...`n" -ForegroundColor Green
    try { Checkpoint-Computer -Description "TechHub - Before tweaks" -ErrorAction SilentlyContinue } catch {}

    $count = 0
    foreach ($t in $tweaks) {
        Write-Host "  $($t.Name)... " -NoNewline
        try {
            $parent = Split-Path $t.Path -Parent
            if (-not (Test-Path $parent)) { New-Item -Path $parent -Force | Out-Null }
            Set-ItemProperty -Path $t.Path -Name $t.ValueName -Value $t.Value -Type $t.Type -Force
            Write-Host "✅" -ForegroundColor Green
            $count++
            Write-Log "Applied: $($t.Name)"
        } catch {
            Write-Host "❌" -ForegroundColor Red
            Write-Log "Failed: $($t.Name) - $_" "ERROR"
        }
    }
    Write-Host "`n✅ $count/$($tweaks.Count) tweaks applied." -ForegroundColor Green
}