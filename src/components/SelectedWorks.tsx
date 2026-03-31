import {
  m,
  useScroll,
  useTransform,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { useRef } from "react";
import { ExternalLink } from "lucide-react";
import stride from "../assets/desktop-mockup.webp";

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
      <m.div
        className="max-w-6xl mx-auto"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 },
          },
        }}
      >
        <m.h2
          variants={fadeUp}
          className="text-3xl md:text-4xl font-semibold text-primary mb-12 transform-gpu will-change-transform"
        >
          Selected Works
        </m.h2>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          <m.div variants={fadeUp} className="space-y-6">
            <div>
              <h3 className="text-2xl font-semibold mb-1 text-base-content">
                Stride
              </h3>
              <p className="text-sm font-medium text-primary">
                Academic Task Manager
              </p>
            </div>

            <p className="text-base-content/70 leading-relaxed max-w-md">
              A local-first academic task management app built for students
              juggling multiple responsibilities at once. Stride brings
              everything into one place — from rapid thought capture to deadline
              tracking — with no account, no login, and no internet required.
            </p>

            <div className="pt-2 flex flex-col gap-3">
              <a
                href="https://github.com/senRyuu286/stride"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-semibold text-base-content hover:text-primary transition-colors group"
              >
                GitHub
                <span className="transform group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </a>

              <a
                href="https://senryuu286.github.io/stride/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-semibold text-base-content hover:text-primary transition-colors group"
              >
                Try Stride
                <ExternalLink
                  size={15}
                  className="transform group-hover:translate-x-1 transition-transform"
                />
              </a>
            </div>
          </m.div>

          <m.div
            variants={fadeUp}
            style={{ y: parallaxY }}
            className="relative transform-gpu will-change-transform group"
          >
            <div className="relative w-full h-auto">
              <div className="w-full aspect-video rounded-2xl bg-base-300 flex items-center justify-center overflow-hidden transform transition-transform duration-700 group-hover:scale-105">
                <img
                  src={stride}
                  alt="Stride preview"
                  className="w-full h-full object-cover object-top"
                  decoding="async"
                />
              </div>
            </div>

            <div className="absolute -z-10 inset-0 blur-3xl opacity-30 bg-primary/20 rounded-full" />
          </m.div>
        </div>
      </m.div>
    </section>
  );
}
