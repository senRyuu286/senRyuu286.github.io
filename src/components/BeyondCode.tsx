import { Camera, Gamepad2, BookOpen } from "lucide-react";
import { m, type Variants } from "framer-motion";

const hobbies = [
  {
    icon: Camera,
    title: "Photography",
    desc: "Exploring visual storytelling through a lens. This practice hones my eye for detail, balance, and composition—principles that directly translate to frontend design.",
  },
  {
    icon: Gamepad2,
    title: "Gamer",
    desc: "Engaging with strategic and story-driven games. Navigating these digital environments cultivates quick decision-making, adaptability, and complex problem-solving.",
  },
  {
    icon: BookOpen,
    title: "Literature",
    desc: "Immersing myself in compelling fiction and intricate narratives. It expands my perspective, fuels my creativity, and sharpens my analytical thinking offline.",
  },
];

const containerVariant: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

export default function BeyondCode() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-8 pb-12 border-t border-base-300/50 mt-10">
      <div className="text-center mb-16">
        <h3 className="text-4xl font-bold text-base-content tracking-tight">
          Beyond the Code
        </h3>
        <p className="text-lg text-base-content/60 mt-2">
          What I'm doing when I'm not staring at a screen.
        </p>
      </div>

      <m.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        variants={containerVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {hobbies.map((hobby, i) => (
          <m.div
            key={i}
            variants={cardVariant}
            whileHover={{ y: -8, scale: 1.02 }}
            className="flex flex-col items-center text-center p-8 rounded-3xl bg-base-200/50 hover:bg-base-200 border border-base-content/5 transition-all duration-300 shadow-sm hover:shadow-xl group transform-gpu will-change-transform"
          >
            <div className="bg-primary/10 text-primary p-5 rounded-2xl mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
              <hobby.icon size={36} strokeWidth={1.5} />
            </div>
            <h4 className="text-2xl font-bold text-base-content mb-3">
              {hobby.title}
            </h4>
            <p className="text-base-content/70 leading-relaxed">{hobby.desc}</p>
          </m.div>
        ))}
      </m.div>
    </section>
  );
}
