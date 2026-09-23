import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { API_URL } from "../config";

const ghostBtn =
  "px-4 py-2 rounded-lg text-stone-300 font-medium border border-transparent hover:text-white hover:bg-white/10 hover:border-white/10 transition-all duration-300";

export default function Navbar({ loggedIn, setLoggedIn }) {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role") || sessionStorage.getItem("role");

  useEffect(() => {
    gsap.fromTo(
      "[data-nav]",
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.08 },
    );
  }, []);

  const handleLogout = () => {
    // Clear the auth cookie by calling logout endpoint
    fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch((err) => console.log("Logout error:", err));

    setLoggedIn(false);
    localStorage.removeItem("email");
    sessionStorage.removeItem("email");
    localStorage.removeItem("role");
    sessionStorage.removeItem("role");

    document.cookie =
      "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/auth;";

    navigate("/");
  };

  const goHome = () => navigate("/");

  return (
    <div className="w-full h-16 bg-[#1b120f]/90 backdrop-blur-md flex items-center justify-between px-8 border-b border-white/10 sticky top-0 z-50">
      <div data-nav>
        <h1
          onClick={goHome}
          className="text-amber-50 text-2xl font-bold cursor-pointer transition-colors duration-300 hover:text-amber-200"
        >
          Resume<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-rose-400">Analyzer</span>
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button data-nav className={ghostBtn} onClick={goHome}>
          Home
        </button>

        {loggedIn || email ? (
          <>
            <button data-nav className={ghostBtn} onClick={() => navigate("/fileupload")}>
              Analyze
            </button>
            <button
              data-nav
              className={ghostBtn}
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>
            {role === "admin" && (
              <button
                data-nav
                className={ghostBtn}
                onClick={() => navigate("/admindash")}
              >
                Admin
              </button>
            )}
            <button
              data-nav
              className={ghostBtn}
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            data-nav
            onClick={() => navigate("/Login")}
            className="px-5 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-red-600 to-rose-700 shadow-[0_6px_25px_rgba(225,29,72,0.4)] hover:from-red-500 hover:to-rose-600 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
}