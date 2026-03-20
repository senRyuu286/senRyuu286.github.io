import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { margin: "-120px", once: true });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  return (
    <section ref={ref} className="relative pt-8 pb-12 px-6 bg-base-200 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <h2 className={`text-4xl font-semibold mb-6 text-primary ${isVisible ? "fade-in-up" : "opacity-0 translate-y-6"}`}>
          Skills & Technologies
        </h2>

        <p className={`max-w-xl text-base-content/70 mb-8 ${isVisible ? "fade-in-up delay-75" : "opacity-0 translate-y-4"}`}>
          Technologies I use while learning and building projects.
        </p>

        <div className="flex flex-wrap gap-4">
          {tech.map((name, idx) => (
            <div
              key={name}
              className={`badge badge-lg badge-outline px-5 py-4 text-base cursor-default transform-gpu will-change-transform hover:shadow-md ${
                isVisible ? `fade-in-up delay-${idx * 35}` : "opacity-0"
              }`}
              style={{ animationDelay: isVisible ? `${idx * 0.05 + 0.18}s` : "0s" }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
