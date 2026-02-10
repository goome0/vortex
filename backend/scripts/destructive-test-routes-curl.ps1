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

function Assert-Ok([PSCustomObject]$r, [string[]]$okCodes) {
  if ($r.code -notin $okCodes) {
    Write-Output ''
    Write-Output "FAILED: $($r.name) [$($r.method) $($r.path)] code=$($r.code)"
    Write-Output $r.body
    exit 1
  }
}

$results = @()

# --- Login as admin ---
$login = Invoke-CurlJson -Name 'auth.sign-in' -Method 'POST' -Path '/auth/sign-in' -Body '{"username":"admin","password":"admin123"}'
$results += $login
Assert-Ok $login @('200','201')

$loginObj = $login.body | ConvertFrom-Json
$token = $loginObj.data.token

# --- Create temporary user (sign-up) ---
$suffix = (Get-Random -Minimum 10000 -Maximum 99999)
$tmpUsername = "tmp$($suffix)"
$tmpEmail = "$tmpUsername@example.com"
$tmpPassword = 'temp123'
$tmpPassword2 = 'temp124'

$signupBody = (@{ username = $tmpUsername; email = $tmpEmail; password = $tmpPassword } | ConvertTo-Json -Compress)
$signup = Invoke-CurlJson -Name 'auth.sign-up.temp' -Method 'POST' -Path '/auth/sign-up' -Body $signupBody
$results += $signup
Assert-Ok $signup @('200','201')

try {
  # --- Update temp account ---
  $updateBody = (@{
      username = $tmpUsername
      password = $tmpPassword2
      disp_name = 'Temp User'
      cp = 0
      ticket_count = 0
      user_level = 0
      enabled = $true
    } | ConvertTo-Json -Compress)

  $update = Invoke-CurlJson -Name 'admin.account.update.temp' -Method 'POST' -Path '/admin/account/update' -Body $updateBody -BearerToken $token
  $results += $update
  Assert-Ok $update @('200','201')

  # --- Fetch temp account (non-destructive verification) ---
  $getBody = (@{ username = $tmpUsername } | ConvertTo-Json -Compress)
  $getAcc = Invoke-CurlJson -Name 'admin.account.get.temp' -Method 'POST' -Path '/admin/account' -Body $getBody -BearerToken $token
  $results += $getAcc
  Assert-Ok $getAcc @('200','201')

  # --- Promo create/delete (destructive but self-cleaning) ---
  $promos = Invoke-CurlJson -Name 'admin.promos' -Method 'GET' -Path '/admin/promos' -BearerToken $token
  $results += $promos
  Assert-Ok $promos @('200','201')

  $promosObj = $promos.body | ConvertFrom-Json
  $items = @()
  if ($promosObj.data.promos -and $promosObj.data.promos.Count -gt 0) {
    $first = $promosObj.data.promos[0]
    if ($first.items -and $first.items.Count -gt 0) {
      $items = @($first.items[0])
    }
  }
  if ($items.Count -eq 0) {
    # Fallback: common test product id
    $items = @(1)
  }

  $now = [int][DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  $promoCode = "TMP$now$suffix"
  $promoCreateBody = (@{
      code = $promoCode
      startTime = $now
      endTime = ($now + 3600)
      useLimit = 1
      limitType = 'account'
      items = $items
    } | ConvertTo-Json -Compress)

  $promoCreate = Invoke-CurlJson -Name 'admin.promo.create.temp' -Method 'POST' -Path '/admin/promo/create' -Body $promoCreateBody -BearerToken $token
  $results += $promoCreate
  Assert-Ok $promoCreate @('200','201')

  $promoDeleteBody = (@{ code = $promoCode } | ConvertTo-Json -Compress)
  $promoDelete = Invoke-CurlJson -Name 'admin.promo.delete.temp' -Method 'POST' -Path '/admin/promo/delete' -Body $promoDeleteBody -BearerToken $token
  $results += $promoDelete
  Assert-Ok $promoDelete @('200','201')
}
finally {
  # --- Always delete temporary user ---
  $deleteBody = (@{ username = $tmpUsername } | ConvertTo-Json -Compress)
  $deleteAcc = Invoke-CurlJson -Name 'admin.account.delete.temp' -Method 'POST' -Path '/admin/account/delete' -Body $deleteBody -BearerToken $token
  $results += $deleteAcc
}

$results | Select-Object name,method,path,code | Format-Table -AutoSize | Out-String | Write-Output

# Highlight any unexpected non-2xx in the cleanup call.
$cleanup = $results | Where-Object { $_.name -eq 'admin.account.delete.temp' } | Select-Object -First 1
if ($cleanup -and $cleanup.code -notin @('200','201')) {
  Write-Output ''
  Write-Output "Cleanup (account delete) failed:"
  Write-Output $cleanup.body
  exit 1
}

