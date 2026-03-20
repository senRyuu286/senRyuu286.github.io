import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import sample from "../assets/sample.svg";

export default function SelectedWorks() {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // subtle parallax for image ONLY
  const imageY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      id="works"
      ref={ref}
      className="relative bg-base-200 py-12 px-6 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-3xl md:text-4xl font-semibold text-primary mb-8"
        >
          Selected Works
        </motion.h2>

        {/* Project */}
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* LEFT: TEXT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-semibold mb-2">
                CPU Scheduling Simulator
              </h3>
              <p className="text-sm text-base-content/60">
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
                <p className="text-base-content/50">Role</p>
                <p className="font-medium">Simulation Programmer</p>
              </div>

              <div>
                <p className="text-base-content/50">Duration</p>
                <p className="font-medium">
                  July 14, 2025 — July 18, 2025
                </p>
              </div>

              <div>
                <p className="text-base-content/50">Links</p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 hover:text-primary transition"
                >
                  GitHub →
                </a>
              </div>

            </div>
          </motion.div>

          {/* RIGHT: IMAGE */}
          <motion.div
            style={{ y: imageY }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-xl bg-base-100/40 backdrop-blur-sm">
              <img
                src={sample}
                alt="CPU Scheduling Simulator"
                className="w-full h-auto object-cover"
              />
            </div>

            {/* subtle glow */}
            <div className="absolute -z-10 inset-0 blur-3xl opacity-20 bg-primary/20" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}