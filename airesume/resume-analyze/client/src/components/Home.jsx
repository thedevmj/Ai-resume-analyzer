import React from "react";
import { Navigate, useNavigate } from "react-router-dom";

export default function Home() {
  
  const navigate = useNavigate();
  
    
 
  return (
    <div className="min-h-screen bg-[#e0e5ec] flex flex-col items-center justify-center px-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-700 mb-4">
          AI Resume Analyzer
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Get instant ATS score, identify missing skills, and improve your
          resume using AI-powered analysis. Designed to help you stand out and
          land your dream job faster.
        </p>
      </div>

      <div>
        <button
          className="
        px-5 py-2 
        rounded-xl 
        bg-[#e0e5ec] 
        text-gray-700 
        font-semibold
        shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff]
        active:shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_#ffffff]
        transition-all
      "
          onClick={() => navigate("/Login")}
        >
          Get Started
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-12 w-full max-w-5xl">
        {[
          {
            title: "ATS Score",
            desc: "Know how well your resume performs with Applicant Tracking Systems.",
          },
          {
            title: "Skill Gap Analysis",
            desc: "Identify missing skills required for your target role.",
          },
          {
            title: "Smart Suggestions",
            desc: "Get AI-driven improvements to boost your chances.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-[#e0e5ec] p-6 rounded-2xl text-center 
            shadow-[6px_6px_12px_#a3b1c6,-6px_-6px_12px_#ffffff]"
          >
            <h3 className="font-semibold text-gray-700 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
