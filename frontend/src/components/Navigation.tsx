"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, BarChart2, Database, Info, Flame } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

const navItems = [
  { name: "Detection", href: "/", icon: Camera },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "History", href: "/history", icon: Database },
  { name: "About", href: "/about", icon: Info },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 bg-white text-black rounded-sm">
            <span className="font-black text-sm leading-none tracking-tighter">S</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-[0.2em] text-white uppercase">SCARLET</h1>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.name} href={item.href} className="relative py-4 group">
                <div
                  className={clsx(
                    "flex items-center gap-2 transition-colors text-xs font-semibold tracking-wide uppercase",
                    isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300"
                  )}
                >
                  <Icon size={14} />
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="top-nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium tracking-wide uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          System Online
        </div>
      </div>
    </header>
  );
}
