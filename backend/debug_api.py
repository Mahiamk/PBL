import requests

try:
    response = requests.get("http://localhost:8000/api/products/categories")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 422:
        print("Validation Error Details:")
        print(response.json())
    else:
        print(response.text)
except Exception as e:
    print(f"Error: {e}")
