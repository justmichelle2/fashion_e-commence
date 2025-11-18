if (Test-Path "web-dev.pid") {
  $serverPid = Get-Content "web-dev.pid"
  Stop-Process -Id $serverPid -Force
  Remove-Item "web-dev.pid"
}
