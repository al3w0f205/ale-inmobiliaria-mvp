$images = @("traefik:v2.10", "postgis/postgis:15-3.4-alpine", "redis:7-alpine", "python:3.10-alpine", "node:18-alpine")

foreach ($img in $images) {
    $success = $false
    for ($i = 1; $i -le 20; $i++) {
        Write-Host "Pulling $img (Attempt $i)..."
        docker pull $img
        if ($LASTEXITCODE -eq 0) {
            $success = $true
            Write-Host "Successfully pulled $img."
            break
        }
        Write-Host "Failed to pull $img. Retrying in 2 seconds..."
        Start-Sleep -Seconds 2
    }
    if (-not $success) {
        Write-Host "FATAL: Could not pull $img after 20 attempts."
    }
}
