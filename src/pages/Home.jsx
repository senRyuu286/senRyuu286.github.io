import NavigationBar from "../components/NavigationBar";
import HeroPage from "../components/HeroPage";
import { motion } from "framer-motion";

function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <NavigationBar />
        <HeroPage />
      </div>
    </motion.div>
  );
}

export default Home;
