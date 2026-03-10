import { motion } from "framer-motion";
import NavigationBar from "../components/NavigationBar";

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <NavigationBar /> 
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-4xl font-bold">About Me</h1>
      </div>
    </motion.div>
  );
}