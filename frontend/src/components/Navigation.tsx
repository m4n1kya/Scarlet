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
    <div className="w-64 bg-dark-800 border-r border-dark-700 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="p-2 bg-scarlet-700/20 rounded-lg text-scarlet-700">
          <Flame size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wider text-white">SCARLET</h1>
          <p className="text-xs text-gray-400">Wildfire Monitor</p>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-8 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} className="relative block">
              {isActive && (
                <motion.div
                  layoutId="nav-bg"
                  className="absolute inset-0 bg-scarlet-700/10 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div
                className={clsx(
                  "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors z-10",
                  isActive ? "text-scarlet-500" : "text-gray-400 hover:text-gray-200 hover:bg-dark-700/50"
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-dark-700">
        <div className="bg-dark-900 rounded-lg p-4 border border-dark-600">
          <p className="text-xs text-gray-400 mb-1">Status</p>
          <div className="flex items-center gap-2 text-sm text-green-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            API Connected
          </div>
        </div>
      </div>
    </div>
  );
}
