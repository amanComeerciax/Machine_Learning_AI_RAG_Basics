<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Local RAG System with Ollama</title>

  <style>
    body {
      font-family: "Segoe UI", Roboto, Arial, sans-serif;
      background: #0f172a;
      color: #e5e7eb;
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }

    header {
      background: linear-gradient(135deg, #6366f1, #22c55e);
      color: white;
      padding: 50px 20px;
      text-align: center;
    }

    header h1 {
      margin: 0;
      font-size: 2.5rem;
    }

    header p {
      font-size: 1.1rem;
      max-width: 700px;
      margin: 10px auto 0;
    }

    section {
      max-width: 900px;
      margin: auto;
      padding: 40px 20px;
    }

    h2 {
      color: #38bdf8;
      margin-bottom: 10px;
    }

    pre {
      background: #020617;
      padding: 15px;
      overflow-x: auto;
      border-radius: 8px;
      border-left: 4px solid #22c55e;
      color: #e5e7eb;
    }

    code {
      color: #22c55e;
    }

    ul {
      padding-left: 20px;
    }

    li {
      margin-bottom: 8px;
    }

    .box {
      background: #020617;
      padding: 20px;
      border-radius: 10px;
      margin: 20px 0;
      border: 1px solid #1e293b;
    }

    footer {
      background: #020617;
      color: #9ca3af;
      text-align: center;
      padding: 30px 20px;
      font-size: 0.9rem;
    }

    .highlight {
      color: #22c55e;
      font-weight: bold;
    }
  </style>
</head>
<body>

<header>
  <h1>🤖 Local RAG System with Ollama</h1>
  <p>
    A simple, stable, and fully local <strong>Retrieval-Augmented Generation (RAG)</strong>
    project built with <span class="highlight">Node.js</span> and
    <span class="highlight">Ollama</span> — no OpenAI, no API keys.
  </p>
</header>

<section>
  <h2>✨ Features</h2>
  <ul>
    <li>🧠 Local LLM using Ollama</li>
    <li>📄 Context-based answering (RAG concept)</li>
    <li>🚫 No hallucination – answers only from your data</li>
    <li>🆓 100% Free & Offline</li>
    <li>⚡ Lightweight & beginner-friendly</li>
  </ul>
</section>

<section>
  <h2>🧠 What is RAG?</h2>
  <div class="box">
    <p>
      <strong>RAG (Retrieval-Augmented Generation)</strong> means:
      <br/>
      <em>Give the AI your data first, then ask questions.</em>
    </p>
    <p>
      This project injects your data directly into the prompt,
      forcing the AI to answer only from that context.
    </p>
  </div>
</section>

<section>
  <h2>🏗 Project Structure</h2>
  <pre>
Office_Work/
│── rag.js          # Main RAG logic
│── data.txt        # Your knowledge base
│── package.json    # Project config
│── .gitignore      # Ignored files
│── README.html     # This file
  </pre>
</section>

<section>
  <h2>🚀 Getting Started</h2>

  <h3>1️⃣ Install Ollama Model</h3>
  <pre><code>ollama pull dolphin-llama3:8b</code></pre>

  <h3>2️⃣ Install Dependencies</h3>
  <pre><code>npm install</code></pre>

  <h3>3️⃣ Add Your Data</h3>
  <pre>
Company Leave Policy:
Employees are entitled to 12 paid leaves per year.
Casual leave is 6 days.
  </pre>

  <h3>4️⃣ Run the Project</h3>
  <pre><code>node rag.js</code></pre>
</section>

<section>
  <h2>✅ Example Output</h2>
  <pre>
Employees are entitled to 12 paid leaves per year.
Casual leave is 6 days.
  </pre>
</section>

<section>
  <h2>⚙️ How It Works</h2>
  <pre>
Your Data (data.txt)
        ↓
Context Injection
        ↓
Ollama Local LLM
        ↓
Accurate Answer
  </pre>
</section>

<section>
  <h2>🔐 Privacy</h2>
  <ul>
    <li>No cloud APIs</li>
    <li>No data leaves your machine</li>
    <li>Fully offline capable</li>
  </ul>
</section>

<section>
  <h2>🛠 Future Improvements</h2>
  <ul>
    <li>📄 PDF-based RAG</li>
    <li>🔍 Chunking & search</li>
    <li>🌐 Express API</li>
    <li>⚛️ React frontend</li>
    <li>🎤 Voice-based Q&A</li>
  </ul>
</section>

<section>
  <h2>👨‍💻 Author</h2>
  <div class="box">
    <p>
      <strong>Aman Memon</strong><br/>
      BCA Graduate | MERN Stack Developer | AI Enthusiast
    </p>
  </div>
</section>

<footer>
  <p>
    ⭐ If you like this project, give it a star on GitHub<br/>
    Built with clarity, stability, and real-world RAG fundamentals.
  </p>
</footer>

</body>
</html>
