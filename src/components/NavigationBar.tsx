import { Mail, Linkedin, Github, Facebook, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "/logo.svg";

export default function NavigationBar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const section = document.querySelector("#works");

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive("works");
        } else {
          setActive("");
        }
      },
      { threshold: 0.6 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const worksStyle = `hover:text-primary transition font-medium ${
    active === "works" ? "text-primary" : ""
  }`;

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-neutral/30 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-6">
        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 text-2xl text-base-300">
          <a href="#works" className={worksStyle}>
            Works
          </a>

          <Link
            to="/about"
            className="hover:text-primary transition font-medium"
          >
            About
          </Link>
        </div>

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 md:flex-col md:gap-0 text-left md:text-center"
        >
          <img src={logo} alt="Logo" className="w-10 h-10 md:w-12 md:h-12" />

          <div className="text-lg md:text-2xl tracking-widest font-extralight text-base-300">
            Justin Ramas
          </div>
        </Link>

        {/* Desktop Icons */}
        <div className="hidden md:flex gap-6 items-center text-base-300">
          <a href="#" className="hover:text-primary transition">
            <Mail size={24} />
          </a>
          <a href="#" className="hover:text-primary transition">
            <Linkedin size={24} />
          </a>
          <a href="#" className="hover:text-primary transition">
            <Github size={24} />
          </a>
          <a href="#" className="hover:text-primary transition">
            <Facebook size={24} />
          </a>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden text-base-300"
          onClick={() => setOpen(true)}
        >
          <Menu size={30} />
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              className="fixed top-0 right-0 h-full w-72 
              bg-neutral/90 backdrop-blur-lg
              shadow-2xl md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
            >
              <div className="flex justify-end p-5">
                <button onClick={() => setOpen(false)}>
                  <X size={30} className="text-base-300" />
                </button>
              </div>

              <div
                className="flex flex-col items-center gap-8 
                text-2xl text-base-300 border-l border-b 
                border-base-300/20 shadow-2xl rounded-bl-2xl pt-10 pb-10"
              >
                <a
                  href="#works"
                  className={worksStyle}
                  onClick={() => setOpen(false)}
                >
                  Works
                </a>

                <Link
                  to="/about"
                  className="hover:text-primary transition"
                  onClick={() => setOpen(false)}
                >
                  About
                </Link>

                {/* Divider */}
                {/* <div className="divider w-1/6"></div> */}

                {/* Social Icons */}
                <div className="flex gap-8 text-base-300">
                  <a
                    href="#"
                    className="hover:text-primary transition"
                    onClick={() => setOpen(false)}
                  >
                    <Mail size={28} />
                  </a>

                  <a
                    href="#"
                    className="hover:text-primary transition"
                    onClick={() => setOpen(false)}
                  >
                    <Linkedin size={28} />
                  </a>

                  <a
                    href="#"
                    className="hover:text-primary transition"
                    onClick={() => setOpen(false)}
                  >
                    <Github size={28} />
                  </a>

                  <a
                    href="#"
                    className="hover:text-primary transition"
                    onClick={() => setOpen(false)}
                  >
                    <Facebook size={28} />
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
