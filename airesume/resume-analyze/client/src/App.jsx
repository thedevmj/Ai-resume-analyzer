import React, { Suspense, lazy, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import IsLoggedin from "./security/IsLoggedin";


const Upload = lazy(() => import("./pages/Upload"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Home = lazy(() => import("./components/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Admindash = lazy(() => import("./admin/Admindash"));

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <>
      
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#f0f0f3",
            color: "#555",
            borderRadius: "12px",
            boxShadow:
              "6px 6px 10px #d1d1d4, -6px -6px 10px #ffffff",
          },
        }}
      />

     
      <Navbar
        loggedIn={loggedIn}
        setLoggedIn={setLoggedIn}
      />

      
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#e0e5ec]">
            <div
              className="
                w-20 h-20 rounded-full
                border-4 border-gray-300
                border-t-gray-700
                animate-spin
                shadow-[6px_6px_12px_#a3b1c6,-6px_-6px_12px_#ffffff]
              "
            />
          </div>
        }
      >
        <Routes>
         
          <Route
            path="/"
            element={<Home />}
          />

          
          <Route
            path="/fileupload"
            element={<Upload />}
          />

          
          <Route
            path="/dashboard"
            element={
              <IsLoggedin>
                <Dashboard />
              </IsLoggedin>
            }
          />

          
          <Route
            path="/Login"
            element={
              <Login setLoggedIn={setLoggedIn} />
            }
          />

          
          <Route
            path="/Signup"
            element={<Signup />}
          />

          {/* ADMIN */}
          <Route
            path="/admindash"
            element={<Admindash />}
          />
        </Routes>
      </Suspense>

      {/* FOOTER */}
      <Footer />
    </>
  );
}