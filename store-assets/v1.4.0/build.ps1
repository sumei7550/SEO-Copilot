Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$source = Join-Path $root 'source'
$ink = [Drawing.Color]::FromArgb(18, 25, 56)
$muted = [Drawing.Color]::FromArgb(75, 87, 119)
$purple = [Drawing.Color]::FromArgb(84, 55, 229)

function New-Font([float]$size, [string]$style = 'Regular') {
  [Drawing.Font]::new('Segoe UI', $size, [Drawing.FontStyle]::$style, [Drawing.GraphicsUnit]::Pixel)
}

function New-Brush([Drawing.Color]$color) {
  [Drawing.SolidBrush]::new($color)
}

function Draw-RoundRect($graphics, [Drawing.Rectangle]$rect, [int]$radius, [Drawing.Color]$fill, [Drawing.Color]$border) {
  $path = [Drawing.Drawing2D.GraphicsPath]::new()
  $diameter = $radius * 2
  $path.AddArc($rect.Left, $rect.Top, $diameter, $diameter, 180, 90)
  $path.AddArc($rect.Right - $diameter, $rect.Top, $diameter, $diameter, 270, 90)
  $path.AddArc($rect.Right - $diameter, $rect.Bottom - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($rect.Left, $rect.Bottom - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  $brush = New-Brush $fill
  $graphics.FillPath($brush, $path)
  $pen = [Drawing.Pen]::new($border, 1)
  $graphics.DrawPath($pen, $path)
  $pen.Dispose()
  $brush.Dispose()
  $path.Dispose()
}

function Draw-Text($graphics, [string]$text, [float]$size, [string]$style, [Drawing.Color]$color, [float]$x, [float]$y) {
  $font = New-Font $size $style
  $brush = New-Brush $color
  $graphics.DrawString($text, $font, $brush, $x, $y)
  $font.Dispose()
  $brush.Dispose()
}

function Draw-Source($graphics, [string]$path, [Drawing.Rectangle]$srcRect, [Drawing.Rectangle]$dstRect) {
  $bitmap = [Drawing.Image]::FromFile($path)
  $graphics.DrawImage($bitmap, $dstRect, $srcRect.Left, $srcRect.Top, $srcRect.Width, $srcRect.Height, [Drawing.GraphicsUnit]::Pixel)
  $bitmap.Dispose()
}

function Make-Slide($slide, [int]$number) {
  $bitmap = [Drawing.Bitmap]::new(1280, 800)
  $graphics = [Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.TextRenderingHint = [Drawing.Text.TextRenderingHint]::ClearTypeGridFit

  $background = [Drawing.Drawing2D.LinearGradientBrush]::new(
    [Drawing.Rectangle]::new(0, 0, 1280, 800),
    [Drawing.Color]::FromArgb(250, 249, 255),
    [Drawing.Color]::FromArgb(229, 228, 255),
    14
  )
  $graphics.FillRectangle($background, 0, 0, 1280, 800)
  $background.Dispose()
  $circleBrush = New-Brush ([Drawing.Color]::FromArgb(22, 97, 75, 239))
  $graphics.FillEllipse($circleBrush, 955, -270, 610, 610)
  $graphics.FillEllipse($circleBrush, -180, 650, 390, 390)
  $circleBrush.Dispose()

  $rule = [Drawing.Pen]::new([Drawing.Color]::FromArgb(216, 214, 247), 1)
  $graphics.DrawLine($rule, 54, 144, 455, 144)
  $rule.Dispose()

  Draw-RoundRect $graphics ([Drawing.Rectangle]::new(54, 58, 74, 74)) 15 ([Drawing.Color]::White) ([Drawing.Color]::FromArgb(226, 226, 244))
  Draw-Source $graphics (Join-Path $source 'logo.png') ([Drawing.Rectangle]::new(0, 0, 128, 128)) ([Drawing.Rectangle]::new(66, 70, 50, 50))
  Draw-Text $graphics 'SEO Copilot' 27 'Bold' $ink 146 69
  Draw-Text $graphics 'ON-PAGE SEO CHECKER' 13 'Bold' $purple 148 106

  Draw-Text $graphics $slide.title 53 'Bold' $ink 54 206
  Draw-Text $graphics $slide.description 21 'Regular' $muted 56 395
  Draw-Text $graphics $slide.detail 17 'Regular' $muted 56 515
  $chipTop = 656
  Draw-RoundRect $graphics ([Drawing.Rectangle]::new(54, $chipTop, 346, 48)) 12 ([Drawing.Color]::FromArgb(239, 236, 255)) ([Drawing.Color]::FromArgb(226, 221, 252))
  Draw-Text $graphics $slide.chip 16 'Bold' $purple 73 ($chipTop + 12)
  Draw-Text $graphics ('0' + $number + ' / 05') 15 'Bold' ([Drawing.Color]::FromArgb(103, 97, 145)) 56 742

  if ($slide.kind -eq 'report') {
    $frame = [Drawing.Rectangle]::new(562, 63, 672, 691)
    $content = [Drawing.Rectangle]::new(574, 75, 648, 666)
    $crop = [Drawing.Rectangle]::new(0, 97, 556, 571)
  } else {
    $frame = [Drawing.Rectangle]::new(481, 73, 753, 634)
    $content = [Drawing.Rectangle]::new(491, 83, 733, 614)
    $crop = [Drawing.Rectangle]::new(6, 5, 722, 595)
  }
  $shadow = New-Brush ([Drawing.Color]::FromArgb(18, 25, 24, 98))
  $graphics.FillEllipse($shadow, $frame.Left + 14, $frame.Bottom - 14, $frame.Width - 16, 38)
  $shadow.Dispose()
  Draw-RoundRect $graphics $frame 19 ([Drawing.Color]::White) ([Drawing.Color]::FromArgb(216, 216, 237))
  $graphics.SetClip($content)
  Draw-Source $graphics (Join-Path $source $slide.image) $crop $content
  $graphics.ResetClip()

  $output = Join-Path $root $slide.file
  $bitmap.Save($output, [Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
  Write-Output $output
}

$slides = @(
  @{ file = '01-page-seo-at-a-glance-1280x800.png'; image = 'content.png'; kind = 'popup'; title = "Page SEO,`nat a glance"; description = "Read titles, descriptions,`nheadings, and page details."; detail = 'See the current page before opening a full audit.'; chip = 'Title · Meta · Headings' },
  @{ file = '02-indexability-signals-1280x800.png'; image = 'indexability.png'; kind = 'popup'; title = "Review`nindexability"; description = "Inspect canonical, robots,`nsitemaps, and hreflang."; detail = 'Understand the signals found on this page.'; chip = 'Canonical · Robots · Hreflang' },
  @{ file = '03-structured-data-1280x800.png'; image = 'structured-data.png'; kind = 'popup'; title = "Explore`nstructured data"; description = "Read markup types, properties,`nand nested objects."; detail = 'Inspect collected data without leaving the page.'; chip = 'JSON-LD · Page markup' },
  @{ file = '04-image-alt-issues-1280x800.png'; image = 'images.png'; kind = 'popup'; title = "Spot image`nalt issues"; description = "Find missing and empty alt text`nin the current page's images."; detail = 'Filter results and review image details.'; chip = 'Images · Alt text · Filters' },
  @{ file = '05-prioritized-seo-report-1280x800.png'; image = 'report.png'; kind = 'report'; title = "Know what`nto fix next"; description = "See your score, issue severity,`nand recommended actions."; detail = 'Move from a quick check to a focused report.'; chip = 'Score · Issues · Actions' }
)

for ($index = 0; $index -lt $slides.Count; $index++) {
  Make-Slide $slides[$index] ($index + 1)
}
