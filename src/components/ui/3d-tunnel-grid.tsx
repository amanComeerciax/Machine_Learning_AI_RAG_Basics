"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

export function TunnelGrid({ images, className }: { images: string[], className?: string }) {
  // Create a perfectly tileable array of 3D positions so the animation can loop seamlessly
  const { tileableItems, loopDepth } = React.useMemo(() => {
    // 32 items for the base loop
    const baseImages = [...images, ...images].slice(0, 32); 
    const depthSpacing = 800;
    
    const basePositions = baseImages.map((img, i) => {
      const sectionIndex = Math.floor(i / 4);
      const z = - (sectionIndex * depthSpacing);
      const angle = (i % 4) * (Math.PI / 2) + (Math.random() * 0.5);
      const radius = 300 + Math.random() * 400;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const rotateZ = (Math.random() - 0.5) * 20;
      const rotateX = (Math.random() - 0.5) * 30;
      const rotateY = (Math.random() - 0.5) * 30;
      
      return { img, x, y, z, rotateX, rotateY, rotateZ };
    });

    const singleLoopDepth = 32 / 4 * depthSpacing; // 8 sections * 800 = 6400

    // Duplicate the base positions for the second half of the loop, offset by singleLoopDepth
    const duplicatePositions = basePositions.map(pos => ({
      ...pos,
      z: pos.z - singleLoopDepth
    }));

    return { 
        tileableItems: [...basePositions, ...duplicatePositions],
        loopDepth: singleLoopDepth
    };
  }, [images]);

  return (
    <div className={cn("relative h-screen min-h-[700px] w-full overflow-hidden bg-[#040a15] flex items-center justify-center border-y border-[#3b82f6]/10", className)} style={{ perspective: "800px" }}>
        
        {/* Center Title */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none">
            <h2 className="text-white text-5xl md:text-[5rem] font-black tracking-tighter drop-shadow-[0_0_30px_rgba(59,130,246,0.6)] font-['Outfit']">
                Endless <span className="text-[#3b82f6]">Possibilities</span>
            </h2>
            <p className="mt-4 text-white/60 text-lg md:text-xl max-w-lg mx-auto text-center">
                Dive deep into your documents. The only limit is your imagination.
            </p>
        </div>

        {/* The 3D Scene - Auto Animates infinitely */}
        <motion.div 
          className="absolute inset-0 w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ z: [0, loopDepth] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
        >
          {tileableItems.map((item, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 -ml-[150px] -mt-[100px] w-[300px] h-[200px] rounded-2xl overflow-hidden border border-[#3b82f6]/30 shadow-[0_0_40px_rgba(59,130,246,0.15)] bg-[#0a1628]/80 backdrop-blur-sm"
              style={{
                transform: `translate3d(${item.x}px, ${item.y}px, ${item.z}px) rotateX(${item.rotateX}deg) rotateY(${item.rotateY}deg) rotateZ(${item.rotateZ}deg)`
              }}
            >
              <img src={item.img} alt={`Floating Image ${i}`} className="w-full h-full object-cover opacity-80 transition-opacity hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040a15] to-transparent pointer-events-none" />
            </div>
          ))}
        </motion.div>

        {/* Ambient Fog/Glow overlay to give depth effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#040a15_100%)] pointer-events-none" />
        
    </div>
  )
}
