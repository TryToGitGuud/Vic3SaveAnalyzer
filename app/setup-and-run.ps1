$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSCommandPath
$Port = 4173
$Url = "http://127.0.0.1:$Port/"

function Write-Step($Message) {
  Write-Host ""
  Write-Host "== $Message ==" -ForegroundColor Cyan
}

function Test-Command($Name) {
  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Refresh-Path() {
  $machine = [Environment]::GetEnvironmentVariable("Path", "Machine")
  $user = [Environment]::GetEnvironmentVariable("Path", "User")
  $env:Path = "$machine;$user"
}

function Install-WithWinget($Id, $Name) {
  if (!(Test-Command "winget")) {
    throw "$Name is missing and winget is not available. Install $Name manually, then run this launcher again."
  }

  Write-Step "Installing $Name"
  winget install --id $Id --exact --accept-package-agreements --accept-source-agreements
  Refresh-Path
}

function Get-Node() {
  $bundled = Join-Path $Root "runtime\node\node.exe"
  if (Test-Path $bundled) {
    return $bundled
  }

  $node = Get-Command "node" -ErrorAction SilentlyContinue
  if ($node) {
    return $node.Source
  }

  Install-WithWinget "OpenJS.NodeJS.LTS" "Node.js LTS"

  $node = Get-Command "node" -ErrorAction SilentlyContinue
  if ($node) {
    return $node.Source
  }

  throw "Node.js was installed but is not visible in PATH yet. Close this window and run GitGudSaveAnalyzer.exe again."
}

function Ensure-Python() {
  $bundled = Join-Path $Root "runtime\python\python.exe"
  if (Test-Path $bundled) {
    return
  }

  if (Test-Command "py" -or Test-Command "python") {
    return
  }

  Install-WithWinget "Python.Python.3.12" "Python 3"

  if (!(Test-Command "py") -and !(Test-Command "python")) {
    Write-Host "Python was installed but may require restarting the launcher before binary save conversion works." -ForegroundColor Yellow
  }
}

function Wait-ForServer() {
  for ($i = 0; $i -lt 40; $i++) {
    try {
      Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 1 | Out-Null
      return $true
    } catch {
      Start-Sleep -Milliseconds 500
    }
  }
  return $false
}

$serverProcess = $null

function Stop-PortServer() {
  $lines = netstat -ano | Select-String ":$Port"
  foreach ($line in $lines) {
    $parts = ($line.ToString().Trim() -split "\s+")
    if ($parts.Length -lt 5) {
      continue
    }

    $pidText = $parts[-1]
    $pidValue = 0
    if ([int]::TryParse($pidText, [ref]$pidValue) -and $pidValue -gt 0 -and $pidValue -ne $PID) {
      try {
        Write-Host "Stopping existing process on port $Port (PID $pidValue)..." -ForegroundColor Yellow
        Stop-Process -Id $pidValue -Force -ErrorAction SilentlyContinue
      } catch {
      }
    }
  }
}

function Stop-ServerProcess() {
  if ($null -eq $serverProcess) {
    return
  }

  try {
    if (!$serverProcess.HasExited) {
      Write-Host ""
      Write-Host "Stopping GitGud Save Analyzer server..." -ForegroundColor Yellow
      Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    }
  } catch {
  }
}

try {
  Write-Host "GitGud Save Analyzer" -ForegroundColor Green
  Write-Host "Starting local server from: $Root"

  $Node = Get-Node
  Ensure-Python

  $Server = Join-Path $Root "local-server.cjs"
  if (!(Test-Path $Server)) {
    throw "local-server.cjs was not found."
  }

  if (Wait-ForServer) {
    Write-Host "Server is already running on port $Port." -ForegroundColor Yellow
    Stop-PortServer
    Start-Sleep -Milliseconds 500
  }

  Write-Step "Starting server"
  $env:PORT = "$Port"
  $serverProcess = Start-Process -FilePath $Node -ArgumentList "`"$Server`"" -WorkingDirectory $Root -WindowStyle Hidden -PassThru

  if (!(Wait-ForServer)) {
    throw "Local server did not answer on $Url"
  }

  Write-Host "Ready: $Url" -ForegroundColor Green
  Start-Process $Url

  Write-Host ""
  Write-Host "Keep this window open while using the analyzer." -ForegroundColor Cyan
  Write-Host "Close this window or press Ctrl+C to stop the local server on port $Port."

  try {
    while ($null -ne $serverProcess -and !$serverProcess.HasExited) {
      Start-Sleep -Seconds 1
    }
  } finally {
    Stop-ServerProcess
  }
} catch {
  Write-Host ""
  Write-Host "Startup failed:" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  Write-Host ""
  Write-Host "Manual requirements:"
  Write-Host "  Node.js LTS"
  Write-Host "  Python 3"
  Read-Host "Press Enter to close"
  Stop-ServerProcess
  exit 1
}
