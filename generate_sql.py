import json

# Generate SQL INSERT statements from JSON data

def escape_sql(s):
    if s is None:
        return 'NULL'
    s = str(s).replace("'", "''")
    return f"'{s}'"

def json_escape(obj):
    if obj is None:
        return "'[]'::jsonb"
    return f"'{json.dumps(obj, ensure_ascii=False).replace(chr(39), chr(39)+chr(39))}'::jsonb"

def bool_sql(v):
    return 'TRUE' if v else 'FALSE'

# --- POEMS ---
with open('src/data/poems.json', 'r', encoding='utf-8') as f:
    poems = json.load(f)

sql_lines = []
for p in poems:
    sql_lines.append(f"""INSERT INTO poems (id, title, date, style, theme, meter, dedication, classification, is_pinned, pin_expires_at, urai, notes, variants) VALUES (
  {escape_sql(str(p['id']))},
  {escape_sql(p.get('title', ''))},
  {escape_sql(p.get('date')) if p.get('date') else 'NULL'},
  {escape_sql(p.get('style', ''))},
  {escape_sql(p.get('theme', ''))},
  {escape_sql(p.get('meter', ''))},
  {escape_sql(p.get('dedication', ''))},
  {escape_sql(p.get('classification')) if p.get('classification') else 'NULL'},
  {bool_sql(p.get('isPinned', False))},
  {escape_sql(p.get('pinExpiresAt')) if p.get('pinExpiresAt') else 'NULL'},
  {escape_sql(p.get('urai', ''))},
  {escape_sql(p.get('notes', ''))},
  {json_escape(p.get('variants', []))}
);""")

# --- QUOTES ---
with open('src/data/quotes.json', 'r', encoding='utf-8') as f:
    quotes = json.load(f)

for q in quotes:
    sql_lines.append(f"""INSERT INTO quotes (id, tag, date, is_pinned, pin_expires_at, urai, notes, variants) VALUES (
  {escape_sql(str(q['id']))},
  {escape_sql(q.get('tag', ''))},
  {escape_sql(q.get('date')) if q.get('date') else 'NULL'},
  {bool_sql(q.get('isPinned', False))},
  {escape_sql(q.get('pinExpiresAt')) if q.get('pinExpiresAt') else 'NULL'},
  {escape_sql(q.get('urai', ''))},
  {escape_sql(q.get('notes', ''))},
  {json_escape(q.get('variants', []))}
);""")

full_sql = "\n\n".join(sql_lines)
with open('migration.sql', 'w', encoding='utf-8') as f:
    f.write(full_sql)

print(f"Generated {len(sql_lines)} INSERT statements ({len(poems)} poems + {len(quotes)} quotes)")
print(f"Saved to migration.sql ({len(full_sql)} bytes)")
