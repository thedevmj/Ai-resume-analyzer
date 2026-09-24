import { Suspense, lazy, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import IsLoggedin from "./security/IsLoggedin";
import IsAdmin from "./security/IsAdmin";


const Upload = lazy(() => import("./pages/Upload"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Home = lazy(() => import("./components/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Admindash = lazy(() => import("./admin/Admindash"));

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const location = useLocation();

  return (
    <>
      
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#241814",
            color: "#fdf6ec",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          },
          success: {
            iconTheme: { primary: "#16a34a", secondary: "#ffffff" },
          },
          error: {
            style: { borderColor: "rgba(239,68,68,0.4)" },
            iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
          },
        }}
      />

     
      <Navbar
        loggedIn={loggedIn}
        setLoggedIn={setLoggedIn}
      />

      
      <Suspense
        fallback={
          <Loader message="Loading..."/>
        }
      >
        <div
          key={location.pathname}
          className="animate-fade-up"
        >
          <Routes>
         
          <Route
            path="/"
            element={<Home />}
          />

          
          <Route
            path="/fileupload"
            element={
              <IsLoggedin>
                <Upload />
              </IsLoggedin>
            }
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
            element={
              <IsAdmin>
                <Admindash />
              </IsAdmin>
            }
          />
        </Routes>
        </div>
      </Suspense>

      
      <Footer />
    </>
  );
}