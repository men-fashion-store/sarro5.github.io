$ErrorActionPreference = 'Stop'
$outDir = Join-Path $PSScriptRoot 'التطبيقات'
New-Item -ItemType Directory -Force $outDir | Out-Null

$apks = @{
    'الصاروووخ-العملاء.apk'  = 'android\app\build\outputs\apk\client\debug\app-client-debug.apk'
    'الصاروووخ-الادمن.apk'   = 'android\app\build\outputs\apk\admin\debug\app-admin-debug.apk'
    'الصاروووخ-الدليفري.apk' = 'android\app\build\outputs\apk\driver\debug\app-driver-debug.apk'
}

foreach ($name in $apks.Keys) {
    $src = Join-Path $PSScriptRoot $apks[$name]
    if (-not (Test-Path $src)) {
        throw "APK not found: $src"
    }
    Copy-Item $src (Join-Path $outDir $name) -Force
    Write-Host "Copied $name"
}

Write-Host "APKs ready in $outDir"
