import { useState } from "react";
import axios from "axios";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/upload", formData);
      setResult(res.data.analysis);
    } catch (err) {
      alert("Error analyzing resume");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#e0e5ec] flex flex-col items-center p-6">
     
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

          {/* Suggestions */}
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
    </div>
  );
}
