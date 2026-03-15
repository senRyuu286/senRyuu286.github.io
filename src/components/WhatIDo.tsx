import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.25,
    },
  },
};

const card = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const reveal = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function WhatIDo() {
  return (
    <section id="about" className="w-full bg-base-200 pt-24 pb-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Scroll Float Header */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-semibold mb-16 text-primary"
        >
          What I Do
        </motion.h2>

        {/* Animated Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-12"
        >
          {/* Card 1 */}
          <motion.div
            variants={card}
            whileHover={{
              y: -6,
              transition: { duration: 0.15 },
            }}
            className="group border-l-2 border-base-300 hover:border-primary rounded-2xl p-8 hover:bg-base-100 transition-all duration-150 hover:shadow-xl"
          >
            <motion.div
              variants={reveal}
              className="text-4xl text-base-content/40 mb-4 transition-all duration-150 group-hover:text-primary group-hover:scale-110"
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
            variants={card}
            whileHover={{
              y: -6,
              transition: { duration: 0.15 },
            }}
            className="group border-l-2 border-base-300 hover:border-primary rounded-2xl p-8 hover:bg-base-100 transition-all duration-150 hover:shadow-xl"
          >
            <motion.div
              variants={reveal}
              className="text-4xl text-base-content/40 mb-4 transition-all duration-150 group-hover:text-primary group-hover:scale-110"
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
            variants={card}
            whileHover={{
              y: -6,
              transition: { duration: 0.15 },
            }}
            className="group border-l-2 border-base-300 hover:border-primary rounded-2xl p-8 hover:bg-base-100 transition-all duration-150 hover:shadow-xl"
          >
            <motion.div
              variants={reveal}
              className="text-4xl text-base-content/40 mb-4
    transition-all duration-150
    group-hover:text-primary
    group-hover:scale-110"
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
