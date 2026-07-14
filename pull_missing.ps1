$images = @("postgis/postgis:15-3.4-alpine", "redis:7-alpine")
foreach ($img in $images) {
    $success = $false
    for ($i = 1; $i -le 100; $i++) {
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
        Write-Host "FATAL: Could not pull $img after 100 attempts."
    }
}
