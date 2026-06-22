$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root ".env"

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) {
        return
    }

    $parts = $line -split "=", 2
    if ($parts.Count -eq 2) {
        [Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), "Process")
    }
}

if (-not $env:BRAVE_API_KEY) {
    throw "BRAVE_API_KEY is not set."
}

$headers = @{
    "X-Subscription-Token" = $env:BRAVE_API_KEY
    "Accept" = "application/json"
}

$response = Invoke-RestMethod -Uri "https://api.search.brave.com/res/v1/web/search?q=OpenAI&count=3" -Headers $headers
$count = $response.web.results.Count
$title = $response.web.results[0].title

Write-Output "web_results=$count"
Write-Output "first_title=$title"
