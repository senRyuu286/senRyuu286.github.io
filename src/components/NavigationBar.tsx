import { Mail, Linkedin, Github, Menu, X, Sun, Moon } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoDark from "/logo-dark.svg";
import logoLight from "/logo-light.svg";
import { scrollToSection } from "../features/ScrollToSection";

const socialLinks = [
  { Icon: Mail, url: "mailto:justinramas12@outlook.com" },
  { Icon: Linkedin, url: "https://www.linkedin.com/in/justin-ramas/" },
  { Icon: Github, url: "https://github.com/senRyuu286" },
];

export default function NavigationBar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const isScrolling = useRef(false);

  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "dark",
  );

  useEffect(() => {
    localStorage.setItem("theme", theme as string);
    document.querySelector("html")?.setAttribute("data-theme", theme as string);
  }, [theme]);

  const handleToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    if (window.innerWidth < 768) return;
    const handleScroll = () => {
      if (isScrolling.current) return;
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const collapse = () => {
      setScrolled(true);
      isScrolling.current = true;
    };
    const unlock = () => {
      isScrolling.current = false;
    };

    window.addEventListener("navbar-collapse", collapse);
    window.addEventListener("navbar-unlock", unlock);

    return () => {
      window.removeEventListener("navbar-collapse", collapse);
      window.removeEventListener("navbar-unlock", unlock);
    };
  }, []);

  useEffect(() => {
    const section = document.querySelector("#works");
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting ? "works" : ""),
      { threshold: 0.6 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [location.pathname]);

  const executeScroll = (targetId: string) => {
    scrollToSection(targetId, setScrolled, isScrolling);
  };

  const handleWorksClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setOpen(false);

    if (location.pathname !== "/") {
      navigate("/#works");
    } else {
      executeScroll("#works");
    }
  };

  useEffect(() => {
    if (location.pathname === "/" && location.hash === "#works") {
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
                active === "works"
                  ? "scale-x-100"
                  : "scale-x-0 group-hover:scale-x-100"
              }`}
            />
          </a>

          <Link
            to="/about"
            className={`relative font-medium transition-colors group ${
              location.pathname === "/about"
                ? "text-primary"
                : "hover:text-primary text-base-content"
            }`}
          >
            About
            <span
              className={`absolute -bottom-1 left-0 w-full h-0.5 bg-primary transform transition-transform duration-300 origin-center ${
                location.pathname === "/about"
                  ? "scale-x-100"
                  : "scale-x-0 group-hover:scale-x-100"
              }`}
            />
          </Link>
        </div>

        <Link
          to="/"
          className="hidden md:flex flex-col items-center justify-center group shrink-0"
        >
          <m.div
            className="flex flex-col items-center"
            whileHover="hover"
            initial="rest"
            animate="rest"
          >
            <m.img
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

            <m.div
              animate={{
                opacity: scrolled ? 0 : 1,
                height: scrolled ? 0 : "auto",
                marginTop: scrolled ? 0 : 4,
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden text-2xl tracking-widest font-extralight text-base-content transition-colors duration-300 group-hover:text-primary will-change-[opacity,height,margin-top]"
            >
              Justin Ramas
            </m.div>
          </m.div>
        </Link>

        <div className="hidden md:flex flex-1 justify-end gap-6 items-center text-base-content">
          {socialLinks.map(({ Icon, url }, i) => (
            <a
              key={i}
              href={url}
              target={url.startsWith("http") ? "_blank" : undefined}
              rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
              className="hover:text-primary transition hover:scale-110"
            >
              <Icon size={24} />
            </a>
          ))}

          <div className="w-px h-6 bg-base-300 mx-2"></div>

          <m.button
            aria-label="Toggle Dark Mode"
            onClick={handleToggle}
            whileTap={{ scale: 0.8, rotate: 15 }}
            className="hover:text-primary transition transform-gpu will-change-transform"
          >
            {theme === "light" ? <Moon size={24} /> : <Sun size={24} />}
          </m.button>
        </div>

        <div className="flex md:hidden items-center justify-between w-full">
          <Link
            to="/"
            className="flex items-center gap-3 text-base-content group"
          >
            <m.img
              src={theme === "light" ? logoDark : logoLight}
              alt="Logo"
              className="w-10 h-10 transform-gpu will-change-transform"
              whileTap={{ scale: 0.9, rotate: -5 }}
            />
            <div className="text-lg tracking-widest font-extralight group-hover:text-primary transition-colors">
              Justin Ramas
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <m.button
              aria-label="Toggle Dark Mode"
              onClick={handleToggle}
              whileTap={{ scale: 0.8 }}
              className="text-base-content hover:text-primary transition transform-gpu will-change-transform"
            >
              {theme === "light" ? <Moon size={26} /> : <Sun size={26} />}
            </m.button>

            <button
              aria-label="Open Navigation Menu"
              onClick={() => setOpen(true)}
              className="text-base-content hover:text-primary transition"
            >
              <Menu size={30} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <m.div
              className="fixed inset-0 bg-black/40 md:hidden backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <m.div
              className="fixed top-0 right-0 h-full w-72 bg-base-100/95 backdrop-blur-lg shadow-2xl md:hidden transform-gpu will-change-transform"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
            >
              <div className="flex justify-end p-7">
                <button onClick={() => setOpen(false)}>
                  <X
                    size={40}
                    className="text-base-content hover:text-primary transition"
                  />
                </button>
              </div>

              <div className="flex flex-col items-center gap-8 text-2xl text-base-content border-l border-b border-base-300 rounded-bl-2xl pt-10 pb-10 bg-base-200/50 backdrop-blur-sm">
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
                    location.pathname === "/about"
                      ? "text-primary"
                      : "text-base-content hover:text-primary"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  About
                </Link>
                <div className="flex gap-8 text-base-content">
                  {socialLinks.map(({ Icon, url }, i) => (
                    <a
                      key={i}
                      href={url}
                      target={url.startsWith("http") ? "_blank" : undefined}
                      rel={
                        url.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="hover:text-primary transition"
                    >
                      <Icon size={28} />
                    </a>
                  ))}
                </div>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
