import { useState, useEffect } from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

// Configure axios globally for credentials
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:5000";

export default function Dashboard() {
 
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("upload/history");

      // Handle different response formats
      let historyData = [];
      if (res.data?.history && Array.isArray(res.data.history)) {
        historyData = res.data.history;
      } else if (Array.isArray(res.data)) {
        historyData = res.data;
      } else {
        throw new Error("Invalid response format from server");
      }

      // Ensure each report has required fields
      const validReports = historyData.filter((report) => report && report._id);

      const sortedReports = validReports.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      setReports(sortedReports);
      if (sortedReports.length > 0) {
        setSelectedReport(sortedReports[0]);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        // Redirect to login after brief delay
        setTimeout(() => navigate("/login"), 2000);
      } else if (err.message === "Network Error") {
        setError(
          "Cannot connect to server. Please ensure the server is running.",
        );
      } else {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to load reports. Please try again.",
        );
      }
    }
    setLoading(false);
  };

  const getReportScore = (report) => {
    // Handle multiple possible score locations
    return report?.analysis?.score || report?.score || 0;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#4CAF50";
    if (score >= 60) return "#FFC107";
    if (score >= 40) return "#FF9800";
    return "#F44336";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  const calculateStats = () => {
    if (reports.length === 0) return null;

    // Get score from either root level or analysis object
    const scores = reports.map((r) => {
      const score = r.analysis?.score || r.score || 0;
      return typeof score === "number" ? score : 0;
    });

    const validScores = scores.filter((s) => s > 0);
    const avgScore =
      validScores.length > 0
        ? Math.round(
            validScores.reduce((a, b) => a + b, 0) / validScores.length,
          )
        : 0;
    const maxScore = validScores.length > 0 ? Math.max(...validScores) : 0;
    const latestScore = scores[0] || 0; // First report is newest due to sorting

    return { avgScore, maxScore, latestScore, totalAnalyses: reports.length };
  };

  let stats = null;

  try {
    stats = calculateStats();
  } catch (e) {
    console.error("Stats calculation failed:", e);
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your analysis data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchReports} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="dashboard-container">
        <div className="empty-state">
          <h2>No Analyses Yet</h2>
          <p>Start by uploading a resume to get your first analysis</p>
          <button onClick={() => navigate("/fileupload")} className="start-btn">
            Upload Resume
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Your Analysis Dashboard</h1>
        <p>Track your resume performance and improvement</p>
      </div>

      {/* Statistics Overview */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.avgScore}%</div>
            <div className="stat-label">Average Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.maxScore}%</div>
            <div className="stat-label">Best Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalAnalyses}</div>
            <div className="stat-label">Total Analyses</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.latestScore}%</div>
            <div className="stat-label">Latest Score</div>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        {/* Reports History Sidebar */}
        <div className="reports-sidebar">
          <h3>Analysis History</h3>
          <div className="reports-list">
            {reports.map((report) => (
              <div
                key={report._id}
                className={`report-item ${selectedReport?._id === report._id ? "active" : ""}`}
                onClick={() => setSelectedReport(report)}
              >
                <div className="report-item-header">
                  <h4>{report.name || "Resume"}</h4>
                  <div
                    className="score-badge"
                    style={{
                      backgroundColor: getScoreColor(getReportScore(report)),
                    }}
                  >
                    {getReportScore(report)}%
                  </div>
                </div>
                <p className="report-date">
                  {report.createdAt
                    ? new Date(report.createdAt).toLocaleDateString()
                    : "No Date"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Report View */}
        {selectedReport && (
          <div className="report-detail">
            <div className="report-header">
              <h2>{selectedReport.name || "Resume Analysis"}</h2>
              <p>
                Analyzed on{" "}
                {selectedReport.createdAt
                  ? new Date(selectedReport.createdAt).toLocaleDateString()
                  : "No Date"}
              </p>
            </div>

            {/* Score Card */}
            <div className="score-card">
              <div className="score-circle">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" className="score-circle-bg" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="score-circle-progress"
                    style={{
                      strokeDasharray: `${getReportScore(selectedReport) * 2.83} 283`,
                      stroke: getScoreColor(getReportScore(selectedReport)),
                    }}
                  />
                </svg>
                <div className="score-text">
                  <span className="score-number">
                    {getReportScore(selectedReport)}%
                  </span>
                  <span className="score-label">
                    {getScoreLabel(getReportScore(selectedReport))}
                  </span>
                </div>
              </div>

              <div className="score-info">
                <div className="info-section">
                  <h4>Email</h4>
                  <p>{selectedReport.analysis?.email || "N/A"}</p>
                </div>
                <div className="info-section">
                  <h4>Phone</h4>
                  <p>{selectedReport.analysis?.phone || "N/A"}</p>
                </div>
                <div className="info-section">
                  <h4>Summary</h4>
                  <p>
                    {selectedReport.analysis?.summary?.substring(0, 100) ||
                      "N/A"}
                    ...
                  </p>
                </div>
              </div>
            </div>

            {/* Strengths and Weaknesses Grid */}
            <div className="analysis-grid">
              {/* Strengths */}
              <div className="analysis-card strengths-card">
                <div className="card-header">
                  <h3>💪 Strengths</h3>
                  <span className="badge">
                    {selectedReport.analysis?.strengths?.length || 0}
                  </span>
                </div>
                <ul className="analysis-list">
                  {selectedReport.analysis?.strengths &&
                  selectedReport.analysis.strengths.length > 0 ? (
                    selectedReport.analysis.strengths.map((strength, idx) => (
                      <li key={idx} className="strength-item">
                        <span className="checkmark">✓</span>
                        {strength}
                      </li>
                    ))
                  ) : (
                    <li className="empty-item">No strengths identified</li>
                  )}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="analysis-card weaknesses-card">
                <div className="card-header">
                  <h3>⚠️ Weaknesses</h3>
                  <span className="badge">
                    {selectedReport.analysis?.weaknesses?.length || 0}
                  </span>
                </div>
                <ul className="analysis-list">
                  {selectedReport.analysis?.weaknesses &&
                  selectedReport.analysis.weaknesses.length > 0 ? (
                    selectedReport.analysis.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="weakness-item">
                        <span className="alert">!</span>
                        {weakness}
                      </li>
                    ))
                  ) : (
                    <li className="empty-item">No weaknesses identified</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Skills Section */}
            <div className="skills-section">
              <div className="skills-card">
                <h3>✨ Current Skills</h3>
                <div className="skills-tags">
                  {selectedReport.analysis?.skills &&
                  selectedReport.analysis.skills.length > 0 ? (
                    selectedReport.analysis.skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p>No skills identified</p>
                  )}
                </div>
              </div>

              <div className="skills-card">
                <h3>🎯 Missing Skills</h3>
                <div className="skills-tags missing">
                  {selectedReport.analysis?.missing_skills &&
                  selectedReport.analysis.missing_skills.length > 0 ? (
                    selectedReport.analysis.missing_skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag missing-tag">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p>Great! You have all recommended skills</p>
                  )}
                </div>
              </div>
            </div>

            {/* Suggestions */}
            {selectedReport.analysis?.suggestions &&
              selectedReport.analysis.suggestions.length > 0 && (
                <div className="suggestions-card">
                  <h3>💡 Suggestions for Improvement</h3>
                  <ol className="suggestions-list">
                    {selectedReport.analysis.suggestions.map(
                      (suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ),
                    )}
                  </ol>
                </div>
              )}

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                onClick={() => navigate("/fileupload")}
                className="btn btn-primary"
              >
                Upload New Resume
              </button>
              <button
                onClick={() => window.scrollTo(0, 0)}
                className="btn btn-secondary"
              >
                Back to Top
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
