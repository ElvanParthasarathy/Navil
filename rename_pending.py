import os
import re
from pathlib import Path

src_dir = Path(r"d:\Things\Padaippugal\Nadappil\Elvan Navil\src")

dictionary = {
    "pages": "பக்கங்கள்",
    "theme": "கருப்பொருள்",
    "dashboard": "முகப்புப்பலகை",
    "editors": "தொகுப்பான்கள்",
    "shared": "பொதுவானவை",
    "engine": "இயந்திரம்",
    "instagram": "இன்ஸ்டாகிராம்",
    "NirvaagiApp": "கையாளுநர்செயலி",
    "CommentsManager": "கருத்துகள்மேலாளர்",
    "NirvaagiDashboard": "கையாளுநர்முகப்புப்பலகை",
    "NirvaagiLogin": "கையாளுநர்நுழைவு",
    "AboutEditor": "பற்றிதொகுப்பான்",
    "ArtEditor": "கலைதொகுப்பான்",
    "ArticleEditor": "கட்டுரைதொகுப்பான்",
    "BlogEditor": "வலைப்பதிவுதொகுப்பான்",
    "DiaryEditor": "நாட்குறிப்புதொகுப்பான்",
    "PoemEditor": "செய்யுள்தொகுப்பான்",
    "ProfileEditor": "தன்னுருதொகுப்பான்",
    "QuoteEditor": "நவில்மொழிதொகுப்பான்",
    "RichTextEditor": "உரைதொகுப்பான்",
    "StandardListEditor": "பட்டியல்தொகுப்பான்",
    "StoryEditor": "கதைதொகுப்பான்",
    "VariantListEditor": "மாறுபாடுதொகுப்பான்",
    "NirvaagiShared": "கையாளுநர்பொது",
    "nirvaagiUtils": "கையாளுநர்பயன்பாடுகள்",
    "BookMakerView": "நூல்உருவாக்கும்பார்வை",
    "brahmiMaps": "தமிழிவரைபடங்கள்",
    "eBrahmiMaps": "இதமிழிவரைபடங்கள்",
    "vatteluttuMaps": "வட்டெழுத்துவரைபடங்கள்",
    "ArichuvadiAbout": "அரிச்சுவடிபற்றி",
    "ArichuvadiBooks": "அரிச்சுவடிநூல்கள்",
    "ArichuvadiDownloads": "அரிச்சுவடிபதிவிறக்கங்கள்",
    "ArichuvadiEditor": "அரிச்சுவடிதொகுப்பான்",
    "ArichuvadiImage": "அரிச்சுவடிபடம்",
    "ArichuvadiLearn": "அரிச்சுவடிகற்றல்",
    "ArichuvadiMatch": "அரிச்சுவடிபொருத்து",
    "ArichuvadiMemorize": "அரிச்சுவடிநினைவூட்டு",
    "ArichuvadiPractice": "அரிச்சுவடிபயிற்சி",
    "constants": "மாறிலிகள்",
    "usePiano": "கின்னரப்பெட்டிகொக்கி",
    "Interactive": "ஊடாடும்",
    "Presentation": "விளக்கக்காட்சி",
    "vocoder-global": "குரல்மாற்றிபொது",
    "englishToTamil": "ஆங்கிலம்முதல்தமிழ்",
    "navilToTamil": "நவில்முதல்தமிழ்",
    "transliterate": "மொழிமாற்றம்",
    "ArtCard": "கலைஅட்டை",
    "artsUtils": "கலைபயன்பாடுகள்",
    "LightboxImage": "ஒளிப்பெட்டிபடம்",
    "CategoryFilterBar": "வகைவடிகட்டி",
    "CategoryGrid": "வகைகட்டம்",
    "SeriesDetailView": "தொடர்தரவுபார்வை",
    "StoryFilterBar": "கதைவடிகட்டி",
    "StoryGrid": "கதைகட்டம்",
    "storyUtils": "கதைபயன்பாடுகள்",
    "profile": "தன்னுரு",
    "stories": "கதைகள்",
    "nirvaagiTheme": "கையாளுநர்கருப்பொருள்",
    "nirvaagi-tailwind": "கையாளுநர்விதானம்",
    "arts": "கலைகள்",
}

def translate_name(name):
    base, ext = os.path.splitext(name)
    
    if base in dictionary:
        base = dictionary[base]
    elif base.lower() in dictionary:
        base = dictionary[base.lower()]
        
    # Global replacement based on user feedback to remove spaces and underscores
    base = base.replace('_', '').replace(' ', '')
    
    return base + ext

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
            if not (import_str.endswith('.css') or import_str.endswith('.json') or import_str.endswith('.jpg')):
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

print("Final renaming and import updates completed.")
