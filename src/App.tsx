// @ts-ignore: allow importing JS module without a declaration file
// import WorkInProgress from "./pages/WorkInProgress";

// function App() {
//   return <WorkInProgress />;
// }

// export default App;

import NavigationBar from "./components/NavigationBar";
import HeroPage from "./components/HeroPage";

function App() {
  return (
    <div>
      <NavigationBar />
      <HeroPage />
    </div>
  );
}

export default App;