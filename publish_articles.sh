#!/bin/bash

# Supabase config
SUPABASE_URL="https://ulqzicqxnaygfergqrbe.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVscXppY3F4bmF5Z2ZlcmdxcmJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ1ODQyMiwiZXhwIjoyMDgzMDM0NDIyfQ.gJWgDe0CD8OvpdWt_70SGd0ibxFbGjTGIvhztfa-AYg"
MCP_URL="https://twzhczgmcwuusldowyim.supabase.co/functions/v1/news-mcp"
MCP_KEY="mcp_QK8hXbz0upfk75yRz_VLIK_HWTYvahq1"

echo "=== Agri Updates: Publishing 15 Articles ==="
echo ""

# Function to map tag to category
map_category() {
    case "$1" in
        MARKET|POLICY|LIVESTOCK|HORTICULTURE) echo "News" ;;
        RESEARCH|CLIMATE) echo "Research" ;;
        STARTUP) echo "Startups" ;;
        FUNDING) echo "Grants" ;;
        TECH) echo "News" ;;
        *) echo "News" ;;
    esac
}

# Function to generate slug from title with timestamp for uniqueness
generate_slug() {
    TIMESTAMP=$(date +%s)
    echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//' | cut -c1-70 | sed "s/$/-${TIMESTAMP}/"
}

# Fetch all articles from MCP - list_latest
echo "Fetching articles from MCP feed (list_latest)..."
ARTICLES1=$(curl -s -X POST "$MCP_URL" \
    -H "Authorization: Bearer $MCP_KEY" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_latest","arguments":{"limit":10,"min_score":7,"india_only":true}}}')

# Fetch more with search
echo "Fetching articles from MCP feed (search_news)..."
ARTICLES2=$(curl -s -X POST "$MCP_URL" \
    -H "Authorization: Bearer $MCP_KEY" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search_news","arguments":{"query":"farmers crops","limit":10,"min_score":6,"india_only":true}}}')

# Combine articles - extract items from both and merge
ALL_ITEMS=$(jq -n \
    --argjson a "$ARTICLES1" \
    --argjson b "$ARTICLES2" \
    '[$a.result.content[0].text | fromjson | .items[]] + [$b.result.content[0].text | fromjson | .items[]] | unique_by(.id) | .[0:15]')

COUNT=$(echo "$ALL_ITEMS" | jq 'length')
echo "Total unique articles to publish: $COUNT"
echo ""

PUBLISHED=0
FAILED=0

# Process each article
for i in $(seq 0 $((COUNT-1))); do
    ARTICLE=$(echo "$ALL_ITEMS" | jq -c ".[$i]")
    
    TITLE=$(echo "$ARTICLE" | jq -r '.title')
    URL=$(echo "$ARTICLE" | jq -r '.url')
    SOURCE=$(echo "$ARTICLE" | jq -r '.source')
    SUMMARY=$(echo "$ARTICLE" | jq -r '.summary')
    TAG=$(echo "$ARTICLE" | jq -r '.tag')
    ARTICLE_ID=$(echo "$ARTICLE" | jq -r '.id')
    
    SLUG=$(generate_slug "$TITLE")
    CATEGORY=$(map_category "$TAG")
    NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    # Create tags array
    TAGS="[\"$(echo $TAG | tr '[:upper:]' '[:lower:]')\",\"agriculture\",\"india\",\"$(echo $SOURCE | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g')\"]"
    
    # Generate content
    CONTENT="<h2>${TITLE}</h2>
<p>${SUMMARY}</p>
<p><strong>Why This Matters for Indian Agriculture:</strong> This development has significant implications for India's agricultural sector. With the sector employing over 40% of the country's workforce and contributing approximately 18% to GDP, such news directly impacts millions of farmers and agri-businesses across the country.</p>
<h2>Key Takeaways</h2>
<p><strong>Source:</strong> ${SOURCE} | <strong>Category:</strong> ${CATEGORY}</p>
<p>Read the full article at <a href=\"${URL}\" target=\"_blank\">the original source</a>.</p>
<p>This article was sourced and curated by Agri Updates Editorial to keep the Indian agricultural community informed about the latest developments in the sector.</p>"
    
    echo "[$((i+1))/$COUNT] Publishing: $TITLE"
    echo "  - Category: $CATEGORY"
    echo "  - Slug: $SLUG"
    
    # Prepare JSON payload
    PAYLOAD=$(jq -n \
        --arg title "$TITLE" \
        --arg slug "$SLUG" \
        --arg excerpt "$(echo "$SUMMARY" | cut -c1-150)" \
        --arg content "$CONTENT" \
        --arg category "$CATEGORY" \
        --arg published_at "$NOW" \
        --arg created_at "$NOW" \
        --arg author_name "Agri Updates Editorial" \
        --arg status "published" \
        --arg source "mcp_news_feed" \
        --argjson tags "$TAGS" \
        --argjson is_active true \
        '{
            title: $title,
            slug: $slug,
            excerpt: $excerpt,
            content: $content,
            category: $category,
            status: $status,
            is_active: $is_active,
            is_published: true,
            author_name: $author_name,
            tags: $tags,
            published_at: $published_at,
            created_at: $created_at,
            source: $source,
            views: 0
        }')
    
    # Insert into Supabase
    RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/posts" \
        -H "apikey: $SUPABASE_KEY" \
        -H "Authorization: Bearer $SUPABASE_KEY" \
        -H "Content-Type: application/json" \
        -H "Prefer: return=representation" \
        -d "$PAYLOAD" 2>&1)
    
    # Check for errors - Supabase returns array on success
    if echo "$RESPONSE" | jq -e '.[0].id' > /dev/null 2>&1; then
        POST_ID=$(echo "$RESPONSE" | jq -r '.[0].id')
        echo "  ✓ Published (ID: $POST_ID)"
        PUBLISHED=$((PUBLISHED + 1))
    elif echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
        POST_ID=$(echo "$RESPONSE" | jq -r '.id')
        echo "  ✓ Published (ID: $POST_ID)"
        PUBLISHED=$((PUBLISHED + 1))
    else
        ERROR=$(echo "$RESPONSE" | jq -r '.message // .error_description // .hint // "Unknown error"')
        echo "  ✗ Failed: $ERROR"
        FAILED=$((FAILED + 1))
    fi
    
    echo ""
    sleep 1
done

echo ""
echo "=== Publishing Complete ==="
echo "Published: $PUBLISHED"
echo "Failed: $FAILED"
