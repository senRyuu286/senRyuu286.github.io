import { motion, useReducedMotion, type Variants } from "framer-motion";

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

// Let Framer Motion handle the timing automatically
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Quick, snappy pop-in for the badges
      delayChildren: 0.15,
    },
  },
};

const badgeVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function SkillsandTech() {
  const shouldReduceMotion = useReducedMotion();

  // Clean fallback variables for accessibility
  const activeContainer = shouldReduceMotion ? { hidden: { opacity: 1 }, show: { opacity: 1 } } : containerVariants;
  const activeBadge = shouldReduceMotion ? { hidden: { opacity: 1 }, show: { opacity: 1 } } : badgeVariants;

  return (
    // Removed ref and simplified
    <section className="relative pt-8 pb-12 px-6 bg-base-200 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        <motion.h2
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="text-4xl font-semibold mb-6 text-primary"
        >
          Skills & Technologies
        </motion.h2>

        <motion.p
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          // Slightly delayed to follow the heading naturally
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }} 
          className="max-w-xl text-base-content/70 mb-8"
        >
          Technologies I use while learning and building projects.
        </motion.p>

        <motion.div
          variants={activeContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="flex flex-wrap gap-4"
        >
          {tech.map((name) => (
            <motion.div
              key={name}
              variants={activeBadge}
              // 🔥 Performance & Styling Fix: Rely completely on Tailwind for the hover interactions
              className="badge badge-lg badge-outline px-5 py-4 text-base cursor-default transition-all duration-300 hover:bg-primary hover:text-primary-content hover:border-primary hover:shadow-md hover:-translate-y-1"
            >
              {name}
            </motion.div>
          ))}
        </motion.div>
        
      </div>
    </section>
  );
}