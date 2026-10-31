# Installs Eclipse Temurin JDK 17 under D:\Java (zip, no MSI — avoids filling C:).
# Run in PowerShell:  Set-ExecutionPolicy -Scope Process Bypass; .\scripts\install-java-d.ps1

$ErrorActionPreference = "Stop"

$root = "D:\Java"
$tmp = "D:\tmp"
$zip = Join-Path $tmp "temurin17-jdk.zip"
$url = "https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse?project=jdk"

New-Item -ItemType Directory -Force -Path $root, $tmp | Out-Null
$env:TEMP = $tmp
$env:TMP = $tmp

Write-Host "Downloading Temurin 17 JDK to $zip ..."
Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing

$extractRoot = Join-Path $root "extract"
if (Test-Path $extractRoot) { Remove-Item -Recurse -Force $extractRoot }
New-Item -ItemType Directory -Force -Path $extractRoot | Out-Null
Expand-Archive -Path $zip -DestinationPath $extractRoot -Force

$jdkDir = Get-ChildItem -Path $extractRoot -Directory | Select-Object -First 1
if (-not $jdkDir) { throw "No JDK folder found after extract." }

$target = Join-Path $root "jdk-17"
if (Test-Path $target) { Remove-Item -Recurse -Force $target }
Move-Item -Path $jdkDir.FullName -Destination $target

Remove-Item -Recurse -Force $extractRoot
Remove-Item -Force $zip -ErrorAction SilentlyContinue

$java = Join-Path $target "bin\java.exe"
& $java -version

Write-Host ""
Write-Host "Installed: $target"
Write-Host "Optional — add to your user PATH (new terminals):"
Write-Host '  [Environment]::SetEnvironmentVariable("JAVA_HOME", "' + $target + '", "User")'
Write-Host '  $path = [Environment]::GetEnvironmentVariable("Path", "User")'
Write-Host '  [Environment]::SetEnvironmentVariable("Path", "' + (Join-Path $target "bin") + ';" + $path, "User")'
Write-Host ""
Write-Host "E2e (npm run test:e2e:local) will also pick up D:\Java\jdk-17\bin if java is not on PATH."
