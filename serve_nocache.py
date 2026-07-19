#!/usr/bin/env python3
"""HTTP server with aggressive no-cache headers to ensure always fresh files."""
import http.server
import socketserver

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def send_response(self, code, message=None):
        super().send_response(code, message)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, proxy-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Surrogate-Control', 'no-store')
        super().end_headers()

    def do_GET(self):
        # Force bypass ETag / Last-Modified conditional requests
        if 'If-None-Match' in self.headers:
            del self.headers['If-None-Match']
        if 'If-Modified-Since' in self.headers:
            del self.headers['If-Modified-Since']
        super().do_GET()

PORT = 8000
print(f"Serving at http://localhost:{PORT} (aggressive no-cache mode)")
with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
    httpd.serve_forever()
