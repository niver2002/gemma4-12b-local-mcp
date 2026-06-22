import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


class Handler(BaseHTTPRequestHandler):
    def _send_json(self, status, payload):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path == "/health":
            self._send_json(200, {"status": "ok", "backend": backend_name()})
            return
        self._send_json(404, {"error": "not_found"})

    def do_POST(self):
        if self.path != "/v1/chat":
            self._send_json(404, {"error": "not_found"})
            return

        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length).decode("utf-8")
        request = json.loads(body) if body else {}
        prompt = str(request.get("prompt", ""))
        self._send_json(200, generate_response(prompt))

    def log_message(self, format, *args):
        return


def backend_name():
    return os.environ.get("AI_WORKER_BACKEND", "stub")


def generate_response(prompt):
    backend = backend_name()
    if backend != "stub":
        return {
            "backend": backend,
            "text": f"Backend '{backend}' is configured but not implemented in this phase.",
            "model": os.environ.get("MODEL_ID", "gemma-12b"),
        }

    return {
        "backend": "stub",
        "model": "stub-gemma-compatible",
        "text": f"[stub-gemma-compatible] received: {prompt}",
    }


def main():
    host = os.environ.get("AI_WORKER_HOST", "127.0.0.1")
    port = int(os.environ.get("AI_WORKER_PORT", "8765"))
    server = ThreadingHTTPServer((host, port), Handler)
    server.serve_forever()


if __name__ == "__main__":
    main()
