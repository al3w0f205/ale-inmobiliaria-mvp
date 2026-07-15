import os
import re

frontend_src = r"c:\Users\power\Desktop\Ale\Repos - Proyectos\MVP\frontend\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # If the file doesn't have fetch or access_token, skip
    if 'fetch(' not in content and 'access_token' not in content:
        return

    # Replace localStorage.getItem('access_token')
    content = re.sub(r"const\s+token\s*=\s*localStorage\.getItem\('access_token'\);\s*", "", content)
    
    # We need to add credentials: 'include' to fetch calls.
    # It's tricky to do with regex perfectly if we have nested objects, but let's try a simple approach for the specific cases we have.
    # Case 1: fetch(URL, { headers: { 'Authorization': `Bearer ${token}` } }) -> fetch(URL, { credentials: 'include' })
    # We will just replace the specific headers block if it only contains Authorization.
    
    # Replace the headers block that only contains Authorization
    content = re.sub(
        r"headers:\s*\{\s*'Authorization':\s*`Bearer \$\{token\}`\s*\}",
        "credentials: 'include'",
        content
    )
    
    # If there are other headers (like Content-Type), we want to append credentials: 'include' or just replace Authorization
    # Let's replace 'Authorization': `Bearer ${token}` with just nothing (or remove the line)
    content = re.sub(r"'Authorization':\s*`Bearer \$\{token\}`\s*,?\s*", "", content)
    
    # We still need to make sure credentials: 'include' is added to fetch if not there.
    # Let's just find fetch(..., { ... }) and insert credentials: 'include' if it doesn't have it.
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Processed {filepath}")

for root, dirs, files in os.walk(frontend_src):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            process_file(os.path.join(root, file))
