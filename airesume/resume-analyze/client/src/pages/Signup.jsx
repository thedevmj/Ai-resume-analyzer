import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useSEO from "../hooks/useSEO";
import { API_URL } from "../config";

const inputClass =
  "w-full mb-4 px-4 py-3 rounded-xl bg-[#1e140f] border border-white/10 text-white placeholder-stone-500 outline-none focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 transition-all duration-300";

export default function Signup() {
  useSEO({
    title: "Sign Up",
    description: "Create a free account on AI Resume Analyzer to save your resume reports and track your progress.",
  });
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const signup = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);

      // Check if email is empty
      if (!email || email.trim() === "") {
        toast.error("Email is required");
        setLoading(false);
        return;
      }

      // Validate email format
      if (!validateEmail(email)) {
        toast.error("Please enter a valid email address");
        setLoading(false);
        return;
      }

      // Check if password is empty
      if (!password) {
        toast.error("Password is required");
        setLoading(false);
        return;
      }

      // Check password length
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters long");
        setLoading(false);
        return;
      }

      // Check password has a mix of letters and numbers
      if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        toast.error("Password must contain a mix of letters and numbers");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Account created successfully");
        setemail("");
        setpassword("");
        setTimeout(() => navigate("/Login"), 1500);
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Signup failed");
      }
      setLoading(false);
    } catch (err) {
      console.log("Error occurred in signup", err.message);
      toast.error("An error occurred during signup");
      setLoading(false);
    }
  };
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-[#1b120f] px-4 relative overflow-hidden">
        {/* DECORATIVE CRIMSON GLOW ORBS */}
        <div className="pointer-events-none absolute top-20 right-16 w-44 h-44 rounded-full bg-red-600/20 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute bottom-20 left-16 w-56 h-56 rounded-full bg-rose-600/20 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />

        <div
          className="p-10 rounded-2xl bg-[#241814]/90 border border-white/10 backdrop-blur-md w-full max-w-md animate-fade-up
              shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        >
          <h2 className="text-3xl font-bold text-amber-50 mb-2 text-center">
            Create Account
          </h2>
          <p className="text-stone-400 text-sm mb-6 text-center">
            Join and boost your resume today
          </p>

          <form onSubmit={signup}>
            {" "}
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              className={inputClass}
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              className={inputClass}
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-semibold
             bg-gradient-to-r from-red-600 to-rose-700
             shadow-[0_8px_30px_rgba(225,29,72,0.4)]
             hover:from-red-500 hover:to-rose-600
             hover:-translate-y-0.5
             transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing up...
                </span>
              ) : (
                "Sign up"
              )}
            </button>
          </form>
          <div className="flex justify-end mt-4">
            <button
              type="button"
              className="text-amber-200 text-right underline bg-transparent border-none p-0 cursor-pointer hover:text-amber-100 transition-colors"
              onClick={() => navigate("/Login")}
            >
              Already have an account? Go to Login
            </button>
          </div>
        </div>
      </div>
    </>
  );
}