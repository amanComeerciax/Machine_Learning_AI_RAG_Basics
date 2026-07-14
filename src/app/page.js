"use client";

import { Show, SignIn, UserButton, useAuth } from "@clerk/nextjs";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GradientCard } from "@/components/ui/gradient-card";
import { Zap, Shield, Activity, Globe, Layers, Key, FileText } from "lucide-react";
import { AppleGlassNav } from "@/components/ui/apple-glass-nav";
import dynamic from "next/dynamic";
import { ContainerAnimated, ContainerStagger, GalleryGrid, GalleryGridCell } from "@/components/ui/cta-section-with-gallery";
import { Button } from "@/components/ui/button";
import { TunnelGrid } from "@/components/ui/3d-tunnel-grid";

const GALLERY_IMAGES = [
    "/images/gallery_hologram_docs_1783933813924.png",
    "/images/gallery_ai_network_1783933803973.png",
    "/images/gallery_data_scanner_1783933825364.png",
    "/images/gallery_pdf_icon_1783933794541.png",
];


const VolumetricStudio = dynamic(
    () => import("@/components/ui/volumetric-studio").then(mod => ({ default: mod.VolumetricStudio })),
    { ssr: false }
);

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
    const { isLoaded, userId, getToken } = useAuth();

    const [conversationHistory, setConversationHistory] = useState([]);
    const [pdfUploaded, setPdfUploaded] = useState(false);
    const [pdfMetadata, setPdfMetadata] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [documents, setDocuments] = useState([]);
    const [activeDocumentId, setActiveDocumentId] = useState(null);

    const [isUploading, setIsUploading] = useState(false);
    const [isAsking, setIsAsking] = useState(false);
    const [serverStatus, setServerStatus] = useState("Checking...");
    const [activeError, setActiveError] = useState("");
    const [errorTarget, setErrorTarget] = useState("");

    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);
    const textareaRef = useRef(null);
    const landingRef = useRef(null);

    // ========== Scroll Animations (Intersection Observer) ==========
    useEffect(() => {
        if (!isLoaded) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("active");
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
        );

        const elements = document.querySelectorAll(".reveal-el");
        elements.forEach((el) => observer.observe(el));

        // GSAP Number Counter Animation for Stats
        if (typeof window !== "undefined") {
            const statNumbers = document.querySelectorAll(".lp-stat-number");
            statNumbers.forEach((el) => {
                const text = el.innerText;
                let suffix = "";
                if (text.includes("M+")) suffix = "M+";
                else if (text.includes("k")) suffix = "k";

                const targetNum = parseFloat(text.replace(/[^0-9.]/g, ""));

                if (!isNaN(targetNum)) {
                    // Set initial value to 0 to prevent flashing
                    el.innerText = "0" + suffix;

                    const obj = { val: 0 };
                    gsap.to(obj, {
                        val: targetNum,
                        duration: 2,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 85%", // Starts animation when element is 85% down the viewport
                        },
                        onUpdate: () => {
                            el.innerText = Math.floor(obj.val) + suffix;
                        }
                    });
                }
            });
        }

        return () => {
            observer.disconnect();
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, [isLoaded, userId]);

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [conversationHistory, isAsking]);

    // Check server status and user pdf info
    useEffect(() => {
        if (!isLoaded) return;

        async function initWorkspace() {
            try {
                const res = await fetch("/api/health");
                const data = await res.json();
                if (data.status === "ok") {
                    setServerStatus("Online");

                    if (userId) {
                        await loadUserDocuments();
                    }
                } else {
                    setServerStatus("Offline");
                }
            } catch (err) {
                setServerStatus("Offline");
                console.error("Workspace init failed:", err);
            }
        }

        initWorkspace();
    }, [isLoaded, userId]);

    // Show error toast
    const showError = (target, message) => {
        setErrorTarget(target);
        setActiveError(message);
        setTimeout(() => {
            setActiveError("");
        }, 5000);
    };

    // Textarea resize handler
    const handleInput = (e) => {
        setInputValue(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (inputValue.trim() && !isAsking && pdfUploaded) {
                sendMessage();
            }
        }
    };

    // Trigger quick action questions
    const setQuestion = (q) => {
        setInputValue(q);
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    const [selectedFile, setSelectedFile] = useState(null);

    const processFile = (file) => {
        if (file.size > 10 * 1024 * 1024) {
            showError("upload", "⚠️ File size exceeds 10 MB limit");
            return;
        }
        setSelectedFile(file);
    };

    // Load documents for current user
    const loadUserDocuments = async (selectDocId = null) => {
        try {
            const token = await getToken();
            const res = await fetch("/api/documents", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const docs = await res.json();
                setDocuments(docs);
                if (docs.length > 0) {
                    const activeDoc = selectDocId 
                        ? docs.find(d => d._id === selectDocId) || docs[0]
                        : docs[0];
                    setPdfUploaded(true);
                    setActiveDocumentId(activeDoc._id);
                    setPdfMetadata({
                        title: activeDoc.title,
                        pages: activeDoc.pages,
                        fileType: activeDoc.fileType
                    });
                    setConversationHistory(activeDoc.messages || []);
                } else {
                    setPdfUploaded(false);
                    setActiveDocumentId(null);
                    setPdfMetadata(null);
                    setConversationHistory([]);
                }
            }
        } catch (err) {
            console.error("Failed to load documents:", err);
        }
    };

    // Delete a specific document
    const deleteDocument = async (docId) => {
        try {
            const token = await getToken();
            const res = await fetch("/api/reset", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ documentId: docId })
            });
            if (res.ok) {
                const remainingDocs = documents.filter(d => d._id !== docId);
                setDocuments(remainingDocs);
                if (docId === activeDocumentId) {
                    if (remainingDocs.length > 0) {
                        setPdfUploaded(true);
                        const nextDoc = remainingDocs[0];
                        setActiveDocumentId(nextDoc._id);
                        setPdfMetadata({
                            title: nextDoc.title,
                            pages: nextDoc.pages,
                            fileType: nextDoc.fileType
                        });
                        setConversationHistory(nextDoc.messages || []);
                    } else {
                        setPdfUploaded(false);
                        setActiveDocumentId(null);
                        setPdfMetadata(null);
                        setConversationHistory([]);
                    }
                }
            } else {
                const data = await res.json();
                showError("chat", data.error || "Delete failed");
            }
        } catch (err) {
            showError("chat", err.message);
        }
    };

    // File Upload
    const uploadFile = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setActiveError("");

        const formData = new FormData();
        formData.append("pdf", selectedFile);

        try {
            const token = await getToken();
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Upload failed");

            setSelectedFile(null);
            await loadUserDocuments(data.documentId);
        } catch (err) {
            showError("upload", `❌ ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    // Send Message
    const sendMessage = async () => {
        const message = inputValue.trim();
        if (!message || isAsking) return;

        setInputValue("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        const updatedHistory = [...conversationHistory, { role: "user", content: message }];
        setConversationHistory(updatedHistory);
        setIsAsking(true);

        const newAssistantMsgIndex = updatedHistory.length;
        const historyWithPlaceholder = [...updatedHistory, { role: "assistant", content: "" }];
        setConversationHistory(historyWithPlaceholder);

        try {
            const token = await getToken();
            const res = await fetch("/api/ask-stream", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ question: message, history: conversationHistory, documentId: activeDocumentId })
            });

            if (!res.ok) {
                const textErr = await res.text();
                throw new Error(textErr || "Failed to fetch response");
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let assistantText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const rawData = line.slice(6).trim();
                            if (!rawData) continue;
                            const parsed = JSON.parse(rawData);

                            if (parsed.error) {
                                throw new Error(parsed.error);
                            }

                            if (parsed.content) {
                                assistantText += parsed.content;
                                setConversationHistory(prev => {
                                    const next = [...prev];
                                    if (next[newAssistantMsgIndex]) {
                                        next[newAssistantMsgIndex].content = assistantText;
                                    }
                                    return next;
                                });
                            }
                        } catch (e) {
                            // Suppress JSON parsing errors for partial stream chunks
                        }
                    }
                }
            }
        } catch (err) {
            showError("chat", `❌ ${err.message}`);
            setConversationHistory(prev => prev.filter((_, idx) => idx !== newAssistantMsgIndex));
        } finally {
            setIsAsking(false);
        }
    };

    const [showAuthModal, setShowAuthModal] = useState(false);

    return (
        <>
            {/* ==================== LANDING PAGE ==================== */}
            <Show when="signed-out">
                <div className="landing-page bg-[#040a15] text-white" ref={landingRef}>
                    {/* Hero Container with integrated Navbar & Video */}
                    <div className="w-full h-screen">
                        <div className="relative w-full h-full overflow-hidden bg-[#040a15] flex flex-col items-center justify-center shadow-2xl">

                            {/* Background Video */}
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-100 brightness-110 contrast-105 transition-opacity duration-700"
                                style={{ imageRendering: 'high-quality' }}
                            >
                                <source src="/videos/hero-bg.mp4?v=2" type="video/mp4" />
                            </video>

                            {/* Lighter Overlay to hide artifacts but keep brightness */}
                            <div className="absolute inset-0 z-0 bg-[#3b82f6]/10 mix-blend-overlay pointer-events-none" />
                            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0a1628]/10 via-transparent to-[#040a15] pointer-events-none" />

                            {/* Integrated Floating Navbar */}
                            <nav className="absolute top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 flex items-center justify-between px-4 py-2 bg-[#0a1628]/60 backdrop-blur-2xl border border-[#3b82f6]/15 rounded-full shadow-[0_4px_30px_rgba(0,0,0,0.4),0_0_40px_rgba(59,130,246,0.08)] ring-1 ring-white/5">
                                <div className="flex items-center gap-3">
                                    <img src="/images/logo.png" alt="Glamour PDF Logo" className="w-9 h-9 object-contain rounded-xl" />
                                    <span className="text-white font-bold text-xl tracking-tight uppercase">Glamour PDF</span>
                                </div>
                                <div className="hidden lg:block">
                                    <AppleGlassNav items={[
                                        { name: "Home", href: "#" },
                                        { name: "How It Works", href: "#lp-how" },
                                        { name: "Features", href: "#lp-features" },
                                        { name: "Pricing", href: "#lp-pricing" }
                                    ]} />
                                </div>
                                <div className="flex items-center gap-4">
                                    <button className="text-sm font-medium text-white/80 hover:text-white hidden sm:block" onClick={() => setShowAuthModal(true)}>Log in</button>
                                    <button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-[0_4px_14px_rgba(59,130,246,0.4)] transition-all transform hover:-translate-y-0.5" onClick={() => setShowAuthModal(true)}>
                                        Sign Up
                                    </button>
                                </div>
                            </nav>


                        </div>
                    </div>

                    {/* Trusted By Logos */}
                    <section className="lp-trusted reveal-el">
                        <p className="lp-trusted-label">Trusted by leading teams worldwide</p>
                        <div className="lp-trusted-logos">
                            <span className="lp-trusted-logo">◆ TechCorp</span>
                            <span className="lp-trusted-logo">● DataFlow</span>
                            <span className="lp-trusted-logo">▲ CloudNine</span>
                            <span className="lp-trusted-logo">■ InnoLabs</span>
                            <span className="lp-trusted-logo">★ NexusAI</span>
                        </div>
                    </section>

                    {/* How It Works - Animated Steps */}
                    <section className="relative w-full pt-16 pb-24 overflow-hidden" id="lp-how" ref={(el) => {
                        if (!el || el.dataset.gsapInit) return;
                        el.dataset.gsapInit = "true";

                        // Animate header
                        const header = el.querySelector('.how-header');
                        if (header) {
                            gsap.fromTo(header, { opacity: 0, y: 50 }, {
                                opacity: 1, y: 0, duration: 1,
                                scrollTrigger: { trigger: header, start: "top 85%", end: "top 60%", scrub: 1 }
                            });
                        }

                        // Animate each step card
                        el.querySelectorAll('.how-anim-step').forEach((step, i) => {
                            const dir = i % 2 === 0 ? -80 : 80;
                            gsap.fromTo(step,
                                { opacity: 0, x: dir, scale: 0.9 },
                                {
                                    opacity: 1, x: 0, scale: 1, duration: 1,
                                    scrollTrigger: {
                                        trigger: step,
                                        start: "top 88%",
                                        end: "top 55%",
                                        scrub: 1,
                                    }
                                }
                            );
                        });

                        // Animate the connecting line
                        const line = el.querySelector('.how-connect-line');
                        if (line) {
                            gsap.fromTo(line, { scaleY: 0 }, {
                                scaleY: 1, duration: 1,
                                scrollTrigger: { trigger: el, start: "top 60%", end: "bottom 70%", scrub: 1 }
                            });
                        }
                    }}>
                        {/* Background glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.07] pointer-events-none" style={{
                            background: 'radial-gradient(circle, #3b82f6, transparent 70%)'
                        }} />

                        <div className="max-w-[1200px] mx-auto px-6 md:px-10 relative">
                            {/* Section Header */}
                            <div className="how-header text-center mb-20">
                                <div className="inline-block mb-4 px-5 py-2 rounded-full border border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#3b82f6] text-sm font-semibold tracking-wide uppercase">
                                    How It Works
                                </div>
                                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '48px', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
                                    Three Simple Steps to<br />
                                    <span className="highlight">Smarter Documents</span>
                                </h2>
                                <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '550px', margin: '20px auto 0', fontSize: '18px', lineHeight: 1.7 }}>
                                    No credit card required. No complicated setup. Just sign up and start chatting with your documents.
                                </p>
                            </div>

                            {/* Steps Container */}
                            <div className="relative flex flex-col gap-16 md:gap-24">

                                {/* Connecting Line */}
                                <div className="how-connect-line hidden md:block absolute left-1/2 top-[80px] bottom-[80px] w-[2px] -translate-x-1/2 origin-top" style={{
                                    background: 'linear-gradient(to bottom, transparent, #3b82f6 20%, #3b82f6 80%, transparent)'
                                }} />

                                {/* Step 1 - Slides from Left */}
                                <div className="how-anim-step flex flex-col md:flex-row items-center gap-8 md:gap-16">
                                    <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                                        <div className="relative w-[280px] h-[220px] rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden group hover:border-[#3b82f6]/40 transition-all duration-500">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="relative">
                                                    <div className="w-20 h-20 rounded-2xl bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_60px_rgba(59,130,246,0.5)] transition-shadow duration-700">
                                                        <Key className="w-10 h-10 text-[#3b82f6]" />
                                                    </div>
                                                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#3b82f6] flex items-center justify-center text-white text-xs font-bold shadow-[0_0_15px_rgba(59,130,246,0.5)]">✓</div>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#3b82f6]/5 to-transparent" />
                                        </div>
                                    </div>
                                    <div className="w-full md:w-1/2 text-center md:text-left">
                                        <div className="inline-flex items-center gap-3 mb-4">
                                            <span className="w-10 h-10 rounded-xl bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6] font-bold text-lg">01</span>
                                            <span className="text-[#3b82f6] text-sm font-semibold uppercase tracking-wider">Account Setup</span>
                                        </div>
                                        <h3 className="text-white text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Create Your Account</h3>
                                        <p className="text-white/50 text-base leading-relaxed max-w-md">
                                            Sign up securely using email, Google, or GitHub through our Clerk-powered authentication. Takes less than 30 seconds.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 2 - Slides from Right */}
                                <div className="how-anim-step flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16">
                                    <div className="w-full md:w-1/2 flex justify-center md:justify-start">
                                        <div className="relative w-[280px] h-[220px] rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden group hover:border-[#3b82f6]/40 transition-all duration-500">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="relative">
                                                    <div className="w-20 h-20 rounded-2xl bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_60px_rgba(59,130,246,0.5)] transition-shadow duration-700">
                                                        <FileText className="w-10 h-10 text-[#3b82f6]" />
                                                    </div>
                                                    <div className="absolute -bottom-1 -left-1 w-8 h-8 rounded-lg bg-[#3b82f6]/20 border border-[#3b82f6]/30 flex items-center justify-center animate-pulse">
                                                        <Layers className="w-4 h-4 text-[#3b82f6]" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#3b82f6]/5 to-transparent" />
                                        </div>
                                    </div>
                                    <div className="w-full md:w-1/2 text-center md:text-right">
                                        <div className="inline-flex items-center gap-3 mb-4">
                                            <span className="w-10 h-10 rounded-xl bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6] font-bold text-lg">02</span>
                                            <span className="text-[#3b82f6] text-sm font-semibold uppercase tracking-wider">Document Upload</span>
                                        </div>
                                        <h3 className="text-white text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Upload Your PDF</h3>
                                        <p className="text-white/50 text-base leading-relaxed max-w-md md:ml-auto">
                                            Drag and drop any PDF or TXT file. Our AI instantly splits it into smart chunks for accurate retrieval and deep analysis.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 3 - Slides from Left */}
                                <div className="how-anim-step flex flex-col md:flex-row items-center gap-8 md:gap-16">
                                    <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                                        <div className="relative w-[280px] h-[220px] rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden group hover:border-[#3b82f6]/40 transition-all duration-500">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="relative">
                                                    <div className="w-20 h-20 rounded-2xl bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_60px_rgba(59,130,246,0.5)] transition-shadow duration-700">
                                                        <Zap className="w-10 h-10 text-[#3b82f6]" />
                                                    </div>
                                                    {/* Chat bubble decorations */}
                                                    <div className="absolute -top-6 -right-8 px-3 py-1.5 rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[10px] text-[#3b82f6] font-medium whitespace-nowrap">
                                                        AI Answering...
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#3b82f6]/5 to-transparent" />
                                        </div>
                                    </div>
                                    <div className="w-full md:w-1/2 text-center md:text-left">
                                        <div className="inline-flex items-center gap-3 mb-4">
                                            <span className="w-10 h-10 rounded-xl bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6] font-bold text-lg">03</span>
                                            <span className="text-[#3b82f6] text-sm font-semibold uppercase tracking-wider">Start Chatting</span>
                                        </div>
                                        <h3 className="text-white text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Ask Anything</h3>
                                        <p className="text-white/50 text-base leading-relaxed max-w-md">
                                            Ask questions in any language and get instant, context-aware answers streamed in real-time. Powered by Mistral AI.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Scale With AI - Gallery CTA */}
                    <section className="relative w-full py-24 bg-[#0a1628]/30 border-y border-[#3b82f6]/10">
                        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-12 px-6 md:px-10 md:grid-cols-2">
                            <ContainerStagger>
                                <ContainerAnimated className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#3b82f6] text-xs font-semibold tracking-wide uppercase">
                                    Intelligent Analysis
                                </ContainerAnimated>
                                <ContainerAnimated className="text-4xl font-bold md:text-[2.8rem] tracking-tight text-white leading-tight font-['Outfit']">
                                    Transform Your Documents with AI
                                </ContainerAnimated>
                                <ContainerAnimated className="my-6 text-base text-white/50 md:text-lg leading-relaxed">
                                    Experience lightning-fast, context-aware answers from your PDFs. We help teams analyze, extract, and understand data instantly with enterprise-grade security.
                                </ContainerAnimated>
                                <ContainerAnimated>
                                    <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-8 py-6 text-base font-bold shadow-[0_4px_14px_rgba(59,130,246,0.4)] transition-all hover:scale-105 active:scale-95 rounded-xl" onClick={() => setShowAuthModal(true)}>
                                        Start Analyzing Today
                                    </Button>
                                </ContainerAnimated>
                            </ContainerStagger>

                            <GalleryGrid>
                                {GALLERY_IMAGES.map((imageUrl, index) => (
                                    <GalleryGridCell index={index} key={index}>
                                        <img
                                            className="size-full object-cover object-center"
                                            width="100%"
                                            height="100%"
                                            src={imageUrl}
                                            alt={`AI Document Analysis Feature ${index + 1}`}
                                        />
                                    </GalleryGridCell>
                                ))}
                            </GalleryGrid>
                        </div>
                    </section>

                    {/* Features - Grid Only */}
                    <section className="relative w-full overflow-hidden py-12" id="lp-features" ref={(el) => {
                        if (!el || el.dataset.gsapParallax) return;
                        el.dataset.gsapParallax = "true";


                        // Parallax: Floating orbs
                        el.querySelectorAll('.feat-orb').forEach((orb, i) => {
                            gsap.to(orb, {
                                y: (i % 2 === 0 ? -80 : -150),
                                scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true }
                            });
                        });

                        // Stagger cards in
                        const cards = el.querySelectorAll('.feat-card-anim');
                        cards.forEach((card, i) => {
                            gsap.fromTo(card,
                                { opacity: 0, y: 80, scale: 0.92 },
                                {
                                    opacity: 1, y: 0, scale: 1, duration: 0.8,
                                    scrollTrigger: {
                                        trigger: card,
                                        start: "top 90%",
                                        end: "top 65%",
                                        scrub: 1,
                                    }
                                }
                            );
                        });
                    }}>
                        {/* Background decorations */}
                        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] rounded-full opacity-[0.06] pointer-events-none" style={{
                            background: 'radial-gradient(ellipse, #3b82f6, transparent 70%)'
                        }} />

                        {/* Floating orbs for parallax depth */}
                        <div className="feat-orb absolute top-[10%] left-[8%] w-32 h-32 rounded-full opacity-[0.04] pointer-events-none" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
                        <div className="feat-orb absolute top-[60%] right-[5%] w-48 h-48 rounded-full opacity-[0.05] pointer-events-none" style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }} />
                        <div className="feat-orb absolute bottom-[15%] left-[15%] w-24 h-24 rounded-full opacity-[0.04] pointer-events-none" style={{ background: 'radial-gradient(circle, #93c5fd, transparent)' }} />

                        <div className="max-w-[1440px] mx-auto px-6 md:px-10 relative">

                            {/* Feature Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="feat-card-anim">
                                    <GradientCard
                                        title="Mistral AI Powered"
                                        description="Context-aware answers using mistral-small-latest model with RAG pipeline for maximum accuracy."
                                        icon={<Zap size={24} color="#3b82f6" />}
                                        linkText="Discover More"
                                    />
                                </div>
                                <div className="feat-card-anim">
                                    <GradientCard
                                        title="User-Scoped Privacy"
                                        description="Every user&apos;s documents are stored in isolated MongoDB collections. Zero data leaks guaranteed."
                                        icon={<Shield size={24} color="#3b82f6" />}
                                        linkText="Discover More"
                                    />
                                </div>
                                <div className="feat-card-anim">
                                    <GradientCard
                                        title="Real-Time Streaming"
                                        description="Answers stream character-by-character as they generate. See results instantly with zero wait."
                                        icon={<Activity size={24} color="#3b82f6" />}
                                        linkText="Discover More"
                                    />
                                </div>
                                <div className="feat-card-anim">
                                    <GradientCard
                                        title="Multilanguage Support"
                                        description="Ask questions in Hindi, English, Spanish, or any language. The AI understands and responds naturally."
                                        icon={<Globe size={24} color="#3b82f6" />}
                                        linkText="Discover More"
                                    />
                                </div>
                                <div className="feat-card-anim">
                                    <GradientCard
                                        title="Smart Chunking"
                                        description="Documents split into optimized chunks for precise context retrieval and accurate responses."
                                        icon={<Layers size={24} color="#3b82f6" />}
                                        linkText="Discover More"
                                    />
                                </div>
                                <div className="feat-card-anim">
                                    <GradientCard
                                        title="Clerk Auth Integration"
                                        description="Enterprise-grade authentication with SSO, MFA, and user management built-in from day one."
                                        icon={<Key size={24} color="#3b82f6" />}
                                        linkText="Discover More"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 3D Tunnel Grid Parallax */}
                    <TunnelGrid images={[
                        "/images/gallery_hologram_docs_1783933813924.png",
                        "/images/gallery_ai_network_1783933803973.png",
                        "/images/gallery_data_scanner_1783933825364.png",
                        "/images/gallery_pdf_icon_1783933794541.png",
                        "/images/features-robot.png",
                        "/images/hero-robot.png",
                        "/images/cta-robot.png",
                        "/images/gallery_hologram_docs_1783933813924.png",
                        "/images/gallery_ai_network_1783933803973.png",
                        "/images/gallery_data_scanner_1783933825364.png",
                        "/images/gallery_pdf_icon_1783933794541.png",
                        "/images/features-robot.png",
                        "/images/hero-robot.png",
                        "/images/cta-robot.png",
                        "/images/gallery_hologram_docs_1783933813924.png",
                        "/images/gallery_ai_network_1783933803973.png",
                    ]} />

                    {/* Pricing */}
                    <section className="relative w-full py-24" id="lp-pricing">
                        <div className="max-w-[1440px] mx-auto px-6 md:px-10 text-center mb-16 reveal-el">
                            <div className="inline-block mb-4 px-5 py-2 rounded-full border border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#3b82f6] text-sm font-semibold tracking-wide uppercase">
                                Pricing
                            </div>
                            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '44px', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.8px', color: 'white' }}>
                                Simple, Transparent Pricing
                            </h2>
                            <p className="mt-4 text-white/50 text-lg">Start free. Upgrade when you need more power.</p>
                        </div>
                        <div className="max-w-[1200px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Starter Plan */}
                            <div className="relative p-8 rounded-3xl bg-[#0a1628]/50 backdrop-blur-xl border border-white/5 hover:border-[#3b82f6]/30 transition-all duration-300 flex flex-col gap-6 group reveal-el delay-100">
                                <div className="text-xl font-bold text-white font-['Outfit']">Starter</div>
                                <div className="text-5xl font-black text-white font-['Outfit'] tracking-tight">
                                    <span className="text-2xl text-white/50 align-top mr-1">$</span>0<span className="text-lg text-white/40 font-medium tracking-normal">/mo</span>
                                </div>
                                <ul className="flex flex-col gap-4 flex-1 text-sm text-white/70">
                                    <li className="flex items-center gap-3"><span className="text-[#3b82f6]">✓</span> 5 Documents per month</li>
                                    <li className="flex items-center gap-3"><span className="text-[#3b82f6]">✓</span> 50 Questions per day</li>
                                    <li className="flex items-center gap-3"><span className="text-[#3b82f6]">✓</span> Basic AI responses</li>
                                    <li className="flex items-center gap-3"><span className="text-[#3b82f6]">✓</span> Community support</li>
                                </ul>
                                <button className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10" onClick={() => setShowAuthModal(true)}>
                                    Get Started
                                </button>
                            </div>

                            {/* Pro Plan */}
                            <div className="relative p-8 rounded-3xl bg-[#0a1628]/80 backdrop-blur-xl border border-[#3b82f6]/50 shadow-[0_0_40px_rgba(59,130,246,0.15)] flex flex-col gap-6 transform md:-translate-y-4 reveal-el delay-200">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#3b82f6] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-[0_4px_14px_rgba(59,130,246,0.4)]">
                                    Most Popular
                                </div>
                                <div className="text-xl font-bold text-[#3b82f6] font-['Outfit']">Pro</div>
                                <div className="text-5xl font-black text-white font-['Outfit'] tracking-tight">
                                    <span className="text-2xl text-white/50 align-top mr-1">$</span>19<span className="text-lg text-white/40 font-medium tracking-normal">/mo</span>
                                </div>
                                <ul className="flex flex-col gap-4 flex-1 text-sm text-white/80">
                                    <li className="flex items-center gap-3"><span className="text-[#3b82f6]">✓</span> Unlimited documents</li>
                                    <li className="flex items-center gap-3"><span className="text-[#3b82f6]">✓</span> Unlimited questions</li>
                                    <li className="flex items-center gap-3"><span className="text-[#3b82f6]">✓</span> Priority AI responses</li>
                                    <li className="flex items-center gap-3"><span className="text-[#3b82f6]">✓</span> Real-time streaming</li>
                                    <li className="flex items-center gap-3"><span className="text-[#3b82f6]">✓</span> Priority support</li>
                                </ul>
                                <button className="w-full py-3.5 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold transition-all shadow-[0_4px_14px_rgba(59,130,246,0.4)]" onClick={() => setShowAuthModal(true)}>
                                    Start Pro Trial
                                </button>
                            </div>

                            {/* Enterprise Plan */}
                            <div className="relative p-8 rounded-3xl bg-[#0a1628]/50 backdrop-blur-xl border border-white/5 hover:border-[#3b82f6]/30 transition-all duration-300 flex flex-col gap-6 group reveal-el delay-300">
                                <div className="text-xl font-bold text-white font-['Outfit']">Enterprise</div>
                                <div className="text-5xl font-black text-white font-['Outfit'] tracking-tight">
                                    <span className="text-2xl text-white/50 align-top mr-1">$</span>99<span className="text-lg text-white/40 font-medium tracking-normal">/mo</span>
                                </div>
                                <ul className="flex flex-col gap-4 flex-1 text-sm text-white/70">
                                    <li className="flex items-center gap-3"><span className="text-[#3b82f6]">✓</span> Everything in Pro</li>
                                    <li className="flex items-center gap-3"><span className="text-[#3b82f6]">✓</span> Custom AI model fine-tuning</li>
                                    <li className="flex items-center gap-3"><span className="text-[#3b82f6]">✓</span> SSO & team management</li>
                                    <li className="flex items-center gap-3"><span className="text-[#3b82f6]">✓</span> API access</li>
                                    <li className="flex items-center gap-3"><span className="text-[#3b82f6]">✓</span> Dedicated support</li>
                                </ul>
                                <button className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10" onClick={() => setShowAuthModal(true)}>
                                    Contact Sales
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* CTA Banner - Volumetric Studio */}
                    <section className="w-full relative h-[100vh] min-h-[600px] overflow-hidden mt-12 mb-0">
                        <div className="absolute inset-0 w-full h-full reveal-el">
                            <VolumetricStudio className="w-full h-full">
                                <div className="flex flex-col items-center justify-center w-full h-full text-center px-6 relative z-10 pointer-events-none">
                                    <div
                                        className="inline-block mb-6 px-5 py-2 rounded-full border border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#3b82f6] text-sm font-semibold tracking-wide uppercase"
                                    >
                                        ✨ Powered by Mistral AI
                                    </div>
                                    <h2
                                        className="text-4xl md:text-6xl lg:text-[80px] leading-none mb-6 font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 drop-shadow-2xl"
                                        style={{ fontFamily: "'Outfit', sans-serif" }}
                                    >
                                        Your PDFs,<br />Now Intelligent
                                    </h2>
                                    <p
                                        className="text-lg md:text-xl max-w-2xl mb-10 text-white/50 font-medium"
                                    >
                                        Upload any PDF, ask questions in any language, and get instant AI-powered answers. Experience the future of document analysis with Glamour PDF.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 pointer-events-auto">
                                        <button
                                            className="px-8 py-4 font-bold transition-transform hover:scale-105 active:scale-95 bg-[#3b82f6] text-white rounded-full shadow-[0_0_30px_rgba(59,130,246,0.4)] text-lg"
                                            onClick={() => setShowAuthModal(true)}
                                        >
                                            Start Analyzing Free →
                                        </button>
                                        <button
                                            className="px-8 py-4 font-bold transition-transform hover:scale-105 active:scale-95 bg-transparent text-white border border-white/20 rounded-full hover:bg-white/10 text-lg"
                                            onClick={() => {
                                                document.getElementById('lp-how')?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                        >
                                            See How It Works
                                        </button>
                                    </div>
                                </div>
                            </VolumetricStudio>
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="w-full border-t border-white/5 bg-[#040a15] pt-16 pb-8">
                        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-16">
                                <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <img src="/images/logo.png" alt="Glamour PDF Logo" className="w-8 h-8 object-contain rounded-lg" />
                                        <span className="text-white font-bold text-lg tracking-tight uppercase">Glamour PDF</span>
                                    </div>
                                    <p className="text-white/40 text-sm leading-relaxed max-w-xs mt-2">
                                        The AI-powered document assistant that understands your PDFs in any language.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <h4 className="text-white font-semibold text-sm mb-2">Product</h4>
                                    <a href="#lp-features" className="text-white/50 hover:text-white text-sm transition-colors">Features</a>
                                    <a href="#lp-pricing" className="text-white/50 hover:text-white text-sm transition-colors">Pricing</a>
                                    <a href="#" className="text-white/50 hover:text-white text-sm transition-colors">Changelog</a>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <h4 className="text-white font-semibold text-sm mb-2">Company</h4>
                                    <a href="#" className="text-white/50 hover:text-white text-sm transition-colors">About Us</a>
                                    <a href="#" className="text-white/50 hover:text-white text-sm transition-colors">Blog</a>
                                    <a href="#" className="text-white/50 hover:text-white text-sm transition-colors">Contact</a>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <h4 className="text-white font-semibold text-sm mb-2">Legal</h4>
                                    <a href="#" className="text-white/50 hover:text-white text-sm transition-colors">Privacy Policy</a>
                                    <a href="#" className="text-white/50 hover:text-white text-sm transition-colors">Terms of Service</a>
                                    <a href="#" className="text-white/50 hover:text-white text-sm transition-colors">Security</a>
                                </div>
                            </div>
                            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                                <p className="text-white/40 text-sm">
                                    © {new Date().getFullYear()} Glamour PDF. All rights reserved.
                                </p>
                                <div className="flex items-center gap-4">
                                    <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all text-sm">𝕏</a>
                                    <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all text-sm">in</a>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>

                {/* Auth Modal */}
                {showAuthModal && (
                    <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
                        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close" onClick={() => setShowAuthModal(false)}>×</button>
                            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "22px", fontWeight: "800" }}>
                                Access Workspace
                            </h2>
                            <SignIn routing="hash" />
                        </div>
                    </div>
                )}
            </Show>

            {/* ==================== CHAT WORKSPACE ==================== */}
            <Show when="signed-in">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
                    <div className="app" id="appContainer" style={{ maxWidth: "1120px" }}>
                        {/* Header */}
                        <header className="header">
                            <div className="header-left">
                                <div className="logo">
                                    <img src="/images/logo.png" alt="Logo" style={{ width: "100%", height: "100%", borderRadius: "10px" }} />
                                </div>
                                <div className="brand">
                                    <h1>Glamour PDF</h1>
                                    <span>AI Document Assistant</span>
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                {pdfUploaded && (
                                    <button 
                                        className="btn-change-pdf"
                                        onClick={() => {
                                            setPdfUploaded(false);
                                            setActiveDocumentId(null);
                                            setPdfMetadata(null);
                                            setSelectedFile(null);
                                            setConversationHistory([]);
                                        }}
                                        style={{
                                            background: "rgba(59, 130, 246, 0.15)",
                                            border: "1px solid rgba(59, 130, 246, 0.3)",
                                            color: "#3b82f6",
                                            padding: "6px 14px",
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            transition: "all 0.3s"
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = "rgba(59, 130, 246, 0.25)"; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)"; }}
                                    >
                                        ➕ New Chat
                                    </button>
                                )}
                                <div className={`status-pill ${serverStatus === "Online" ? "online" : "offline"}`}>
                                    <span className="status-dot"></span>
                                    <span>{serverStatus}</span>
                                </div>
                                <UserButton afterSignOutUrl="/" />
                            </div>
                        </header>

                        {/* Main Body */}
                        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                            {/* Sidebar */}
                            <aside className="sidebar-chats" style={{
                                width: "260px",
                                borderRight: "1px solid var(--border)",
                                background: "rgba(10, 15, 35, 0.4)",
                                display: "flex",
                                flexDirection: "column",
                                flexShrink: 0
                            }}>
                                <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
                                    <button
                                        onClick={() => {
                                            setPdfUploaded(false);
                                            setActiveDocumentId(null);
                                            setPdfMetadata(null);
                                            setSelectedFile(null);
                                            setConversationHistory([]);
                                        }}
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            background: "rgba(59, 130, 246, 0.1)",
                                            border: "1px dashed rgba(59, 130, 246, 0.3)",
                                            borderRadius: "12px",
                                            color: "#3b82f6",
                                            fontWeight: "600",
                                            fontSize: "13px",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "8px",
                                            transition: "all 0.2s"
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)"; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)"; }}
                                    >
                                        ➕ New Chat
                                    </button>
                                </div>
                                <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {documents.map((doc) => {
                                        const isActive = doc._id === activeDocumentId;
                                        return (
                                            <div
                                                key={doc._id}
                                                onClick={() => {
                                                    setPdfUploaded(true);
                                                    setActiveDocumentId(doc._id);
                                                    setPdfMetadata({ title: doc.title, pages: doc.pages, fileType: doc.fileType });
                                                    setConversationHistory(doc.messages || []);
                                                }}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    padding: "10px 12px",
                                                    borderRadius: "10px",
                                                    background: isActive ? "rgba(59, 130, 246, 0.15)" : "transparent",
                                                    border: isActive ? "1px solid rgba(59, 130, 246, 0.2)" : "1px solid transparent",
                                                    color: isActive ? "white" : "rgba(255,255,255,0.6)",
                                                    cursor: "pointer",
                                                    fontSize: "13px",
                                                    transition: "all 0.2s"
                                                }}
                                                onMouseOver={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                                                onMouseOut={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                                            >
                                                <span style={{
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    flex: 1,
                                                    marginRight: "8px"
                                                }}>
                                                    📄 {doc.title}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteDocument(doc._id);
                                                    }}
                                                    style={{
                                                        background: "transparent",
                                                        border: "none",
                                                        color: "rgba(255,255,255,0.3)",
                                                        cursor: "pointer",
                                                        fontSize: "12px",
                                                        padding: "2px 6px"
                                                    }}
                                                    onMouseOver={(e) => { e.currentTarget.style.color = "#ef4444"; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </aside>

                            {/* Content Panel */}
                            <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", position: "relative" }}>
                                {!pdfUploaded ? (
                                    <section className="upload-section">
                                        <div
                                            className="drop-zone"
                                            onClick={() => fileInputRef.current?.click()}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
                                        >
                                            <div className="drop-zone-icon">📤</div>
                                            <div className="drop-zone-title">
                                                {selectedFile ? selectedFile.name : "Drop your document here or click to browse"}
                                            </div>
                                            <div className="drop-zone-hint">
                                                {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "PDF & TXT files • Max 10 MB"}
                                            </div>
                                        </div>

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept=".pdf,.txt"
                                            style={{ display: "none" }}
                                            onChange={(e) => { const f = e.target.files[0]; if (f) processFile(f); }}
                                        />

                                        {activeError && errorTarget === "upload" && (
                                            <div className="error-toast visible" style={{ marginTop: "12px" }}>{activeError}</div>
                                        )}

                                        <button
                                            className="btn-upload"
                                            onClick={uploadFile}
                                            disabled={!selectedFile || isUploading}
                                        >
                                            {isUploading ? (
                                                <><div className="spinner"></div> Processing…</>
                                            ) : (
                                                "🚀 Upload & Process Document"
                                            )}
                                        </button>
                                    </section>
                                ) : (
                                    <>
                                        {/* Chat Area */}
                                        <div className="chat-area">
                                            {conversationHistory.length === 0 ? (
                                                <div className="welcome">
                                                    <div className="welcome-emoji">🤖</div>
                                                    <h2>Welcome to Glamour PDF</h2>
                                                    <p>Upload a document and ask questions — I&apos;ll find the answers using AI.</p>
                                                </div>
                                            ) : (
                                                conversationHistory.map((msg, index) => (
                                                    <div key={index} className={`msg ${msg.role}`}>
                                                        <div className="msg-avatar">{msg.role === "user" ? "👤" : "🤖"}</div>
                                                        <div className="msg-body">
                                                            <div className="msg-bubble" dangerouslySetInnerHTML={{
                                                                __html: msg.content.replace(/\n/g, "<br />")
                                                            }}></div>
                                                            <div className="msg-time">
                                                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}

                                            {isAsking && (
                                                <div className="msg assistant">
                                                    <div className="msg-avatar">🤖</div>
                                                    <div className="msg-body">
                                                        <div className="msg-bubble">
                                                            <div className="typing-dots">
                                                                <span></span><span></span><span></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div ref={chatEndRef} />
                                        </div>

                                        {/* Quick actions */}
                                        {conversationHistory.length <= 1 && (
                                            <div style={{ display: "flex", justifyContent: "center", paddingBottom: "10px" }}>
                                                <div className="quick-actions">
                                                    <button className="quick-action" onClick={() => setQuestion("Summarize this document")}>📝 Summarize</button>
                                                    <button className="quick-action" onClick={() => setQuestion("What are the key points?")}>🔑 Key points</button>
                                                    <button className="quick-action" onClick={() => setQuestion("What is the main topic?")}>💡 Main topic</button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Input bar */}
                                        <div className="input-section">
                                            {activeError && errorTarget === "chat" && (
                                                <div className="error-toast visible">{activeError}</div>
                                            )}
                                            <div className="input-row">
                                                <div className="input-wrap">
                                                    <textarea
                                                        ref={textareaRef}
                                                        value={inputValue}
                                                        onChange={handleInput}
                                                        onKeyDown={handleKeyDown}
                                                        placeholder="Ask me anything about your document..."
                                                        rows={1}
                                                        disabled={isAsking}
                                                    />
                                                    {inputValue && (
                                                        <button className="clear-input visible" onClick={() => setInputValue("")}>×</button>
                                                    )}
                                                </div>
                                                <button
                                                    className="btn-send"
                                                    onClick={sendMessage}
                                                    disabled={!inputValue.trim() || isAsking}
                                                    title="Send message"
                                                >➤</button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Show>
        </>
    );
}
