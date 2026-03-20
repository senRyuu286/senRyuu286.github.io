import { Mail, Linkedin, Github, Facebook, Menu, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // 🔥 Added useLocation and useNavigate
import logoDark from "/logo-dark.svg";
import logoLight from "/logo-light.svg";

export default function NavigationBar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  
  // 🔥 Setup hooks for routing
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem("theme") ? localStorage.getItem("theme") : "dark");

  useEffect(() => {
    localStorage.setItem("theme", theme as string);
    document.querySelector("html")?.setAttribute("data-theme", theme as string);
  }, [theme]);

  const handleToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    if (window.innerWidth < 768) return;
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const section = document.querySelector("#works");
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting ? "works" : ""),
      { threshold: 0.6 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [location.pathname]); // 🔥 Re-run this if the path changes

  // 🔥 Extracted the scroll math so we can reuse it
  const executeScroll = (targetId: string) => {
    const target = document.querySelector(targetId);
    if (target) {
      const navbarOffset = 72; 
      const elementPosition = target.getBoundingClientRect().top + window.scrollY;
      
      window.scrollTo({
        top: elementPosition - navbarOffset,
        behavior: "smooth"
      });
    }
  };

  // 🔥 Smart click handler
  const handleWorksClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setOpen(false);

    if (location.pathname !== "/") {
      // If we aren't on home, navigate there and append the hash
      navigate("/#works");
    } else {
      // If we are on home, just do the smooth scroll
      executeScroll("#works");
    }
  };

  // 🔥 Catch the navigation from the About page and trigger the scroll
  useEffect(() => {
    if (location.pathname === "/" && location.hash === "#works") {
      // Small timeout ensures the Home page has fully rendered before we calculate the scroll position
      setTimeout(() => {
        executeScroll("#works");
      }, 100);
    }
  }, [location]);

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-base-100/80 backdrop-blur-md border-b border-base-200/50">
      <div
        className={`max-w-6xl mx-auto flex items-center justify-between px-6 transition-all duration-300 ${
          scrolled ? "h-18" : "h-24"
        }`}
      >
        <div className="hidden md:flex flex-1 justify-start gap-8 text-2xl text-base-content">
          {/* 🔥 Updated the onClick to use our new handleWorksClick */}
          <a
            href="/#works"
            onClick={handleWorksClick}
            className={`relative font-medium transition-colors cursor-pointer group ${
              active === "works" ? "text-primary" : "hover:text-primary"
            }`}
          >
            Works
            <span
              className={`absolute -bottom-1 left-0 w-full h-0.5 bg-primary transform transition-transform duration-300 origin-center ${
                active === "works" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              }`}
            />
          </a>

          <Link
            to="/about"
            className={`relative font-medium transition-colors group ${
              location.pathname === "/about" ? "text-primary" : "hover:text-primary text-base-content"
            }`}
          >
            About
            <span 
              className={`absolute -bottom-1 left-0 w-full h-0.5 bg-primary transform transition-transform duration-300 origin-center ${
                location.pathname === "/about" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              }`} 
            />
          </Link>
        </div>

        <Link
          to="/"
          className="hidden md:flex flex-col items-center justify-center group shrink-0"
        >
          <motion.div
            className="flex flex-col items-center"
            whileHover="hover"
            initial="rest"
            animate="rest"
          >
            <motion.img
              src={theme === "light" ? logoDark : logoLight}
              alt="Logo"
              className="w-12 h-12 origin-center transform-gpu will-change-transform"
              variants={{
                rest: { scale: 1, rotate: 0 },
                hover: {
                  scale: 1.15,
                  rotate: -8,
                  transition: { type: "spring", stiffness: 400, damping: 10 },
                },
              }}
            />

            <motion.div
              animate={{
                opacity: scrolled ? 0 : 1,
                height: scrolled ? 0 : "auto",
                marginTop: scrolled ? 0 : 4,
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden text-2xl tracking-widest font-extralight text-base-content transition-colors duration-300 group-hover:text-primary will-change-[opacity,height,margin-top]"
            >
              Justin Ramas
            </motion.div>
          </motion.div>
        </Link>

        <div className="hidden md:flex flex-1 justify-end gap-6 items-center text-base-content">
          {[Mail, Linkedin, Github, Facebook].map((Icon, i) => (
            <a key={i} href="#" className="hover:text-primary transition hover:scale-110">
              <Icon size={24} />
            </a>
          ))}
          
          <div className="w-px h-6 bg-base-300 mx-2"></div>
          
          <motion.button 
            onClick={handleToggle}
            whileTap={{ scale: 0.8, rotate: 15 }} 
            className="hover:text-primary transition"
          >
            {theme === "light" ? <Moon size={24} /> : <Sun size={24} />}
          </motion.button>
        </div>

        <div className="flex md:hidden items-center justify-between w-full">
          <Link to="/" className="flex items-center gap-3 text-base-content group">
            <motion.img 
              src={theme === "light" ? logoDark : logoLight}
              alt="Logo" 
              className="w-10 h-10"
              whileTap={{ scale: 0.9, rotate: -5 }}
            />
            <div className="text-lg tracking-widest font-extralight group-hover:text-primary transition-colors">
              Justin Ramas
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <motion.button 
              onClick={handleToggle} 
              whileTap={{ scale: 0.8 }} 
              className="text-base-content hover:text-primary transition"
            >
              {theme === "light" ? <Moon size={26} /> : <Sun size={26} />}
            </motion.button>
            
            <button onClick={() => setOpen(true)} className="text-base-content hover:text-primary transition">
              <Menu size={30} />
            </button>
          </div>
        </div>
      </div>

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
              className="fixed top-0 right-0 h-full w-72 bg-base-100/95 backdrop-blur-lg shadow-2xl md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
            >
              <div className="flex justify-end p-7">
                <button onClick={() => setOpen(false)}>
                  <X size={40} className="text-base-content hover:text-primary transition" />
                </button>
              </div>

              <div className="flex flex-col items-center gap-8 text-2xl text-base-content border-l border-b border-base-300 rounded-bl-2xl pt-10 pb-10 bg-base-200/50 backdrop-blur-sm">
                {/* 🔥 Updated the mobile link too */}
                <a 
                  href="/#works"
                  onClick={handleWorksClick}
                  className={`relative font-medium transition-colors ${active === "works" ? "text-primary" : ""}`} 
                >
                  Works
                </a>
                <Link 
                  to="/about" 
                  className={`transition font-medium ${
                    location.pathname === "/about" ? "text-primary" : "text-base-content hover:text-primary"
                  }`} 
                  onClick={() => setOpen(false)}
                >
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