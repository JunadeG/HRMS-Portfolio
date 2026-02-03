$pattern = 'com\.HRMSbackend\.HRMSbackend'
$root = Get-Location
Get-ChildItem -Path $root -Include *.java,*.properties -Recurse -File | ForEach-Object {
    $p = $_.FullName
    try {
        $c = [System.IO.File]::ReadAllText($p)
    } catch { continue }
    $nc = [System.Text.RegularExpressions.Regex]::Replace($c, $pattern, 'com')
    if ($nc -ne $c) {
        [System.IO.File]::WriteAllText($p, $nc)
        Write-Output "Updated: $p"
    }
}
Write-Output 'Done'
