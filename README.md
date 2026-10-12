# HTTP API Lab — Postman, HTTP, JSON, Python

**Это не сайт, который сам отправляет запросы.** Сайт на GitHub Pages — учебная документация. Backend — отдельный FastAPI-сервер, с которым работаешь через Postman, curl, Python requests или PowerShell.

## Публикация backend на Render Free

1. Создай репозиторий GitHub и загрузи все файлы.
2. Render → New → Web Service → подключи репозиторий.
3. Root Directory: `api`
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Выбери Free и нажми Deploy.
7. Проверь `https://ТВОЙ-URL/health` и `https://ТВОЙ-URL/docs`.

Render Free может усыплять сервис после простоя. Данные хранятся в памяти и сбрасываются при перезапуске.

## Публикация сайта на GitHub Pages

Самый простой путь — отдельный репозиторий для сайта: скопируй содержимое `site/` в корень репозитория, затем Settings → Pages → Deploy from a branch → `main` → `/(root)`. Вставь URL Render в поле на сайте.

## Postman

Импортируй `postman/HTTP-API-Lab.postman_collection.json` через Import. Импортируй также environment JSON и выбери окружение. По умолчанию `baseUrl` равен `http://127.0.0.1:8000`; для Render замени его на публичный URL без завершающего слеша.

## Локальный запуск

```bash
cd api
python -m pip install -r requirements.txt
uvicorn main:app --reload
```
Документация: `http://127.0.0.1:8000/docs`.

## Endpoints

- `GET /health`
- `GET /api/v1/posts?userId=2&limit=3&offset=0`
- `GET /api/v1/posts/1`
- `POST /api/v1/posts`
- `PUT /api/v1/posts/1`
- `PATCH /api/v1/posts/1`
- `DELETE /api/v1/posts/1`
- `GET /api/v1/users`
- `GET /api/v1/secure/profile` (header `X-API-Key: lab-demo-key`)
- `GET /api/v1/status/418`

Demo key is intentionally public; it is not real security. Do not send personal or secret data.
