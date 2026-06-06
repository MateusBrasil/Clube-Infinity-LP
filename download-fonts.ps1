# Baixa todas as fontes referenciadas no CSS deles
$ErrorActionPreference = 'SilentlyContinue'
$cssFiles = @(
  'C:\Users\mateu\Documents\Projetos\Lp Clube Infinity\clube-infinity-lp\app\auryon-1.css',
  'C:\Users\mateu\Documents\Projetos\Lp Clube Infinity\clube-infinity-lp\app\auryon-2.css'
)
$publicDir = 'C:\Users\mateu\Documents\Projetos\Lp Clube Infinity\clube-infinity-lp\public'
$base = 'https://auryonacademy.com'

$allText = ''
foreach ($f in $cssFiles) { $allText += [System.IO.File]::ReadAllText($f) }

$paths = [regex]::Matches($allText, '/_next/static/media/[a-zA-Z0-9._-]+\.[a-z0-9]+') | ForEach-Object { $_.Value } | Sort-Object -Unique
Write-Host "Encontradas $($paths.Count) referências de font/media"

$ok = 0; $fail = 0
foreach ($p in $paths) {
  $localPath = Join-Path $publicDir $p.Substring(1)
  if (Test-Path $localPath) { $ok++; continue }
  New-Item -Path (Split-Path $localPath -Parent) -ItemType Directory -Force | Out-Null
  try {
    Invoke-WebRequest -Uri "$base$p" -UseBasicParsing -OutFile $localPath -TimeoutSec 20 | Out-Null
    $ok++
    Write-Host "  OK   $p"
  } catch {
    $fail++
    Write-Host "  FAIL $p"
  }
}
Write-Host "Done: $ok ok, $fail fail"
