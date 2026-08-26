import os
import re
from pathlib import Path
import shutil

src_dir = Path(r"d:\Things\Padaippugal\Nadappil\Elvan Navil\src")

dictionary = {
    # Root dirs
    "app": "செயலி",
    "assets": "வளங்கள்",
    "components": "கூறுகள்",
    "data": "தரவு",
    "features": "சிறப்புக் கூறுகள்",
    "hooks": "கொக்கிகள்",
    "lib": "நூலகம்",
    "styles": "வடிவமைப்பு",
    "utils": "பயன்பாடுகள்",

    # Feature Domains
    "home": "முகப்பு",
    "HomePage": "முகப்பு_பக்கம்",
    "about": "பற்றி",
    "AboutPage": "பற்றி_பக்கம்",
    "arts": "கலைகள்",
    "ArtsPage": "கலைகள்_பக்கம்",
    "ArtsGallery": "கலைக்கூடம்",
    "teaching": "பயிற்றுவிப்பு",
    "TeachingPage": "பயிற்றுவிப்பு_பக்கம்",
    "writings": "படைப்புகள்",
    "WritingsPage": "படைப்புகள்_பக்கம்",
    "tools": "கருவிகள்",
    "ToolsPage": "கருவிகள்_பக்கம்",
    "nirvaagi": "கையாளுநர்",
    "Nirvaagi": "கையாளுநர்",
    
    # Sub directories
    "views": "பார்வைகள்",

    # Tools
    "arichuvadi": "அரிச்சுவடி",
    "ArichuvadiTool": "அரிச்சுவடி_கருவி",
    "piano": "கின்னரப்பெட்டி",
    "PianoTool": "கின்னரப்பெட்டி_கருவி",
    "transliterator": "மொழிமாற்றி",
    "TransliteratorTool": "மொழிமாற்றி_கருவி",
    "vocoder": "குரல்மாற்றி",
    "VocoderView": "குரல்மாற்றி_பார்வை",

    # Components Categories
    "layout": "கட்டமைப்பு",
    "feedback": "பின்னூட்டம்",
    "media": "ஊடகம்",
    "engagement": "தொடர்பு",

    # Shared Component Files
    "Layout": "கட்டமைப்பு",
    "router": "வழித்தடம்",
    "useTheme": "கருப்பொருள்",
    "useSettings": "அமைப்புகள்_கொக்கி",
    "firebase": "ஃபயர்பேஸ்",
    "MobileTopBar": "மொபைல்_மேல்பட்டை",
    "FloatingBackButton": "மிதக்கும்_பின்பொத்தான்",
    "ConfirmDialog": "உறுதிப்படுத்தல்",
    "GlobalErrorBoundary": "பிழை_தடுப்பு",
    "AdBanner": "விளம்பரம்",
    "Engagement": "தொடர்பு_கூறு",
    "ProfileImage": "சுயவிவர_படம்",
    "NavLink": "வழிசெலுத்தல்_இணைப்பு",

    # Specific sub files
    "CategoryListView": "வகை_பட்டியல்",
    "StoriesListView": "கதைகள்_பட்டியல்",
    "ReadingView": "வாசிப்பு_பார்வை",
    "Portfolio": "தொகுப்பு",
    "Settings": "அமைப்புகள்_பக்கம்",
    "client": "வாடிக்கையாளர்",
    "cache": "தேக்ககம்",
}

def translate_name(name):
    base, ext = os.path.splitext(name)
    if base in dictionary:
        return dictionary[base] + ext
    if base.lower() in dictionary:
         return dictionary[base.lower()] + ext
    if base == "home": return "முகப்பு" + ext
    if base == "about": return "பற்றி" + ext
    if base == "writings": return "படைப்புகள்" + ext
    if base == "piano": return "கின்னரப்பெட்டி" + ext
    if base == "arichuvadi": return "அரிச்சுவடி" + ext
    if base == "transliterator": return "மொழிமாற்றி" + ext
    if base == "index": return "முகப்பு_எண்" + ext
    if base == "App": return "செயலி_கூறு" + ext
    return name

