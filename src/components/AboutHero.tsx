import { m } from "framer-motion";
import { Github, Linkedin, Mail, MapPin, GraduationCap, Zap } from "lucide-react";

const quickFacts = [
  { icon: MapPin, text: "Based in Lapu-Lapu, PH" },
  { icon: GraduationCap, text: "BSIT Undergrad" },
  { icon: Zap, text: "Constant Learner" },
];

const socialLinks = [
  { icon: Github, href: "https://github.com/senRyuu286", label: "GitHub Profile" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/justin-ramas/", label: "LinkedIn Profile" },
  { icon: Mail, href: "mailto:justinramas12@outlook.com", label: "Email Contact" },
];

const fadeLeftVariant = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

const fadeRightVariant = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.2 } }
};

export default function AboutHero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-32 pb-20" id="top">
      <div className="flex flex-col md:flex-row gap-12 items-center">
        
        <m.div 
          initial="hidden"
          animate="visible"
          variants={fadeLeftVariant}
          className="w-full md:w-5/12 aspect-square rounded-box overflow-hidden shadow-2xl relative group transform-gpu will-change-transform"
        >
          <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition duration-500 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800" 
            alt="Justin Ramas - BSIT Student" 
            decoding="async"
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500"
          />
        </m.div>

        <m.div 
          initial="hidden"
          animate="visible"
          variants={fadeRightVariant}
          className="w-full md:w-7/12 flex flex-col justify-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-base-content mb-2 tracking-tight">
            ABOUT ME
          </h1>
          <h2 className="text-xl font-medium text-primary mb-8 uppercase tracking-widest">
            Justin Ramas - BSIT Student
          </h2>

          <p className="text-lg text-base-content/80 mb-8 leading-relaxed">
            I am an Information Technology undergrad deeply curious about how the web works behind the scenes. I spend my time turning coffee into code, constantly learning new frameworks, and building projects to bridge the gap between theory and real-world development.
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {quickFacts.map((fact, index) => (
              <li key={index} className="flex items-center gap-3 text-base-content/80">
                <fact.icon className="text-primary" size={20} />
                <span>{fact.text}</span>
              </li>
            ))}
          </ul>

          <div className="flex gap-6 text-base-content">
            {socialLinks.map((link, i) => (
              <a 
                key={i} 
                href={link.href} 
                aria-label={link.label}
                className="hover:text-primary transition hover:-translate-y-1 transform duration-200"
              >
                <link.icon size={24} />
              </a>
            ))}
          </div>
        </m.div>
      </div>
    </section>
  );
}