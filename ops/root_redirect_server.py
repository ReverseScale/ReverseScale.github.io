#!/usr/bin/env python3
"""Serve the canonical ReverseScale redirect on a loopback-only port."""

from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


HOST = "127.0.0.1"
PORT = 8090
TARGET_URL = "https://reversescale.github.io/"


class RootRedirectHandler(BaseHTTPRequestHandler):
    """Redirect only the exact root path and reject unmatched paths."""

    def _respond(self, include_body: bool) -> None:
        if self.path != "/":
            self.send_error(404)
            return

        body = b"Redirecting to ReverseScale.\n"
        self.send_response(308)
        self.send_header("Location", TARGET_URL)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body) if include_body else 0))
        self.end_headers()
        if include_body:
            self.wfile.write(body)

    def do_GET(self) -> None:
        self._respond(include_body=True)

    def do_HEAD(self) -> None:
        self._respond(include_body=False)


def main() -> None:
    server = ThreadingHTTPServer((HOST, PORT), RootRedirectHandler)
    print(f"Root redirect listening on http://{HOST}:{PORT}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
