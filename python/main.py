"""
HTTP Lab: учебный HTTP-клиент.
Установка: python -m pip install requests
Запуск: python main.py
"""
import json
import requests

BASE_URL = "https://jsonplaceholder.typicode.com"


def get_post(post_id: int) -> dict:
    """Получает публикацию и возвращает данные JSON."""
    url = f"{BASE_URL}/posts/{post_id}"
    response = requests.get(url, timeout=10)

    print(f"HTTP status: {response.status_code}")
    print(f"Content-Type: {response.headers.get('Content-Type', 'не указан')}")

    response.raise_for_status()
    data = response.json()

    if not data:
        raise ValueError("Публикация не найдена или API вернул пустой ответ.")

    return data


def save_json(data: dict, filename: str = "response.json") -> None:
    """Сохраняет объект Python в читаемый JSON-файл."""
    with open(filename, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)
    print(f"Данные сохранены в {filename}")


def main() -> None:
    raw_id = input("ID публикации (1–100): ").strip()
    try:
        post_id = int(raw_id)
        if not 1 <= post_id <= 100:
            print("Для этого учебного API выбери ID от 1 до 100.")
            return
    except ValueError:
        print("ID должен быть целым числом.")
        return

    try:
        post = get_post(post_id)
        print("\nПолученный JSON:")
        print(json.dumps(post, ensure_ascii=False, indent=2))
        print("\nЗаголовок:", post.get("title", "(нет заголовка)"))
        save_json(post)
    except requests.exceptions.HTTPError as error:
        print("HTTP-ошибка:", error)
    except requests.exceptions.Timeout:
        print("Сервер не ответил за отведённое время.")
    except requests.exceptions.RequestException as error:
        print("Ошибка соединения:", error)
    except (ValueError, json.JSONDecodeError) as error:
        print("Не удалось обработать ответ:", error)


if __name__ == "__main__":
    main()
