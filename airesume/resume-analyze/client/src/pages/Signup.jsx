import React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Signup() {
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
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
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
      <div className="min-h-screen flex items-center justify-center bg-[#f0f0f3]">
        <div
          className="p-10 rounded-2xl bg-[#f0f0f3]
              shadow-[10px_10px_20px_#d1d1d4,-10px_-10px_20px_#ffffff]"
        >
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
            SignUp
          </h2>

          <form>
            {" "}
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              className="w-full mb-4 px-4 py-3 rounded-xl bg-[#f0f0f3]
             shadow-[inset_6px_6px_10px_#d1d1d4,inset_-6px_-6px_10px_#ffffff]
             outline-none text-gray-700 placeholder-gray-400"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              className="w-full mb-6 px-4 py-3 rounded-xl bg-[#f0f0f3]
             shadow-[inset_6px_6px_10px_#d1d1d4,inset_-6px_-6px_10px_#ffffff]
             outline-none text-gray-700 placeholder-gray-400"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#f0f0f3] text-gray-700 font-medium
             shadow-[6px_6px_10px_#d1d1d4,-6px_-6px_10px_#ffffff]
             active:shadow-[inset_6px_6px_10px_#d1d1d4,inset_-6px_-6px_10px_#ffffff]
             transition"
              onClick={signup}
            >
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </form>
          <div className="flex justify-end mt-4">
            <button
              type="button"
              className="text-blue-500 text-right underline bg-transparent border-none p-0 cursor-pointer"
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
