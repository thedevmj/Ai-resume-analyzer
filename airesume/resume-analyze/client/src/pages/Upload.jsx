import { useState, useEffect } from "react";
import axios from "axios";
import Feedback from "../components/Feedback";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [showFormatModal, setShowFormatModal] = useState(false);

  // Fetch history on component mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/upload/history", {
        withCredentials: true,
      });
      setHistory(res.data.history || []);
    } catch (err) {
      console.log("Error fetching history:", err.message);
    }
    setHistoryLoading(false);
  };

  const loadHistoryItem = async (itemId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/upload/report/${itemId}`,
        {
          withCredentials: true,
        },
      );
      setResult(res.data.report.analysis);
      setSelectedHistoryItem(itemId);
    } catch (err) {
      alert("Error loading report");
    }
  };

  const deleteHistoryItem = async (itemId, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`http://localhost:5000/upload/report/${itemId}`, {
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
    } catch (err) {
      alert("Error deleting report");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      setResult(res.data.analysis);
      setSelectedHistoryItem(res.data.reportId);
      setFile(null);
      fetchHistory(); // Refresh history
    } catch (err) {
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
        "http://localhost:5000/upload/download",
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
    <div className="min-h-screen bg-[#e0e5ec] flex">
     
      <div className="w-80 bg-[#e0e5ec] shadow-lg overflow-y-auto border-r-2 border-[#a3b1c6]">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Resume History
          </h2>

          {historyLoading ? (
            <p className="text-gray-600">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-500 text-sm">No resume history yet</p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item._id}
                  onClick={() => loadHistoryItem(item._id)}
                  className={`p-4 rounded-xl cursor-pointer transition ${
                    selectedHistoryItem === item._id
                      ? "bg-[#e0e5ec] shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff]"
                      : "bg-[#e0e5ec] shadow-[2px_2px_5px_#a3b1c6,-2px_-2px_5px_#ffffff] hover:shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff]"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-700 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => deleteHistoryItem(item._id, e)}
                      className="ml-2 px-2 py-1 rounded text-xs bg-red-300 text-red-800 hover:bg-red-400 transition"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                      {item.score}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">/ 100</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

     
      <div className="flex-1 flex flex-col items-center p-6">
        <h1 className="text-3xl font-bold mb-8 text-gray-700">
          AI Resume Analyzer
        </h1>

        <div
          className="p-6 rounded-2xl w-full max-w-xl bg-[#e0e5ec]
        shadow-[9px_9px_16px_#a3b1c6,-9px_-9px_16px_#ffffff]"
        >
          <input
            type="file"
            className="mb-4 w-full p-3 rounded-xl bg-[#e0e5ec] outline-none
          shadow-inner"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button
            onClick={handleUpload}
            className="w-full py-2 rounded-xl text-gray-700 font-semibold
          bg-[#e0e5ec]
          shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff]
          active:shadow-inner transition"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </div>

        {result && (
          <div className="mt-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Score */}
            <div
              className="p-6 rounded-2xl text-center bg-[#e0e5ec]
            shadow-[9px_9px_16px_#a3b1c6,-9px_-9px_16px_#ffffff]"
            >
              <h2 className="text-lg text-gray-600 mb-2">ATS Score</h2>
              <p className="text-5xl font-bold text-gray-700">
                {result.score}/100
              </p>
            </div>

            <div
              className="p-6 rounded-2xl bg-[#e0e5ec]
            shadow-[9px_9px_16px_#a3b1c6,-9px_-9px_16px_#ffffff]"
            >
              <h2 className="text-lg text-gray-700 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {result.skills?.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-sm bg-[#e0e5ec]
                  shadow-inner text-gray-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div
              className="p-6 rounded-2xl bg-[#e0e5ec]
            shadow-[9px_9px_16px_#a3b1c6,-9px_-9px_16px_#ffffff]"
            >
              <h2 className="text-lg text-gray-700 mb-3">Missing Skills</h2>
              <div className="flex flex-wrap gap-2">
                {result.missing_skills?.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-sm bg-[#e0e5ec]
                  shadow-inner text-gray-600"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div
              className="p-6 rounded-2xl bg-[#e0e5ec]
            shadow-[9px_9px_16px_#a3b1c6,-9px_-9px_16px_#ffffff]"
            >
              <h2 className="text-lg text-gray-700 mb-3">Suggestions</h2>
              <ul className="space-y-2">
                {result.suggestions?.map((s, i) => (
                  <li
                    key={i}
                    className="p-2 rounded-lg bg-[#e0e5ec] shadow-inner text-gray-600"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

       
        {result && (
          <div className="mt-10 w-full max-w-5xl">
            <div className="p-6 rounded-2xl bg-linear-to-r from-[#e0e5ec] to-[#e8ecf1] shadow-[9px_9px_16px_#a3b1c6,-9px_-9px_16px_#ffffff]">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-3xl">💼</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Recruiter's Perspective</h3>
                  
                  <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
                    {/* Overall Assessment */}
                    <div className="p-3 rounded-lg bg-[#e0e5ec] shadow-inner">
                      <p className="font-semibold text-gray-800 mb-1">📊 Initial Impression:</p>
                      <p>
                        {result.score >= 80
                          ? `Your resume presents a strong profile with an excellent ATS score of ${result.score}/100. Recruiters will likely proceed to review your qualifications carefully.`
                          : result.score >= 60
                          ? `Your resume is competitive with a score of ${result.score}/100. You have a solid foundation, but strategic improvements can significantly increase visibility.`
                          : `Your resume scores ${result.score}/100, indicating potential gaps. Addressing key areas can dramatically improve recruiter engagement.`}
                      </p>
                    </div>

                    {/* Strengths */}
                    <div className="p-3 rounded-lg bg-[#e0e5ec] shadow-inner">
                      <p className="font-semibold text-gray-800 mb-2">✨ What Recruiters Will Like:</p>
                      <ul className="space-y-1 ml-2">
                        {result.strengths?.slice(0, 3).map((strength, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  
                    {result.weaknesses?.length > 0 && (
                      <div className="p-3 rounded-lg bg-[#ffd4d4] shadow-inner">
                        <p className="font-semibold text-gray-800 mb-2">⚠️ Red Flags to Address:</p>
                        <ul className="space-y-1 ml-2">
                          {result.weaknesses?.slice(0, 3).map((weakness, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-red-600 font-bold">•</span>
                              <span>{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                   
                    {result.missing_skills?.length > 0 && (
                      <div className="p-3 rounded-lg bg-[#fff4d4] shadow-inner">
                        <p className="font-semibold text-gray-800 mb-2">🎯 High-Impact Skills to Add:</p>
                        <p className="text-xs text-gray-600 mb-2">Adding these skills could increase your hiring potential by 30-50%:</p>
                        <div className="flex flex-wrap gap-2">
                          {result.missing_skills?.slice(0, 5).map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 rounded text-xs font-semibold bg-yellow-200 text-yellow-800"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                 
                    <div className="p-3 rounded-lg bg-[#d4f4dd] shadow-inner">
                      <p className="font-semibold text-gray-800 mb-2">🚀 Immediate Actions (High ROI):</p>
                      <ol className="space-y-1 ml-2 text-xs">
                        <li className="flex items-start gap-2">
                          <span className="font-bold text-green-700">1.</span>
                          <span>Quantify achievements with metrics and percentages</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold text-green-700">2.</span>
                          <span>Use industry keywords related to your target roles</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold text-green-700">3.</span>
                          <span>Add 2-3 quantifiable project outcomes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold text-green-700">4.</span>
                          <span>Improve formatting consistency for better ATS compatibility</span>
                        </li>
                      </ol>
                    </div>

                  
                    <div className="p-3 rounded-lg bg-[#e0e5ec] shadow-inner border-l-4 border-blue-500">
                      <p className="font-semibold text-gray-800 mb-1">📈 Expected Impact:</p>
                      <p className="text-xs text-gray-700">
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
            className="mt-8 w-full max-w-5xl py-2 rounded-xl text-gray-700 font-semibold
          bg-[#e0e5ec]
          shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff]
          active:shadow-inner transition"
          >
            {loading ? "Downloading..." : "Download Resume"}
          </button>
        )}

        {result && selectedHistoryItem && (
          <div className="mt-10 w-full max-w-5xl">
            <Feedback reportId={selectedHistoryItem} />
          </div>
        )}

        {/* Format Selection Modal */}
        {showFormatModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#e0e5ec] rounded-2xl p-8 shadow-[10px_10px_20px_#d1d1d4,-10px_-10px_20px_#ffffff] max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-700 mb-6 text-center">
                Select Resume Format
              </h3>

              <div className="space-y-4 mb-6">
                {[
                  { format: "pdf", icon: "📄", label: "PDF", description: "Universal format, best for printing" },
                  { format: "docx", icon: "📝", label: "DOCX", description: "Microsoft Word format, easily editable" },
                  { format: "txt", icon: "📋", label: "TXT", description: "Plain text format, universal compatibility" },
                ].map((option) => (
                  <button
                    key={option.format}
                    onClick={() => downloadResume(option.format)}
                    disabled={loading}
                    className="w-full p-4 rounded-xl bg-[#e0e5ec] shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#a3b1c6,-7px_-7px_14px_#ffffff] transition-all disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{option.icon}</span>
                        <div className="text-left">
                          <p className="font-semibold text-gray-700">{option.label}</p>
                          <p className="text-xs text-gray-500">{option.description}</p>
                        </div>
                      </div>
                      <span className="text-gray-400">→</span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowFormatModal(false)}
                disabled={loading}
                className="w-full py-2 rounded-xl text-gray-700 font-semibold bg-[#e0e5ec] shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] active:shadow-inner transition disabled:opacity-50"
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
