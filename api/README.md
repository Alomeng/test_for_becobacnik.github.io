# API backend
Run locally:
```bash
python -m pip install -r requirements.txt
uvicorn main:app --reload
```
Open http://127.0.0.1:8000/docs.

Render Web Service:
- Root Directory: `api`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Instance: Free

Data is stored in memory and resets when the process restarts or the free service wakes up. This is intentional for practice. Do not send real secrets or personal data. `lab-demo-key` is public demo authentication, not real security.
