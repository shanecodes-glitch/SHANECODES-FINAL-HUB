function Clean-TempFiles {
    Write-Host "`n[🧹 Clean Temporary Files]" -ForegroundColor Cyan
    Write-Log "Started temp cleanup"

    $paths = @("$env:TEMP\*", "$env:WINDIR\Temp\*", "$env:WINDIR\Prefetch\*")
    $count = 0; $size = 0

    foreach ($p in $paths) {
        if (Test-Path $p) {
            Get-ChildItem -Path $p -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object {
                try {
                    $size += $_.Length
                    Remove-Item -Path $_.FullName -Force -ErrorAction SilentlyContinue
                    $count++
                } catch {}
            }
        }
    }

    Write-Host "Deleted $count files, freed ~$([math]::Round($size/1MB, 2)) MB" -ForegroundColor Green
    Write-Log "Cleaned $count files ($([math]::Round($size/1MB, 2)) MB)"
}