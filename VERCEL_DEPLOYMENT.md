# Deploying AIBrowseX to Vercel

## 🚀 Quick Start

### Prerequisites
- GitHub account
- Vercel account (free tier is fine)
- Anthropic API key

---

## 📋 Deployment Steps

### 1. Push Your Code to GitHub ✅
Your code is already on GitHub at: `https://github.com/vishalharkal15/AIBrowseX-.git`

### 2. Import Project to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your repository: `vishalharkal15/AIBrowseX-`
5. Click **"Import"**

### 3. Configure Project Settings

**Framework Preset:** Other (it will auto-detect)

**Build & Development Settings:**
- Build Command: `npm install` (optional, leave empty)
- Output Directory: Leave empty
- Install Command: `npm install`

### 4. Add Environment Variables

Click **"Environment Variables"** and add:

```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

⚠️ **Important:** Replace with your real Anthropic API key!

### 5. Deploy!

Click **"Deploy"** button and wait 1-2 minutes.

---

## 🌐 What Gets Deployed

### Backend API Only (Serverless Functions)
Vercel will deploy your FastAPI backend as serverless functions.

**Your API Endpoints:**
- `https://your-project.vercel.app/` - Health check
- `https://your-project.vercel.app/health` - Health status
- `https://your-project.vercel.app/api/askAI` - AI chat
- `https://your-project.vercel.app/api/summary` - Summarize webpage
- `https://your-project.vercel.app/api/analyze` - Analyze content

### Electron Desktop App
❌ **Cannot be deployed to Vercel** (it's a desktop application)

The Electron app will continue to run locally on users' computers and connect to your Vercel API.

---

## 🔧 Update Electron App to Use Vercel API

After deployment, update your Electron app to use the Vercel backend:

1. Get your Vercel URL (e.g., `https://aibrowsex.vercel.app`)

2. Update `main.js` to use the Vercel API:

```javascript
// Replace this line:
const BACKEND_URL = 'http://localhost:8000';

// With your Vercel URL:
const BACKEND_URL = 'https://your-project.vercel.app';
```

3. Rebuild your desktop app:
```bash
npm run build:win
```

---

## 📊 Deployment Architecture

```
┌─────────────────────────────────────┐
│   User's Computer (Desktop App)     │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Electron App (Frontend)    │  │
│  │  - Browser UI                │  │
│  │  - Tabs, Bookmarks, etc.     │  │
│  └──────────┬───────────────────┘  │
│             │ HTTP Requests        │
└─────────────┼─────────────────────┘
              │
              ↓
┌─────────────────────────────────────┐
│         Vercel Cloud (API)          │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  FastAPI Serverless          │  │
│  │  - /api/askAI                │  │
│  │  - /api/summary              │  │
│  │  - /api/analyze              │  │
│  └──────────┬───────────────────┘  │
│             │                       │
└─────────────┼───────────────────────┘
              │
              ↓
┌─────────────────────────────────────┐
│      Anthropic API (Claude AI)      │
└─────────────────────────────────────┘
```

---

## ✅ Benefits of Vercel Deployment

1. **Always Available**: API is always online (no need to run backend locally)
2. **Auto-scaling**: Handles multiple users automatically
3. **Free Tier**: Generous free tier for personal projects
4. **HTTPS**: Automatic SSL certificates
5. **Fast**: Global CDN for fast response times
6. **Easy Updates**: Just push to GitHub, auto-deploys

---

## 🔄 Continuous Deployment

Once connected to GitHub:

1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update API"
   git push origin main
   ```
3. Vercel automatically deploys the new version! ✨

---

## 🧪 Testing Your Deployment

After deployment, test your API:

```bash
# Health check
curl https://your-project.vercel.app/health

# Test AI endpoint (POST request)
curl -X POST https://your-project.vercel.app/api/askAI \
  -H "Content-Type: application/json" \
  -d '{"question": "Hello, how are you?"}'
```

Or visit `https://your-project.vercel.app/` in your browser to see the health check response.

---

## 📝 Important Notes

### Database Consideration
⚠️ **SQLite won't work on Vercel** (serverless functions are stateless)

Options:
1. **Keep database local** (in Electron app) - ✅ Recommended
2. **Use cloud database** (PostgreSQL, MongoDB Atlas, Supabase)
3. **Hybrid**: Local DB for bookmarks/history, Vercel API for AI only

**Current Setup**: Keep using local SQLite in your Electron app. Only AI features use Vercel API.

### File Structure After Deployment
```
AIBrowseX/
├── api/
│   └── index.py          # ✅ Deployed to Vercel
├── renderer/             # ❌ Local (Electron app)
├── db/                   # ❌ Local (Electron app)
├── main.js              # ❌ Local (Electron app)
├── vercel.json          # ✅ Vercel config
├── requirements.txt     # ✅ Python dependencies
└── package.json         # For local Electron app
```

---

## 🆘 Troubleshooting

### Error: "No Python files found"
- Check `vercel.json` is configured correctly
- Ensure `api/index.py` exists

### Error: "Module not found"
- Check `requirements.txt` includes all dependencies
- Vercel auto-installs from `requirements.txt`

### API returns 503
- Check ANTHROPIC_API_KEY is set in Vercel environment variables
- Check API key is valid

### CORS errors
- CORS is already configured to allow all origins
- If issues persist, check Vercel logs

---

## 📚 Next Steps

1. ✅ Deploy to Vercel (follow steps above)
2. ✅ Get your Vercel URL
3. ✅ Update `main.js` with Vercel URL
4. ✅ Rebuild desktop app
5. ✅ Test everything works
6. ✅ Share your app with others!

---

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **Your GitHub Repo**: https://github.com/vishalharkal15/AIBrowseX-

---

## 💡 Pro Tips

1. **Custom Domain**: Add a custom domain in Vercel settings (optional)
2. **Analytics**: Enable Vercel Analytics to track API usage
3. **Logs**: Check Vercel logs to debug issues
4. **Environment**: Use different environments for dev/production

---

**Ready to deploy? Go to [vercel.com](https://vercel.com) and click "New Project"!** 🚀
