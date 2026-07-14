"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type NavItem = {
    name: string;
    href?: string;
    onClick?: () => void;
};

interface NavProps {
    items: NavItem[];
    className?: string;
}

export const AppleGlassNav = ({ items, className }: NavProps) => {
    const [active, setActive] = useState(items[0].name);

    return (
        <nav className={cn("flex p-1.5 gap-2", className)}>
            {items.map((item) => (
                <a
                    key={item.name}
                    href={item.href || "#"}
                    onClick={(e) => { 
                        e.preventDefault(); 
                        setActive(item.name);
                        if (item.onClick) item.onClick();
                        else if (item.href && item.href.startsWith('#') && item.href.length > 1) {
                            const id = item.href.substring(1);
                            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}
                    className={cn(
                        "relative px-4 py-1.5 text-sm font-medium transition-colors duration-300",
                        active === item.name ? "text-white" : "text-white/70 hover:text-white"
                    )}
                >
                    {active === item.name && (
                        <motion.div
                            layoutId="glass-active"
                            className="absolute inset-0 bg-white/15 shadow-sm rounded-full backdrop-blur-md border border-white/20"
                            transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                        />
                    )}
                    <span className="relative z-10">{item.name}</span>
                </a>
            ))}
        </nav>
    );
};
