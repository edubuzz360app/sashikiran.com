from pathlib import Path

p = Path(r"c:\Users\sashikiran.ss.lv\Downloads\websiteee\websiteeeee\public\assets\certificates")
out = Path(r"c:\Users\sashikiran.ss.lv\Downloads\websiteee\websiteeeee\cert-names-out.txt")
names = sorted(x.name for x in p.iterdir() if x.is_file())
out.write_text("\n".join(names), encoding="utf-8")
