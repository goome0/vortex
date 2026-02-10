$ErrorActionPreference = 'Stop'

$BaseUrl = 'http://localhost:6005'

function Invoke-CurlJson {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][ValidateSet('GET','POST')][string]$Method,
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $false)][AllowNull()][string]$Body,
    [Parameter(Mandatory = $false)][AllowNull()][string]$BearerToken
  )

  $args = @('-s', '-X', $Method, '-w', "`n%{http_code}")
  $tmpPath = $null

  if ($BearerToken) {
    $args += @('-H', "Authorization: Bearer $BearerToken")
  }

  if ($null -ne $Body) {
    $tmpPath = (New-TemporaryFile).FullName
    # Write UTF-8 without BOM, so curl sends exact JSON.
    [System.IO.File]::WriteAllText($tmpPath, $Body, [System.Text.UTF8Encoding]::new($false))
    $args += @('-H', 'Content-Type: application/json', '--data-binary', "@$tmpPath")
  }

  $args += "$BaseUrl$Path"

  $out = & curl.exe @args
  if ($tmpPath) {
    Remove-Item -LiteralPath $tmpPath -Force -ErrorAction SilentlyContinue
  }
  $parts = $out -split "`n"
  $code = $parts[-1].Trim()
  $resp = ($parts[0..($parts.Length - 2)] -join "`n").Trim()

  [PSCustomObject]@{
    name = $Name
    method = $Method
    path = $Path
    code = $code
    body = $resp
  }
}

$results = @()

# --- Auth ---
$login = Invoke-CurlJson -Name 'auth.sign-in' -Method 'POST' -Path '/auth/sign-in' -Body '{"username":"admin","password":"admin123"}'
$results += $login

if ($login.code -notin @('200', '201')) {
  $results | Select-Object name,method,path,code | Format-Table -AutoSize | Out-String | Write-Output
  Write-Output "Sign-in failed body:"
  Write-Output $login.body
  exit 1
}

$loginObj = $login.body | ConvertFrom-Json
$token = $loginObj.data.token
$refreshToken = $loginObj.data.refreshToken

$results += Invoke-CurlJson -Name 'auth.refresh-token' -Method 'POST' -Path '/auth/refresh-token' -Body (@{ refreshToken = $refreshToken } | ConvertTo-Json -Compress)
$results += Invoke-CurlJson -Name 'auth.profile' -Method 'GET' -Path '/auth/profile' -BearerToken $token

# Validation-only (won't change data)
$results += Invoke-CurlJson -Name 'auth.reset-password.validation' -Method 'POST' -Path '/auth/reset-password' -Body '{}' -BearerToken $token
$results += Invoke-CurlJson -Name 'auth.sign-up.validation' -Method 'POST' -Path '/auth/sign-up' -Body '{}'

# --- Admin (safe smoke: GETs + validation errors) ---
$results += Invoke-CurlJson -Name 'admin.accounts' -Method 'GET' -Path '/admin/accounts' -BearerToken $token
$results += Invoke-CurlJson -Name 'admin.account.validation' -Method 'POST' -Path '/admin/account' -Body '{}' -BearerToken $token
$results += Invoke-CurlJson -Name 'admin.account.update.validation' -Method 'POST' -Path '/admin/account/update' -Body '{}' -BearerToken $token
$results += Invoke-CurlJson -Name 'admin.account.delete.validation' -Method 'POST' -Path '/admin/account/delete' -Body '{}' -BearerToken $token
$results += Invoke-CurlJson -Name 'admin.kick-player.validation' -Method 'POST' -Path '/admin/kick-player' -Body '{}' -BearerToken $token
$results += Invoke-CurlJson -Name 'admin.message-world.validation' -Method 'POST' -Path '/admin/message-world' -Body '{}' -BearerToken $token
$results += Invoke-CurlJson -Name 'admin.online' -Method 'POST' -Path '/admin/online' -Body '{}' -BearerToken $token
$results += Invoke-CurlJson -Name 'admin.post-items.validation' -Method 'POST' -Path '/admin/post-items' -Body '{}' -BearerToken $token
$results += Invoke-CurlJson -Name 'admin.promos' -Method 'GET' -Path '/admin/promos' -BearerToken $token
$results += Invoke-CurlJson -Name 'admin.promo.create.validation' -Method 'POST' -Path '/admin/promo/create' -Body '{}' -BearerToken $token
$results += Invoke-CurlJson -Name 'admin.promo.delete.validation' -Method 'POST' -Path '/admin/promo/delete' -Body '{}' -BearerToken $token

# --- WebGame (read-only + validation) ---
$results += Invoke-CurlJson -Name 'webgame.coins' -Method 'GET' -Path '/webgame/coins' -BearerToken $token
$results += Invoke-CurlJson -Name 'webgame.start.validation' -Method 'POST' -Path '/webgame/start' -Body '{}' -BearerToken $token
$results += Invoke-CurlJson -Name 'webgame.update.validation' -Method 'POST' -Path '/webgame/update' -Body '{}' -BearerToken $token

$results | Select-Object name,method,path,code | Format-Table -AutoSize | Out-String | Write-Output

# Show bodies for non-2xx that were expected to be 2xx.
$expectedOk = @(
  'auth.sign-in',
  'auth.refresh-token',
  'auth.profile',
  'admin.accounts',
  'admin.online',
  'admin.promos',
  'webgame.coins'
)

foreach ($r in $results) {
  if ($expectedOk -contains $r.name) {
    if ($r.code -notmatch '^(200|201)$') {
      Write-Output ''
      Write-Output "---- Unexpected non-OK: $($r.name) [$($r.code)] ----"
      Write-Output $r.body
    }
  }
}

