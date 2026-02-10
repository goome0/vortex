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
$ticketId = $null
$tmpUsername = $null

# --- Admin login (for cleanup + admin actions) ---
$adminLogin = Invoke-CurlJson -Name 'auth.sign-in.admin' -Method 'POST' -Path '/auth/sign-in' -Body '{"username":"admin","password":"admin123"}'
$results += $adminLogin
Assert-Ok $adminLogin @('200','201')
$adminToken = ($adminLogin.body | ConvertFrom-Json).data.token

try {
  # --- Create temp user ---
  $suffix = (Get-Random -Minimum 10000 -Maximum 99999)
  $tmpUsername = "tkt$($suffix)"
  $tmpEmail = "$tmpUsername@example.com"
  $tmpPassword = 'temp123'

  $signupBody = (@{ username = $tmpUsername; email = $tmpEmail; password = $tmpPassword } | ConvertTo-Json -Compress)
  $signup = Invoke-CurlJson -Name 'auth.sign-up.temp' -Method 'POST' -Path '/auth/sign-up' -Body $signupBody
  $results += $signup
  Assert-Ok $signup @('200','201')

  # --- User login ---
  $userLoginBody = (@{ username = $tmpUsername; password = $tmpPassword } | ConvertTo-Json -Compress)
  $userLogin = Invoke-CurlJson -Name 'auth.sign-in.user' -Method 'POST' -Path '/auth/sign-in' -Body $userLoginBody
  $results += $userLogin
  Assert-Ok $userLogin @('200','201')
  $userToken = ($userLogin.body | ConvertFrom-Json).data.token

  # --- User creates ticket ---
  $createTicketBody = (@{
      subject = 'Test ticket - login issue'
      category = 'ACCOUNT'
      priority = 'LOW'
      message = 'This is an automated test ticket. Please ignore.'
    } | ConvertTo-Json -Compress)
  $createTicket = Invoke-CurlJson -Name 'tickets.create' -Method 'POST' -Path '/tickets' -Body $createTicketBody -BearerToken $userToken
  $results += $createTicket
  Assert-Ok $createTicket @('200','201')
  $ticketId = ($createTicket.body | ConvertFrom-Json).data.id

  # --- User lists and reads ticket ---
  $results += (Invoke-CurlJson -Name 'tickets.my' -Method 'GET' -Path '/tickets/my' -BearerToken $userToken)
  $getTicket = Invoke-CurlJson -Name 'tickets.get' -Method 'GET' -Path "/tickets/$ticketId" -BearerToken $userToken
  $results += $getTicket
  Assert-Ok $getTicket @('200','201')

  # --- User adds message ---
  $userMsgBody = (@{ message = 'Adding a follow-up message.' } | ConvertTo-Json -Compress)
  $results += (Invoke-CurlJson -Name 'tickets.addMessage.user' -Method 'POST' -Path "/tickets/$ticketId/messages" -Body $userMsgBody -BearerToken $userToken)

  # --- Admin sees ticket list and resolves ---
  $results += (Invoke-CurlJson -Name 'admin.tickets.list' -Method 'GET' -Path '/admin/tickets' -BearerToken $adminToken)
  $results += (Invoke-CurlJson -Name 'admin.tickets.get' -Method 'GET' -Path "/admin/tickets/$ticketId" -BearerToken $adminToken)
  $adminMsgBody = (@{ message = 'We are looking into this.' } | ConvertTo-Json -Compress)
  $results += (Invoke-CurlJson -Name 'admin.tickets.addMessage' -Method 'POST' -Path "/admin/tickets/$ticketId/messages" -Body $adminMsgBody -BearerToken $adminToken)
  $resolveBody = (@{ message = 'Resolved (test).' } | ConvertTo-Json -Compress)
  $results += (Invoke-CurlJson -Name 'admin.tickets.resolve' -Method 'POST' -Path "/admin/tickets/$ticketId/resolve" -Body $resolveBody -BearerToken $adminToken)

  # --- User closes ticket ---
  $results += (Invoke-CurlJson -Name 'tickets.close' -Method 'POST' -Path "/tickets/$ticketId/close" -BearerToken $userToken)
}
finally {
  if ($tmpUsername) {
    $deleteBody = (@{ username = $tmpUsername } | ConvertTo-Json -Compress)
    $results += (Invoke-CurlJson -Name 'admin.account.delete.temp' -Method 'POST' -Path '/admin/account/delete' -Body $deleteBody -BearerToken $adminToken)
  }
}

$results | Select-Object name,method,path,code | Format-Table -AutoSize | Out-String | Write-Output

if ($ticketId) {
  Write-Output ''
  Write-Output "Created ticket id: $ticketId"
}

