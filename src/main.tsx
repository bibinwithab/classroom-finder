import ReactDOM from "react-dom/client";
import Dashboard from "./Dashboard.tsx";
import RoomPage from "./RoomPage.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
    </BrowserRouter>
  );
}
