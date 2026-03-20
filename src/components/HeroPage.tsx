import vidbg from "../assets/heropage.mp4"
import TypingAnimation from "../features/TypingAnimation";

export default function HeroPage() {
  return (
    <section className="relative w-full h-screen overflow-hidden" id="top">
      {/* Background Video */}
      <video
        preload="metadata"
        poster="../assets/hero-poster.png"
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src={vidbg} type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      {/* <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/40 to-black/80"></div> */}
      <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/40 to-black/60"></div>
      {/* <div className="absolute inset-0"></div> */}

      {/* Centered Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full text-base-300 px-6">

        <TypingAnimation />

        <h1 className="text-2xl md:text-4xl font-bold mb-4 text-base-300">
          Justin Ramas
        </h1>

        <p className="text-lg md:text-1xl max-w-3xl font-light text-base-300">
          An aspiring IT professional passionate about creating innovative and
          practical technology solutions. I value research, data, and real-world
          constraints to guide my work. I stay updated with the latest tools,
          trends, and best practices in the IT field to continuously improve my
          skills and projects.
        </p>

        <a href="#works" className="btn btn-base-300 rounded-full px-8 mt-6 hover:btn-primary transition">
          See My Works
        </a>
      </div>
    </section>
  );
}
