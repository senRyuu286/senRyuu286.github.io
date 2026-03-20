import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import {
  type Container,
  type ISourceOptions,
  MoveDirection,
  OutMode,
} from "@tsparticles/engine";
import TypingAnimation from "../features/TypingAnimation";

export default function HeroPage() {
  const [initDone, setInitDone] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInitDone(true));
  }, []);

  const particlesLoaded = async (container?: Container) => {
    console.log("Particles loaded", container);
  };

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      // Set to transparent so the DaisyUI bg-base-100 class handles the background color
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      interactivity: {
        events: { onHover: { enable: true, mode: "repulse" } },
        modes: { repulse: { distance: 120, duration: 0.6 } },
      },
      particles: {
        number: { value: 60, density: { enable: true } },
        color: {
          value: ["#ff3cac", "#ff7eb9", "#6a0dad", "#3f51b5"], // These will pop nicely on a light background
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
    }),
    [],
  );

  if (!initDone) return null;

  return (
    // Changed bg-[#0d0d0d] to bg-base-100 to utilize your DaisyUI theme background
    <section
      id="top"
      className="relative w-full h-screen overflow-hidden bg-base-100"
    >
      <Particles
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={options}
        className="absolute inset-0 z-0"
      />

      {/* Changed the black gradient to a subtle light gradient using your theme colors, 
          otherwise a black gradient on a white background looks like a dirty smudge */}
      <div className="absolute inset-0 bg-linear-to-b from-base-100/20 via-base-200/40 to-base-300/60 z-10 pointer-events-none"></div>

      <div className="relative z-20 flex flex-col items-center justify-center text-center w-full h-full px-6 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center">
          <TypingAnimation />

          {/* Changed text-base-300 to text-base-content (dark text) so it's readable on the light background */}
          <h1 className="text-2xl md:text-4xl font-bold mb-4 text-base-content">
            Justin Ramas
          </h1>

          {/* Changed text-base-300 to text-base-content */}
          <p className="text-lg md:text-xl max-w-3xl font-light text-base-content/80">
            An aspiring IT professional passionate about creating innovative and
            practical technology solutions. I value research, data, and
            real-world constraints to guide my work. I stay updated with the
            latest tools, trends, and best practices in the IT field to
            continuously improve my skills and projects.
          </p>

          <a
            href="#works"
            // Swapped to btn-primary to make the call-to-action pop with your theme's primary color
            className="btn btn-primary rounded-full px-8 mt-6 hover:scale-105 transition-transform"
          >
            See My Works
          </a>
        </div>
      </div>
    </section>
  );
}
