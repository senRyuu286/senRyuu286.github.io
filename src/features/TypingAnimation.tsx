import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const roles = [
  "IT Professional",
  "Software Developer",
  "Tech Enthusiast",
  "Student Developer",
];

export default function HeroTyping() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % roles.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mb-4">
      <span className="invisible text-lg md:text-xl font-light tracking-wide">
        Software Developer
      </span>

      <h2 className="absolute inset-0 flex items-center justify-center text-lg md:text-xl max-w-3xl font-light text-base-content tracking-wide will-change-transform">
        <AnimatePresence mode="wait">
          <motion.span
            key={roles[index]}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {roles[index]}
          </motion.span>
        </AnimatePresence>
      </h2>
    </div>
  );
}
