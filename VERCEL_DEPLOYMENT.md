# Vercel पर Frontend Deploy करने का तरीका

## ✅ अच्छी खबर: Vercel में कोई Environment Variable की जरूरत नहीं है!

आपका frontend automatically detect करता है कि वो कहाँ चल रहा है:
- **Localhost** पर → `http://localhost:3000` use करेगा
- **Production** (Vercel) पर → `https://machine-learning-ai-rag-basics.onrender.com` use करेगा

## 🚀 Vercel पर Deploy करने के Steps

### Method 1: Vercel Website से (सबसे आसान)

1. **Vercel पर Sign Up/Login करें**
   - https://vercel.com पर जाएं
   - GitHub account से login करें

2. **New Project बनाएं**
   - "Add New" → "Project" पर click करें
   - अपनी GitHub repository select करें
   
3. **Configure करें**
   - **Framework Preset**: Other (या None)
   - **Root Directory**: `frontend` (या जहाँ आपकी HTML file है)
   - **Build Command**: Leave empty (कुछ नहीं लिखें)
   - **Output Directory**: Leave empty

4. **Environment Variables**
   - ❌ **कुछ add करने की जरूरत नहीं है!**
   - Frontend static file है, इसे कोई environment variable नहीं चाहिए

5. **Deploy करें**
   - "Deploy" button पर click करें
   - 1-2 मिनट में deploy हो जाएगा

### Method 2: Vercel CLI से

```bash
# 1. Vercel CLI install करें
npm i -g vercel

# 2. Frontend folder में जाएं
cd frontend

# 3. Login करें
vercel login

# 4. Deploy करें
vercel --prod
```

## 📝 Important Notes

### ✅ Frontend - कोई Environment Variable नहीं
Frontend सिर्फ एक HTML file है। ये automatically आपके Render backend को use करेगा।

**Code में देखें (`frontend/index.html` line 1247-1251):**
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'                                      // Local development
    : 'https://machine-learning-ai-rag-basics.onrender.com';      // Production (Render)
```

### ⚠️ Backend (Render) - Environment Variables Required

आपका backend already Render पर है। Render dashboard में ये environment variable जरूर set होना चाहिए:

**Required:**
- `GROQ_API_KEY` = आपकी Groq API key (already set है शायद)

**Optional:**
- `PORT` = 3000 (Render automatically set करता है)

## 🧪 Testing After Deployment

1. **Vercel पर deploy होने के बाद:**
   - Vercel आपको एक URL देगा: `https://your-app.vercel.app`
   
2. **Browser में खोलें:**
   - URL पर जाएं
   - F12 press करें (DevTools खोलने के लिए)
   - Console tab में देखें
   
3. **Check करें कि:**
   - Console में ये दिखना चाहिए: 
     ```
     🌐 API Base URL: https://machine-learning-ai-rag-basics.onrender.com
     ```
   - Green status indicator दिखना चाहिए (Server Online)

4. **Test करें:**
   - PDF upload करें
   - Question पूछें
   - Answer मिलना चाहिए

## 🔧 Troubleshooting

### अगर "Server Offline" दिख रहा है:

1. **Render backend check करें:**
   - https://machine-learning-ai-rag-basics.onrender.com/health पर जाएं
   - `{"status":"ok"}` दिखना चाहिए

2. **CORS error है तो:**
   आपके `server.js` में ये line होनी चाहिए:
   ```javascript
   app.use(cors());
   ```

3. **Browser Console में error देखें:**
   - F12 → Console tab
   - Red error messages check करें

## 📊 Summary

| Item | Value | Environment Variable? |
|------|-------|----------------------|
| **Frontend (Vercel)** | Static HTML | ❌ NO |
| **Backend (Render)** | Node.js Server | ✅ YES (`GROQ_API_KEY`) |
| **Frontend URL** | Auto-detected | ❌ Hardcoded in HTML |
| **Backend URL** | `https://machine-learning-ai-rag-basics.onrender.com` | ❌ Hardcoded in HTML |

## 🎯 Next Steps

1. ✅ आपका backend already Render पर है
2. ✅ Frontend code update हो गया है
3. 🔄 अब बस Vercel पर deploy करें (ऊपर के steps follow करें)
4. ✅ Test करें कि सब काम कर रहा है

**कोई environment variable की जरूरत नहीं है Vercel में!** 🎉
