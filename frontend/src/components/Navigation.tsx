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
    <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-black/60 backdrop-blur-lg border border-gray-800 rounded-full px-8 h-12 flex items-center justify-between shadow-2xl">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-sm font-bold tracking-[0.2em] text-gray-300 uppercase">SCARLET</h1>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.name} href={item.href} className="relative py-2 group">
                <div
                  className={clsx(
                    "flex items-center gap-2 transition-colors text-xs font-semibold tracking-wide uppercase",
                    isActive ? "text-gray-300" : "text-gray-600 group-hover:text-gray-400"
                  )}
                >
                  <Icon size={14} />
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="top-nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-400"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium tracking-wide uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
          System Online
        </div>
      </div>
    </header>
  );
}
