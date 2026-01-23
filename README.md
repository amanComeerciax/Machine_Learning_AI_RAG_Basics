<h1 align="center">📄 Machine Learning AI – PDF RAG Chatbot</h1>

<p align="center">
  <b>PDF-based AI Chatbot using RAG (Retrieval-Augmented Generation)</b><br/>
  Built with Node.js, Groq LLM, and a custom retrieval pipeline
</p>

<hr/>

<h2>🚀 Live Demo</h2>
<img width="2174" height="1968" alt="image" src="https://github.com/user-attachments/assets/5fd6668d-bce1-46c4-990d-8105282fd6ff" />

<p>
  🌐 <b>Frontend (User Interface):</b><br/>
  <a href="https://glamourpdfanalyzer.vercel.app/" target="_blank">
    https://glamourpdfanalyzer.vercel.app/
  </a>
</p>

<p>
  ⚙️ <b>Backend API:</b><br/>
  <a href="https://machine-learning-ai-rag-basics.onrender.com" target="_blank">
    https://machine-learning-ai-rag-basics.onrender.com
  </a>
</p>

<p>
  🔍 <b>Health Check:</b><br/>
  <a href="https://machine-learning-ai-rag-basics.onrender.com/health" target="_blank">
    /health
  </a>
</p>

<hr/>

<h2>📌 Project Overview</h2>

<p>
This project demonstrates a <b>real-world implementation of RAG (Retrieval-Augmented Generation)</b>.
Users can upload a PDF document via a web interface and ask natural language questions.  
The system retrieves relevant information from the PDF and generates accurate answers using an LLM.
</p>

<hr/>

<h2>🧠 What is RAG?</h2>

<p>
<b>Retrieval-Augmented Generation (RAG)</b> is an AI technique that combines:
</p>

<ul>
  <li>📄 Document Retrieval</li>
  <li>🧠 Large Language Models (LLMs)</li>
  <li>⚡ Context-aware Answer Generation</li>
</ul>

<p>
Instead of sending the full document to the model every time,  
only the <b>most relevant chunks</b> are retrieved and used as context — making responses faster, cheaper, and more accurate.
</p>

<hr/>

<h2>⚙️ Features</h2>

<ul>
  <li>📤 Upload PDF from frontend</li>
  <li>✂️ Automatic PDF text chunking</li>
  <li>🔍 Relevant context selection</li>
  <li>🤖 AI-powered Q&A using Groq LLM</li>
  <li>⚡ Fast responses with caching</li>
  <li>🌐 Clean frontend-backend separation</li>
</ul>

<hr/>

<h2>🛠 Tech Stack</h2>

<ul>
  <li><b>Frontend:</b> HTML, CSS, JavaScript (Vercel)</li>
  <li><b>Backend:</b> Node.js, Express (Render)</li>
  <li><b>AI Model:</b> Groq (LLaMA 3.3 – 70B)</li>
  <li><b>PDF Parsing:</b> pdf-parse</li>
  <li><b>File Upload:</b> Multer</li>
  <li><b>Caching:</b> Node Cache</li>
</ul>

<hr/>

<h2>📡 API Endpoints</h2>

<table border="1" cellpadding="8" cellspacing="0">
  <tr>
    <th>Method</th>
    <th>Endpoint</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>POST</td>
    <td>/upload</td>
    <td>Upload and index a PDF</td>
  </tr>
  <tr>
    <td>POST</td>
    <td>/ask</td>
    <td>Ask a question from the uploaded PDF</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/health</td>
    <td>Server health check</td>
  </tr>
  <tr>
    <td>POST</td>
    <td>/reset</td>
    <td>Clear uploaded PDF and cache</td>
  </tr>
</table>

<hr/>

<h2>📂 Architecture</h2>

<pre>
Frontend (Vercel)
        |
        |  HTTP Requests
        v
Backend API (Express - Render)
        |
        v
PDF Chunking + Retrieval (RAG)
        |
        v
Groq LLM (Answer Generation)
</pre>

<hr/>

<h2>🧪 Example Workflow</h2>

<ol>
  <li>User uploads a PDF using the frontend UI</li>
  <li>Backend extracts and chunks PDF text</li>
  <li>User asks a question</li>
  <li>Relevant chunks are retrieved</li>
  <li>Groq LLM generates an answer using retrieved context</li>
</ol>

<hr/>

<h2>🔐 Security Best Practices</h2>

<ul>
  <li>API keys stored in environment variables</li>
  <li>.env file excluded using .gitignore</li>
  <li>No secrets committed to GitHub</li>
</ul>

<hr/>

<h2>👨‍💻 Author</h2>

<p>
<b>Mohammad Aman Memon</b><br/>
Full Stack Developer | MERN | AI & RAG Enthusiast
</p>

<p>
🌐 GitHub: 
<a href="https://github.com/amanComeerciax" target="_blank">
  github.com/amanComeerciax
</a>
</p>

<hr/>

<h2>📈 Future Enhancements</h2>

<ul>
  <li>Vector database integration (FAISS / Qdrant)</li>
  <li>Multi-PDF support</li>
  <li>User authentication</li>
  <li>Chat-style UI</li>
  <li>Streaming AI responses</li>
</ul>

<hr/>

<p align="center">
  ⭐ If you found this project useful, give it a star!
</p>
