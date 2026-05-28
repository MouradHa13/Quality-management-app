param(
    [string]$message = "Update project"
)

$git = "C:\Program Files\Git\bin\git.exe"

Write-Host "📦 Ajout des fichiers..." -ForegroundColor Cyan
& $git add .

Write-Host "💬 Commit: $message" -ForegroundColor Yellow
& $git commit -m $message

Write-Host "🚀 Push vers GitHub..." -ForegroundColor Green
& $git push

Write-Host "✅ Projet mis à jour sur GitHub!" -ForegroundColor Green
