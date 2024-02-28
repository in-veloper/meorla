import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { UserProvider } from "contexts/UserContext";
import "bootstrap/dist/css/bootstrap.css";
import "assets/scss/paper-dashboard.scss?v=1.3.0";
import "assets/demo/demo.css";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import AdminLayout from "layouts/Admin.js";
import Login from "views/Login";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <UserProvider>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/meorla/*" element={<AdminLayout />} />
        <Route path="/dashboard" element={<Navigate to="/meorla/dashboard" replace />} />
      </Routes>
    </UserProvider>
  </BrowserRouter>
);