path_map = {}
file_contents = {}
skipped_files = ["main.tsx", "nirvaagi-main.tsx", "vite-env.d.ts"]

for root, dirs, files in os.walk(src_dir, topdown=False):
    for name in files:
        old_path = Path(root) / name
        if name in skipped_files:
            path_map[old_path] = old_path
            continue
        rel = old_path.relative_to(src_dir)
        new_parts = [translate_name(p) for p in rel.parts]
        new_path = src_dir.joinpath(*new_parts)
        path_map[old_path] = new_path
    
    for name in dirs:
        old_path = Path(root) / name
        rel = old_path.relative_to(src_dir)
        new_parts = [translate_name(p) for p in rel.parts]
        new_path = src_dir.joinpath(*new_parts)
        path_map[old_path] = new_path

old_files = [p for p in path_map.keys() if p.is_file()]

def resolve_import(base_dir, import_path):
    target_path = (base_dir / import_path).resolve()
    if target_path in old_files:
        return target_path
    for ext in ['.ts', '.tsx', '.js', '.jsx']:
        p = target_path.with_suffix(ext)
        if p in old_files:
            return p
    for ext in ['.ts', '.tsx', '.js', '.jsx']:
        p = target_path / f"index{ext}"
        if p in old_files:
            return p
    return None

import_regex = re.compile(r"(import\s+.*?from\s+['\"])(.*?)(['\"])")
import_side_regex = re.compile(r"(import\s+['\"])(.*?)(['\"])")

def replace_imports(match, old_path):
    prefix, import_str, suffix = match.groups()
    if not import_str.startswith('.'):
        return match.group(0)
        
    resolved_old = resolve_import(old_path.parent, import_str)
    if resolved_old:
        new_target = path_map[resolved_old]
        new_source = path_map[old_path]
        
        try:
            rel = os.path.relpath(new_target, new_source.parent)
            rel = rel.replace('\\', '/')
            if not rel.startswith('.'):
                rel = './' + rel
            if not (import_str.endswith('.css') or import_str.endswith('.json')):
                rel = os.path.splitext(rel)[0]
            if not import_str.endswith('index') and rel.endswith('index'):
                 rel = rel[:-6]
            if rel.endswith('/'):
                 rel = rel[:-1]
            return f"{prefix}{rel}{suffix}"
        except Exception as e:
            pass
            
    return match.group(0)

for old_path in old_files:
    if old_path.suffix in ['.ts', '.tsx', '.js', '.jsx']:
        try:
            content = old_path.read_text(encoding='utf-8')
            content = import_regex.sub(lambda m: replace_imports(m, old_path), content)
            content = import_side_regex.sub(lambda m: replace_imports(m, old_path), content)
            file_contents[old_path] = content
        except UnicodeDecodeError:
            pass
            
for m_file in ["main.tsx", "nirvaagi-main.tsx"]:
    p = src_dir / m_file
    if p.exists():
        content = p.read_text(encoding='utf-8')
        content = import_regex.sub(lambda m: replace_imports(m, p), content)
        content = import_side_regex.sub(lambda m: replace_imports(m, p), content)
        file_contents[p] = content

for old_path in sorted(path_map.keys(), key=lambda p: len(p.parts), reverse=True):
    new_path = path_map[old_path]
    if old_path != new_path and old_path.exists():
        new_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            if old_path.is_dir():
                if not new_path.exists():
                     old_path.rename(new_path)
                else:
                     try:
                         old_path.rmdir()
                     except:
                         pass
            else:
                old_path.rename(new_path)
        except Exception as e:
            pass 

for old_path, content in file_contents.items():
    new_path = path_map.get(old_path, old_path)
    new_path.write_text(content, encoding='utf-8')

print("Renaming and import updates completed.")
