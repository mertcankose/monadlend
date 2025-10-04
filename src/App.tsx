import "./App.css";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home.js";
import Dashboard from "./pages/Dashboard.js";
import { Toaster } from "react-hot-toast";

const MonadRoutes = () => {
  const location = useLocation();

  return (
    <Routes location={location}>
      <Route path="/">
        <Route index element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <>
      <BrowserRouter>
        <MonadRoutes />
      </BrowserRouter>

      <Toaster />
    </>
  );
};

export default App;
