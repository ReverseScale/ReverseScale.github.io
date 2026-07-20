import http.client
from http.server import ThreadingHTTPServer
from pathlib import Path
import sys
import threading
import unittest


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from ops.root_redirect_server import RootRedirectHandler


class RootRedirectServerTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), RootRedirectHandler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.port = cls.server.server_address[1]

    @classmethod
    def tearDownClass(cls) -> None:
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def request(self, method: str, path: str) -> http.client.HTTPResponse:
        connection = http.client.HTTPConnection("127.0.0.1", self.port)
        connection.request(method, path)
        return connection.getresponse()

    def test_root_get_redirects_permanently_to_reverse_scale(self) -> None:
        response = self.request("GET", "/")
        self.assertEqual(response.status, 308)
        self.assertEqual(response.getheader("Location"), "https://reversescale.github.io/")

    def test_root_head_has_same_redirect_without_body(self) -> None:
        response = self.request("HEAD", "/")
        self.assertEqual(response.status, 308)
        self.assertEqual(response.read(), b"")

    def test_non_root_path_is_not_redirected(self) -> None:
        response = self.request("GET", "/babel/")
        self.assertEqual(response.status, 404)
        self.assertIsNone(response.getheader("Location"))
