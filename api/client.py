import requests
BASE_URL = "http://127.0.0.1:8000"  # Replace with your deployed API URL.
try:
    response = requests.get(f"{BASE_URL}/api/v1/posts",
                            params={"userId": 1, "limit": 5}, timeout=10)
    print("Status:", response.status_code)
    print("Content-Type:", response.headers.get("Content-Type"))
    response.raise_for_status()
    for post in response.json()["items"]:
        print(post["id"], post["title"])
except requests.exceptions.Timeout:
    print("Server timed out")
except requests.exceptions.RequestException as error:
    print("Request failed:", error)
