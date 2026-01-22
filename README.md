
<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/6c5886d2-9c0c-4ba0-b0d3-45fe7fc7b11b" />

<!DOCTYPE html>
<html lang="en">
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
