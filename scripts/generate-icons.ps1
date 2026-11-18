Add-Type -AssemblyName System.Drawing

function Generate-PwaIcon {
    param(
        [int]$Size,
        [string]$OutputPath
    )

    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Clear transparent
    $g.Clear([System.Drawing.Color]::Transparent)

    # Gradient Brush (Purple to Lilac)
    $rect = New-Object System.Drawing.Rectangle 0, 0, $Size, $Size
    $color1 = [System.Drawing.Color]::FromArgb(255, 124, 58, 237) # #7C3AED
    $color2 = [System.Drawing.Color]::FromArgb(255, 167, 139, 250) # #A78BFA
    $gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $color1, $color2, 45.0

    # Draw rounded squircle
    $radius = [int]($Size * 0.22)
    $diameter = $radius * 2
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $arcRect = New-Object System.Drawing.Rectangle 0, 0, $diameter, $diameter
    $path.AddArc($arcRect, 180, 90)
    $arcRect.X = $Size - $diameter
    $path.AddArc($arcRect, 270, 90)
    $arcRect.Y = $Size - $diameter
    $path.AddArc($arcRect, 0, 90)
    $arcRect.X = 0
    $path.AddArc($arcRect, 90, 90)
    $path.CloseFigure()

    $g.FillPath($gradBrush, $path)

    # Draw White Wallet Motif
    $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    $softBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(200, 237, 233, 254))
    $purpleBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 124, 58, 237))

    # Wallet Main Body
    $wX = [int]($Size * 0.22)
    $wY = [int]($Size * 0.30)
    $wW = [int]($Size * 0.56)
    $wH = [int]($Size * 0.40)
    $wRad = [int]($Size * 0.08)
    
    # Back card
    $cardRect = New-Object System.Drawing.Rectangle ([int]($Size * 0.30)), ([int]($Size * 0.22)), ([int]($Size * 0.40)), ([int]($Size * 0.16))
    $g.FillRectangle($softBrush, $cardRect)

    # Wallet Body
    $wPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $wDia = $wRad * 2
    $wArc = New-Object System.Drawing.Rectangle $wX, $wY, $wDia, $wDia
    $wPath.AddArc($wArc, 180, 90)
    $wArc.X = $wX + $wW - $wDia
    $wPath.AddArc($wArc, 270, 90)
    $wArc.Y = $wY + $wH - $wDia
    $wPath.AddArc($wArc, 0, 90)
    $wArc.X = $wX
    $wPath.AddArc($wArc, 90, 90)
    $wPath.CloseFigure()
    $g.FillPath($whiteBrush, $wPath)

    # Wallet Clasp
    $claspX = [int]($wX + $wW - ($Size * 0.16))
    $claspY = [int]($wY + ($wH * 0.32))
    $claspW = [int]($Size * 0.18)
    $claspH = [int]($Size * 0.16)
    $g.FillRectangle($gradBrush, $claspX, $claspY, $claspW, $claspH)
    $g.FillEllipse($whiteBrush, [int]($claspX + ($claspW * 0.25)), [int]($claspY + ($claspH * 0.25)), [int]($claspW * 0.45), [int]($claspH * 0.45))

    # Clean up
    $g.Dispose()
    $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Generated: $OutputPath"
}

Generate-PwaIcon -Size 192 -OutputPath "C:\coding\web\pengeluaranku\public\icon-192.png"
Generate-PwaIcon -Size 512 -OutputPath "C:\coding\web\pengeluaranku\public\icon-512.png"
Generate-PwaIcon -Size 180 -OutputPath "C:\coding\web\pengeluaranku\public\apple-touch-icon.png"
