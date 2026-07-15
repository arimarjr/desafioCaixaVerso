$root = "C:\Desenvolvimento\hackathon2026CaixaVersoSmartFlow"
$output = "$root\codigos.txt"
$exts = @("*.ts","*.html","*.scss","*.css","*.cs","*.py","*.sql")
$excludePatterns = @("node_modules","\\bin\\","\\obj\\","\\dist\\","\\.angular\\","relatorio-seguranca-jwt","_gerar_codigos")

$allFiles = @()
foreach ($ext in $exts) {
    $found = Get-ChildItem -Path $root -Recurse -Filter $ext -File
    foreach ($f in $found) {
        $skip = $false
        foreach ($pat in $excludePatterns) {
            if ($f.FullName -like "*$($pat.Replace('\\','*'))*") { $skip = $true; break }
            if ($f.FullName -match $pat) { $skip = $true; break }
        }
        if (-not $skip) { $allFiles += $f }
    }
}

$allFiles = $allFiles | Sort-Object FullName | Group-Object FullName | ForEach-Object { $_.Group[0] }

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add("================================================================================")
$lines.Add("CODIGOS DO SISTEMA - SmartFlow PJ")
$lines.Add("Gerado em: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$lines.Add("Total de arquivos: $($allFiles.Count)")
$lines.Add("================================================================================")
$lines.Add("")

foreach ($file in $allFiles) {
    $lines.Add("================================================================================")
    $lines.Add($file.FullName)
    $lines.Add("================================================================================")
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
        $lines.Add($content)
    } catch {
        $lines.Add("[ERRO AO LER ARQUIVO: $_]")
    }
    $lines.Add("")
}

[System.IO.File]::WriteAllLines($output, $lines, [System.Text.Encoding]::UTF8)
Write-Host "CONCLUIDO: $($allFiles.Count) arquivos gravados em $output"
