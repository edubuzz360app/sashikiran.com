from pathlib import Path
from PIL import Image

ASSETS = Path(__file__).resolve().parent.parent / "public" / "assets"
FILES = [
    "infoview logo.png",
    "vaken logo.png",
    "to the new logo.png",
    "guvi logo.png",
    "latentview logo.png",
]

for name in FILES:
    im = Image.open(ASSETS / name).convert("RGBA")
    px = im.load()
    w, h = im.size
    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    transparent = 0
    for y in range(0, h, 8):
        for x in range(0, w, 8):
            if px[x, y][3] == 0:
                transparent += 1
    print(name, "corners=", corners, "sample_transparent=", transparent)
