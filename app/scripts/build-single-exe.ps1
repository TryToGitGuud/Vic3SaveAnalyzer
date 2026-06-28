param(
  [string]$PortableZip = "..\..\outputs\vic3-save-analyzer-portable.zip",
  [string]$OutputExe = "..\..\outputs\GitGudSaveAnalyzer.exe"
)

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$zipPath = Resolve-Path (Join-Path $root $PortableZip)
$outPath = Join-Path $root $OutputExe
$baseExe = Join-Path $env:TEMP ("GitGudSaveAnalyzerBase-" + [guid]::NewGuid().ToString("N") + ".exe")
$marker = [Text.Encoding]::ASCII.GetBytes("GITGUD_SAVE_ANALYZER_PAYLOAD_V1")

$csc = "$env:WINDIR\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (!(Test-Path $csc)) {
  $csc = "$env:WINDIR\Microsoft.NET\Framework\v4.0.30319\csc.exe"
}
if (!(Test-Path $csc)) {
  throw "Could not find the .NET Framework C# compiler."
}

Push-Location $root
try {
  & $csc /nologo /target:winexe /out:$baseExe /reference:System.IO.Compression.dll /reference:System.IO.Compression.FileSystem.dll /reference:System.Windows.Forms.dll GitGudSaveAnalyzerSelfExtractingLauncher.cs
  if ($LASTEXITCODE -ne 0) {
    throw "Launcher compilation failed."
  }

  $exeBytes = [IO.File]::ReadAllBytes($baseExe)
  $zipBytes = [IO.File]::ReadAllBytes($zipPath)
  $lengthBytes = [BitConverter]::GetBytes([Int64]$zipBytes.Length)

  $outFull = [IO.Path]::GetFullPath($outPath)
  $outDir = Split-Path $outFull -Parent
  New-Item -ItemType Directory -Path $outDir -Force | Out-Null

  $stream = [IO.File]::Create($outFull)
  try {
    $stream.Write($exeBytes, 0, $exeBytes.Length)
    $stream.Write($zipBytes, 0, $zipBytes.Length)
    $stream.Write($marker, 0, $marker.Length)
    $stream.Write($lengthBytes, 0, $lengthBytes.Length)
  }
  finally {
    $stream.Dispose()
  }

  Write-Host "Single-file launcher created:"
  Write-Host $outFull
}
finally {
  Pop-Location
  if (Test-Path $baseExe) {
    Remove-Item -LiteralPath $baseExe -Force
  }
}
