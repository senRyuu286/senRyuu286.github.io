import { Mail, Linkedin, Github, Facebook, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import logo from "/logo-dark.svg";

export default function NavigationBar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);

  // Scroll detection (desktop only)
  useEffect(() => {
    if (window.innerWidth < 768) return;

    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection observer for "works" section
  useEffect(() => {
    const section = document.querySelector("#works");
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting ? "works" : ""),
      { threshold: 0.6 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Memoized styles to prevent recalculation
  const worksStyle = useMemo(
    () => `hover:text-primary transition font-medium ${
      active === "works" ? "text-primary" : ""
    }`,
    [active]
  );

  return (
    // 🔥 Changed bg-neutral/30 to bg-base-100/80 for a light frosted glass effect
    <div className="fixed top-0 left-0 w-full z-50 bg-base-100/80 backdrop-blur-md border-b border-base-200/50">
      <div
        className={`max-w-6xl mx-auto flex items-center justify-between px-6 transition-all duration-300 ${
          scrolled ? "h-18" : "h-24"
        }`}
      >
        {/* Desktop Links */}
        {/* 🔥 Changed text-base-300 to text-base-content */}
        <div className="hidden md:flex gap-8 text-2xl text-base-content">
          <a href="#works" className={worksStyle}>
            Works
          </a>
          <Link to="/about" className="hover:text-primary transition font-medium">
            About
          </Link>
        </div>

        {/* Logo + Name */}
        <Link
          to="/"
          className="hidden md:flex flex-col items-center justify-center"
        >
          {/* Note: Ensure your logo.svg is dark or has good contrast against white! */}
          <img src={logo} alt="Logo" className="w-12 h-12" />

          <motion.div
            animate={{
              opacity: scrolled ? 0 : 1,
              height: scrolled ? 0 : "auto",
              marginTop: scrolled ? 0 : 4,
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            // 🔥 Changed text-base-300 to text-base-content
            className="overflow-hidden text-2xl tracking-widest font-extralight text-base-content will-change-[opacity,height,margin-top]"
          >
            Justin Ramas
          </motion.div>
        </Link>

        {/* Desktop Icons */}
        {/* 🔥 Changed text-base-300 to text-base-content */}
        <div className="hidden md:flex gap-6 items-center text-base-content">
          {[Mail, Linkedin, Github, Facebook].map((Icon, i) => (
            <a key={i} href="#" className="hover:text-primary transition hover:scale-110">
              <Icon size={24} />
            </a>
          ))}
        </div>

        {/* Mobile Layout */}
        <div className="flex md:hidden items-center justify-between w-full">
          {/* 🔥 Changed text-base-300 to text-base-content */}
          <Link to="/" className="flex items-center gap-3 text-base-content">
            <img src={logo} alt="Logo" className="w-10 h-10" />
            <div className="text-lg tracking-widest font-extralight">
              Justin Ramas
            </div>
          </Link>
          {/* 🔥 Added text-base-content to ensure hamburger menu is visible */}
          <button onClick={() => setOpen(true)} className="text-base-content hover:text-primary transition">
            <Menu size={30} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 md:hidden backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              // 🔥 Changed bg-neutral/90 to bg-base-100/95 for a light sidebar
              className="fixed top-0 right-0 h-full w-72 bg-base-100/95 backdrop-blur-lg shadow-2xl md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
            >
              <div className="flex justify-end p-7">
                <button onClick={() => setOpen(false)}>
                  {/* 🔥 Changed text-base-300 to text-base-content */}
                  <X size={40} className="text-base-content hover:text-primary transition" />
                </button>
              </div>

              {/* 🔥 Changed colors to base-content and adjusted border/backgrounds for light theme */}
              <div className="flex flex-col items-center gap-8 text-2xl text-base-content border-l border-b border-base-300 rounded-bl-2xl pt-10 pb-10 bg-base-200/50 backdrop-blur-sm">
                <a href="#works" className={worksStyle} onClick={() => setOpen(false)}>
                  Works
                </a>
                <Link to="/about" className="hover:text-primary transition" onClick={() => setOpen(false)}>
                  About
                </Link>
                <div className="flex gap-8 text-base-content">
                  {[Mail, Linkedin, Github, Facebook].map((Icon, i) => (
                    <a key={i} href="#" className="hover:text-primary transition">
                      <Icon size={28} />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}