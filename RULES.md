# Agri Updates – Content Generation & Visibility Rules (RULES.md)

This file is the single source of truth for content creation, rendering, and publishing on Agri Updates.
Follow these rules exactly. Violations are publish-blocking.

---

## 1. Zero Hallucination Policy (CRITICAL)
- Do not invent dates, numbers, links, contacts, eligibility, or names.
- If a fact is missing or unverified, include: "Details to be verified from official source" and provide `source_url` if available.
- Do not extrapolate beyond source facts.

## 2. Intent Classification (MANDATORY)
Classify each item as ONE of:
- `job` — only for verified hiring roles.
- `opportunity` — calls for entries, incubations, fellowships, competitions.
- `scheme` — government subsidies/programs.
- `news` — startup / funding / acquisition / ecosystem updates.
- `event` — workshops, summits, cohorts.

Do NOT label an `opportunity` or `scheme` as `job`.

## 3. Author Rule (NON-NEGOTIABLE)
- Field `author` must exist in frontmatter.
- If empty or missing, set `author: "Anand"` automatically.

## 4. Frontmatter & Required Fields
Every post must include frontmatter YAML with at minimum:
```yaml
title: ""
author: "Anand"
date: ""
content_type: "opportunity" # job|opportunity|scheme|news|event
tags: []
primary_tag: ""
source_url: ""
published: false
review_date: ""
hero_image: ""
meta_description: ""
```

## 5. Content Structure (SEO + UX)

Every page must follow this hierarchy:

* Single `<h1>` (page title)
* `<h2>` for primary sections (Overview, Eligibility, How to Apply, Dates, FAQs)
* `<h3>` for subsections
* Lists must use `<ul>`/`<ol>`, not inline bullets
* Paragraphs: short (2–3 lines)

Minimum sections where applicable:

* Overview
* Eligibility / Who Can Apply
* Key Details / Highlights
* Important Dates
* How to Apply
* FAQs (≥2 for long-form)

## 6. Visibility & Rendering (MANDATORY)

* Render content as semantic HTML. Headings must be `<h1>`, `<h2>`, `<h3>`.
* Wrap article content in a typography container (eg. `prose` or equivalent).
* Disclaimer block must appear visually separated at the bottom.
* Critical facts (deadline, link, eligibility) must be visible without clicks — no hidden accordions.
* Mobile-first: no horizontal scroll; elements stack vertically.

## 7. Sanitizer Rules

Allowed tags must include:
`h1,h2,h3,p,ul,ol,li,strong,em,a,img,blockquote`
Allowed attributes: `href,src,alt,target,rel`
Do NOT remove heading tags during sanitization.

## 8. Metadata & Rich Snippets

* Generate JSON-LD for each post:

  * Use `JobPosting` for jobs, `CreativeWork`/`Article` for opportunity/news/scheme.
  * If `author` missing, set to `"Anand"` in JSON-LD.
* Meta description: 120–160 chars, generated from intro if not provided.

## 9. Source & Verification

* If any contact/detail is included, `source_url` is required.
* If `source_url` is missing for a key fact (date, contact), flag post as "Needs verification" and block publish.

## 10. Prepublish Validation (Required)

Before publishing, enforce:

* Intent correcto
* Frontmatter present and valid
* H1 exists
* Disclaimer present at the bottom (verbatim)
* JSON-LD valid
* Hero image + alt text present
* Sanitized HTML contains headings (h2 or h3) for sections

## 11. Disclaimer (MUST be appended verbatim)

**Disclaimer**
Agri Updates shares opportunities sourced from trusted networks. Applicants are advised to verify all details directly with the issuing organisation before submission.

## 12. Priority Principle

When in doubt, prioritize:
**Accuracy > Clarity > Structure > SEO > Speed**

End of RULES.md
