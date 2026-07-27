"""Remove solid black backgrounds from company logo PNGs (edge flood-fill)."""
from collections import deque
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
THRESHOLD = 32
HARD = 28
SOFT = 48


def is_near_black(r: int, g: int, b: int, threshold: int = THRESHOLD) -> bool:
    return r <= threshold and g <= threshold and b <= threshold


def knockout(path: Path) -> None:
    im = Image.open(path).convert("RGBA")
    pixels = im.load()
    w, h = im.size
    bg = bytearray(w * h)
    q: deque[int] = deque()

    def push(x: int, y: int) -> None:
        if x < 0 or y < 0 or x >= w or y >= h:
            return
        i = y * w + x
        if bg[i]:
            return
        r, g, b, _a = pixels[x, y]
        if not is_near_black(r, g, b):
            return
        bg[i] = 1
        q.append(i)

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)

    while q:
        i = q.popleft()
        x = i % w
        y = i // w
        push(x - 1, y)
        push(x + 1, y)
        push(x, y - 1)
        push(x, y + 1)

    for y in range(h):
        for x in range(w):
            i = y * w + x
            if not bg[i]:
                continue
            r, g, b, a = pixels[x, y]
            m = max(r, g, b)
            if m <= HARD:
                pixels[x, y] = (r, g, b, 0)
            elif m <= SOFT:
                pixels[x, y] = (r, g, b, int(a * (m - HARD) / (SOFT - HARD)))

    im.save(path, "PNG")
    bands = Image.open(path).getbands()
    print(f"OK {path.name}: {path.stat().st_size} bytes, bands={bands}")


def main() -> None:
    for name in FILES:
        path = ASSETS / name
        if not path.exists():
            print(f"MISSING {name}")
            continue
        knockout(path)


if __name__ == "__main__":
    main()
