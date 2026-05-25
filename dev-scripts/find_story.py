import re
import os

html_path = r"d:\Projects\Elvan\jaiprakashelvan instagram\your_instagram_activity\media\stories.html"

if not os.path.exists(html_path):
    print(f"File not found: {html_path}")
    exit(1)

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find story blocks and extract date and media path
# Each story is in a div with class "pam _3-95 _2ph- _a6-g uiBoxWhite noborder"
# We can search for the date and look backwards for the media path
target_date = "Jan 30, 2022"

# Find all occurrences of the target date
matches = [m.start() for m in re.finditer(target_date, content)]

for pos in matches:
    # Look back for "media/stories/"
    start_search = max(0, pos - 2000)
    chunk = content[start_search:pos]
    
    # Try to find video or image path
    media_match = re.search(r'media/stories/[^"\']+', chunk)
    if media_match:
        print(f"Found match at position {pos}")
        print(f"Date line: {content[pos:pos+50]}")
        print(f"Media Path: {media_match.group(0)}")
        print("-" * 20)
    else:
        # Try a wider search
        start_search = max(0, pos - 5000)
        chunk = content[start_search:pos]
        media_match = re.search(r'media/stories/[^"\']+', chunk)
        if media_match:
            print(f"Found match (wide search) at position {pos}")
            print(f"Media Path: {media_match.group(0)}")
            print("-" * 20)
