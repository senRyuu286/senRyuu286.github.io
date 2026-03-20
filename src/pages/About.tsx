import { motion } from "framer-motion";
import NavigationBar from "../components/NavigationBar";
import AboutHero from "../components/AboutHero";
import BentoStack from "../components/BentoStack";
import ExperienceTimeline from "../components/ExperienceTimeline";
import BeyondCode from "../components/BeyondCode";
import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="min-h-screen bg-base-200 selection:bg-primary selection:text-primary-content">
        <NavigationBar />
        <AboutHero />
        <BentoStack />
        <ExperienceTimeline />
        <BeyondCode />
        <Footer />
      </div>
    </motion.div>
  );
}
