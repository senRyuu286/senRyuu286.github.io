import { motion, type Variants } from "framer-motion";
import { Monitor, Terminal, Smartphone } from "lucide-react";

const techCategories = {
  web: ["HTML5/CSS3", "Javascript", "Typescript", "React", "Angular", "Vite"],
  software: ["C", "Java", "Python", "PHP"],
  mobile: ["Flutter"],
};

const containerVariant: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
};

const badgeVariant: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

export default function BentoStack() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <div className="mb-12">
        <h3 className="text-4xl font-bold text-base-content tracking-tight">
          Tech Stack
        </h3>
        <p className="text-lg text-base-content/60 mt-2">
          Technologies and languages I'm actively building with.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]"
        variants={containerVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div
          variants={cardVariant}
          whileHover={{ y: -5 }}
          className="card bg-linear-to-br from-base-200 to-base-300 shadow-xl md:col-span-2 md:row-span-2 border border-base-content/5 overflow-hidden relative group"
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition duration-500" />

          <div className="card-body z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/20 text-primary rounded-xl">
                <Monitor size={24} />
              </div>
              <h4 className="card-title text-2xl text-base-content">
                Web Development
              </h4>
            </div>
            <p className="text-base-content/70 mb-6">
              Building responsive, interactive, and performant user interfaces.
            </p>

            <motion.div
              className="flex flex-wrap gap-3 mt-auto"
              variants={containerVariant}
            >
              {techCategories.web.map((tech) => (
                <motion.span
                  key={tech}
                  variants={badgeVariant}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-4 py-2 rounded-lg bg-base-100 border border-base-content/10 text-base-content/90 font-medium hover:border-primary hover:text-primary transition-colors cursor-default shadow-sm"
                >
                  {tech}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariant}
          whileHover={{ y: -5 }}
          className="card bg-base-200 shadow-xl border border-base-content/5 relative overflow-hidden group"
        >
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition duration-500" />

          <div className="card-body z-10">
            <div className="flex items-center gap-3 mb-4">
              <Terminal size={20} className="text-primary" />
              <h4 className="font-bold text-lg text-base-content">
                Software & Scripts
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {techCategories.software.map((tech) => (
                <span
                  key={tech}
                  className="badge badge-lg bg-base-100 border-none text-base-content/80 group-hover:text-base-content transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariant}
          whileHover={{ y: -5 }}
          className="card bg-base-200 shadow-xl border border-base-content/5 relative overflow-hidden group"
        >
          <div className="card-body z-10 justify-center items-center text-center">
            <div className="p-4 bg-base-100 rounded-full mb-2 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <Smartphone size={28} className="text-primary" />
            </div>
            <h4 className="font-bold text-lg text-base-content mb-1">
              Mobile Apps
            </h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {techCategories.mobile.map((tech) => (
                <span
                  key={tech}
                  className="text-primary font-bold tracking-wide"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
