import { motion } from "framer-motion";

export default function WorkInProgress() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-xl w-full text-center"
      >
        {/* Animated Icon */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-6xl mb-6"
        >
          🚧
        </motion.div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-4">
          Portfolio in Progress
        </h1>

        {/* Subtitle */}
        <p className="text-gray-300 mb-8">
          I’m currently building something awesome.  
          Check back soon for projects, case studies, and experiments.
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden mb-6">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "20%" }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
          />
        </div>

        <p className="text-sm text-gray-400 mb-8">
          Progress: 20%
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <a
            href="https://github.com/senRyuu286"
            target="_blank"
            className="px-5 py-2 rounded-lg bg-white text-black font-medium hover:bg-gray-200 transition"
          >
            GitHub
          </a>
          <a
            href="mailto:hakdogdigidog.com"
            className="px-5 py-2 rounded-lg border border-white hover:bg-white hover:text-black transition"
          >
            Contact Me
          </a>
        </div>
      </motion.div>
    </div>
  );
}