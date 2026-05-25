import json

# The stash files are UTF-16LE from PowerShell redirect
# The current (remote) files are UTF-8

def load_json_any_encoding(path):
    """Try UTF-8 first, then UTF-16LE (PowerShell default)"""
    for enc in ['utf-8', 'utf-16-le', 'utf-16']:
        try:
            with open(path, 'r', encoding=enc) as f:
                return json.load(f)
        except:
            continue
    raise ValueError(f"Could not load {path}")

# Load the enriched stash data (has transliterations, themes, styles)
stash_poems = load_json_any_encoding('poems_stash.json')
stash_quotes = load_json_any_encoding('quotes_stash.json')

# Load the current remote data (bare CMS data, may have newer poems)
remote_poems = load_json_any_encoding('src/data/poems.json')
remote_quotes = load_json_any_encoding('src/data/quotes.json')

print(f"Stash poems: {len(stash_poems)}, Remote poems: {len(remote_poems)}")
print(f"Stash quotes: {len(stash_quotes)}, Remote quotes: {len(remote_quotes)}")

# Create lookup by ID from stash (enriched data)
stash_poems_by_id = {str(p['id']): p for p in stash_poems}
stash_quotes_by_id = {str(q['id']): q for q in stash_quotes}

# Merge: use stash version for existing IDs, keep remote-only items as-is
merged_poems = []
seen_ids = set()
for p in remote_poems:
    pid = str(p['id'])
    if pid in stash_poems_by_id:
        # Use the enriched stash version (has transliterations, themes, etc.)
        merged_poems.append(stash_poems_by_id[pid])
    else:
        # New poem only on remote, keep as-is
        merged_poems.append(p)
    seen_ids.add(pid)

# Also add any stash poems not in remote (shouldn't happen, but just in case)
for pid, p in stash_poems_by_id.items():
    if pid not in seen_ids:
        merged_poems.append(p)

merged_quotes = []
seen_ids = set()
for q in remote_quotes:
    qid = str(q['id'])
    if qid in stash_quotes_by_id:
        merged_quotes.append(stash_quotes_by_id[qid])
    else:
        merged_quotes.append(q)
    seen_ids.add(qid)

for qid, q in stash_quotes_by_id.items():
    if qid not in seen_ids:
        merged_quotes.append(q)

# Write back
with open('src/data/poems.json', 'w', encoding='utf-8') as f:
    json.dump(merged_poems, f, ensure_ascii=False, indent=2)

with open('src/data/quotes.json', 'w', encoding='utf-8') as f:
    json.dump(merged_quotes, f, ensure_ascii=False, indent=2)

print(f"\nMerged poems: {len(merged_poems)}")
for p in merged_poems:
    theme = p.get('theme', '—')
    style = p.get('style', '—')
    title = p.get('title', '—')
    nvars = len(p.get('variants', []))
    has_transl = any(v.get('transliterations') for v in p.get('variants', []))
    print(f"  [{theme:12s}] [{style:16s}] {nvars} variants, transliterations={'YES' if has_transl else 'NO'} | {title}")

print(f"\nMerged quotes: {len(merged_quotes)}")
for q in merged_quotes:
    tag = q.get('tag', '—')
    date = q.get('date', '—')
    title = q.get('variants', [{}])[0].get('title', '—')
    has_transl = any(v.get('transliterations') for v in q.get('variants', []))
    print(f"  [{tag:15s}] [{date:20s}] transliterations={'YES' if has_transl else 'NO'} | {title}")
