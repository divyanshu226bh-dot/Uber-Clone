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
import ActiveRideProtectedWrapper from "./components/ActiveRideProtectedWrapper";
import UserRiding from "./pages/UserRiding";
import CaptainRiding from "./pages/CaptainRiding";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/register" element={<UserRegister />} />
      <Route
        path="/home"
        element={
          <UserProtectWrapper>
            <UserHome />
          </UserProtectWrapper>
        }
      />
      <Route
        path="/user-riding"
        element={
          <UserProtectWrapper>
            <ActiveRideProtectedWrapper role="rider">
              <UserRiding/>
            </ActiveRideProtectedWrapper>
          </UserProtectWrapper>
        }
      />
      <Route path="/captain-login" element={<CaptainLogin />} />
      <Route path="/captain-register" element={<CaptainRegister />} />
      <Route
        path="/captain-home"
        element={
          <CaptainProtectWrapper>
            {" "}
            <CaptainHome />{" "}
          </CaptainProtectWrapper>
        }
      />
      <Route
        path="/captain-riding"
        element={
          <CaptainProtectWrapper>
            <ActiveRideProtectedWrapper role="captain">
              <CaptainRiding />
            </ActiveRideProtectedWrapper>
          </CaptainProtectWrapper>
        }
      />
    </Routes>
  );
}

export default App;
