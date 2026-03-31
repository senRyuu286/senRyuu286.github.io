import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const roles = [
  "BSIT Student",            
  "Frontend Developer",      
  "Building Web Apps",    
  "UI/UX Enthusiast",        
  "Aspiring Software Engineer",
  "Tech Explorer",             
];

export default function HeroTyping() {
  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % roles.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mb-4">
      <span
        aria-hidden="true"
        className="invisible text-lg md:text-xl font-light tracking-wide"
      >
        Aspiring Software Engineer
      </span>

      <h2 className="absolute inset-0 flex items-center justify-center text-lg md:text-xl max-w-3xl font-light text-base-content tracking-wide">
        <AnimatePresence mode="wait">
          <motion.span
            key={roles[index]}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
            transition={{ duration: 0.4 }}
            className="transform-gpu will-change-transform inline-block"
          >
            {roles[index]}
          </motion.span>
        </AnimatePresence>
      </h2>
    </div>
  );
}
