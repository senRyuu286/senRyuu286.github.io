import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";

const tech = [
  { name: "C", x: -60, y: 20 },
  { name: "Java", x: 40, y: -20 },
  { name: "Javascript", x: -30, y: -20 },
  { name: "Typescript", x: 50, y: 10 },
  { name: "PHP", x: -40, y: 30 },
  { name: "Python", x: 20, y: -30 },
  { name: "Flutter", x: -50, y: 20 },
  { name: "HTML5/CSS3", x: 60, y: -10 },
  { name: "Angular", x: -20, y: -30 },
  { name: "React", x: 30, y: 20 },
  { name: "Vite", x: -20, y: 20 },
];

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.15,
      staggerChildren: 0.05,
    },
  },
};

export default function SkillsandTech() {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-120px", once: true });

  return (
    <section
      ref={ref}
      className="relative pt-8 pb-24 px-6 bg-base-200 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 18,
          }}
          className="text-4xl font-semibold mb-6 text-primary"
        >
          Skills & Technologies
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{
            delay: 0.1,
            type: "spring",
            stiffness: 120,
            damping: 18,
          }}
          className="max-w-xl text-base-content/70 mb-8"
        >
          Technologies I use while learning and building projects.
        </motion.p>

        {/* Pills */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="flex flex-wrap gap-4 transform-gpu"
        >
          {tech.map((item) => (
            <motion.div
              key={item.name}
              variants={{
                hidden: {
                  opacity: 0,
                  scale: 0.85,
                  x: item.x * 0.5,
                  y: item.y * 0.5,
                },
                show: {
                  opacity: 1,
                  scale: 1,
                  x: 0,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 120,
                    damping: 18,
                    mass: 0.6,
                  },
                },
              }}
              whileHover={{
                y: -4,
                scale: 1.05,
                transition: {
                  type: "spring",
                  stiffness: 260,
                  damping: 18,
                },
              }}
              className="
                badge
                badge-lg
                badge-outline
                px-5
                py-4
                text-base
                cursor-default
                transform-gpu
                will-change-transform
                hover:shadow-md
              "
            >
              {item.name}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
