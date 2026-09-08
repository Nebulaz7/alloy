# Render PWA and Apple Touch Icons using Headless Edge Blink Engine
param()

$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edgePath)) {
    Write-Error "Edge not found at $edgePath"
    exit 1
}

$iconsDir = "c:\Users\PC\Desktop\Coding\Alloy\app\public\icons"
$publicDir = "c:\Users\PC\Desktop\Coding\Alloy\app\public"
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Force -Path $iconsDir | Out-Null
}

$svgPath = "c:\Users\PC\Desktop\Coding\Alloy\app\public\alloy-mascot.svg"
$svgContent = Get-Content -Raw -Path $svgPath

# Function to render SVG at specific size
function Render-Icon {
    param(
        [int]$Width,
        [int]$Height,
        [string]$OutputFile,
        [bool]$Maskable = $false,
        [bool]$FullBleed = $false
    )

    $tempHtml = Join-Path $iconsDir "temp_$Width.html"
    
    # SVG viewBox is 0 0 100 100
    # For maskable or full-bleed (e.g. apple-touch-icon):
    # Apple touch icon should have square background without transparent corners because iOS applies the squircle mask.
    # Maskable should have 80% safe zone with full bleed #007FFF background.
    if ($Maskable) {
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
    background: #007FFF;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .mascot-container {
    width: 80%;
    height: 80%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  svg {
    width: 100%;
    height: 100%;
  }
</style>
</head>
<body>
  <div class="mascot-container">
    $svgContent
  </div>
</body>
</html>
"@
    } elseif ($FullBleed) {
        # Apple touch icon (180x180): Full bleed #007FFF background, mascot squircle filling 100%
        # Replace the rx="28" with rx="0" for full bleed squircle or let it fill with #007FFF background
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
    background: #007FFF;
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
    } else {
        # Standard icon (192x192, 512x512): Transparent body, mascot vector fits exactly
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
    }

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

    $p = Start-Process -FilePath $edgePath -ArgumentList $procArgs -Wait -PassThru -NoNewWindow
    if (Test-Path $tempHtml) {
        Remove-Item $tempHtml -Force
    }

    Write-Host "Generated: $OutputFile"
}

# 1. Standard Icons
Render-Icon -Width 192 -Height 192 -OutputFile (Join-Path $iconsDir "icon-192.png")
Render-Icon -Width 512 -Height 512 -OutputFile (Join-Path $iconsDir "icon-512.png")

# 2. Maskable Icons (safe zone 80% on full-bleed Base Blue #007FFF)
Render-Icon -Width 192 -Height 192 -OutputFile (Join-Path $iconsDir "icon-192-maskable.png") -Maskable $true
Render-Icon -Width 512 -Height 512 -OutputFile (Join-Path $iconsDir "icon-512-maskable.png") -Maskable $true

# 3. Apple Touch Icon (180x180 full bleed)
Render-Icon -Width 180 -Height 180 -OutputFile (Join-Path $iconsDir "apple-touch-icon.png") -FullBleed $true
Copy-Item (Join-Path $iconsDir "apple-touch-icon.png") (Join-Path $publicDir "apple-touch-icon.png") -Force

# 4. Copy SVG icon
Copy-Item $svgPath (Join-Path $iconsDir "icon.svg") -Force

Write-Host "All icons rendered with pixel perfection via Edge Blink engine!"
