<#
.SYNOPSIS
    SHANECODES TECH HUB - FINAL LAUNCHER
.DESCRIPTION
    Single source of truth. Downloads and executes modular functions.
.EXAMPLE
    irm https://raw.githubusercontent.com/shanecodes-glitch/SHANECODES-FINAL-HUB/main/launcher.ps1 | iex
.NOTES
    Author: Shane Nichael Obinguar
    Version: 1.0.0
#>

#Requires -RunAsAdministrator

# ── CONFIGURATION ──
$script:REPO_URL = "https://raw.githubusercontent.com/shanecodes-glitch/SHANECODES-FINAL-HUB/main"
$script:LOG_PATH = Join-Path $env:TEMP "ShaneCodes-TechHub.log"
$script:VERSION = "1.0.0"

# ── LOGGING ──
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $entry = "[$timestamp] [$Level] $Message"
    Add-Content -Path $script:LOG_PATH -Value $entry -ErrorAction SilentlyContinue
    $color = switch ($Level) {
        "INFO"    { "White" }
        "WARNING" { "Yellow" }
        "ERROR"   { "Red" }
        default   { "White" }
    }
    Write-Host $entry -ForegroundColor $color
}

# ── DOWNLOAD AND EXECUTE FUNCTION ──
function Invoke-Module {
    param([string]$Name)
    $url = "$script:REPO_URL/functions/$Name"
    Write-Log "Loading module: $Name"
    try {
        $scriptBlock = [ScriptBlock]::Create((Invoke-WebRequest -Uri $url -UseBasicParsing -ErrorAction Stop).Content)
        & $scriptBlock
    } catch {
        Write-Log "Failed to load $Name : $_" "ERROR"
        Write-Host "⚠️ Module '$Name' could not be loaded." -ForegroundColor Red
    }
}

# ── SHOW BANNER ──
Clear-Host
Write-Host @"
   _____  _   _   _____  ____    _   _   _____   _____  _   _   _   _   _____ 
  / ____|| \ | | / ____|/ __ \  | \ | | |_   _| / ____|| | | | | \ | | |  __ \
 | (___  |  \| || |    | |  | | |  \| |   | |  | |     | |_| | |  \| | | |__) |
  \___ \ | . ` || |    | |  | | | . ` |   | |  | |     |  _  | | . ` | |  ___/
  ____) || |\  || |____| |__| | | |\  |  _| |_ | |____ | | | | | |\  | | |
 |_____/ |_| \_| \_____|\____/  |_| \_| |_____| \_____||_| |_| |_| \_| |_|
                                                                           
═══════════════════════════════════════════════════════════════════════════════
  SHANECODES TECH HUB  |  FINAL RELEASE v$script:VERSION  |  By Shane Nichael Obinguar
═══════════════════════════════════════════════════════════════════════════════
"@
Write-Log "SHANECODES TECH HUB v$script:VERSION started"

# ── CHECK ADMIN ──
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "This utility must be run as Administrator."
    Write-Warning "Please restart PowerShell as Administrator."
    Write-Log "Non-admin execution attempt" "WARNING"
    Write-Host "`nPress any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# ── MAIN MENU ──
function Show-MainMenu {
    Write-Host "`n[ MAIN MENU ]`n"
    Write-Host "  1.  📦 Install Software"
    Write-Host "  2.  ⚡ Apply System Tweaks"
    Write-Host "  3.  🔧 Windows Update Manager"
    Write-Host "  4.  📊 View System Information"
    Write-Host "  5.  🔄 Self-Update Tech Hub"
    Write-Host "  6.  📜 View Log"
    Write-Host "  7.  🧹 Clean Temporary Files"
    Write-Host "  8.  ❌ Exit"
    Write-Host "`n───────────────────────────────────────────────────────────────────────────────────────"
    Write-Host "  Log: $script:LOG_PATH"
    Write-Host "───────────────────────────────────────────────────────────────────────────────────────"

    $choice = Read-Host "`nEnter your choice (1-8)"

    switch ($choice) {
        "1" { Invoke-Module "install-apps.ps1"; return $true }
        "2" { Invoke-Module "apply-tweaks.ps1"; return $true }
        "3" { Invoke-Module "update-manager.ps1"; return $true }
        "4" { Invoke-Module "system-info.ps1"; return $true }
        "5" { Invoke-Module "self-update.ps1"; return $true }
        "6" { Invoke-Module "view-log.ps1"; return $true }
        "7" { Invoke-Module "clean-temp.ps1"; return $true }
        "8" {
            Write-Host "`nExiting SHANECODES TECH HUB. Goodbye!" -ForegroundColor Green
            Write-Log "User exited"
            exit 0
        }
        default {
            Write-Host "`nInvalid choice." -ForegroundColor Red
            return $true
        }
    }
}

# ── LOOP ──
do {
    $continue = Show-MainMenu
    if ($continue) {
        Write-Host "`nPress any key to return to the main menu..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
} while ($continue)

Write-Log "SHANECODES TECH HUB finished"