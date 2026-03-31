import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Mail, Linkedin, Github } from "lucide-react";

export default function Footer() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const topVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const middleVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const bottomVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <footer className="bg-base-200 px-6 py-20 overflow-hidden">
      <motion.div
        className="max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div variants={topVariants} className="mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-primary">
            Let’s build something meaningful.
          </h2>
          <p className="text-base-content/60 max-w-md">
            I’m currently learning and exploring opportunities. Feel free to
            reach out for collaborations or projects.
          </p>
        </motion.div>

        <div className="h-px bg-base-300/50 mb-8" />

        <motion.div
          variants={middleVariants}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-3 text-base-content/70">
            <Mail size={18} />
            <a
              href="mailto:justinramas12@outlook.com"
              className="hover:text-primary transition-colors"
            >
              justinramas12@outlook.com
            </a>
          </div>

          <div className="flex items-center gap-5 text-base-content/60 md:ml-auto">
            <a
              href="https://www.linkedin.com/in/justin-ramas/"
              className="hover:text-primary transition-all duration-300 hover:-translate-y-1"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="https://github.com/senRyuu286"
              className="hover:text-primary transition-all duration-300 hover:-translate-y-1"
            >
              <Github size={20} />
            </a>
          </div>
        </motion.div>

        <motion.div
          variants={bottomVariants}
          className="mt-12 flex flex-col items-center gap-4"
        >
          <button
            onClick={() => {
              document
                .querySelector("#top")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-sm text-base-content/60 hover:text-primary transition-colors group"
          >
            Back to top
            <span className="inline-block transform group-hover:-translate-y-1 transition-transform ml-1">
              ↑
            </span>
          </button>

          <p className="text-sm text-base-content/40 text-center">
            © {new Date().getFullYear()} Justin Ramas. All rights reserved.
          </p>
        </motion.div>
      </motion.div>
    </footer>
  );
}
