// @ts-ignore: allow importing JS module without a declaration file
// import WorkInProgress from "./pages/WorkInProgress";

// function App() {
//   return <WorkInProgress />;
// }

// export default App;

// import NavigationBar from "./components/NavigationBar";
// import HeroPage from "./components/HeroPage";

// function App() {
//   return (
//     <div>
//       <NavigationBar />
//       <HeroPage />
//     </div>
//   );
// }

// export default App;

// import { BrowserRouter, Routes, Route } from "react-router-dom";
// // @ts-ignore: allow importing JS module without a declaration file
// import Home from "./pages/Home";
// // @ts-ignore: allow importing JS module without a declaration file
// import About from "./pages/About";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/about" element={<About />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;


import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
// @ts-ignore: allow importing JS module without a declaration file
import Home from "./pages/Home";
// @ts-ignore: allow importing JS module without a declaration file
import About from "./pages/About";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;