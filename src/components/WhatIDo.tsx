import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useRef } from "react";

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.15,
      staggerChildren: 0.12,
    },
  },
};

const card: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.98,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 110,
      damping: 20,
      mass: 0.6,
    },
  },
};

const reveal: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 140,
      damping: 18,
    },
  },
};

export default function WhatIDo() {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // smoother parallax (reduced movement)
  const y1 = useTransform(scrollYProgress, [0, 1], [10, -10]);
  const y2 = useTransform(scrollYProgress, [0, 1], [14, -14]);
  const y3 = useTransform(scrollYProgress, [0, 1], [18, -18]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative w-full bg-base-200 pt-24 pb-8 px-6 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 18,
          }}
          className="text-4xl font-semibold mb-16 text-primary"
        >
          What I Do
        </motion.h2>

        {/* Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          className="grid md:grid-cols-3 gap-12"
        >
          {/* Card 1 */}
          <motion.div
            style={{ y: y1 }}
            variants={card}
            whileHover={{
              y: -6,
              scale: 1.02,
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 20,
              },
            }}
            className="group border-l-2 border-base-300 hover:border-primary rounded-2xl p-10 bg-base-100/40 backdrop-blur-sm transition-colors duration-300 hover:shadow-xl transform-gpu will-change-transform"
          >
            <motion.div
              variants={reveal}
              className="text-4xl text-base-content/40 mb-4 transition-all duration-200 group-hover:text-primary group-hover:-translate-y-1"
            >
              01
            </motion.div>

            <motion.h3 variants={reveal} className="text-xl font-semibold mb-3">
              Learning & Design
            </motion.h3>

            <motion.p variants={reveal} className="text-base-content/70">
              As a student exploring web design, I focus on creating clean and
              engaging interfaces while continuously improving my understanding
              of user experience and visual design.
            </motion.p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            style={{ y: y2 }}
            variants={card}
            whileHover={{
              y: -6,
              scale: 1.02,
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 20,
              },
            }}
            className="group border-l-2 border-base-300 hover:border-primary rounded-2xl p-10 bg-base-100/40 backdrop-blur-sm transition-colors duration-300 hover:shadow-xl transform-gpu will-change-transform"
          >
            <motion.div
              variants={reveal}
              className="text-4xl text-base-content/40 mb-4 transition-all duration-200 group-hover:text-primary group-hover:-translate-y-1"
            >
              02
            </motion.div>

            <motion.h3 variants={reveal} className="text-xl font-semibold mb-3">
              Development Practice
            </motion.h3>

            <motion.p variants={reveal} className="text-base-content/70">
              I build web projects using modern technologies to strengthen my
              development skills, turning ideas into functional applications
              while expanding my technical knowledge.
            </motion.p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            style={{ y: y3 }}
            variants={card}
            whileHover={{
              y: -6,
              scale: 1.02,
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 20,
              },
            }}
            className="group border-l-2 border-base-300 hover:border-primary rounded-2xl p-10 bg-base-100/40 backdrop-blur-sm transition-colors duration-300 hover:shadow-xl transform-gpu will-change-transform"
          >
            <motion.div
              variants={reveal}
              className="text-4xl text-base-content/40 mb-4 transition-all duration-200 group-hover:text-primary group-hover:-translate-y-1"
            >
              03
            </motion.div>

            <motion.h3 variants={reveal} className="text-xl font-semibold mb-3">
              Growth & Potential
            </motion.h3>

            <motion.p variants={reveal} className="text-base-content/70">
              Each project in this portfolio represents my ongoing journey as a
              student developer, combining what I have learned with new concepts
              as I continue to grow in the field.
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
