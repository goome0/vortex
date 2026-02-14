$ErrorActionPreference = 'Stop'

function Import-DotEnv([string]$Path) {
  if (!(Test-Path $Path)) { return }
  Get-Content $Path | ForEach-Object {
    if ($_ -match '^\s*#') { return }
    if ($_ -match '^\s*$') { return }
    $idx = $_.IndexOf('=')
    if ($idx -lt 1) { return }
    $k = $_.Substring(0, $idx).Trim()
    $v = $_.Substring($idx + 1).Trim().Trim('"').Trim("'")
    if ($k) { Set-Item -Path "Env:$k" -Value $v }
  }
}

# Load vortex backend env (works when running from repo root or backend/)
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$backendRoot = Resolve-Path (Join-Path $repoRoot 'backend')
Import-DotEnv (Join-Path $backendRoot '.env')

if (-not $env:DB_HOST -or -not $env:DB_PORT -or -not $env:DB_USERNAME -or -not $env:DB_PASSWORD -or -not $env:DB_DATABASE) {
  throw 'Missing DB_* env vars. Check `backend/.env`.'
}

$ghostbayRoot = Resolve-Path (Join-Path $backendRoot '..\..')
$compHackRoot = Resolve-Path (Join-Path $ghostbayRoot 'comp_hack')

$exe = Join-Path $compHackRoot 'build64\bin\RelWithDebInfo\comp_lobby.exe'
if (!(Test-Path $exe)) {
  throw "comp_lobby.exe not found at: $exe"
}

$configPath = Join-Path $compHackRoot 'build64\testing\config\lobby.vortex.local.xml'
$logDir = Join-Path $compHackRoot 'build64\testing\log'
New-Item -ItemType Directory -Force -Path (Split-Path $configPath) | Out-Null
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$compHackRootPosix = ($compHackRoot.Path -replace '\\', '/')
$dataStore = "$compHackRootPosix/datastore"
$webRoot = "$compHackRootPosix/contrib/webroot"
$logFile = (($logDir -replace '\\', '/') + '/lobby.log')

$xml = @"
<?xml version="1.0" encoding="UTF-8"?>
<objgen>
  <object name="LobbyConfig">
    <member name="DiffieHellmanKeyPair">9C4169BBE8F535F7A7404D4EB3AE22CF63C0450FC2C7B2A5A03794D4CFA9F290FF5774267885E60B848280E3A07468366E62F040DAC3CB67E95E8F3DC4D97F94AD1D3D98F0B066F72B65CB391643A95BB96CF048ED5D60FB7AF7A969F38ABD2301F6A7EC4DB7DAFC2CFD1F417E0B634033FEE8B102D62A28EC03D95266E2B0B3</member>
    <member name="Port">10666</member>
    <member name="DatabaseType">MARIADB</member>
    <member name="MultithreadMode">true</member>
    <member name="DataStore"><element>$dataStore</element></member>
    <member name="DataStoreSync">true</member>
    <member name="LogFile">$logFile</member>
    <member name="LogFileTimestamp">true</member>
    <member name="LogFileAppend">true</member>
    <member name="LogDebug">true</member>
    <member name="LogInfo">true</member>
    <member name="LogWarning">true</member>
    <member name="LogError">true</member>
    <member name="LogCritical">true</member>
    <member name="ServerConstantsPath"/>

    <member name="MariaDBConfig">
      <object>
        <member name="IP">$env:DB_HOST</member>
        <member name="Port">$env:DB_PORT</member>
        <member name="DatabaseName">$env:DB_DATABASE</member>
        <member name="DatabaseType">comp_hack</member>
        <member name="DefaultDatabaseType">comp_hack</member>
        <member name="Username">$env:DB_USERNAME</member>
        <member name="Password">$env:DB_PASSWORD</member>
        <member name="MockData">false</member>
        <member name="AutoSchemaUpdate">true</member>
      </object>
    </member>

    <member name="CharacterDeletionDelay">0</member>
    <member name="CharacterTicketCost">0</member>
    <member name="RegistrationCP">0</member>
    <member name="RegistrationTicketCount">1</member>
    <member name="RegistrationUserLevel">0</member>
    <member name="RegistrationAccountEnabled">true</member>
    <member name="WebListeningPort">10999</member>
    <member name="WebRoot">$webRoot</member>
    <member name="ClientVersion">1.666</member>
  </object>
</objgen>
"@

Set-Content -Path $configPath -Value $xml -Encoding UTF8

Start-Process -FilePath $exe -ArgumentList @($configPath) -WorkingDirectory $compHackRoot | Out-Null

Start-Sleep -Seconds 2
try {
  Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:10999/' -TimeoutSec 3 | Out-Null
  Write-Host 'OK: comp_hack lobby WebAPI is responding on http://127.0.0.1:10999'
} catch {
  Write-Host "WARN: lobby WebAPI not responding yet on 10999 ($($_.Exception.Message))"
}
