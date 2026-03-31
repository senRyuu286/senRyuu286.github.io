import NavigationBar from "../components/NavigationBar";
import HeroPage from "../components/HeroPage";
import WhatIDo from "../components/WhatIDo";
import SelectedWorks from "../components/SelectedWorks";
import Footer from "../components/Footer";
import { m } from "framer-motion";

function Home() {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="min-h-screen selection:bg-primary selection:text-primary-content">
        <NavigationBar />
        <HeroPage />
        <WhatIDo />
        <SelectedWorks />
        <Footer />
      </div>
    </m.div>
  );
}

export default Home;