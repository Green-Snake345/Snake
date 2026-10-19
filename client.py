from __future__ import annotations
import argparse
import json
import socket
import ssl
import sys
import time
import webbrowser
from urllib import request as urlrequest
from urllib.error import HTTPError, URLError

DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 5000
DEFAULT_TIMEOUT = 5.0
DEFAULT_RETRIES = 2
RETRY_BACKOFF = 0.6

EXIT_OK = 0
EXIT_FAIL = 1
EXIT_CRITICAL = 2
EXIT_INTERRUPTED = 130

GAME_FILES = ("index.html", "index.js", "style.css", "favicon.ico", "track.js", "analytics.js")

EXPECTED_CONTENT_TYPES = {
    "index.html": "text/html",
    "index.js": "javascript",
    "style.css": "text/css",
    "favicon.ico": "image/",
    "track.js": "javascript",
    "analytics.js": "javascript",
}


class SnakeClientError(Exception):
    def __init__(self, message: str, *, hint: str | None = None) -> None:
        super().__init__(message)
        self.hint = hint


class ServerUnreachable(SnakeClientError):
    pass


class BadResponse(SnakeClientError):
    pass


class DownloadError(SnakeClientError):
    pass


class Color:
    OK = "\033[92m"
    WARN = "\033[93m"
    ERR = "\033[91m"
    INFO = "\033[94m"
    DIM = "\033[2m"
    END = "\033[0m"


def c(text: str, color: str) -> str:
    return f"{color}{text}{Color.END}" if sys.stdout.isatty() else text


def section(title: str) -> None:
    print()
    print(c(f"── {title} " + "─" * max(0, 58 - len(title)), Color.INFO))


class SnakeClient:
    def __init__(self, host: str, port: int, timeout: float = DEFAULT_TIMEOUT,
                 retries: int = DEFAULT_RETRIES) -> None:
        self.host = host
        self.port = port
        self.timeout = timeout
        self.retries = max(0, retries)
        self.base_url = f"http://{host}:{port}"

    def _request(self, path: str) -> tuple[int, dict, bytes, float]:
        url = f"{self.base_url}{path}"
        last_err: SnakeClientError | None = None

        for attempt in range(self.retries + 1):
            start = time.time()
            try:
                req = urlrequest.Request(
                    url, method="GET",
                    headers={"User-Agent": "SnakeClient/1.0", "Accept": "*/*"},
                )
                with urlrequest.urlopen(req, timeout=self.timeout) as resp:
                    body = resp.read()
                    return resp.status, dict(resp.headers), body, (time.time() - start) * 1000

            except HTTPError as e:
                body = b""
                try:
                    body = e.read() or b""
                except Exception:
                    pass
                return e.code, dict(e.headers or {}), body, (time.time() - start) * 1000

            except URLError as e:
                last_err = self._classify(getattr(e, "reason", None), url)
            except socket.timeout:
                last_err = ServerUnreachable(
                    f"таймаут {self.timeout}s при запросе {url}",
                    hint="сервер не отвечает — проверь, запущен ли он",
                )
            except (ConnectionError, OSError) as e:
                last_err = ServerUnreachable(f"сетевая ошибка: {e}", hint="проверь сеть/адрес")
            except Exception as e:
                last_err = SnakeClientError(f"непредвиденная ошибка: {e!r}")

            if attempt < self.retries:
                pause = RETRY_BACKOFF * (2 ** attempt)
                print(c(f"  [..] {last_err} — повтор через {pause:.1f}s "
                        f"({attempt + 1}/{self.retries})", Color.WARN))
                time.sleep(pause)

        assert last_err is not None
        raise last_err

    @staticmethod
    def _classify(reason, url: str) -> SnakeClientError:
        if isinstance(reason, socket.gaierror):
            return ServerUnreachable(f"не удалось разрешить имя хоста для {url}",
                                     hint="проверь --host")
        if isinstance(reason, ConnectionRefusedError):
            return ServerUnreachable(f"соединение отклонено: {url}",
                                     hint="сервер не запущен или слушает другой порт")
        if isinstance(reason, socket.timeout):
            return ServerUnreachable(f"таймаут соединения: {url}",
                                     hint="увеличь --timeout")
        if isinstance(reason, ConnectionResetError):
            return ServerUnreachable(f"соединение разорвано сервером: {url}",
                                     hint="посмотри snake.log")
        if isinstance(reason, ssl.SSLError):
            return ServerUnreachable(f"TLS-ошибка: {reason}", hint="клиент работает по http://")
        return ServerUnreachable(f"ошибка соединения: {reason}", hint="проверь сервер")

    def health(self) -> dict:
        status, headers, body, ms = self._request("/health")
        try:
            payload = json.loads(body.decode("utf-8"))
            if not isinstance(payload, dict):
                payload = {"raw": payload}
        except (UnicodeDecodeError, json.JSONDecodeError):
            payload = {"raw": body.decode("utf-8", "replace")}
        return {"status": status, "headers": headers, "payload": payload, "elapsed_ms": ms}

    def fetch(self, filename: str) -> dict:
        status, headers, body, ms = self._request(f"/{filename}")
        return {
            "filename": filename, "status": status, "headers": headers,
            "size": len(body), "elapsed_ms": ms, "body": body,
        }

    def probe(self, path: str) -> dict:
        status, headers, body, ms = self._request(path)
        return {
            "path": path, "status": status, "headers": headers,
            "size": len(body), "elapsed_ms": ms,
            "text": body.decode("utf-8", "replace"),
        }

    def open_in_browser(self) -> bool:
        return webbrowser.open(self.base_url + "/")


