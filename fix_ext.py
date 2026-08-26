import os
import re

src = r'd:\Things\Padaippugal\Nadappil\Elvan Navil\src'
files = [os.path.join(r, f) for r,d,fl in os.walk(src) for f in fl if f.endswith(('.ts', '.tsx'))]

for f in files:
    try:
        content = open(f, encoding='utf-8').read()
        if 'instagram/profile' in content and 'profile.jpg' not in content:
            new_content = re.sub(r'(/instagram/profile)[\'\"]', r"\1.jpg'", content)
            open(f, 'w', encoding='utf-8').write(new_content)
    except:
        pass
