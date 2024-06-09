import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { UserProvider } from "contexts/UserContext";
// import { MedicineProvider } from "contexts/MedicineContext";
import "bootstrap/dist/css/bootstrap.css";
import "assets/scss/paper-dashboard.scss?v=1.3.0";
import "assets/demo/demo.css";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import AdminLayout from "layouts/Admin.js";
import Login from "views/Login";
import { connectSocket } from "components/Socket/socket";
import PrivateRoute from "components/Route/PrivateRoute";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const serverUrl = `http://${BASE_URL}`;

const AppRoutes = () => {
  useEffect(() => {
    connectSocket(serverUrl);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Navigate to="/meorla/dashboard" replace />} />
      <Route path="/meorla/*" element={<PrivateRoute><AdminLayout /></PrivateRoute>} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
