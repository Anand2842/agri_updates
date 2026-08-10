import os
import json
import re
import urllib.request
import urllib.error

def get_env():
    env_vars = {}
    if os.path.exists('.env.local'):
        with open('.env.local', 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    env_vars[k.strip()] = v.strip().strip('"').strip("'")
    return env_vars

env = get_env()
SUPABASE_URL = env.get('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_KEY = env.get('SUPABASE_SERVICE_ROLE_KEY', '')

def fetch_all_posts():
    url = f"{SUPABASE_URL}/rest/v1/posts?category=eq.schemes"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}'
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def update_post(id, content):
    url = f"{SUPABASE_URL}/rest/v1/posts?id=eq.{id}"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    payload = json.dumps({'content': content}).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers=headers, method='PATCH')
    with urllib.request.urlopen(req) as resp:
        return resp.status in [200, 204]

posts = fetch_all_posts()
print(f"Fetched {len(posts)} posts for cleanup.")

for post in posts:
    content = post['content']
    
    # Clean up PDF extraction artifacts
    content = re.sub(r'✅ WHO\s*', '', content)
    content = re.sub(r'CAN APPLY\?', '', content)
    content = re.sub(r'💰 WHAT DO\s*', '', content)
    content = re.sub(r'YOU GET\?', '', content)
    content = re.sub(r'🚀 HOW TO\s*', '', content)
    content = re.sub(r'\bTHIS\?\s*', '', content)
    content = re.sub(r'🎯\s*', '', content)
    
    # Fix "APPLY apply" duplicate or standalone APPLY
    content = re.sub(r'\bAPPLY apply\b', 'apply', content)
    content = re.sub(r'<li>APPLY\s*', '<li>', content)
    content = re.sub(r'<li>YOU GET\?\s*', '<li>', content)
    content = re.sub(r'<li>CAN APPLY\?\s*', '<li>', content)
    
    # Clean up target beneficiaries text in quick facts
    content = re.sub(r'<td>DPIIT recognised startups\. CAN APPLY\?  Incorporated', r'<td>DPIIT recognised startups. Incorporated', content)
    content = re.sub(r'<td>DPIIT recognised startups\.  Incorporated', r'<td>DPIIT recognised startups. Incorporated', content)
    
    update_post(post['id'], content)

print("Cleanup complete.")
