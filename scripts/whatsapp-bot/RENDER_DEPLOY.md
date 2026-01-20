# Deploy WhatsApp Bot to Render

## Quick Start

### 1. Create a New Background Worker on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Background Worker**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `whatsapp-bot`
   - **Root Directory**: `scripts/whatsapp-bot`
   - **Runtime**: Docker
   - **Plan**: Starter ($7/month) or higher

### 2. Add Environment Variables

In Render dashboard, add these variables:

| Variable | Value |
|----------|-------|
| `WEBHOOK_URL` | `https://agriupdates.online/api/webhooks/whatsapp` |
| `WHATSAPP_WEBHOOK_SECRET` | *(same as your Vercel secret)* |
| `GROUP_NAME` | `news` *(or your group name)* |

### 3. Add Persistent Disk

To preserve WhatsApp login session across restarts:

1. Go to **Disks** in your service settings
2. Add disk:
   - **Name**: `whatsapp-session`
   - **Mount Path**: `/app/.wwebjs_auth`
   - **Size**: 1 GB

### 4. First-Time Authentication

1. After deploy, go to **Logs** in Render dashboard
2. Look for the QR code in the logs
3. Scan with WhatsApp (Settings → Linked Devices → Link a Device)
4. Once authenticated, the session is saved to disk

### 5. Verify It Works

1. Send a test message to your target WhatsApp group
2. Check Render logs for "Forwarding to Website..."
3. Check your admin panel at `/admin/posts` for the new draft

## Troubleshooting

### QR Code Not Displaying Properly
The QR code may appear broken in logs. Copy the raw text below the QR and paste into [QR Code Generator](https://www.the-qrcode-generator.com/).

### Session Expired
Delete the persistent disk contents and restart the service to get a new QR code.

### Bot Not Detecting Messages
Ensure `GROUP_NAME` matches part of your WhatsApp group name (case-insensitive).
