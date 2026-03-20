import { motion, useScroll, useTransform, useReducedMotion, type Variants } from "framer-motion";
import { useRef } from "react";
import sample from "../assets/sample.svg";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

export default function SelectedWorks() {
  const ref = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const parallaxY = shouldReduceMotion ? 0 : imageY;

  return (
    <section
      id="works"
      ref={ref}
      className="relative bg-base-200 py-16 px-6 overflow-hidden"
    >
      <motion.div 
        className="max-w-6xl mx-auto"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: { opacity: 0 },
          show: { 
            opacity: 1, // typo fix kept from last turn
            transition: { staggerChildren: 0.15 } 
          }
        }}
      >
        {/* Header */}
        <motion.h2
          variants={fadeUp}
          className="text-3xl md:text-4xl font-semibold text-primary mb-12"
        >
          Selected Works
        </motion.h2>

        {/* Project */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* LEFT: TEXT */}
          <motion.div variants={fadeUp} className="space-y-6">
            <div>
              <h3 className="text-2xl font-semibold mb-1 text-base-content">
                CPU Scheduling Simulator
              </h3>
              <p className="text-sm font-medium text-primary">
                Python Scheduling Simulator
              </p>
            </div>

            <p className="text-base-content/70 leading-relaxed max-w-md">
              A CPU Scheduling Simulator with an easy-to-use GUI that lets users
              test different scheduling algorithms and see results on a live
              Gantt chart. It helps visualize how CPU scheduling works in real
              time.
            </p>

            {/* Meta Info */}
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-base-content/50 uppercase tracking-wider text-xs font-semibold mb-1">Role</p>
                <p className="font-medium text-base-content">Simulation Programmer</p>
              </div>

              <div>
                <p className="text-base-content/50 uppercase tracking-wider text-xs font-semibold mb-1">Duration</p>
                <p className="font-medium text-base-content">
                  July 14, 2025 — July 18, 2025
                </p>
              </div>

              <div className="pt-2">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 font-semibold text-base-content hover:text-primary transition-colors group"
                >
                  GitHub 
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: IMAGE */}
          <motion.div
            variants={fadeUp}
            style={{ y: parallaxY }}
            // 🔥 Added 'group' here so hovering the image area triggers the scale animation below
            className="relative transform-gpu will-change-transform group"
          >
            {/* 🔥 Optimized Image Wrapper:
                Removed: shadow-xl, border, border-base-300, bg-base-100, group (moved to parent)
                Added: A direct wrapper without card styling
            */}
            <div className="relative w-full h-auto">
              <img
                src={sample}
                alt="CPU Scheduling Simulator"
                // 🔥 Added rounded corners directly to the img, kept the scale animation
                className="w-full h-auto object-cover rounded-2xl transform transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* subtle glow */}
            <div className="absolute -z-10 inset-0 blur-3xl opacity-30 bg-primary/20 rounded-full" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}