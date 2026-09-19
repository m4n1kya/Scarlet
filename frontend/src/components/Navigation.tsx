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
    <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-8 h-12 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <nav className="flex items-center gap-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} className="relative py-2 group">
              <div
                className={clsx(
                  "flex items-center gap-2 transition-colors text-xs font-semibold tracking-wide uppercase",
                  isActive ? "text-gray-200" : "text-gray-500 group-hover:text-gray-300"
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
    </header>
  );
}
