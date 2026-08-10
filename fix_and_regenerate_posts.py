#!/usr/bin/env python3
"""
Regenerate and fix SEO-Optimized Government Startup Schemes Blog Posts in Supabase.
This script replaces the old boilerplate-heavy HTML with clean, direct answers,
proper HTML lists, and actual extracted URLs.
"""

import os
import re
import json
import urllib.request
import urllib.error

# Load environment variables
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
SUPABASE_URL = env.get('NEXT_PUBLIC_SUPABASE_URL', 'https://ulqzicqxnaygfergqrbe.supabase.co')
SUPABASE_KEY = env.get('SUPABASE_SERVICE_ROLE_KEY', '')

if not SUPABASE_KEY:
    print("ERROR: SUPABASE_SERVICE_ROLE_KEY not found in .env.local")
    exit(1)

def format_bullet_points(text):
    if not text:
        return ""
    # Check if text contains bullets
    if '•' in text:
        items = text.split('•')
        # The first part might be leading text before bullets, keep it as paragraph if not empty
        html = ""
        leading = items[0].strip()
        if leading:
            html += f"<p>{leading}</p>\n"
        
        list_items = [i.strip() for i in items[1:] if i.strip()]
        if list_items:
            html += "<ul>\n"
            for item in list_items:
                html += f"  <li>{item}</li>\n"
            html += "</ul>\n"
        return html
    else:
        return f"<p>{text}</p>"

def extract_url(text):
    match = re.search(r'(https?://[^\s]+)', text)
    if match:
        return match.group(1).rstrip('.')
    return "https://www.startupindia.gov.in"

def clean_slug(title):
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'\s+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug.strip('-')[:80] + '-2026'

def get_author_desk(title, ministry):
    # Mapping image mapping
    IMAGES = {
        'agri': 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80',
        'biotech': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80',
        'tech': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80',
        'defence': 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80',
        'finance': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80',
        'space': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80',
        'msme': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80'
    }

    t_lower = title.lower() + ' ' + ministry.lower()
    if any(k in t_lower for k in ['agri', 'farm', 'food', 'livestock', 'rural', 'rkvy', 'apeda', 'nabard']):
        return 'Agricultural Policy & Innovation Desk', IMAGES['agri']
    elif any(k in t_lower for k in ['bio', 'birac', 'health', 'sparsh', 'dbt', 'pharm']):
        return 'Biotechnology & Life Sciences Desk', IMAGES['biotech']
    elif any(k in t_lower for k in ['defence', 'idex', 'aditi', 'drdo', 'tdf']):
        return 'Defence & Aerospace Innovation Desk', IMAGES['defence']
    elif any(k in t_lower for k in ['space', 'antariksh', 'in-space', 'isro']):
        return 'Space Tech & Exploration Desk', IMAGES['space']
    elif any(k in t_lower for k in ['meity', 'quantum', 'stpi', 'chips', 'dli', 'tech', 'semiconductor', 'tide', 'cyber']):
        return 'DeepTech & Electronics Desk', IMAGES['tech']
    elif any(k in t_lower for k in ['msme', 'mudra', 'cgtmse', 'sri fund', 'sc-st', 'esdp']):
        return 'MSME & Enterprise Development Desk', IMAGES['msme']
    else:
        return 'Startup Policy & Finance Desk', IMAGES['finance']

