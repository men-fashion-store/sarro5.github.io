$ErrorActionPreference = 'Stop'
$webFiles = @('index.html','admin.html','driver.html','manifest.json','sw.js','Orange Modern Food Delivery Service Instagram Post.png')

New-Item -ItemType Directory -Force www | Out-Null
Copy-Item $webFiles www -Force
Write-Host 'Web assets synced to www.'

$androidAssets = 'android\app\src\main\assets\public'
if (Test-Path $androidAssets) {
    Copy-Item $webFiles $androidAssets -Force
    Write-Host "Android assets synced to $androidAssets"
} else {
    Write-Warning "Android assets folder not found: $androidAssets"
}

# Capacitor always opens index.html. Each flavor overlays its own entry page.
$adminPublic = 'android\app\src\admin\assets\public'
$driverPublic = 'android\app\src\driver\assets\public'
New-Item -ItemType Directory -Force $adminPublic | Out-Null
New-Item -ItemType Directory -Force $driverPublic | Out-Null
Copy-Item 'admin.html' (Join-Path $adminPublic 'index.html') -Force
Copy-Item 'driver.html' (Join-Path $driverPublic 'index.html') -Force
Write-Host 'Flavor start pages synced (admin/driver).'
