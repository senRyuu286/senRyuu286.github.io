import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import {
  type ISourceOptions,
  MoveDirection,
  OutMode,
} from "@tsparticles/engine";
import TypingAnimation from "../features/TypingAnimation";

const scrollToSection = (
  e: React.MouseEvent<HTMLAnchorElement>,
  targetId: string,
) => {
  e.preventDefault();
  const target = document.querySelector(targetId);

  if (target) {
    const navbarOffset = 72;
    const elementPosition = target.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({
      top: elementPosition - navbarOffset,
      behavior: "smooth",
    });
  }
};

export default function HeroPage() {
  const [initDone, setInitDone] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInitDone(true));
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      interactivity: {
        events: { onHover: { enable: true, mode: "repulse" } },
        modes: { repulse: { distance: 120, duration: 0.6 } },
      },
      particles: {
        number: { value: 50, density: { enable: true } },
        color: {
          value: ["#ff3cac", "#ff7eb9", "#6a0dad", "#3f51b5"],
        },
        shape: { type: "circle" },
        opacity: { value: 0.7 },
        size: { value: { min: 2, max: 4 } },
        links: {
          enable: true,
          distance: 140,
          color: "#9c27b0",
          opacity: 0.3,
          width: 1,
        },
        move: {
          enable: true,
          speed: 1.2,
          direction: MoveDirection.none,
          random: true,
          straight: false,
          outModes: { default: OutMode.out },
        },
      },
      detectRetina: true,
      pauseOnBlur: true,
      pauseOnOutsideViewport: true,
    }),
    [],
  );

  return (
    <section
      id="top"
      className="relative w-full h-screen overflow-hidden bg-base-100"
    >
      {initDone && (
        <Particles
          id="tsparticles"
          options={options}
          className="absolute inset-0 z-0"
        />
      )}

      <div className="absolute inset-0 bg-linear-to-b from-base-100/20 via-base-200/40 to-base-300/60 z-10 pointer-events-none"></div>

      <div className="relative z-20 flex flex-col items-center justify-center text-center w-full h-full px-6 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center">
          <TypingAnimation />

          <h1 className="text-2xl md:text-4xl font-bold mb-4 text-base-content">
            Justin Ramas
          </h1>

          <p className="text-lg md:text-xl max-w-3xl font-light text-base-content/80">
            An aspiring IT professional passionate about creating innovative and
            practical technology solutions. I value research, data, and
            real-world constraints to guide my work. I stay updated with the
            latest tools, trends, and best practices in the IT field to
            continuously improve my skills and projects.
          </p>

          <a
            href=""
            onClick={(e) => scrollToSection(e, "#works")}
            className="btn btn-primary rounded-full px-8 mt-6 hover:scale-105 transition-transform"
          >
            See My Works
          </a>
        </div>
      </div>
    </section>
  );
}
