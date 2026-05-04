import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Upload from "./pages/Upload";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { Toaster } from "react-hot-toast";
import IsLoggedin from "./security/IsLoggedin";

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
            boxShadow: "6px 6px 10px #d1d1d4, -6px -6px 10px #ffffff",
          },
        }}
      />
      <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
      
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Home />
            </>
          }
        ></Route>
        <Route
          path="/fileupload"
          element={
            <>
              <Upload />
            
            </>
          }
        ></Route>
        <Route path="/Login" element={<Login setLoggedIn={setLoggedIn} />}></Route>
        <Route path="/Signup" element={<Signup />}></Route>
      </Routes>
      
    </>
  );
}
