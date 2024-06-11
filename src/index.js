import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "contexts/UserContext";
import "bootstrap/dist/css/bootstrap.css";
import "assets/scss/paper-dashboard.scss?v=1.3.0";
import "assets/demo/demo.css";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import { Block } from 'notiflix/build/notiflix-block-aio';
import AdminLayout from "layouts/Admin.js";
import Login from "views/Login";
import { connectSocket } from "components/Socket/socket";
import PrivateRoute from "components/Route/PrivateRoute";
import ExternalView from "views/Request";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const serverUrl = `${BASE_URL}`;

const AppRoutes = () => {
  const { user, getUser, loading } = useUser();

  useEffect(() => {
    connectSocket(serverUrl);
    getUser();
  }, [getUser]);

  useEffect(() => {
    if (loading) Block.dots('.wrapper');
    else Block.remove('.wrapper');
  }, [loading]);

  if(loading) return null;  // 로딩 중일 때는 아무 것도 렌더링하지 않음 (Notiflix가 처리함)

  return (
    <Routes>
      <Route path="/" element={<Login/>} />
      <Route path="/dashboard" element={<Navigate to="/meorla/dashboard" replace />} />
      <Route path="/meorla/request/*" element={<ExternalView />} />
      <Route path="/meorla/*" element={<PrivateRoute><AdminLayout /></PrivateRoute>} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  </BrowserRouter>
)
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);