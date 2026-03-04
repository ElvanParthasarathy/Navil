import json
import requests
import sys

# Supabase config
SUPABASE_URL = "https://kvzltutlfuvyzigtmoqw.supabase.co"
SUPABASE_KEY = "sb_secret_pdlPG6W2OcEr2wWxeS2AGQ_WyvkE7hK"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def upload_poems():
    print("📖 Loading poems.json...")
    with open("src/data/poems.json", "r", encoding="utf-8") as f:
        poems = json.load(f)
    
    rows = []
    for p in poems:
        row = {
            "id": str(p["id"]),
            "title": p.get("title", ""),
            "date": p.get("date"),
            "style": p.get("style", ""),
            "theme": p.get("theme", ""),
            "meter": p.get("meter", ""),
            "dedication": p.get("dedication", ""),
            "classification": p.get("classification"),
            "is_pinned": p.get("isPinned", False),
            "pin_expires_at": p.get("pinExpiresAt"),
            "urai": p.get("urai", ""),
            "notes": p.get("notes", ""),
            "variants": p.get("variants", [])
        }
        rows.append(row)
    
    print(f"   Uploading {len(rows)} poems...")
    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/poems",
        headers=HEADERS,
        json=rows
    )
    
    if resp.status_code in (200, 201):
        print(f"   ✅ {len(rows)} poems uploaded successfully!")
        return True
    else:
        print(f"   ❌ Error: {resp.status_code} — {resp.text}")
        return False

def upload_quotes():
    print("💬 Loading quotes.json...")
    with open("src/data/quotes.json", "r", encoding="utf-8") as f:
        quotes = json.load(f)
    
    rows = []
    for q in quotes:
        row = {
            "id": str(q["id"]),
            "tag": q.get("tag", ""),
            "date": q.get("date"),
            "is_pinned": q.get("isPinned", False),
            "pin_expires_at": q.get("pinExpiresAt"),
            "urai": q.get("urai", ""),
            "notes": q.get("notes", ""),
            "variants": q.get("variants", [])
        }
        rows.append(row)
    
    print(f"   Uploading {len(rows)} quotes...")
    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/quotes",
        headers=HEADERS,
        json=rows
    )
    
    if resp.status_code in (200, 201):
        print(f"   ✅ {len(rows)} quotes uploaded successfully!")
        return True
    else:
        print(f"   ❌ Error: {resp.status_code} — {resp.text}")
        return False

def verify():
    print("\n🔍 Verifying...")
    
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/poems?select=id,title,theme,style",
        headers=HEADERS
    )
    poems = resp.json()
    print(f"   Poems in Supabase: {len(poems)}")
    for p in poems:
        print(f"     [{p.get('theme',''):12s}] [{p.get('style',''):16s}] {p.get('title','')}")
    
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/quotes?select=id,tag,date",
        headers=HEADERS
    )
    quotes = resp.json()
    print(f"   Quotes in Supabase: {len(quotes)}")
    for q in quotes:
        print(f"     [{q.get('tag',''):15s}] [{q.get('date',''):20s}]")

if __name__ == "__main__":
    ok1 = upload_poems()
    ok2 = upload_quotes()
    if ok1 and ok2:
        verify()
        print("\n🎉 Migration complete!")
    else:
        print("\n⚠️  Some uploads failed. Check the errors above.")
        sys.exit(1)
