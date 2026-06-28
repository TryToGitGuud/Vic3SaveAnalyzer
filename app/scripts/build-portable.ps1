param(
  [string]$OutputDir = "release\GitGudSaveAnalyzer"
)

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$output = Join-Path $root $OutputDir

Push-Location $root
try {
  npm install
  npm run build

  if (Test-Path $output) {
    Remove-Item -LiteralPath $output -Recurse -Force
  }
  New-Item -ItemType Directory -Path $output -Force | Out-Null

  Copy-Item -Path "dist\*" -Destination $output -Recurse -Force
  Copy-Item -Path "local-server.cjs","run-local-server.bat","vic3_melt.py","rakaly.dll","README.md","Dockerfile" -Destination $output -Force

  $launcher = Join-Path $root "Victoria3SaveAnalyzer.exe"
  if (Test-Path $launcher) {
    Copy-Item -Path $launcher -Destination $output -Force
  } else {
    Write-Warning "Victoria3SaveAnalyzer.exe was not found. Compile Vic3SaveAnalyzerLauncher.cs or copy the launcher manually."
  }

  $nodeCommand = Get-Command node -ErrorAction SilentlyContinue
  if ($nodeCommand) {
    $node = $nodeCommand.Source
    New-Item -ItemType Directory -Path (Join-Path $output "runtime\node") -Force | Out-Null
    Copy-Item -Path $node -Destination (Join-Path $output "runtime\node\node.exe") -Force
  } else {
    Write-Warning "Node.js was not found. The portable package will require Node installed on the target PC."
  }

  $pythonCommand = Get-Command python -ErrorAction SilentlyContinue
  $python = if ($pythonCommand) { $pythonCommand.Source } else { $null }
  if ($python -and $python -notlike "*WindowsApps*") {
    $pythonRoot = Split-Path $python -Parent
    Copy-Item -Path $pythonRoot -Destination (Join-Path $output "runtime\python") -Recurse -Force
  } else {
    Write-Warning "A real Python installation was not found. The portable package will require Python installed on the target PC."
  }

  $zip = "$output.zip"
  if (Test-Path $zip) {
    Remove-Item -LiteralPath $zip -Force
  }
  Compress-Archive -Path (Join-Path $output "*") -DestinationPath $zip -Force

  Write-Host "Portable package created:"
  Write-Host $output
  Write-Host $zip
}
finally {
  Pop-Location
}