def build_post_content(scheme_name, ministry, what_is, objectives, eligibility, funding, process, source_url_text):
    # Extract actual URL
    actual_url = extract_url(source_url_text)

    # Clean the bullet points to make HTML lists
    eligibility_html = format_bullet_points(eligibility)
    funding_html = format_bullet_points(funding)
    process_html = format_bullet_points(process)
    what_is_html = format_bullet_points(what_is)
    objectives_html = format_bullet_points(objectives)

    # Make target beneficiaries a short snippet of the eligibility text
    target_beneficiaries = eligibility.replace('•', '').strip()[:100] + "..." if eligibility else "Startups and Innovators"

    intro = f"""<p><strong>{scheme_name}</strong> {what_is if what_is else 'is a key government initiative'} {objectives if objectives else ''}</p>"""

    quick_facts_table = f"""<h2>Quick Facts & Scheme Overview</h2>
<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Details</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Scheme Name</strong></td>
      <td>{scheme_name}</td>
    </tr>
    <tr>
      <td><strong>Nodal Ministry</strong></td>
      <td>{ministry if ministry else 'Government of India'}</td>
    </tr>
    <tr>
      <td><strong>Target Beneficiaries</strong></td>
      <td>{target_beneficiaries}</td>
    </tr>
    <tr>
      <td><strong>Official Portal</strong></td>
      <td><a href="{actual_url}" target="_blank" rel="noopener">Official Website</a></td>
    </tr>
  </tbody>
</table>"""

    sections = [intro, quick_facts_table]

    if eligibility_html:
        sections.append(f"<h2>Who is Eligible?</h2>\n{eligibility_html}")
    
    if funding_html:
        sections.append(f"<h2>Funding & Financial Assistance</h2>\n{funding_html}")
        
    if process_html:
        sections.append(f"<h2>How to Apply</h2>\n{process_html}")

    sources_sec = f"""<h2>Official Sources & Guidelines</h2>
<p>For complete guidelines and active application windows, refer to the official portal:</p>
<ul>
  <li><strong>Official Link:</strong> <a href="{actual_url}" target="_blank" rel="noopener">{actual_url}</a></li>
</ul>
<hr />
<div class="author-trust-card" style="background-color: #f8fafc; border-left: 4px solid #16a34a; padding: 16px; margin-top: 24px;">
  <p><strong>Written by:</strong> Agri & Startup Schemes Editorial Desk</p>
  <p><strong>Reviewed by:</strong> Government Policy & Scheme Audit Cell</p>
  <p><strong>Last Updated:</strong> August 2026</p>
  <p><em>Disclaimer: Scheme guidelines and funding caps are subject to official ministry updates. Verify current call notifications on the official portal before applying.</em></p>
</div>"""

    sections.append(sources_sec)
    return "\n\n".join(sections)

def update_post_in_supabase(slug, post_data):
    url = f"{SUPABASE_URL}/rest/v1/posts?slug=eq.{slug}"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    payload = json.dumps(post_data).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers=headers, method='PATCH')
    
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode('utf-8')
            res_json = json.loads(body)
            if isinstance(res_json, list) and len(res_json) > 0:
                return True, res_json[0].get('id')
            else:
                return False, "Post not found or not updated (maybe slug doesn't exist)"
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        return False, f"HTTP {e.code}: {err_body}"
    except Exception as e:
        return False, str(e)

# Read text from startup_schemes_content.txt
with open('startup_schemes_content.txt', 'r', encoding='utf-8') as f:
    raw_text = f.read()

pages = raw_text.split('=== PAGE ')
posts_data = []

for i in range(32, 102):
    if i >= len(pages):
        continue
    page_content = pages[i]
    lines = [l.strip() for l in page_content.split('\n') if l.strip()]
    
    # Clean out playbook headers and page numbers
    clean = []
    for l in lines:
        if 'PLAYBOOK OF' in l or re.match(r'^Page \d+', l) or re.match(r'^\d+\s*===', l):
            continue
        clean.append(l)
    
    if not clean or clean[0].startswith('SECTION 3 |') or clean[0].startswith('SECTION 4') or clean[0].startswith('SECTION 5'):
        continue
    
    title = clean[0]
    ministry = clean[1] if len(clean) > 1 and any(k in clean[1] for k in ['Department', 'Ministry', 'NITI', 'IN-SPACe', 'DRDO', 'Authority', 'Council', 'Centre', 'Mission']) else ''
    
    what_is, objectives, eligibility, funding, process, source_url_text = '', '', '', '', '', ''
    
    curr = None
    for l in clean:
        original_l = l
        # Detect sections and remove the header words
        if 'WHAT IS THIS' in l or 'WHAT IS IT' in l or '📌 WHAT IS' in l or l.startswith('WHAT IS'):
            curr = 'w'
            l = re.sub(r'^(📌\s*)?(WHAT IS THIS\?|WHAT IS IT\?|WHAT IS)', '', l).strip()
            if l.startswith('The ') or l.startswith('the '):
                pass
        elif 'OBJECTIVES' in l or '🎯' in l:
            curr = 'o'
            l = re.sub(r'^(🎯\s*)?OBJECTIVES?', '', l).strip()
        elif 'WHO CAN APPLY' in l or 'ELIGIBILITY' in l or '✅' in l:
            curr = 'e'
            l = re.sub(r'^(✅\s*)?(WHO CAN APPLY\?|ELIGIBILITY)', '', l).strip()
        elif 'WHAT DO YOU GET' in l or 'SUPPORT' in l or '💰' in l:
            curr = 'f'
            l = re.sub(r'^(💰\s*)?(WHAT DO YOU GET\?|SUPPORT)', '', l).strip()
        elif 'HOW TO APPLY' in l or 'PROCESS' in l or '📝' in l or '🚀 HOW TO' in l:
            curr = 'p'
            l = re.sub(r'^(📝\s*|🚀\s*)?(HOW TO APPLY\?|HOW TO APPLY|PROCESS)', '', l).strip()
        elif 'PRIMARY SOURCE' in l or 'OFFICIAL LINK' in l or '🔗' in l or 'KEY LINKS' in l:
            curr = 's'
            l = re.sub(r'^(🔗\s*)?(PRIMARY SOURCE\(S\)|PRIMARY SOURCES|OFFICIAL LINKS|KEY LINKS|LINKS)', '', l).strip()
        elif 'BEST SUITED FOR' in l or '💡' in l:
            curr = None # ignore this section
            continue
        
        if l and curr:
            if curr == 'w': what_is += ' ' + l
            elif curr == 'o': objectives += ' ' + l
            elif curr == 'e': eligibility += ' ' + l
            elif curr == 'f': funding += ' ' + l
            elif curr == 'p': process += ' ' + l
            elif curr == 's': source_url_text += ' ' + l

    what_is = what_is.strip()
    objectives = objectives.strip()
    eligibility = eligibility.strip()
    funding = funding.strip()
    process = process.strip()
    source_url_text = source_url_text.strip()

    seo_title = f"{title} 2026: Eligibility, Funding, & Application Process"
    slug = clean_slug(title)
    
    author_name, image_url = get_author_desk(title, ministry)
    content_html = build_post_content(title, ministry, what_is, objectives, eligibility, funding, process, source_url_text)
    
    posts_data.append({
        'slug': slug,
        'title': seo_title,
        'content': content_html,
        'author_name': author_name,
        'image_url': image_url
    })

