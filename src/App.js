import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import InputsPage from "./InputsPage/InputsPage";
import SimulationPage from "./SimulationPage/SimulationPage";

const App = () => {
  return (
    <Router className="App">
      <Routes>
        <Route path="/" element={<InputsPage />} />
        <Route path="/simulate" element={<SimulationPage />} />
      </Routes>
    </Router>
  );
};
//test
export default App;
