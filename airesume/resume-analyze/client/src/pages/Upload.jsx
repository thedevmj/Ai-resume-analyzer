import { useState, useEffect } from "react";
import axios from "axios";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

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
      setSelectedHistoryItem(null);
      setFile(null);
      fetchHistory(); // Refresh history
    } catch (err) {
      alert("Error analyzing resume");
    }

    setLoading(false);
  };

  const downloadResume = async () => {
    if (!result) {
      alert("Please analyze a resume first");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/upload/download",
        result,
        { responseType: "blob", withCredentials: true },
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "ATS_Resume.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Error downloading PDF. Check console for details.");
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

      {/* Main Content */}
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
          <button
            onClick={downloadResume}
            className="mt-8 w-full max-w-5xl py-2 rounded-xl text-gray-700 font-semibold
          bg-[#e0e5ec]
          shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff]
          active:shadow-inner transition"
          >
            {loading ? "Downloading PDF..." : "Download PDF"}
          </button>
        )}
      </div>
    </div>
  );
}
