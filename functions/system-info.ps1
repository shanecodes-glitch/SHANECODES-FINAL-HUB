function Get-SystemInfo {
    Write-Host "`n[📊 System Information]" -ForegroundColor Cyan
    Write-Log "Displayed system info"

    try {
        $os = Get-CimInstance Win32_OperatingSystem
        $cpu = Get-CimInstance Win32_Processor
        $ram = Get-CimInstance Win32_PhysicalMemory
        $disk = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3"

        Write-Host @"
╔═══════════════════════════════════════════════════════════════╗
║                    SYSTEM INFORMATION                         ║
╠═══════════════════════════════════════════════════════════════╣
║  OS         : $($os.Caption)
║  Version    : $($os.Version) (Build $($os.BuildNumber))
║  Architecture : $($os.OSArchitecture)
║  Computer   : $env:COMPUTERNAME
║  User       : $env:USERNAME
╠═══════════════════════════════════════════════════════════════╣
║  Processor  : $($cpu.Name)
║  Cores      : $($cpu.NumberOfCores)
║  Logical    : $($cpu.NumberOfLogicalProcessors)
╠═══════════════════════════════════════════════════════════════╣
║  Total RAM  : $([math]::Round(($ram | Measure-Object Capacity -Sum).Sum / 1GB, 2)) GB
║  Slots Used : $($ram.Count)
╠═══════════════════════════════════════════════════════════════╣
"@
        foreach ($d in $disk) {
            $free = [math]::Round($d.FreeSpace / 1GB, 2)
            $total = [math]::Round($d.Size / 1GB, 2)
            $pct = [math]::Round(($d.FreeSpace / $d.Size) * 100, 2)
            Write-Host "║  $($d.DeviceID) : $total GB total, $free GB free ($pct%)"
        }
        Write-Host "╚═══════════════════════════════════════════════════════════════╝"
    } catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
        Write-Log "System info error: $_" "ERROR"
    }
}