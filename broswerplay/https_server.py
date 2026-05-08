import http.server
import ssl

PORT = 9000

handler = http.server.SimpleHTTPRequestHandler
httpd = http.server.ThreadingHTTPServer(("0.0.0.0", PORT), handler)

context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(certfile="cert.pem", keyfile="key.pem")

httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

print(f"Serving HTTPS on https://0.0.0.0:{PORT}")
httpd.serve_forever()