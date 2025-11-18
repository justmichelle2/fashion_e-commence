$token = Get-Content "tmp_token.txt"
$headers = @{ Authorization = "Bearer $token" }
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/orders/cart" -Headers $headers -UseBasicParsing
$response.Content | Set-Content "tmp_cart_response.json"
Write-Output $response.Content
