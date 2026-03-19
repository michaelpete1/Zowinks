"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/laptops", label: "Laptops" },
    { href: "/accessories", label: "Accessories" },
    { href: "/support", label: "Support" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/5 via-white/60 to-emerald-500/10 backdrop-blur-xl" />
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8 lg:px-12">
        {/* Logo */}
        <motion.div
          className="flex-shrink-0"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="group relative">
            <div className="grid h-12 w-12 place-items-center rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl ring-2 ring-white/20 backdrop-blur-sm">
              <Image
                src="/zowinks-removebg-preview.png"
                alt="Zowinks logo"
                width={48}
                height={48}
                className="h-10 w-10 object-contain drop-shadow-lg"
              />
            </div>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
            <div className="ml-4 hidden lg:block">
              <p className="font-display text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent drop-shadow-lg">
                Zowkins
              </p>
              <p className="text-xs font-medium text-emerald-600 tracking-wider uppercase">
                Enterprise LTD
              </p>
            </div>
          </div>
        </motion.div>

        {/* Desktop Nav & Search */}
        <div className="hidden items-center lg:flex xl:w-1/2">
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-6 text-base font-medium">
                {navLinks.slice(0, 4).map((link) => (
                  <motion.div
                    key={link.href}
                    whileHover={{ y: -2 }}
                    className="relative group"
                  >
                    <Link
                      href={link.href}
                      className="text-slate-700 hover:text-slate-900 transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-gradient-to-r after:from-emerald-500 after:to-blue-500 after:transition-all after:duration-300 group-hover:after:w-full"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Search */}
          <motion.div
            className="ml-8 relative group"
            initial={{ scale: 1 }}
            whileFocus={{ scale: 1.02 }}
          >
            <div className="relative flex items-center rounded-2xl bg-white/80 backdrop-blur-md border border-white/50 shadow-xl px-5 py-3 hover:shadow-2xl transition-all duration-300 group-hover:bg-white/90">
              <svg
                className="h-5 w-5 text-slate-400 absolute left-4 group-focus-within:text-emerald-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                className="bg-transparent pl-12 pr-4 text-sm placeholder-slate-400 focus:outline-none w-48"
                placeholder="Search products..."
              />
            </div>
          </motion.div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative rounded-2xl bg-white/70 backdrop-blur border border-white/40 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-white/90"
          >
            Sign In
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-2xl hover:shadow-3xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200"
          >
            Request Quote
          </motion.button>
          <motion.button
            whileHover={{ rotate: 360 }}
            className="relative grid h-12 w-12 place-items-center rounded-3xl bg-white/80 backdrop-blur border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 ml-2"
          >
            <svg
              className="h-5 w-5 text-slate-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <motion.span
              className="absolute -top-1 -right-1 grid h-6 w-6 place-items-center rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-xs font-bold text-white shadow-lg"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              3
            </motion.span>
          </motion.button>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="lg:hidden grid h-12 w-12 place-items-center rounded-3xl bg-white/80 backdrop-blur border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-200 ml-auto"
          onClick={() => setIsOpen(!isOpen)}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          <svg
            className={`h-6 w-6 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </motion.button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -50, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -50, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden relative border-t border-white/20 bg-white/90 backdrop-blur-3xl shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-6 py-8">
              {/* Mobile Logo */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl">
                    <Image
                      src="/zowinks-removebg-preview.png"
                      alt="Zowinks"
                      width={48}
                      height={48}
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold text-slate-900">
                      Zowkins
                    </p>
                    <p className="text-xs font-medium text-emerald-600 tracking-wider uppercase">
                      Enterprise LTD
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    className="h-7 w-7 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>
              </div>

              {/* Mobile Search */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="flex items-center rounded-2xl bg-white/80 backdrop-blur border border-white/50 px-5 py-4 shadow-xl">
                  <svg
                    className="h-5 w-5 text-slate-400 mr-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    className="bg-transparent text-lg placeholder-slate-500 flex-1 focus:outline-none"
                    placeholder="Search products..."
                  />
                </div>
              </motion.div>

              {/* Mobile Nav Links */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="block rounded-2xl bg-white/50 backdrop-blur border border-white/30 px-6 py-4 text-lg font-semibold text-slate-900 hover:bg-white/80 hover:shadow-xl transition-all duration-200 text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Mobile Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <button className="w-full rounded-2xl border border-slate-200 px-6 py-4 text-lg font-semibold bg-white/70 backdrop-blur hover:bg-white hover:shadow-xl transition-all duration-200">
                  Sign In
                </button>
                <button className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 text-lg font-bold text-white shadow-2xl hover:shadow-3xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200">
                  Request Quote
                </button>
                <div className="flex items-center justify-center pt-4 border-t border-white/30">
                  <div className="relative mr-4">
                    <button className="grid h-14 w-14 place-items-center rounded-3xl bg-white/80 backdrop-blur border border-white/40 shadow-xl hover:shadow-2xl transition-all">
                      <svg
                        className="h-6 w-6 text-slate-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      <span className="absolute -top-1 -right-1 grid h-7 w-7 place-items-center rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-sm font-bold text-white shadow-lg">
                        3
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
