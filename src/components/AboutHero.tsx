import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Facebook, MapPin, GraduationCap, Zap } from "lucide-react";

// 🚀 OPTIMIZATION 1: Extract static data outside the component to prevent memory recreation on re-renders
const quickFacts = [
  { icon: MapPin, text: "Based in Lapu-Lapu, PH" },
  { icon: GraduationCap, text: "BSIT Undergrad" },
  { icon: Zap, text: "Constant Learner" },
];

const socialLinks = [
  { icon: Github, href: "#", label: "GitHub Profile" },
  { icon: Linkedin, href: "#", label: "LinkedIn Profile" },
  { icon: Facebook, href: "#", label: "Facebook Profile" },
  { icon: Mail, href: "#", label: "Email Contact" },
];

// 🚀 OPTIMIZATION 2: Extract animation variants to keep JSX clean and performant
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
        
        {/* Left Side: Image */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeLeftVariant}
          className="w-full md:w-5/12 aspect-square rounded-box overflow-hidden shadow-2xl relative group"
        >
          {/* Neon hover overlay */}
          <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition duration-500 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800" 
            alt="Justin Ramas - BSIT Student" 
            decoding="async" // 🚀 OPTIMIZATION 3: Prevents main-thread blocking while the image loads
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500"
          />
        </motion.div>

        {/* Right Side: Content */}
        <motion.div 
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

          {/* 🚀 OPTIMIZATION 4: Using semantic HTML (ul/li) and mapping through our static array */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {quickFacts.map((fact, index) => (
              <li key={index} className="flex items-center gap-3 text-base-content/80">
                <fact.icon className="text-primary" size={20} />
                <span>{fact.text}</span>
              </li>
            ))}
          </ul>

          <div className="flex gap-6 text-base-content">
            {/* 🚀 OPTIMIZATION 5: Added aria-labels for accessibility (SEO/Screen readers) */}
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
        </motion.div>
      </div>
    </section>
  );
}