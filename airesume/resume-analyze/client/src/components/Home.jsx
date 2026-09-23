import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import useSEO from "../hooks/useSEO";
import GridMotion from "../reactbits/GridMotion";
import Reveal from "./Reveal";
import { FiZap, FiTarget, FiCpu, FiArrowRight } from "react-icons/fi";
import { FaGithub, FaLinkedin, FaWhatsapp } from "react-icons/fa";

const socialLinks = [
  { icon: <FaGithub />, link: "https://github.com/thedevmj", label: "GitHub" },
  { icon: <FaLinkedin />, link: "https://www.linkedin.com/in/junaid-mansuri-devmj", label: "LinkedIn" },
  { icon: <FaWhatsapp />, link: "https://wa.me/919649354858?text=Hello%20I%20want%20to%20know%20more", label: "WhatsApp" },
];

export default function Home() {
  useSEO({
    title: "Home",
    description:
      "Analyze your resume with AI. Get instant ATS score, skill gap analysis and expert feedback for free.",
  });
  const navigate = useNavigate();
  const heroRef = useRef(null);

  const handleGetStarted = () => {
    const email =
      sessionStorage.getItem("email") || localStorage.getItem("email");
    navigate(email ? "/fileupload" : "/Login");
  };

  const items = [
    "AI",
    "Resume",
    "Analyzer",
    "https://images.unsplash.com/photo-1723403804231-f4e9b515fe9d?q=80&w=3870&auto=format&fit=crop",
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-hero]",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
          delay: 0.1,
        },
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: <FiZap className="text-3xl" />,
      title: "ATS Score",
      desc: "Know how well your resume performs with ATS systems.",
    },
    {
      icon: <FiTarget className="text-3xl" />,
      title: "Skill Gap Analysis",
      desc: "Identify missing skills for your target role.",
    },
    {
      icon: <FiCpu className="text-3xl" />,
      title: "Smart Suggestions",
      desc: "Get AI-driven improvements instantly.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Upload Your Resume",
      desc: "Submit your resume in PDF or DOCX format. The document is parsed and analyzed instantly, with no need to restructure or manually reformat anything.",
    },
    {
      number: "02",
      title: "Receive a Detailed Analysis",
      desc: "Get an ATS compatibility score, an auto-detected target role, a skill-gap breakdown, and a clear list of strengths and weaknesses based on current hiring standards.",
    },
    {
      number: "03",
      title: "Improve and Apply",
      desc: "Act on prioritized, actionable suggestions alongside interview preparation tips and cover letter guidance, then re-upload to track your score as it improves.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1b120f]">

      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0 opacity-50 blur-[2px]">
        <GridMotion
          items={items}
          gradientColor="#1b120f"
        />
      </div>

      {/* DARK GRADIENT OVERLAY FOR READABILITY */}
      <div className="absolute inset-0 z-1 bg-gradient-to-b from-black/70 via-[#1b120f]/55 to-[#1b120f] " />

      {/* MAIN CONTENT */}
      <div ref={heroRef} className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">

        {/* DECORATIVE CRIMSON GLOW ORBS */}
        <div className="pointer-events-none absolute top-24 left-10 w-40 h-40 rounded-full bg-rose-600/30 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute bottom-24 right-10 w-56 h-56 rounded-full bg-red-600/25 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[24rem] rounded-full bg-rose-500/10 blur-3xl" />

        {/* HERO */}
        <div className="text-center mb-10 max-w-3xl" data-hero>
          <span className="inline-block px-5 py-2 rounded-full text-sm font-semibold text-amber-100 border border-white/15 bg-white/10 backdrop-blur-md mb-6 shadow-[0_4px_20px_rgba(225,29,72,0.25)]">
            AI-Powered Resume Insights
          </span>

          <h1 className="text-5xl md:text-7xl font-extrabold text-amber-50 mb-6 leading-[1.1] drop-shadow-[0_4px_30px_rgba(225,29,72,0.35)]">
            AI Resume{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-rose-500">
              Analyzer
            </span>
          </h1>

          <p className="text-amber-100/80 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
            Submit your resume and receive a detailed, role-specific evaluation
            powered by AI. Our analyzer produces an ATS compatibility score,
            detects your likely target role, and benchmarks your skills against
            current market expectations — so you can see exactly where you
            stand and what to improve.
          </p>
          <p className="text-amber-100/60 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mt-4">
            Beyond the score, you get a full breakdown: strengths and
            weaknesses, missing in-demand skills, actionable optimization
            suggestions, interview preparation tips, and cover letter guidance.
            Turn a generic resume into a targeted application that recruiters
            and screening systems take seriously.
          </p>
        </div>

        {/* BUTTON */}
        <div data-hero>
          <button
            onClick={handleGetStarted}
            className="
              group relative px-10 py-4
              rounded-2xl
              bg-gradient-to-r from-red-600 to-rose-700
              text-white
              font-semibold text-lg
              shadow-[0_10px_35px_rgba(225,29,72,0.45)]
              hover:shadow-[0_14px_45px_rgba(225,29,72,0.6)]
              active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.35)]
              hover:from-red-500 hover:to-rose-600
              hover:-translate-y-0.5 active:translate-y-0
              transition-all duration-300
            "
          >
            Get Started
            <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
              <FiArrowRight />
            </span>
          </button>
        </div>

        {/* PROFILE LINKS */}
        <div data-hero className="flex gap-4 mt-8">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.link}
              target="_blank"
              rel="noreferrer"
              aria-label={social.label}
              className="
                w-12 h-12 flex items-center justify-center
                rounded-xl text-amber-100 text-lg
                bg-white/10
                border border-white/15
                backdrop-blur-md
                hover:border-rose-500/50 hover:text-amber-200
                hover:bg-rose-500/10
                hover:-translate-y-1
                shadow-[0_4px_20px_rgba(225,29,72,0.25)]
                transition-all duration-300
              "
            >
              {social.icon}
            </a>
          ))}
        </div>

        {/* FEATURES */}
        <div
          data-hero
          className="grid md:grid-cols-3 gap-6 mt-16 w-full max-w-6xl"
        >
          {features.map((item, i) => (
            <Reveal
              key={i}
              delay={i * 120}
              className="group
                bg-white/[0.06]
                backdrop-blur-md
                border border-white/10
                p-8
                rounded-3xl
                text-center
                shadow-[0_8px_30px_rgba(0,0,0,0.35)]
                hover:shadow-[0_14px_40px_rgba(225,29,72,0.25)]
                hover:-translate-y-2 hover:border-rose-500/40
                transition-all duration-300
              "
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-amber-200 group-hover:text-amber-100 group-hover:bg-rose-500/10 transition-colors">
                {item.icon}
              </div>

              <h3 className="font-bold text-xl text-amber-50 mb-3 group-hover:text-amber-200 transition-colors">
                {item.title}
              </h3>

              <p className="text-amber-100/70">
                {item.desc}
              </p>
            </Reveal>
          ))}
        </div>

        {/* HOW IT WORKS */}
        <div data-hero className="w-full max-w-6xl mt-16">
          <div className="text-center mb-8">
            <span className="inline-block px-5 py-2 rounded-full text-sm font-semibold text-amber-100 border border-white/15 bg-white/10 backdrop-blur-md mb-4">
              How It Works
            </span>
            <p className="text-amber-100/70 max-w-2xl mx-auto">
              Three straightforward steps to a stronger, ATS-ready resume —
              no manual formatting, no guesswork, and no prior experience
              required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <Reveal
                key={i}
                delay={i * 120}
                className="group bg-white/[0.06] backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:shadow-[0_14px_40px_rgba(225,29,72,0.25)] hover:-translate-y-2 hover:border-rose-500/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-bold">
                    {step.number}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-rose-300/80">
                    Step {step.number}
                  </span>
                </div>

                <h3 className="font-bold text-xl text-amber-50 mb-3 group-hover:text-amber-200 transition-colors">
                  {step.title}
                </h3>

                <p className="text-amber-100/70 leading-relaxed">
                  {step.desc}
                </p>
              </Reveal>
            ))}
          </div>

          <p className="text-center text-amber-100/50 text-sm mt-8 max-w-3xl mx-auto leading-relaxed">
            Designed for students, early-career professionals, and experienced
            applicants alike. Your resume is analyzed against the same
            formatting and keyword standards used by modern applicant tracking
            systems, helping you catch blind spots before a recruiter ever
            sees your application.
          </p>
        </div>
      </div>
    </div>
  );
}