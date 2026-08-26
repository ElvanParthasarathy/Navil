import os
import re

src = r'd:\Things\Padaippugal\Nadappil\Elvan Navil\src'
files = [os.path.join(r, f) for r,d,fl in os.walk(src) for f in fl if f.endswith(('.ts', '.tsx'))]

for f in files:
    try:
        content = open(f, encoding='utf-8').read()
        updated = False
        
        # fix profile.json
        if 'தரவு/profile' in content and 'profile.json' not in content:
            content = re.sub(r'(/தரவு/profile)[\'\"]', r"\1.json'", content)
            updated = True
            
        # fix arts.json
        if 'தரவு/arts' in content and 'arts.json' not in content:
            content = re.sub(r'(/தரவு/arts)[\'\"]', r"\1.json'", content)
            updated = True
            
        # fix stories.json
        if 'தரவு/stories' in content and 'stories.json' not in content:
            content = re.sub(r'(/தரவு/stories)[\'\"]', r"\1.json'", content)
            updated = True
            
        if updated:
            open(f, 'w', encoding='utf-8').write(content)
    except Exception as e:
        pass
