import sys

def check_brackets(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    depth = 0
    lines = content.split('\n')
    
    for i, line in enumerate(lines):
        for char in line:
            if char == '{':
                depth += 1
            elif char == '}':
                depth -= 1
                if depth < 0:
                    print(f"Error: Unmatched '}}' on line {i+1}")
                    return
    
    if depth > 0:
        print(f"Error: Missing {depth} closing '}}' brackets at EOF.")
    else:
        print("Brackets are balanced.")

check_brackets('src/components/features/CategoryListView.css')
