from pathlib import Path

root = Path('.').resolve()
pattern = 'com.HRMSbackend.HRMSbackend'
count = 0
for p in root.rglob('*'):
    if p.suffix.lower() in ('.java', '.properties', '.xml'):
        try:
            text = p.read_text(encoding='utf-8')
        except Exception:
            continue
        if pattern in text:
            new = text.replace(pattern, 'com')
            p.write_text(new, encoding='utf-8')
            print(f'Updated: {p.relative_to(root)}')
            count += 1

print(f'Done. Files updated: {count}')
