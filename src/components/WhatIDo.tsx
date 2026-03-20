import { motion, useReducedMotion, type Variants } from "framer-motion";

// Simplified: We only need staggerChildren here. 
const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Let Framer handle the delay automatically
    },
  },
};

// Simplified: Removed the custom function and manual delays
const card: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 80, // Slightly softened spring for smoother rendering
      damping: 20,
    },
  },
};

export default function WhatIDo() {
  const shouldReduceMotion = useReducedMotion();

  // Clean fallback variables so we don't clutter the JSX with ternaries
  const activeContainer = shouldReduceMotion ? {} : container;
  const activeCard = shouldReduceMotion ? { hidden: { opacity: 1 }, show: { opacity: 1 } } : card;

  const cards = [
    {
      title: "Learning & Design",
      text: "As a student exploring web design, I focus on creating clean and engaging interfaces while continuously improving my understanding of user experience and visual design.",
    },
    {
      title: "Development Practice",
      text: "I build web projects using modern technologies to strengthen my development skills, turning ideas into functional applications while expanding my technical knowledge.",
    },
    {
      title: "Growth & Potential",
      text: "Each project in this portfolio represents my ongoing journey as a student developer, combining what I have learned with new concepts as I continue to grow in the field.",
    },
  ];

  return (
    <section id="about" className="relative w-full bg-base-200 pt-24 pb-16 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          // Changed to amount: 0.2 so it triggers when 20% of the element is visible
          viewport={{ once: true, amount: 0.2 }} 
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="text-4xl font-semibold mb-16 text-primary"
        >
          What I Do
        </motion.h2>

        <motion.div
          variants={activeContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid md:grid-cols-3 gap-12"
        >
          {cards.map((item, index) => (
            <motion.div
              key={item.title}
              variants={activeCard}
              // 🔥 Performance Fix: Moved hover animations entirely to Tailwind CSS
              className="group border-l-2 border-base-300 hover:border-primary rounded-2xl p-10 bg-base-100/40 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* 🔥 Performance Fix: Removed nested Framer Motion text variants */}
              <div className="text-4xl text-base-content/40 mb-4 transition-colors duration-300 group-hover:text-primary">
                {String(index + 1).padStart(2, "0")}
              </div>

              <h3 className="text-xl font-semibold mb-3 text-base-content">
                {item.title}
              </h3>

              <p className="text-base-content/70 leading-relaxed">
                {item.text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}