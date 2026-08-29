Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Drawing.Common -ErrorAction SilentlyContinue
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$source = Join-Path $root 'source'
$out = $root
$ink = [System.Drawing.Color]::FromArgb(17,26,57)
$muted = [System.Drawing.Color]::FromArgb(82,104,135)
$purple = [System.Drawing.Color]::FromArgb(79,70,229)
$border = [System.Drawing.Color]::FromArgb(225,229,241)

function Font($size, $style='Regular') { New-Object System.Drawing.Font('Segoe UI',$size,[System.Drawing.FontStyle]::$style,[System.Drawing.GraphicsUnit]::Pixel) }
function Brush($color) { [System.Drawing.SolidBrush]::new($color) }
function DrawRound($g,$rect,$radius,$fill,$stroke=$null) {
  $p=[System.Drawing.Drawing2D.GraphicsPath]::new(); $d=$radius*2
  $p.AddArc($rect.X,$rect.Y,$d,$d,180,90); $p.AddArc($rect.Right-$d,$rect.Y,$d,$d,270,90); $p.AddArc($rect.Right-$d,$rect.Bottom-$d,$d,$d,0,90); $p.AddArc($rect.X,$rect.Bottom-$d,$d,$d,90,90); $p.CloseFigure()
  $g.FillPath((Brush $fill),$p); if($stroke){$pen=[Drawing.Pen]::new($stroke,1);$g.DrawPath($pen,$p);$pen.Dispose()}; $p.Dispose()
}
function WrapLines($g,$text,$font,$maxWidth) {
  $words=$text.Split(' '); $lines=@(); $line=''
  foreach($word in $words){$test=if($line){$line+' '+$word}else{$word}; if($g.MeasureString($test,$font).Width -gt $maxWidth -and $line){$lines+=$line;$line=$word}else{$line=$test}}
  if($line){$lines+=$line}; return $lines
}
function DrawWrapped($g,$text,$font,$color,$x,$y,$maxWidth,$lineHeight) {
  $b=Brush $color; $yy=$y; foreach($line in (WrapLines $g $text $font $maxWidth)){$g.DrawString($line,$font,$b,$x,$yy);$yy+=$lineHeight};$b.Dispose(); return $yy
}
function DrawBullet($g,$text,$x,$y) {
  $g.FillEllipse((Brush $purple),$x,$y+2,28,28); $pen=[Drawing.Pen]::new([Drawing.Color]::White,2.5);$pen.StartCap='Round';$pen.EndCap='Round';$g.DrawLines($pen,@([Drawing.Point]::new($x+7,$y+16),[Drawing.Point]::new($x+12,$y+21),[Drawing.Point]::new($x+22,$y+10)));$pen.Dispose();$g.DrawString($text,(Font 20),(Brush $ink),$x+42,$y+2)
}
function DrawImageContain($g,$path,$box) {
  $img=[Drawing.Image]::FromFile($path); $scale=[Math]::Min($box.Width/$img.Width,$box.Height/$img.Height); $w=[int]($img.Width*$scale);$h=[int]($img.Height*$scale);$x=$box.X+[int](($box.Width-$w)/2);$y=$box.Y; $g.DrawImage($img,[Drawing.Rectangle]::new($x,$y,$w,$h));$img.Dispose()
}
function DrawImageFitWidth($g,$path,$x,$y,$width) {
  $img=[Drawing.Image]::FromFile($path);$height=[int]($img.Height*$width/$img.Width);$g.DrawImage($img,$x,$y,$width,$height);$img.Dispose();return $height
}
function DrawImageFitHeight($g,$path,$x,$y,$height) {
  $img=[Drawing.Image]::FromFile($path);$width=[int]($img.Width*$height/$img.Height);$g.DrawImage($img,$x,$y,$width,$height);$img.Dispose();return $width
}
function Render($item,$index) {
  $bmp=[Drawing.Bitmap]::new(1280,800); $g=[Drawing.Graphics]::FromImage($bmp); $g.SmoothingMode='HighQuality';$g.InterpolationMode='HighQualityBicubic';$g.TextRenderingHint='AntiAliasGridFit'
  $bg=[Drawing.Drawing2D.LinearGradientBrush]::new([Drawing.Rectangle]::new(0,0,1280,800),[Drawing.Color]::FromArgb(248,247,255),[Drawing.Color]::FromArgb(232,230,255),25);$g.FillRectangle($bg,0,0,1280,800);$bg.Dispose()
  $g.FillEllipse((Brush [Drawing.Color]::FromArgb(18,110,92,240)),960,-300,650,650)
  DrawRound $g ([Drawing.Rectangle]::new(60,120,96,96)) 18 [Drawing.Color]::White ([Drawing.Color]::FromArgb(225,228,241));$logo=[Drawing.Image]::FromFile((Join-Path $source 'logo.png'));$g.DrawImage($logo,75,135,66,66);$logo.Dispose();$g.DrawString('SEO Copilot',(Font 29 'Bold'),(Brush $ink),185,145);$g.DrawString('AI SEO Checker',(Font 17 'Bold'),(Brush $purple),185,185)
  $y=260;$titleEnd=DrawWrapped $g $item.title (Font 55 'Bold') $ink 60 $y 430 58;$descY=$titleEnd+25;$descEnd=DrawWrapped $g $item.desc (Font 21) $muted 60 $descY 410 32;$by=$descEnd+25;foreach($b in $item.bullets){DrawBullet $g $b 62 $by;$by+=46}
  $frame=[Drawing.Rectangle]::new(474,54,760,676);DrawRound $g $frame 14 [Drawing.Color]::White ([Drawing.Color]::FromArgb(208,213,230))
  $g.FillRectangle((Brush [Drawing.Color]::FromArgb(234,238,247)),474,54,760,52);$g.DrawLine([Drawing.Pen]$border,474,106,1234,106)
  $g.FillEllipse((Brush [Drawing.Color]::FromArgb(255,113,105)),492,75,11,11);$g.FillEllipse((Brush [Drawing.Color]::FromArgb(255,198,76)),511,75,11,11);$g.FillEllipse((Brush [Drawing.Color]::FromArgb(73,198,110)),530,75,11,11)
  DrawRound $g ([Drawing.Rectangle]::new(565,66,570,28)) 7 [Drawing.Color]::White ([Drawing.Color]::FromArgb(224,228,238)); $g.DrawString('https://aipassportphoto.com/india-passport-photo/',(Font 13),(Brush $muted),579,72)
  $g.FillRectangle((Brush [Drawing.Color]::White),474,106,760,624);DrawImageFitHeight $g (Join-Path $source 'ai-passportphoto-page.png') 474 106 624 | Out-Null
  $panelBox=if($index -ge 3){[Drawing.Rectangle]::new(878,122,340,570)}else{[Drawing.Rectangle]::new(918,132,300,560)};DrawRound $g $panelBox 5 [Drawing.Color]::White ([Drawing.Color]::FromArgb(211,216,232));DrawImageContain $g (Join-Path $source $item.img) ([Drawing.Rectangle]::new($panelBox.X+1,$panelBox.Y+1,$panelBox.Width-2,$panelBox.Height-2))
  $decor=(Brush [Drawing.Color]::FromArgb(110,169,158,255)); for($dx=28;$dx -lt 108;$dx+=16){for($dy=704;$dy -lt 768;$dy+=16){$g.FillEllipse($decor,$dx,$dy,4,4)}};$decor.Dispose()
  $file=Join-Path $out $item.file;$bmp.Save($file,[Drawing.Imaging.ImageFormat]::Png);$g.Dispose();$bmp.Dispose()
}
$items=@(
 @{title="Scan any page instantly";desc="Run a fast SEO audit on the page you're viewing and see what needs attention.";bullets=@("One-click page audit","On-page and technical SEO checks","Works directly in Chrome");img='01-analyze.png';file='01-scan-any-page.png'},
 @{title="See your SEO score";desc="Get an instant SEO score, issue summary, and severity overview for the page you're viewing.";bullets=@("SEO score out of 100","Page health at a glance","Clear issue summary");img='02-score.png';file='02-seo-score.png'},
 @{title="Find SEO issues that matter";desc="Understand what's affecting your page and get practical recommendations you can act on.";bullets=@("Prioritized SEO issues","Clear impact explanations","Recommended next steps");img='03-report.png';file='03-find-seo-issues.png'},
 @{title="Improve SEO content with AI";desc="Get page-aware AI suggestions for titles and meta descriptions without leaving your browser.";bullets=@("AI title suggestions","AI meta description suggestions","Before and after comparison");img='04-ai-fix.png';file='04-ai-seo-fix.png'},
 @{title="Compare, copy, and re-scan";desc="Choose the best AI suggestion, copy it, update your page, and scan again.";bullets=@("Compare multiple AI suggestions","Copy your preferred option","Re-scan after updates");img='05-recommendations.png';file='05-copy-and-rescan.png'}
)
for($i=0;$i -lt $items.Count;$i++){Render $items[$i] $i}
