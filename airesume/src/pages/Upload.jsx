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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">

      <h1 className="text-3xl font-bold mb-6">AI Resume Analyzer</h1>

      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-xl">
        <input
          type="file"
          className="mb-4"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          onClick={handleUpload}
          className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </div>


      {result && (
        <div className="mt-8 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">

         
          <div className="bg-white p-6 rounded-2xl shadow text-center">
            <h2 className="text-xl font-semibold mb-2">ATS Score</h2>
            <p className="text-5xl font-bold text-green-600">
              {result.score}/100
            </p>
          </div>

          
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              
              {result.skills?.map((s, i) => (
                <span key={i} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>

      
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-2 text-red-600">Missing Skills</h2>
            <div className="flex flex-wrap gap-2">
              {result.missing_skills?.map((s, i) => (
                <span key={i} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>

         
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-2">Suggestions</h2>
            <ul className="list-disc ml-5 space-y-1">
              {result.suggestions?.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

        </div>
      )}
    </div>
  );
}