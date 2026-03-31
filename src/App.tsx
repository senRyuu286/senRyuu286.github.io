import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import Home from "./pages/Home";
import About from "./pages/About";
import ScrollToTop from "./features/ScrollToTop";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <LazyMotion features={domAnimation}>
      <BrowserRouter basename="/">
        <ScrollToTop />
        <AnimatedRoutes />
      </BrowserRouter>
    </LazyMotion>
  );
}

export default App;