master_guides = [
    {
        'title': 'Master Guide 2026: Central Government Schemes & Initiatives for Startups Playbook',
        'slug': 'central-government-startup-schemes-master-guide-2026',
        'content': '''<p><strong>The Central Government Startup Schemes Playbook 2026</strong> is the definitive guide to over 65 government-backed funding programs, incubation initiatives, and credit guarantee schemes for Indian startups across agriculture, biotechnology, defence, deeptech, space, and MSME sectors.</p>
<h2>Quick Facts & Playbook Overview</h2>
<table>
  <thead><tr><th>Category</th><th>Number of Schemes</th><th>Key Nodal Ministries</th></tr></thead>
  <tbody>
    <tr><td>Startup-Specific Schemes</td><td>30+</td><td>DPIIT, BIRAC, DST, MeitY, MoD, NABARD</td></tr>
    <tr><td>Startup-Relevant Schemes</td><td>35+</td><td>MSME, NITI Aayog, MoAFW, DFS</td></tr>
    <tr><td>PSU & State Initiatives</td><td>35+</td><td>PSUs, State Startup Portals</td></tr>
  </tbody>
</table>
<h2>5-Step Decision Tree: How to Pick the Right Scheme</h2>
<ol>
  <li><strong>Ideation / PoC Stage:</strong> Apply for NIDHI-PRAYAS, SISFS (Grant), or BIG (Biotech).</li>
  <li><strong>Prototype & Validation Stage:</strong> Apply for BIRAC SEED, RKVY R-ABI, or TIDE 2.0.</li>
  <li><strong>Market Entry & Early Traction:</strong> Apply for SISFS (Debt), AgriSURE, or SAMRIDH.</li>
  <li><strong>Scaling & Growth Stage:</strong> Access FFS (Fund of Funds), SRI Fund, or CGSS Collateral Guarantee.</li>
  <li><strong>Government Procurement:</strong> Register on GeM Startup Runway for direct public procurement.</li>
</ol>
<div class="author-trust-card"><p><strong>Written by:</strong> Agri & Startup Schemes Editorial Desk | <strong>Updated:</strong> August 2026</p></div>''',
        'author_name': 'Agri & Startup Schemes Policy Desk'
    },
    {
        'title': 'PSU Startup Initiatives 2026: Funding, Incubation & Procurement Programs Guide',
        'slug': 'psu-startup-initiatives-funding-procurement-guide-2026',
        'content': '''<p><strong>Indian Public Sector Undertakings (PSUs)</strong> play a critical role in nurturing technology startups through dedicated innovation funds, commercial pilots, and priority procurement pathways across energy, defence, mining, and logistics sectors.</p>
<h2>Key PSU Startup Programs</h2>
<table>
  <thead><tr><th>PSU Sector</th><th>Key Focus Areas</th><th>Support Type</th></tr></thead>
  <tbody>
    <tr><td>Oil & Gas (IOCL, ONGC, BPCL, HPCL)</td><td>Clean Energy, Biofuels, Refining Tech</td><td>Seed Grants & Proof-of-Concept Funding</td></tr>
    <tr><td>Power & Green Energy (NTPC, POWERGRID)</td><td>Renewable Energy, Grid Tech, EV Infrastructure</td><td>Pilot Projects & Trial Orders</td></tr>
    <tr><td>Mining & Steel (SAIL, CIL, NMDC)</td><td>Safety Tech, Automation, Recycling</td><td>R&D Grants & Field Testing</td></tr>
  </tbody>
</table>
<h2>How Startups Can Partner with PSUs</h2>
<ol>
  <li>Monitor dedicated PSU innovation portals (e.g., EngSUI portal).</li>
  <li>Participate in sector-specific PSU startup challenges and hackathons.</li>
  <li>Apply for vendor registration through GeM Startup Runway for pilot orders.</li>
</ol>
<div class="author-trust-card"><p><strong>Written by:</strong> Public Sector Innovation Desk | <strong>Updated:</strong> August 2026</p></div>''',
        'author_name': 'Public Sector Innovation Desk'
    },
    {
        'title': 'State & UT Startup Schemes 2026: Complete Directory of State Grants & Incubators',
        'slug': 'state-ut-startup-schemes-directory-2026',
        'content': '''<p><strong>State and Union Territory Startup Policies</strong> complement Central Government initiatives by providing local seed funding, incubation infrastructure, reimbursement for patent costs, and monthly subsistence allowances for early-stage entrepreneurs.</p>
<h2>Top State Government Startup Support Highlights</h2>
<table>
  <thead><tr><th>State / UT</th><th>Key Incentive</th><th>Official Portal</th></tr></thead>
  <tbody>
    <tr><td>Madhya Pradesh</td><td>Seed Capital, Interest Subvention, Rent Allowance</td><td><a href="https://startup.mp.gov.in/" target="_blank">startup.mp.gov.in</a></td></tr>
    <tr><td>Karnataka</td><td>Idea2POC (Elevate) Grants up to ₹50 Lakh</td><td><a href="https://startup.karnataka.gov.in/" target="_blank">startup.karnataka.gov.in</a></td></tr>
    <tr><td>Gujarat</td><td>Monthly Sustenance Allowance & Product Development Grant</td><td><a href="https://startup.gujarat.gov.in/" target="_blank">startup.gujarat.gov.in</a></td></tr>
    <tr><td>Maharashtra</td><td>Incubation Support & Grand Challenges</td><td><a href="https://msins.in/" target="_blank">msins.in</a></td></tr>
    <tr><td>Tamil Nadu</td><td>TANSEED Grants up to ₹10 Lakh for Early-Stage Ventures</td><td><a href="https://startuptn.in/" target="_blank">startuptn.in</a></td></tr>
  </tbody>
</table>
<h2>How to Leverage State Startup Policies</h2>
<ol>
  <li>Register on your home state\'s official startup portal.</li>
  <li>Apply for State Nodal Agency recognition in addition to DPIIT recognition.</li>
  <li>Claim state-specific incentives such as SGST reimbursement, patent cost subsidies, and exhibition stall rent subventions.</li>
</ol>
<div class="author-trust-card"><p><strong>Written by:</strong> State Policy & Regional Development Desk | <strong>Updated:</strong> August 2026</p></div>''',
        'author_name': 'State Policy & Regional Development Desk'
    }
]
posts_data.extend(master_guides)

print(f"Total scheme posts to update: {len(posts_data)}")

success_count = 0
fail_count = 0

print("\\n--- Starting Update into Supabase ---")

for idx, p in enumerate(posts_data, 1):
    slug = p.pop('slug')
    ok, res = update_post_in_supabase(slug, p)
    if ok:
        success_count += 1
        print(f"[{idx}/{len(posts_data)}] ✓ Updated post: {slug}")
    else:
        fail_count += 1
        print(f"[{idx}/{len(posts_data)}] ✗ Failed: {slug} | Error: {res}")

print("\\n==================================================")
print(f"Update Summary:")
print(f"  Successfully updated: {success_count}")
print(f"  Failed: {fail_count}")
print("==================================================")
