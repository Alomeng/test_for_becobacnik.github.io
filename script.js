(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const toast = $("#toast");
  let toastTimer;
  let lastResponseText = "";
  let responseView = "body";
  let lastResponseHeaders = "";

  function notify(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  const savedTheme = (() => { try { return localStorage.getItem("http-lab-theme"); } catch { return null; } })();
  if (savedTheme === "light") document.documentElement.classList.add("light");
  $("#themeToggle").addEventListener("click", () => {
    document.documentElement.classList.toggle("light");
    const theme = document.documentElement.classList.contains("light") ? "light" : "dark";
    try { localStorage.setItem("http-lab-theme", theme); } catch {}
  });

  const methodSelect = $("#methodSelect");
  const bodyInput = $("#bodyInput");
  function updateBodyState() {
    const usesBody = ["POST", "PUT", "PATCH"].includes(methodSelect.value);
    bodyInput.disabled = !usesBody;
    bodyInput.style.opacity = usesBody ? "1" : ".45";
    $("#bodyHint").textContent = usesBody ? "Тело будет отправлено как JSON" : "Для этого метода тело не используется";
  }
  methodSelect.addEventListener("change", updateBodyState);
  updateBodyState();

  document.querySelectorAll("[data-url]").forEach((button) => {
    button.addEventListener("click", () => { $("#urlInput").value = button.dataset.url; });
  });

  function setResponse(text, message) {
    lastResponseText = text;
    $("#responseOutput").textContent = text;
    $("#responseMessage").textContent = message;
  }
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      responseView = button.dataset.tab;
      document.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("active", b === button));
      $("#responseOutput").textContent = responseView === "body" ? lastResponseText : lastResponseHeaders;
    });
  });

  $("#sendRequest").addEventListener("click", async () => {
    const method = methodSelect.value;
    const url = $("#urlInput").value.trim();
    const sendButton = $("#sendRequest");
    let headers;
    let body;
    if (!url) { notify("Введи URL запроса"); return; }
    try { headers = JSON.parse($("#headersInput").value || "{}"); }
    catch (error) { notify("Ошибка JSON в заголовках: " + error.message); return; }
    if (!headers || Array.isArray(headers) || typeof headers !== "object") { notify("Заголовки должны быть JSON-объектом"); return; }
    if (["POST", "PUT", "PATCH"].includes(method)) {
      try { body = JSON.parse(bodyInput.value || "{}"); }
      catch (error) { notify("Ошибка JSON в теле запроса: " + error.message); return; }
    }
    sendButton.disabled = true;
    sendButton.textContent = "Отправка…";
    $("#responseStatus").textContent = "…";
    $("#responseTime").textContent = "…";
    $("#responseSize").textContent = "…";
    setResponse("Выполняется запрос…", "Ожидание ответа");
    const start = performance.now();
    try {
      const options = { method, headers };
      if (body !== undefined) options.body = JSON.stringify(body);
      const response = await fetch(url, options);
      const elapsed = Math.round(performance.now() - start);
      const text = await response.text();
      let pretty = text;
      try { pretty = JSON.stringify(JSON.parse(text), null, 2); } catch {}
      lastResponseHeaders = Array.from(response.headers.entries()).map(([key, value]) => `${key}: ${value}`).join("\n") || "(Браузер не предоставил доступные заголовки ответа)";
      $("#responseStatus").textContent = `${response.status} ${response.statusText}`;
      $("#responseStatus").style.color = response.ok ? "var(--accent2)" : "#ff899c";
      $("#responseTime").textContent = `${elapsed} ms`;
      $("#responseSize").textContent = new TextEncoder().encode(text).length + " B";
      setResponse(pretty || "(Пустое тело ответа)", `${response.ok ? "Запрос выполнен" : "Сервер вернул ошибочный статус"} · ${method}`);
      if (responseView === "headers") $("#responseOutput").textContent = lastResponseHeaders;
    } catch (error) {
      lastResponseHeaders = "";
      $("#responseStatus").textContent = "Ошибка";
      $("#responseStatus").style.color = "#ff899c";
      $("#responseTime").textContent = `${Math.round(performance.now() - start)} ms`;
      $("#responseSize").textContent = "—";
      setResponse(`${error.name}: ${error.message}\n\nВозможные причины:\n• ошибка CORS;\n• нет соединения с сервером;\n• неверный URL или HTTPS-сертификат.\n\nПопробуй HTTPBin или выполни запрос через Python.`, "Не удалось прочитать ответ");
      if (responseView === "headers") $("#responseOutput").textContent = lastResponseHeaders;
    } finally {
      sendButton.disabled = false;
      sendButton.innerHTML = "<span>▶</span> Отправить";
    }
  });

  $("#copyResponse").addEventListener("click", async () => {
    const text = responseView === "body" ? lastResponseText : lastResponseHeaders;
    try { await navigator.clipboard.writeText(text); notify("Ответ скопирован"); }
    catch { notify("Не удалось скопировать. Выдели текст вручную."); }
  });

  function summarize(value) {
    const counts = { objects: 0, arrays: 0, strings: 0, numbers: 0, booleans: 0, nulls: 0 };
    function walk(item) {
      if (item === null) counts.nulls++;
      else if (Array.isArray(item)) { counts.arrays++; item.forEach(walk); }
      else if (typeof item === "object") { counts.objects++; Object.values(item).forEach(walk); }
      else if (typeof item === "string") counts.strings++;
      else if (typeof item === "number") counts.numbers++;
      else if (typeof item === "boolean") counts.booleans++;
    }
    walk(value);
    return counts;
  }
  function renderSummary(value) {
    const counts = summarize(value);
    const items = [
      ["objects", "Объекты"], ["arrays", "Массивы"], ["strings", "Строки"],
      ["numbers", "Числа"], ["booleans", "Логические"], ["nulls", "Значения null"]
    ];
    $("#jsonSummary").innerHTML = items.map(([key, label]) =>
      `<div class="summary-item"><strong>${counts[key]}</strong><span>${label}</span></div>`
    ).join("");
  }
  function parseJson() {
    try {
      const value = JSON.parse($("#jsonInput").value);
      $("#jsonStatus").textContent = "✓ Валидный JSON";
      $("#jsonStatus").className = "json-status valid";
      renderSummary(value);
      return value;
    } catch (error) {
      $("#jsonStatus").textContent = "✕ Ошибка: " + error.message;
      $("#jsonStatus").className = "json-status invalid";
      $("#jsonSummary").innerHTML = '<div class="empty-state">Исправь синтаксис и повтори проверку.</div>';
      return undefined;
    }
  }
  $("#formatJson").addEventListener("click", () => {
    const value = parseJson();
    if (value !== undefined) $("#jsonInput").value = JSON.stringify(value, null, 2);
  });
  $("#minifyJson").addEventListener("click", () => {
    const value = parseJson();
    if (value !== undefined) $("#jsonInput").value = JSON.stringify(value);
  });

  const pythonCode = `import json
import requests

url = "https://jsonplaceholder.typicode.com/posts/1"

try:
    response = requests.get(url, timeout=10)
    print("HTTP status:", response.status_code)
    response.raise_for_status()

    post = response.json()
    print("Title:", post["title"])

    with open("response.json", "w", encoding="utf-8") as file:
        json.dump(post, file, ensure_ascii=False, indent=2)

    print("Ответ сохранён в response.json")

except requests.exceptions.RequestException as error:
    print("Ошибка запроса:", error)
except (ValueError, KeyError) as error:
    print("Ошибка данных:", error)`;
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); notify("Скопировано в буфер обмена"); }
    catch { notify("Копирование недоступно в этом браузере"); }
  }
  $("#copyPython").addEventListener("click", () => copyText(pythonCode));
  document.querySelectorAll("[data-copy]").forEach((button) => button.addEventListener("click", () => copyText(button.dataset.copy)));
})();