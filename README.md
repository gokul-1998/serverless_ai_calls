# serverless_ai_calls

```
import requests
import json

url = "https://serverless-ai-calls.vercel.app/api/explain"

payload = json.dumps({
  "prompt": "Explain why the sky is blue in simple terms."
})
headers = {
  'Content-Type': 'application/json'
}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.text)
```