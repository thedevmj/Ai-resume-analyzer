import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

export default function Navbar({ loggedIn, setLoggedIn }) {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  const handleLogout = () => {
    // Clear the auth cookie by calling logout endpoint
    fetch("http://localhost:5000/auth/logout", {
      method: "POST",
      credentials: "include",
    }).catch((err) => console.log("Logout error:", err));

    setLoggedIn(false);
    localStorage.removeItem("email");

    document.cookie =
      "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    navigate("/");
  };

  return (
    <div className="w-full h-16 bg-[#e0e5ec] flex items-center justify-between px-8 shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff]">
      <h1 className="text-gray-700 text-2xl font-bold">Resume Analyzer</h1>

      <div className="flex items-center gap-6">
        <button className="px-5 py-2 rounded-xl bg-[#e0e5ec] text-gray-700 font-semibold shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] active:shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_#ffffff] transition-all">
          About Us
        </button>

        {loggedIn || email ? (
          <>
            <button
              className="px-5 py-2 rounded-xl bg-[#e0e5ec] text-gray-700 font-semibold shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] active:shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_#ffffff] transition-all"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>
            <button
              className="px-5 py-2 rounded-xl bg-[#e0e5ec] text-gray-700 font-semibold shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] active:shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_#ffffff] transition-all"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            className="px-5 py-2 rounded-xl bg-[#e0e5ec] text-gray-700 font-semibold shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] active:shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_#ffffff] transition-all"
            onClick={() => navigate("/Login")}
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
}
