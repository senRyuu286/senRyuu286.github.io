import { motion } from "framer-motion";

const tech = [
  "C",
  "Java",
  "Javascript",
  "Typescript",
  "PHP",
  "Python",
  "Flutter",
  "HTML5/CSS3",
  "Angular",
  "React",
  "Vite",
];

export default function SkillsandTech() {
  return (
    <section className="pt-8 pb-24 px-6 bg-base-200 overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Header (same animation as WhatIDo) */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-semibold mb-6 text-primary"
        >
          Skills & Technologies
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          viewport={{ once: true }}
          className="max-w-xl text-base-content/70 mb-16"
        >
          Technologies I use while learning and building projects.
        </motion.p>

        {/* Pills Container */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            show: {
              transition: {
                staggerChildren: 0.07,
              },
            },
          }}
          className="flex flex-wrap gap-4"
        >
          {tech.map((item) => (
            <motion.div
              key={item}
              variants={{
                hidden: {
                  opacity: 0,
                  scale: 0.6,
                  x: Math.random() * 200 - 100,
                  y: Math.random() * 120 - 60,
                },
                show: {
                  opacity: 1,
                  scale: 1,
                  x: 0,
                  y: 0,
                  transition: {
                    duration: 0.6,
                    ease: "easeOut",
                  },
                },
              }}
              whileHover={{
                y: -4,
                scale: 1.05,
              }}
              className="badge badge-lg badge-outline px-5 py-4 text-base transition-all hover:shadow-md cursor-default"
            >
              {item}
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}