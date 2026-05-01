import React from "react";

export default function Navbar() {
  return (
    <div className="w-full h-16 bg-[#e0e5ec] flex items-center justify-between px-8 shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff]">

      
      <h1 className="text-gray-700 text-2xl font-bold">
        Resume Analyzer
      </h1>

  
      <button className="
        px-5 py-2 
        rounded-xl 
        bg-[#e0e5ec] 
        text-gray-700 
        font-semibold
        shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff]
        active:shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_#ffffff]
        transition-all
      ">
        About Us
      </button>

    </div>
  );
}