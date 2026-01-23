# Glamour PDF - AI Document Assistant

## Deployment Configuration

### ✅ Changes Made

All API endpoints in `frontend/index.html` have been updated to automatically detect the environment:

**Local Development:**
- API Base URL: `http://localhost:3000`

**Production:**
- API Base URL: `https://machine-learning-ai-rag-basics.onrender.com`

### 📡 Updated Endpoints

The following 4 endpoints now use dynamic URLs:

1. **Health Check**: `${API_BASE_URL}/health`
2. **Upload PDF**: `${API_BASE_URL}/upload`
3. **Ask Question**: `${API_BASE_URL}/ask`
4. **Stream Response**: `${API_BASE_URL}/ask-stream`

### 🚀 Deployment Options

#### Option 1: Vercel (Recommended for Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

#### Option 2: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy frontend
cd frontend
netlify deploy --prod --dir=.
```

#### Option 3: GitHub Pages
1. Push `frontend/index.html` to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Set source to main branch / root or /frontend folder

#### Option 4: Simple Static Hosting
Upload `frontend/index.html` to any static hosting service:
- Firebase Hosting
- Cloudflare Pages
- AWS S3 + CloudFront
- Azure Static Web Apps

### 🔧 Backend (Already Deployed on Render)

Your backend is already running at:
`https://machine-learning-ai-rag-basics.onrender.com`

Make sure the following environment variable is set in your Render dashboard:
- `GROQ_API_KEY`: Your Groq API key

### ✨ CORS Configuration

Ensure your backend (`server.js`) has CORS enabled for your frontend domain. Currently, it uses:
```javascript
app.use(cors());
```

This allows all origins. For production, you might want to restrict it:
```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com'
}));
```

### 🧪 Testing

1. **Local Testing**:
   - Start backend: `npm start`
   - Open `frontend/index.html` in browser
   - Check console for: `🌐 API Base URL: http://localhost:3000`

2. **Production Testing**:
   - Deploy frontend to any hosting
   - Open deployed URL
   - Check console for: `🌐 API Base URL: https://machine-learning-ai-rag-basics.onrender.com`
   - Test PDF upload and question answering

### 📝 Next Steps

1. Deploy frontend to your preferred hosting platform
2. Test all functionality (upload, ask, streaming)
3. Monitor backend logs on Render for any issues
4. Update CORS settings if needed for production security
