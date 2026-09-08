# Generate browser favicon and Next.js app icons from Alloy logo
param()

$baseDir = "c:\Users\PC\Desktop\Coding\Alloy\app"
$publicIconsDir = Join-Path $baseDir "public\icons"
$publicDir = Join-Path $baseDir "public"
$appDir = Join-Path $baseDir "app"
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$svgPath = Join-Path $publicDir "alloy-mascot.svg"
$svgContent = Get-Content -Raw -Path $svgPath

Add-Type -AssemblyName System.Drawing

function Render-Png {
    param(
        [int]$Width,
        [int]$Height,
        [string]$OutputFile
    )

    $tempHtml = Join-Path $publicIconsDir "temp_fav_${Width}.html"
    $html = @"
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${Width}px;
    height: ${Height}px;
    background: transparent;
    overflow: hidden;
  }
  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
</head>
<body>
  $svgContent
</body>
</html>
"@

    [System.IO.File]::WriteAllText($tempHtml, $html, [System.Text.Encoding]::UTF8)

    $procArgs = @(
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        "--screenshot=$OutputFile",
        "--window-size=${Width},${Height}",
        "--default-background-color=00000000",
        $tempHtml
    )

    Start-Process -FilePath $edgePath -ArgumentList $procArgs -Wait -NoNewWindow
    if (Test-Path $tempHtml) {
        Remove-Item $tempHtml -Force
    }
}

# 1. Render small pixel-crisp PNG favicons
$fav32 = Join-Path $publicIconsDir "favicon-32x32.png"
$fav16 = Join-Path $publicIconsDir "favicon-16x16.png"
$fav48 = Join-Path $publicIconsDir "favicon-48x48.png"

Write-Host "Rendering favicon-32x32.png..."
Render-Png -Width 32 -Height 32 -OutputFile $fav32

Write-Host "Rendering favicon-16x16.png..."
Render-Png -Width 16 -Height 16 -OutputFile $fav16

Write-Host "Rendering favicon-48x48.png..."
Render-Png -Width 48 -Height 48 -OutputFile $fav48

# 2. Generate a valid .ico file containing PNG data
# Modern ICO format wraps a 48x48 or 32x32 PNG directly:
# Header: 00 00 (reserved), 01 00 (type 1 = ICO), 01 00 (1 image)
# Entry: Width(1B), Height(1B), Colors(1B=0), Reserved(1B=0), Planes(2B=1), BPP(2B=32), Size(4B), Offset(4B = 22)
# Followed by the raw PNG bytes!
function Convert-PngToIco {
    param(
        [string]$PngPath,
        [string]$IcoPath
    )

    $pngBytes = [System.IO.File]::ReadAllBytes($PngPath)
    $bmp = [System.Drawing.Bitmap]::FromFile($PngPath)
    $w = if ($bmp.Width -ge 256) { [byte]0 } else { [byte]$bmp.Width }
    $h = if ($bmp.Height -ge 256) { [byte]0 } else { [byte]$bmp.Height }
    $bmp.Dispose()

    $header = [byte[]]@(
        0, 0,           # Reserved
        1, 0,           # Type 1 (ICO)
        1, 0,           # 1 Image
        $w,             # Width
        $h,             # Height
        0,              # Color count (0 = >= 256)
        0,              # Reserved
        1, 0,           # Color planes
        32, 0           # Bits per pixel (32)
    )

    $sizeBytes = [System.BitConverter]::GetBytes([int]$pngBytes.Length)
    $offsetBytes = [System.BitConverter]::GetBytes([int]22) # 6 + 16 = 22

    $icoBytes = $header + $sizeBytes + $offsetBytes + $pngBytes
    [System.IO.File]::WriteAllBytes($IcoPath, $icoBytes)
    Write-Host "Saved ICO: $IcoPath ($($icoBytes.Length) bytes)"
}

$appFavicon = Join-Path $appDir "favicon.ico"
$publicFavicon = Join-Path $publicDir "favicon.ico"

# Convert 48x48 PNG to ICO
Convert-PngToIco -PngPath $fav48 -IcoPath $appFavicon
Copy-Item $appFavicon $publicFavicon -Force

# 3. Next.js App Router convention: app/icon.png and app/icon.svg
# When present in app/ directory, Next.js generates the canonical <link rel="icon">
$appIconPng = Join-Path $appDir "icon.png"
Copy-Item (Join-Path $publicIconsDir "icon-192.png") $appIconPng -Force

$appIconSvg = Join-Path $appDir "icon.svg"
Copy-Item $svgPath $appIconSvg -Force

Write-Host "All Alloy browser favicons generated and replaced successfully!"
