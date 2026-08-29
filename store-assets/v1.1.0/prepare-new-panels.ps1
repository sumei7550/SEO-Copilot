Add-Type -AssemblyName System.Drawing
$source=Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) 'source'
$raw=Join-Path $source 'new-full-browser-captures'
New-Item -ItemType Directory -Force -Path $raw | Out-Null
$items=@(
  @{input='C:\Users\Zozo\AppData\Local\Temp\codex-clipboard-f8520e6b-77b4-4276-bdd2-442e61f52b77.png'; output='01-analyze.png'; crop=[Drawing.Rectangle]::new(1257,53,603,714)},
  @{input='C:\Users\Zozo\AppData\Local\Temp\codex-clipboard-8957d96e-60dc-47b8-9508-70274a00f69c.png'; output='02-score.png'; crop=[Drawing.Rectangle]::new(1257,53,604,713)},
  @{input='C:\Users\Zozo\AppData\Local\Temp\codex-clipboard-a192703f-497c-4579-ad1b-0ddb71ad169e.png'; output='03-report.png'; crop=[Drawing.Rectangle]::new(1233,53,627,904)},
  @{input='C:\Users\Zozo\AppData\Local\Temp\codex-clipboard-d0b615c0-4de4-4c53-832f-6d81476960d2.png'; output='04-ai-fix.png'; crop=[Drawing.Rectangle]::new(1223,52,598,908)},
  @{input='C:\Users\Zozo\AppData\Local\Temp\codex-clipboard-5d6cc183-601b-4ee9-a9af-8cf6992f887d.png'; output='05-recommendations.png'; crop=[Drawing.Rectangle]::new(1232,52,628,906)}
)
foreach($item in $items){
  Copy-Item -LiteralPath $item.input -Destination (Join-Path $raw ([IO.Path]::GetFileName($item.input))) -Force
  $img=[Drawing.Bitmap]::new($item.input);$crop=$img.Clone($item.crop,[Drawing.Imaging.PixelFormat]::Format32bppArgb);$crop.Save((Join-Path $source $item.output),[Drawing.Imaging.ImageFormat]::Png);$crop.Dispose();$img.Dispose()
}
$page=[Drawing.Bitmap]::new($items[0].input);$pageCrop=$page.Clone([Drawing.Rectangle]::new(0,113,1257,640),[Drawing.Imaging.PixelFormat]::Format32bppArgb);$pageCrop.Save((Join-Path $source 'ai-passportphoto-page.png'),[Drawing.Imaging.ImageFormat]::Png);$pageCrop.Dispose();$page.Dispose()
