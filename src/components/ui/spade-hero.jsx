"use client";

import React, { useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function SpadeHero({ onSignUp }) {
    const videoRef = useRef(null);

    useEffect(() => {
        // Optional: Any future initialization logic can go here
    }, []);

    const logos = [
        { name: "Vortex", letter: "V" },
        { name: "Nimbus", letter: "N" },
        { name: "Prysma", letter: "P" },
        { name: "Cirrus", letter: "C" },
        { name: "Kynder", letter: "K" },
        { name: "Halcyn", letter: "H" },
    ];
    
    // Duplicate for seamless loop
    const marqueeItems = [...logos, ...logos];

    return (
        <section className="relative min-h-screen flex flex-col bg-[hsl(var(--background))] overflow-hidden font-['Geist_Sans',sans-serif]">
            
            {/* Background Video (Fully Bright) */}
            <div className="absolute inset-0 z-0 bg-[#040a15] overflow-hidden">
                <video
                    src="https://res.cloudinary.com/kxylepyh/video/upload/v1784187134/Website_hero_section_background___202607161254_processed_n40odw.mp4"
                    className="absolute inset-0 w-full h-full object-cover opacity-100"
                    style={{ filter: 'contrast(1.05) saturate(1.1)', transform: 'translateZ(0)', willChange: 'transform' }}
                    autoPlay
                    loop
                    muted
                    playsInline
                />
            </div>

            {/* Content Container (above background) */}
            <div className="relative z-10 flex flex-col min-h-screen overflow-visible">

                {/* Navbar */}
                <nav className="w-full">
                    <div className="w-full py-5 px-8 flex flex-row items-center justify-between">
                        {/* Left: Logo */}
                        <div className="flex items-center">
                            <img src="/images/logo.png" alt="Logo" style={{ height: '32px' }} className="rounded-lg object-contain" />
                        </div>
                        
                        {/* Center: Nav Items */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#" className="text-[hsl(var(--foreground))]/90 hover:text-[hsl(var(--foreground))] transition-colors text-sm font-medium">
                                Home
                            </a>
                            <a href="#lp-how" className="text-[hsl(var(--foreground))]/90 hover:text-[hsl(var(--foreground))] transition-colors text-sm font-medium">
                                How It Works
                            </a>
                            <a href="#lp-features" className="text-[hsl(var(--foreground))]/90 hover:text-[hsl(var(--foreground))] transition-colors text-sm font-medium">
                                Features
                            </a>
                            <a href="#lp-pricing" className="text-[hsl(var(--foreground))]/90 hover:text-[hsl(var(--foreground))] transition-colors text-sm font-medium">
                                Pricing
                            </a>
                        </div>
                        
                        {/* Right: Sign Up */}
                        <div className="flex items-center gap-4">
                            <button onClick={onSignUp} className="text-sm font-medium text-[hsl(var(--foreground))]/80 hover:text-[hsl(var(--foreground))] transition-colors">
                                Log in
                            </button>
                            <button onClick={onSignUp} className="heroSecondary rounded-full px-4 py-2 text-sm font-semibold">
                                Sign Up
                            </button>
                        </div>
                    </div>
                    {/* Divider Line */}
                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[hsl(var(--foreground))]/20 to-transparent mt-[3px]" />
                </nav>

                {/* Hero Content */}
                <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[1440px] mx-auto px-6 md:px-10 z-10 relative">
                    {/* Intentionally left blank as per user request */}
                </div>

                {/* Gradient fade to match landing page background */}
                <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#040a15] to-transparent pointer-events-none z-0" />
            </div>
        </section>
    );
}
