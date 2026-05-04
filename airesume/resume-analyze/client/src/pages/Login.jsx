import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Login({ setLoggedIn }) {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const login = async (e) => {
    e.preventDefault();

    // Check if email is empty
    if (!email || email.trim() === "") {
      toast.error("Email is required");
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Check if password is empty
    if (!password) {
      toast.error("Password is required");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        toast.error("Invalid credentials");
        setLoading(false);
        return;
      }

      toast.success("Login successful");
      setLoggedIn(true);
      localStorage.setItem("email", email);
      navigate("/fileupload");
      setemail("");
      setpassword("");
    } catch (err) {
      console.log("Error occurred in login", err.message);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f0f3]">
      <div className="p-10 rounded-2xl bg-[#f0f0f3]
        shadow-[10px_10px_20px_#d1d1d4,-10px_-10px_20px_#ffffff]">

        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
          Login
        </h2>

     
        <form onSubmit={login}>

          <input
            type="text"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setemail(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-xl bg-[#f0f0f3]
            shadow-[inset_6px_6px_10px_#d1d1d4,inset_-6px_-6px_10px_#ffffff]"
          />

          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setpassword(e.target.value)}
            className="w-full mb-6 px-4 py-3 rounded-xl bg-[#f0f0f3]
            shadow-[inset_6px_6px_10px_#d1d1d4,inset_-6px_-6px_10px_#ffffff]"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#f0f0f3]
            shadow-[6px_6px_10px_#d1d1d4,-6px_-6px_10px_#ffffff]">

            {loading ? "Logging in..." : "Login"}
          </button>
           
        </form>
        <div className="flex justify-end">
        <button  className="text-blue-500 text-right  underline bg-transparent border-none p-0 cursor-pointer" onClick={()=>navigate("/Signup")} >
        
      
        Signup
      </button>
      </div>
      </div>
    </div>
  );
}