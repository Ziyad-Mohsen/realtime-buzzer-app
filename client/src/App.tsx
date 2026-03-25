import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import RoomHost from "./pages/RoomHost";
import RoomPlayer from "./pages/RoomPlayer";
import "./index.css";
import { useEffect } from "react";
import UserContextProvider from "./contexts/UserContext";
import { socket } from "./socket";
import { Toaster } from "react-hot-toast";

function App() {
  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <BrowserRouter>
      <UserContextProvider>
        <div
          className="container"
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          <Toaster />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/host/:roomCode" element={<RoomHost />} />
            <Route path="/play/:roomCode" element={<RoomPlayer />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </UserContextProvider>
    </BrowserRouter>
  );
}

function NotFound() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/");
  }, [navigate]);
  return null;
}

export default App;
