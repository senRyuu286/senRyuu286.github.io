import { motion, type Variants } from "framer-motion";
import { GraduationCap, Code, Rocket } from "lucide-react";

const journeySteps = [
  {
    icon: Rocket,
    year: "2025 - Present",
    title: "Modern Frameworks & Mobile",
    subtitle: "Self-Taught & Academic Growth",
    description:
      "While diving into Angular and Flutter for my university coursework, I took the initiative to self-teach React and Tailwind CSS. I am currently exploring popular modern ecosystems to build fast, scalable web and mobile apps.",
    isPrimary: true,
  },
  {
    icon: Code,
    year: "2023 - 2025",
    title: "Core Programming & Web Basics",
    subtitle: "Building the Foundation",
    description:
      "Mastered Object-Oriented Programming (OOP), algorithms, and data structures using C and Java. During this time, I also built my first fully responsive websites from scratch using pure HTML, CSS, and vanilla JavaScript.",
    isPrimary: false,
  },
  {
    icon: GraduationCap,
    year: "2023",
    title: "Started BSIT Degree",
    subtitle: "The Beginning",
    description:
      "Began my academic journey in Information Technology, sparking my deep curiosity for software architecture, problem-solving, and the mechanics of how digital experiences are built.",
    isPrimary: false,
  },
];

const timelineVariant: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function ExperienceTimeline() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h3 className="text-4xl font-bold text-base-content tracking-tight">
          My Journey
        </h3>
        <p className="text-lg text-base-content/60 mt-2">
          Milestones, education, and how I got to where I am today.
        </p>
      </div>

      <motion.div
        variants={timelineVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
          {journeySteps.map((step, index) => (
            <li key={index}>
              {index !== 0 && (
                <hr className={step.isPrimary ? "bg-primary" : "bg-base-300"} />
              )}

              <div className="timeline-middle">
                <div
                  className={`p-2 rounded-full ${step.isPrimary ? "bg-primary/20 text-primary" : "bg-base-300 text-base-content/50"}`}
                >
                  <step.icon size={20} />
                </div>
              </div>

              <div
                className={`mb-10 ${index % 2 === 0 ? "timeline-start md:text-end" : "timeline-end"}`}
              >
                <time className="font-mono italic text-base-content/60 text-sm">
                  {step.year}
                </time>
                <div className="text-xl font-black text-base-content mt-1">
                  {step.title}
                </div>
                <div
                  className={`font-medium mb-3 ${step.isPrimary ? "text-primary" : "text-base-content/70"}`}
                >
                  {step.subtitle}
                </div>
                <p className="text-base-content/80 text-sm md:text-base leading-relaxed">
                  {step.description}
                </p>
              </div>

              {index !== journeySteps.length - 1 && (
                <hr
                  className={
                    journeySteps[index + 1].isPrimary
                      ? "bg-primary"
                      : "bg-base-300"
                  }
                />
              )}
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
