import { motion, useReducedMotion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.12,
    },
  },
};

const card: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.97,
  },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 16,
      mass: 0.55,
      delay: i * 0.08,
    },
  }),
};

const textReveal: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

export default function WhatIDo() {
  const shouldReduceMotion = useReducedMotion();

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
    <section id="about" className="relative w-full bg-base-200 pt-24 pb-8 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          whileInView={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className="text-4xl font-semibold mb-16 text-primary"
        >
          What I Do
        </motion.h2>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          className="grid md:grid-cols-3 gap-12"
        >
          {cards.map((item, index) => (
            <motion.div
              key={item.title}
              variants={shouldReduceMotion ? { hidden: { opacity: 1, y: 0, scale: 1 }, show: { opacity: 1, y: 0, scale: 1 } } : card}
              custom={index}
              whileHover={shouldReduceMotion ? undefined : { y: -5, scale: 1.01, transition: { type: "spring", stiffness: 240, damping: 20 } }}
              className="group border-l-2 border-base-300 hover:border-primary rounded-2xl p-10 bg-base-100/40 backdrop-blur-sm transition-colors duration-300 hover:shadow-xl transform-gpu will-change-transform"
            >
              <motion.div
                variants={shouldReduceMotion ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } } : textReveal}
                className="text-4xl text-base-content/40 mb-4 transition-all duration-200 group-hover:text-primary group-hover:-translate-y-1"
              >
                {String(index + 1).padStart(2, "0")}
              </motion.div>

              <motion.h3 variants={shouldReduceMotion ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } } : textReveal} className="text-xl font-semibold mb-3">
                {item.title}
              </motion.h3>

              <motion.p variants={shouldReduceMotion ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } } : textReveal} className="text-base-content/70">
                {item.text}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
