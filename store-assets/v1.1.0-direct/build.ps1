Add-Type -AssemblyName System.Drawing
$here=Split-Path -Parent $MyInvocation.MyCommand.Path
$src=Join-Path $here 'source'
$ink=[Drawing.Color]::FromArgb(15,25,57);$muted=[Drawing.Color]::FromArgb(78,99,132);$purple=[Drawing.Color]::FromArgb(79,70,229)
function F($size,$style='Regular'){[Drawing.Font]::new('Segoe UI',$size,[Drawing.FontStyle]::$style,[Drawing.GraphicsUnit]::Pixel)}
function B($color){[Drawing.SolidBrush]::new($color)}
function Round($g,$r,$fill,$line=$null){$p=[Drawing.Drawing2D.GraphicsPath]::new();$d=26;$p.AddArc($r.X,$r.Y,$d,$d,180,90);$p.AddArc($r.Right-$d,$r.Y,$d,$d,270,90);$p.AddArc($r.Right-$d,$r.Bottom-$d,$d,$d,0,90);$p.AddArc($r.X,$r.Bottom-$d,$d,$d,90,90);$p.CloseFigure();$g.FillPath((B $fill),$p);if($line){$q=[Drawing.Pen]::new($line,1);$g.DrawPath($q,$p);$q.Dispose()};$p.Dispose()}
function Lines($g,$text,$font,$max){$a=@();$line='';foreach($w in $text.Split(' ')){$t=if($line){"$line $w"}else{$w};if($line -and $g.MeasureString($t,$font).Width -gt $max){$a+=$line;$line=$w}else{$line=$t}};if($line){$a+=$line};$a}
function TextBlock($g,$text,$font,$color,$x,$y,$max,$leading){$br=B $color;$yy=$y;foreach($l in (Lines $g $text $font $max)){$g.DrawString($l,$font,$br,$x,$yy);$yy+=$leading};$br.Dispose();$yy}
function Bullet($g,$label,$x,$y){$g.FillEllipse((B $purple),$x,$y,28,28);$p=[Drawing.Pen]::new([Drawing.Color]::White,2.5);$p.StartCap='Round';$p.EndCap='Round';$g.DrawLines($p,@([Drawing.Point]::new($x+7,$y+14),[Drawing.Point]::new($x+12,$y+20),[Drawing.Point]::new($x+22,$y+9)));$p.Dispose();$g.DrawString($label,(F 20),(B $ink),$x+42,$y+1)}
function ImageFitHeight($g,$path,$x,$y,$height){$i=[Drawing.Image]::FromFile($path);$w=[int]($i.Width*$height/$i.Height);$g.DrawImage($i,$x,$y,$w,$height);$i.Dispose()}
function ImageContain($g,$path,$box){$i=[Drawing.Image]::FromFile($path);$s=[Math]::Min($box.Width/$i.Width,$box.Height/$i.Height);$w=[int]($i.Width*$s);$h=[int]($i.Height*$s);$x=$box.X+[int](($box.Width-$w)/2);$g.DrawImage($i,$x,$box.Y,$w,$h);$i.Dispose()}
function CropImage($g,$path,$sourceRect,$targetRect){$i=[Drawing.Image]::FromFile($path);$g.DrawImage($i,$targetRect,$sourceRect.X,$sourceRect.Y,$sourceRect.Width,$sourceRect.Height,[Drawing.GraphicsUnit]::Pixel);$i.Dispose()}
function MakeSlide($data,$n){
  $bmp=[Drawing.Bitmap]::new(1280,800);$g=[Drawing.Graphics]::FromImage($bmp);$g.SmoothingMode='HighQuality';$g.InterpolationMode='HighQualityBicubic';$g.TextRenderingHint='AntiAliasGridFit'
  $grad=[Drawing.Drawing2D.LinearGradientBrush]::new([Drawing.Rectangle]::new(0,0,1280,800),[Drawing.Color]::FromArgb(249,248,255),[Drawing.Color]::FromArgb(232,230,255),20);$g.FillRectangle($grad,0,0,1280,800);$grad.Dispose();$g.FillEllipse((B [Drawing.Color]::FromArgb(28,115,103,245)),1000,-300,620,620)
  Round $g ([Drawing.Rectangle]::new(60,120,96,96)) [Drawing.Color]::White [Drawing.Color]::FromArgb(225,228,241);$icon=[Drawing.Image]::FromFile((Join-Path $src 'logo.png'));$g.DrawImage($icon,75,135,66,66);$icon.Dispose();$g.DrawString('SEO Copilot',(F 29 'Bold'),(B $ink),185,145);$g.DrawString('AI SEO Checker',(F 17 'Bold'),(B $purple),185,185)
  $titleEnd=TextBlock $g $data.title (F 55 'Bold') $ink 60 260 430 58;$descEnd=TextBlock $g $data.desc (F 21) $muted 60 ($titleEnd+25) 410 32;$yy=$descEnd+25;foreach($b in $data.bullets){Bullet $g $b 62 $yy;$yy+=46}
  $browser=[Drawing.Rectangle]::new(474,54,760,676);Round $g $browser 14 [Drawing.Color]::White [Drawing.Color]::FromArgb(205,211,229);$shadow=[Drawing.Pen]::new([Drawing.Color]::FromArgb(70,35,38,83),8);$g.DrawRectangle($shadow,478,58,752,668);$shadow.Dispose()
  $g.FillRectangle((B [Drawing.Color]::White),474,136,760,594);ImageFitHeight $g (Join-Path $src 'ai-passportphoto-page-clean.png') 474 136 594 | Out-Null
  # Use the legacy reference browser chrome directly so its geometry and styling stay exact.
  CropImage $g (Join-Path $src 'legacy-browser-reference.png') ([Drawing.Rectangle]::new(474,54,760,82)) ([Drawing.Rectangle]::new(474,54,760,82))
  $box=if($n -lt 3){[Drawing.Rectangle]::new(958,136,260,560)}else{[Drawing.Rectangle]::new(918,136,300,570)};Round $g $box 5 [Drawing.Color]::White [Drawing.Color]::FromArgb(205,211,229);ImageContain $g (Join-Path $src $data.img) ([Drawing.Rectangle]::new($box.X+1,$box.Y+1,$box.Width-2,$box.Height-2))
  $dots=B [Drawing.Color]::FromArgb(108,164,158,255);for($x=28;$x -lt 108;$x+=16){for($y=704;$y -lt 768;$y+=16){$g.FillEllipse($dots,$x,$y,4,4)}};$dots.Dispose();$bmp.Save((Join-Path $here $data.file),[Drawing.Imaging.ImageFormat]::Png);$g.Dispose();$bmp.Dispose()
}
$slides=@(
 @{title='Scan any page instantly';desc="Run a fast SEO audit on the page you're viewing and see what needs attention.";bullets=@('One-click page audit','On-page and technical SEO checks','Works directly in Chrome');img='01-analyze.png';file='01-scan-any-page.png'},
 @{title='See your SEO score';desc="Get an instant SEO score, issue summary, and severity overview for the page you're viewing.";bullets=@('SEO score out of 100','Page health at a glance','Clear issue summary');img='02-score.png';file='02-seo-score.png'},
 @{title='Find SEO issues that matter';desc="Understand what's affecting your page and get practical recommendations you can act on.";bullets=@('Prioritized SEO issues','Clear impact explanations','Recommended next steps');img='03-report.png';file='03-find-seo-issues.png'},
 @{title='Improve SEO content with AI';desc="Get page-aware AI suggestions for titles and meta descriptions without leaving your browser.";bullets=@('AI title suggestions','AI meta description suggestions','Before and after comparison');img='04-ai-fix.png';file='04-ai-seo-fix.png'},
 @{title='Compare, copy, and re-scan';desc="Choose the best AI suggestion, copy it, update your page, and scan again.";bullets=@('Compare multiple AI suggestions','Copy your preferred option','Re-scan after updates');img='05-recommendations.png';file='05-copy-and-rescan.png'}
)
for($i=0;$i -lt $slides.Count;$i++){MakeSlide $slides[$i] $i}
