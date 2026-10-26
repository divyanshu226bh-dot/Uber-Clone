import React from "react";
import { Routes, Route } from "react-router-dom";
import Start from "./pages/Start";
import UserLogin from "./pages/UserLogin";
import UserHome from "./pages/UserHome";
import UserRegister from "./pages/UserRegister";
import CaptainLogin from "./pages/CaptainLogin";
import CaptainHome from "./pages/CaptainHome";
import CaptainRegister from "./pages/CaptainRegister";
import UserProtectWrapper from "./components/UserProtectedWrapper";
import CaptainProtectWrapper from "./components/CaptainProtectedWrapper";

// // Placeholder components for remaining pages
// const UserLogin = () => <div className="p-8 text-white bg-black min-h-screen">User Login Page</div>;
// const UserRegister = () => <div className="p-8 text-white bg-black min-h-screen">User Register Page</div>;
// const CaptainLogin = () => <div className="p-8 text-white bg-black min-h-screen">Captain Login Page</div>;
// const CaptainRegister = () => <div className="p-8 text-white bg-black min-h-screen">Captain Register Page</div>;
// const UserHome = () => <div className="p-8 text-white bg-black min-h-screen">Rider Home Dashboard</div>;
// const CaptainHome = () => <div className="p-8 text-white bg-black min-h-screen">Captain Home Dashboard</div>;

function App() {
  return (
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/register" element={<UserRegister />} />
      <Route path="/home" element={<UserProtectWrapper> <UserHome /> </UserProtectWrapper>} />
      <Route path="/captain-login" element={<CaptainLogin />} />
      <Route path="/captain-register" element={<CaptainRegister />} />
      <Route path="/captain-home" element={<CaptainProtectWrapper> <CaptainHome /> </CaptainProtectWrapper>} />
    </Routes>
  );
}

export default App;
