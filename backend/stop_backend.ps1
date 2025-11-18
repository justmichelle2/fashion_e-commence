if (Test-Path "backend-server.pid") {
  $serverPid = Get-Content "backend-server.pid"
  Stop-Process -Id $serverPid -Force
  Remove-Item "backend-server.pid"
}
