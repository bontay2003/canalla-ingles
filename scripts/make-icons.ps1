# Genera los iconos PNG de la PWA en docs/icons (Windows, System.Drawing)
Add-Type -AssemblyName System.Drawing
$out = Join-Path $PSScriptRoot "..\docs\icons"
New-Item -ItemType Directory -Force $out | Out-Null

function New-Icon([int]$size, [string]$file, [bool]$maskable) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'; $g.TextRenderingHint = 'AntiAliasGridFit'
  $ink = [System.Drawing.ColorTranslator]::FromHtml('#16212B')
  $amber = [System.Drawing.ColorTranslator]::FromHtml('#F0B429')
  $g.Clear($ink)
  # Zona segura: los iconos "maskable" dejan margen para el recorte del sistema
  $pad = if ($maskable) { $size * 0.2 } else { $size * 0.1 }
  $inner = $size - 2 * $pad
  # Texto "EN"
  $font = New-Object System.Drawing.Font 'Arial', ([float]($inner * 0.42)), ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = 'Center'; $fmt.LineAlignment = 'Center'
  $rect = New-Object System.Drawing.RectangleF ([float]$pad), ([float]$pad), ([float]$inner), ([float]($inner * 0.72))
  $g.DrawString('EN', $font, (New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)), $rect, $fmt)
  # Barra de 10 puntos, como en la app (7 encendidos)
  $gap = $inner * 0.02; $w = ($inner - 9 * $gap) / 10; $h = $inner * 0.09; $y = $pad + $inner * 0.8
  $off = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#3A4A57'))
  for ($i = 0; $i -lt 10; $i++) {
    $b = if ($i -lt 7) { New-Object System.Drawing.SolidBrush $amber } else { $off }
    $g.FillRectangle($b, [float]($pad + $i * ($w + $gap)), [float]$y, [float]$w, [float]$h)
  }
  $bmp.Save((Join-Path $out $file), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

New-Icon 192 'icon-192.png' $false
New-Icon 512 'icon-512.png' $false
New-Icon 512 'icon-maskable-512.png' $true
New-Icon 180 'apple-touch-icon.png' $false
