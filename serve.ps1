# Simple HTTP Server Launcher for Portfolio
# Usage: .\serve.ps1
# Requires: Python 3.x

param(
    [int]$Port = 8000
)

$baseUrl = "http://127.0.0.1:$Port/"
$root = Get-Location
Write-Host "🚀 Starting Portfolio Server..."
Write-Host "📁 Serving from: $root"
Write-Host "🌐 Open browser at: $baseUrl"
Write-Host "⏹️  Press Ctrl+C to stop"
Write-Host ""

# Use Python's built-in HTTP server (available in Python 3.x)
try {
    python -m http.server $Port --bind 127.0.0.1
}
catch {
    Write-Host "❌ Error: Could not start server."
    Write-Host "If this fails, please use Python or Node.js to serve the folder locally:"
    Write-Host "  python -m http.server 8000"
    Write-Host "  npx http-server -p 8000"
    exit 1
}

# Content-type map
$map = @{
    'html' = 'text/html; charset=utf-8'
    'htm'  = 'text/html; charset=utf-8'
    'css'  = 'text/css'
    'js'   = 'application/javascript'
    'json' = 'application/json'
    'svg'  = 'image/svg+xml'
    'png'  = 'image/png'
    'jpg'  = 'image/jpeg'
    'jpeg' = 'image/jpeg'
    'gif'  = 'image/gif'
    'pdf'  = 'application/pdf'
    'txt'  = 'text/plain'
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.AbsolutePath.TrimStart('/')
        if ([string]::IsNullOrEmpty($urlPath)) { $urlPath = 'index.html' }

        # Prevent directory traversal
        $urlPath = $urlPath -replace '\\.\\./', ''

        $filePath = Join-Path -Path $root -ChildPath $urlPath
        if (-not (Test-Path $filePath)) {
            # fallback to index.html for SPA routes
            $filePath = Join-Path -Path $root -ChildPath 'index.html'
        }

        try {
            $ext = [System.IO.Path]::GetExtension($filePath).TrimStart('.').ToLower()
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $contentType = $map[$ext]
            if (-not $contentType) { $contentType = 'application/octet-stream' }
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.StatusCode = 200
        }
        catch {
            $errMsg = "404 Not Found"
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($errMsg)
            $response.ContentType = 'text/plain'
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.StatusCode = 404
        }
        finally {
            $response.OutputStream.Close()
        }
    }
}
finally {
    if ($listener -and $listener.IsListening) { $listener.Stop(); $listener.Close() }
}
