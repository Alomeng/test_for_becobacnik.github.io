# Урок 3. API и REST

API — интерфейс, через который программы взаимодействуют друг с другом. REST — архитектурный стиль проектирования API; не каждый HTTP API строго RESTful.

## Примеры адресов JSONPlaceholder

- `GET https://jsonplaceholder.typicode.com/posts` — список публикаций;
- `GET https://jsonplaceholder.typicode.com/posts/1` — публикация с ID 1;
- `GET https://jsonplaceholder.typicode.com/posts?userId=1` — публикации пользователя 1;
- `GET https://jsonplaceholder.typicode.com/users/1` — пользователь с ID 1;
- `POST https://jsonplaceholder.typicode.com/posts` — учебная имитация создания публикации.

## Python-пример

```python
import requests

response = requests.get(
    "https://jsonplaceholder.typicode.com/posts",
    params={"userId": 1},
    timeout=10,
)
response.raise_for_status()
posts = response.json()

for post in posts:
    print(post["id"], post["title"])
```

Параметр `params` безопаснее ручной сборки строки URL: библиотека корректно кодирует параметры.

## Важные привычки

- задавай тайм-аут;
- обрабатывай сетевые исключения;
- проверяй статус ответа;
- не предполагай, что каждый ответ содержит JSON;
- не публикуй API-ключи, пароли и токены;
- читай документацию конкретного API: методы и формат ответов могут различаться.

JSONPlaceholder имитирует некоторые операции записи. Не используй его как реальную базу данных.
