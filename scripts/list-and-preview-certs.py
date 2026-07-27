"""List certificate files, write cert-names-out.txt, make JPEG previews for non-awards."""
from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(r"c:\Users\sashikiran.ss.lv\Downloads\websiteee\websiteeeee")
CERT_DIR = ROOT / "public" / "assets" / "certificates"
OUT_LIST = ROOT / "cert-names-out.txt"
PREVIEW_DIR = ROOT / "tmp-cert-preview"
RESULT = ROOT / "claude101-result.txt"

SKIP_AWARDS = {
    "UdIQV32F6VGqc2GG31b0ac8Nk0g.avif",
    "SuVfvuXRmIThyZYoS8kG9Y8iL1w.webp",
    "dGIXvgkk94L4aleE3cVHiCGoI.avif",
}
IMG_EXT = {".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif"}


def main() -> None:
    names = sorted(p.name for p in CERT_DIR.iterdir() if p.is_file())
    OUT_LIST.write_text("\n".join(names) + "\n", encoding="utf-8")
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)

    lines = [f"FILES:{len(names)}"] + names + ["", "PREVIEWS:"]
    claude_hits: list[str] = []

    try:
        from PIL import Image
    except ImportError:
        Image = None  # type: ignore
        lines.append("Pillow missing")

    for name in names:
        path = CERT_DIR / name
        if name in SKIP_AWARDS:
            lines.append(f"{name} SKIPPED award")
            continue
        if path.suffix.lower() not in IMG_EXT:
            lines.append(f"{name} not image")
            continue

        data = path.read_bytes()
        keys = []
        for s in (b"Claude", b"claude", b"Anthropic", b"ANTHROPIC", b"Claude 101", b"CLAUDE"):
            if s in data:
                keys.append(s.decode("latin1"))
        for s in ("Claude", "Anthropic", "Claude 101"):
            if s.encode("utf-16le") in data:
                keys.append(s + "-u16")
        if keys:
            claude_hits.append(name)
            lines.append(f"{name} BINARY_HIT {keys}")

        if Image is None:
            continue
        try:
            im = Image.open(path)
            im = im.convert("RGB")
            # shrink large screenshots for inspection
            w, h = im.size
            max_side = 1600
            if max(w, h) > max_side:
                scale = max_side / max(w, h)
                im = im.resize((int(w * scale), int(h * scale)))
            safe = "".join(c if c.isalnum() or c in "._-" else "_" for c in name)
            out = PREVIEW_DIR / f"{safe}.jpg"
            im.save(out, "JPEG", quality=85)
            lines.append(f"{name} -> {out.name} size={w}x{h}")
        except Exception as e:
            lines.append(f"{name} preview FAIL: {e}")

    lines.append("")
    lines.append("CLAUDE_CANDIDATES: " + repr(claude_hits))
    RESULT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("\n".join(lines))
    print("DONE")


if __name__ == "__main__":
    main()
