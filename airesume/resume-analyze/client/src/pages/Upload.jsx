import { useState, useEffect, useRef } from "react";
import { axiosClient as axios } from "../api/axiosClient";
import { gsap } from "gsap";
import {
  FaBriefcase,
  FaCheck,
  FaFilePdf,
  FaFileWord,
  FaFileAlt,
  FaArrowRight,
} from "react-icons/fa";
import Feedback from "../components/Feedback";
import { API_URL } from "../config";
import useSEO from "../hooks/useSEO";

const card = "bg-[#241814] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.4)]";

export default function Upload() {
  useSEO({
    title: "Analyze Resume",
    description: "Upload your resume and get an instant AI-powered ATS score, feedback, missing skills and interview tips.",
  });
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const resultsRef = useRef(null);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${API_URL}/upload/history`, {
        withCredentials: true,
      });
      setHistory(res.data.history || []);
    } catch (err) {
      console.log("Error fetching history:", err.message);
    }
    setHistoryLoading(false);
  };

  // Fetch history on component mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory();
  }, []);

  // Animate results grid when analysis arrives
  useEffect(() => {
    if (result && resultsRef.current) {
      gsap.fromTo(
        resultsRef.current.children,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.12,
          overwrite: "auto",
        },
      );
    }
  }, [result]);

  const loadHistoryItem = async (itemId) => {
    try {
      const res = await axios.get(
`${API_URL}/upload/report/${itemId}`,
        {
          withCredentials: true,
        },
      );
      setResult(res.data.report.analysis);
      setSelectedHistoryItem(itemId);
    } catch {
      alert("Error loading report");
    }
  };

  const deleteHistoryItem = async (itemId, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_URL}/upload/report/${itemId}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setHistory(history.filter((item) => item._id !== itemId));
      if (selectedHistoryItem === itemId) {
        setResult(null);
        setSelectedHistoryItem(null);
      }
    } catch {
      alert("Error deleting report");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      setResult(res.data.analysis);
      setSelectedHistoryItem(res.data.reportId);
      setFile(null);
      fetchHistory(); // Refresh history
    } catch {
      alert("Error analyzing resume");
    }

    setLoading(false);
  };

  const downloadResume = async (format = "pdf") => {
    if (!result) {
      alert("Please analyze a resume first");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "${API_URL}/upload/download",
        { ...result, format },
        { responseType: "blob", withCredentials: true },
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      
      // Set appropriate filename based on format
      let filename = "ATS_Resume.pdf";
      if (format === "docx") {
        filename = "ATS_Resume.docx";
      } else if (format === "txt") {
        filename = "ATS_Resume.txt";
      }
      
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setShowFormatModal(false);
    } catch (err) {
      console.error("Download error:", err);
      alert("Error downloading resume. Check console for details.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#1b120f] flex">
     
      <div className="w-80 bg-[#201511]/95 shadow-lg overflow-y-auto border-r border-white/10">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            Resume History
          </h2>

          {historyLoading ? (
            <div className="space-y-3">
              <div className="h-16 shimmer rounded-xl" />
              <div className="h-16 shimmer rounded-xl" />
              <div className="h-16 shimmer rounded-xl" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-stone-500 text-sm">No resume history yet</p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item._id}
                  onClick={() => loadHistoryItem(item._id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] border ${
                    selectedHistoryItem === item._id
                      ? "bg-[#2e1c16] border-rose-500/60 shadow-[0_0_20px_rgba(225,29,72,0.25)]"
                      : "bg-[#241814] border-white/10 hover:border-white/25"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-stone-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => deleteHistoryItem(item._id, e)}
                      className="ml-2 px-2 py-1 rounded text-xs bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 transition shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white font-bold text-lg">
                      {item.score}
                    </div>
                    <span className="ml-2 text-sm text-stone-400">/ 100</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

     
      <div className="flex-1 flex flex-col items-center p-6">
        <h1 className="text-3xl font-bold mb-8 text-white">
          AI Resume Analyzer
        </h1>

        <div
          className={`p-6 rounded-2xl w-full max-w-xl ${card}`}
        >
          <label className="block mb-4">
            <span className="block text-sm font-semibold text-stone-300 mb-2">
              Upload your resume (PDF / DOCX)
            </span>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full p-3 rounded-xl bg-[#1e140f] border border-white/10 outline-none cursor-pointer text-stone-300 file:mr-3 file:px-4 file:py-2 file:rounded-xl file:border-none file:bg-white/10 file:text-white file:font-semibold file:cursor-pointer file:transition-all file:duration-300 file:hover:bg-white/20"
            />
          </label>

          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="w-full py-3 rounded-xl text-white font-semibold
          bg-gradient-to-r from-red-600 to-rose-700
          shadow-[0_8px_30px_rgba(225,29,72,0.4)]
          hover:from-red-500 hover:to-rose-600
          hover:scale-[1.01]
          transition-all duration-300
          disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2 justify-center">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : (
              "Analyze Resume"
            )}
          </button>
          {file && !loading && (
            <p className="mt-3 text-xs text-stone-400 flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {file.name} selected
            </p>
          )}
        </div>

        {result && (
          <div ref={resultsRef} className="mt-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Score */}
            <div
              className={`p-6 rounded-2xl text-center ${card} hover:border-rose-500/40 hover:-translate-y-1 transition-all duration-300`}
            >
              <h2 className="text-lg text-stone-300 mb-2">ATS Score</h2>
              <p className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-rose-500">
                {result.score}/100
              </p>
              {result.score >= 70 && (
                <span className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Great score!
                </span>
              )}
            </div>

            <div
              className={`p-6 rounded-2xl ${card} hover:border-rose-500/40 hover:-translate-y-1 transition-all duration-300`}
            >
              <h2 className="text-lg text-amber-50 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {result.skills?.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-sm bg-white/5 border border-white/10 text-rose-300 hover:bg-white/10 hover:scale-110 transition-all duration-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div
              className={`p-6 rounded-2xl ${card} hover:border-rose-500/40 hover:-translate-y-1 transition-all duration-300`}
            >
              <h2 className="text-lg text-amber-50 mb-3">Missing Skills</h2>
              <div className="flex flex-wrap gap-2">
                {result.missing_skills?.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-sm bg-amber-500/15 text-amber-300 border border-amber-400/20 hover:scale-110 transition-transform duration-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div
              className={`p-6 rounded-2xl ${card} hover:border-rose-500/40 hover:-translate-y-1 transition-all duration-300`}
            >
              <h2 className="text-lg text-amber-50 mb-3">Suggestions</h2>
              <ul className="space-y-2">
                {result.suggestions?.map((s, i) => (
                  <li
                    key={i}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-stone-300 text-sm"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

       
        {result && (
          <div className="mt-10 w-full max-w-5xl animate-fade-up">
            <div className="p-6 rounded-2xl bg-[#241814] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-3xl text-amber-200"><FaBriefcase /></span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">Recruiter's Perspective</h3>
                  
                  <div className="space-y-3 text-stone-300 text-sm leading-relaxed">
                    {/* Overall Assessment */}
                    <div className="p-3 rounded-lg bg-white/5 border-l-4 border-rose-500">
                      <p className="font-semibold text-amber-50 mb-1">Initial Impression:</p>
                      <p>
                        {result.score >= 80
                          ? `Your resume presents a strong profile with an excellent ATS score of ${result.score}/100. Recruiters will likely proceed to review your qualifications carefully.`
                          : result.score >= 60
                          ? `Your resume is competitive with a score of ${result.score}/100. You have a solid foundation, but strategic improvements can significantly increase visibility.`
                          : `Your resume scores ${result.score}/100, indicating potential gaps. Addressing key areas can dramatically improve recruiter engagement.`}
                      </p>
                    </div>

                    {/* Strengths */}
                    <div className="p-3 rounded-lg bg-emerald-500/10 border-l-4 border-emerald-400">
                      <p className="font-semibold text-white mb-2">What Recruiters Will Like:</p>
                      <ul className="space-y-1 ml-2">
                        {result.strengths?.slice(0, 3).map((strength, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-400 font-bold"><FaCheck /></span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  
                    {result.weaknesses?.length > 0 && (
                      <div className="p-3 rounded-lg bg-red-500/10 border-l-4 border-red-400">
                        <p className="font-semibold text-white mb-2">Red Flags to Address:</p>
                        <ul className="space-y-1 ml-2">
                          {result.weaknesses?.slice(0, 3).map((weakness, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-red-400 font-bold">•</span>
                              <span>{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  
                    {result.missing_skills?.length > 0 && (
                      <div className="p-3 rounded-lg bg-amber-500/10 border-l-4 border-amber-400">
                        <p className="font-semibold text-white mb-2">High-Impact Skills to Add:</p>
                        <p className="text-xs text-stone-400 mb-2">Adding these skills could increase your hiring potential by 30-50%:</p>
                        <div className="flex flex-wrap gap-2">
                          {result.missing_skills?.slice(0, 5).map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/20"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                 
                    <div className="p-3 rounded-lg bg-emerald-500/10 border-l-4 border-emerald-400">
                      <p className="font-semibold text-white mb-2">Immediate Actions (High ROI):</p>
                      <ol className="space-y-1 ml-2 text-xs">
                        <li className="flex items-start gap-2">
                          <span className="font-bold text-emerald-400">1.</span>
                          <span>Quantify achievements with metrics and percentages</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold text-emerald-400">2.</span>
                          <span>Use industry keywords related to your target roles</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold text-emerald-400">3.</span>
                          <span>Add 2-3 quantifiable project outcomes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold text-emerald-400">4.</span>
                          <span>Improve formatting consistency for better ATS compatibility</span>
                        </li>
                      </ol>
                    </div>

                  
                    <div className="p-3 rounded-lg bg-white/5 border-l-4 border-rose-500">
                      <p className="font-semibold text-amber-50 mb-1">Expected Impact:</p>
                      <p className="text-xs text-stone-400">
                        Implementing these suggestions could boost your ATS score by 15-25 points and increase interview call rates by 40-60% within 2-4 weeks.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {result && (
          <button
            onClick={() => setShowFormatModal(true)}
            disabled={loading}
            className="mt-8 w-full max-w-5xl py-3 rounded-xl text-white font-semibold
          bg-gradient-to-r from-red-600 to-rose-700
          shadow-[0_8px_30px_rgba(225,29,72,0.4)]
          hover:from-red-500 hover:to-rose-600
          hover:scale-[1.01]
          transition-all duration-300 disabled:opacity-60"
          >
            {loading ? "Downloading..." : "Download Resume"}
          </button>
        )}

        {result && selectedHistoryItem && (
          <div className="mt-10 w-full max-w-5xl animate-fade-up">
            <Feedback reportId={selectedHistoryItem} />
          </div>
        )}

        {/* Format Selection Modal */}
        {showFormatModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-[#241814] border border-white/10 rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] max-w-md w-full mx-4 animate-scale-in">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Select Resume Format
              </h3>

              <div className="space-y-4 mb-6">
                {[
                  { format: "pdf", icon: <FaFilePdf />, label: "PDF", description: "Universal format, best for printing" },
                  { format: "docx", icon: <FaFileWord />, label: "DOCX", description: "Microsoft Word format, easily editable" },
                  { format: "txt", icon: <FaFileAlt />, label: "TXT", description: "Plain text format, universal compatibility" },
                ].map((option, idx) => (
                  <button
                    key={option.format}
                    onClick={() => downloadResume(option.format)}
                    disabled={loading}
                    className="group w-full p-4 rounded-xl bg-[#1e140f] border border-white/10 hover:border-rose-500/40 hover:bg-white/5 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl text-amber-200 group-hover:text-amber-100 transition-colors duration-300">{option.icon}</span>
                        <div className="text-left">
                          <p className="font-semibold text-white">{option.label}</p>
                          <p className="text-xs text-stone-400">{option.description}</p>
                        </div>
                      </div>
                      <span className="text-stone-500 group-hover:text-amber-200 transition-colors duration-300"><FaArrowRight /></span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowFormatModal(false)}
                disabled={loading}
                className="w-full py-2 rounded-xl text-stone-300 font-semibold bg-white/5 border border-white/10 hover:border-red-500/40 hover:text-red-300 transition-all duration-300 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}