def run_check(client: SnakeClient) -> bool:
    section("Health-check")
    try:
        h = client.health()
    except SnakeClientError as e:
        print(c(f"  [FAIL] {e}", Color.ERR))
        if e.hint:
            print(c(f"         подсказка: {e.hint}", Color.WARN))
        return False

    if h["status"] != 200:
        print(c(f"  [FAIL] GET /health -> {h['status']}", Color.ERR))
        return False
    print(c(f"  [OK  ] GET /health -> 200 ({h['elapsed_ms']:.1f}ms) {h['payload']}", Color.OK))

    section("Игровые файлы")
    all_ok = True
    for fn in GAME_FILES:
        try:
            r = client.fetch(fn)
        except SnakeClientError as e:
            print(c(f"  [FAIL] {fn}: {e}", Color.ERR))
            all_ok = False
            continue

        ctype = r["headers"].get("Content-Type", "")
        expected = EXPECTED_CONTENT_TYPES.get(fn, "")
        ct_ok = not expected or expected.lower() in ctype.lower()
        ok = r["status"] == 200 and r["size"] > 0 and ct_ok

        tag = c("OK  ", Color.OK) if ok else c("FAIL", Color.ERR)
        print(f"  [{tag}] {fn:<12} status={r['status']} "
              f"size={r['size']:>6}B time={r['elapsed_ms']:>6.1f}ms ctype={ctype or '-'}")
        if not ok:
            all_ok = False

    section("Защита")
    cases = (
        ("/../etc/passwd", (400, 403, 404)),
        ("/secret.txt", (404,)),
        ("/INDEX.HTML", (403, 404)),
    )
    for path, allowed in cases:
        r = client.probe(path)
        ok = r["status"] in allowed
        tag = c("OK  ", Color.OK) if ok else c("FAIL", Color.ERR)
        print(f"  [{tag}] {path} -> {r['status']} ({r['text']!r})")
        if not ok:
            all_ok = False

    return all_ok


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(
        description="Клиент для игры «Змейка»",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    p.add_argument("--host", default=DEFAULT_HOST)
    p.add_argument("--port", type=int, default=DEFAULT_PORT)
    p.add_argument("--timeout", type=float, default=DEFAULT_TIMEOUT)
    p.add_argument("--retries", type=int, default=DEFAULT_RETRIES)
    p.add_argument("--check-only", action="store_true",
                   help="Только проверить, не открывать браузер")
    p.add_argument("--no-browser", action="store_true",
                   help="Не открывать браузер в любом случае")
    args = p.parse_args(argv)

    if args.port <= 0 or args.port > 65535:
        print(c(f"[FAIL] неверный порт: {args.port}", Color.ERR))
        return EXIT_FAIL
    if args.timeout <= 0:
        print(c(f"[FAIL] таймаут должен быть > 0", Color.ERR))
        return EXIT_FAIL

    client = SnakeClient(args.host, args.port,
                         timeout=args.timeout, retries=args.retries)

    ok = run_check(client)

    if ok and not args.check_only and not args.no_browser:
        section("Запуск")
        if client.open_in_browser():
            print(c(f"  [OK  ] открываю {client.base_url}/", Color.OK))
        else:
            print(c(f"  [WARN] открой вручную: {client.base_url}/", Color.WARN))

    print()
    print(c("Всё в порядке — можно играть!", Color.OK) if ok
          else c("Есть проблемы — смотрите сообщения выше", Color.ERR))
    return EXIT_OK if ok else EXIT_FAIL


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print(c("\nПрервано пользователем", Color.WARN))
        sys.exit(EXIT_INTERRUPTED)
    except Exception as e:
        print(c(f"[CRITICAL] непредвиденная ошибка: {e!r}", Color.ERR), file=sys.stderr)
<<<<<<< HEAD
        sys.exit(EXIT_CRITICAL)
=======
        sys.exit(EXIT_CRITICAL)
>>>>>>> b61c6d2fa33dcd056c48a071794ecd880a122568
