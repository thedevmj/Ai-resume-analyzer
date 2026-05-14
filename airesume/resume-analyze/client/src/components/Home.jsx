import React from "react";
import { useNavigate } from "react-router-dom";
import GridMotion from "../reactbits/GridMotion";

export default function Home() {
  const navigate = useNavigate();

  const items = [
    "AI",
    "Resume",
    "Analyzer",
    "https://images.unsplash.com/photo-1723403804231-f4e9b515fe9d?q=80&w=3870&auto=format&fit=crop",
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#e0e5ec]">

      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0 opacity-30 blur-[2px]">
        <GridMotion
          items={items}
          gradientColor="#e0e5ec"
        />
      </div>

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-white/20 z-1" />

      {/* MAIN CONTENT */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">

        {/* HERO */}
        <div className="text-center mb-10 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-700 mb-6">
            AI Resume Analyzer
          </h1>

          <p className="text-gray-600 text-lg leading-relaxed">
            Get instant ATS score, identify missing skills,
            and improve your resume using AI-powered analysis.
          </p>
        </div>

        {/* BUTTON */}
        <button
          onClick={() => navigate("/Login")}
          className="
            px-8 py-4
            rounded-2xl
            bg-[#e0e5ec]
            text-gray-700
            font-semibold
            shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff]
            active:shadow-[inset_6px_6px_12px_#a3b1c6,inset_-6px_-6px_12px_#ffffff]
            transition-all
            hover:scale-105
          "
        >
          Get Started
        </button>

        {/* FEATURES */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 w-full max-w-6xl">
          {[
            {
              title: "ATS Score",
              desc: "Know how well your resume performs with ATS systems.",
            },
            {
              title: "Skill Gap Analysis",
              desc: "Identify missing skills for your target role.",
            },
            {
              title: "Smart Suggestions",
              desc: "Get AI-driven improvements instantly.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="
                bg-[#e0e5ec]/80
                backdrop-blur-md
                p-8
                rounded-3xl
                text-center
                shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff]
              "
            >
              <h3 className="font-bold text-xl text-gray-700 mb-3">
                {item.title}
              </h3>

              <p className="text-gray-500">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}