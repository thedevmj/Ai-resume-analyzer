import React from "react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Signup() {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signup = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);

      if (!email || !password) {
        toast.error("Please fill in all fields");
      } else if (email === "" || password.length < 6) {
        toast.error("Password must be at least 6 characters long");
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
      }
      setLoading(false);
    } catch (err) {
      console.log("Error ocuured in signup", err.message);
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
              type="text"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              className="w-full mb-4 px-4 py-3 rounded-xl bg-[#f0f0f3]
             shadow-[inset_6px_6px_10px_#d1d1d4,inset_-6px_-6px_10px_#ffffff]
             outline-none text-gray-700 placeholder-gray-400"
            />
            <input
            required             type="password"
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
        </div>
      </div>
    </>
  );
}
