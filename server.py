import http.server
import os

os.chdir('ZORG88-LANDER')

handler = http.server.SimpleHTTPRequestHandler
handler.extensions_map.update({
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.ico': 'image/x-icon',
})

server = http.server.HTTPServer(('0.0.0.0', 5000), handler)
print("Serving ZORG88 Space Lander on port 5000")
server.serve_forever()
