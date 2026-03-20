import { motion } from "framer-motion";
import { Mail, Linkedin, Github, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-base-200 px-6 py-20">
      <div className="max-w-6xl mx-auto">

        {/* Top Section */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-primary">
            Let’s build something meaningful.
          </h2>

          <p className="text-base-content/60 max-w-md">
            I’m currently learning and exploring opportunities. Feel free to
            reach out for collaborations or projects.
          </p>
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-base-300/50 mb-8" />

        {/* Middle Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >

          {/* Contact */}
          <div className="flex items-center gap-3 text-base-content/70">
            <Mail size={18} />
            <a
              href="mailto:youremail@email.com"
              className="hover:text-primary transition"
            >
              youremail@email.com
            </a>
          </div>

          {/* Socials (Right) */}
          <div className="flex items-center gap-5 text-base-content/60 md:ml-auto">
            <a href="#" className="hover:text-primary transition">
              <Linkedin size={20} />
            </a>
            <a href="#" className="hover:text-primary transition">
              <Github size={20} />
            </a>
            <a href="#" className="hover:text-primary transition">
              <Facebook size={20} />
            </a>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-12 flex flex-col items-center gap-4"
        >
          {/* Back to Top (Centered) */}
          <button
            onClick={() => {
              document
                .querySelector("#top")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-sm text-base-content/60 hover:text-primary transition"
          >
            Back to top ↑
          </button>

          {/* Copyright */}
          <p className="text-sm text-base-content/40 text-center">
            © {new Date().getFullYear()} Justin Ramas. All rights reserved.
          </p>
        </motion.div>

      </div>
    </footer>
  );
}

























