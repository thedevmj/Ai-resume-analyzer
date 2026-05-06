import { useState, useEffect } from "react";
import axios from "axios";
import "./Feedback.css";

export default function Feedback({ reportId }) {
  const [feedback, setFeedback] = useState(null);
  const [interviewTips, setInterviewTips] = useState(null);
  const [coverLetter, setCoverLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (reportId) {
      fetchAllFeedback();
    }
  }, [reportId]);

  const fetchAllFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch detailed feedback
      const feedbackRes = await axios.get(
        `http://localhost:5000/upload/feedback/${reportId}`,
        {
          withCredentials: true,
        }
      );
      setFeedback(feedbackRes.data.feedback);

      // Fetch interview tips
      const interviewRes = await axios.get(
        `http://localhost:5000/upload/feedback/${reportId}/interview-tips`,
        {
          withCredentials: true,
        }
      );
      setInterviewTips(interviewRes.data.interview_tips);

      // Fetch cover letter suggestions
      const letterRes = await axios.get(
        `http://localhost:5000/upload/feedback/${reportId}/cover-letter`,
        {
          withCredentials: true,
        }
      );
      setCoverLetter(letterRes.data.cover_letter_suggestions);
    } catch (err) {
      console.error("Error fetching feedback:", err);
      setError("Error loading feedback. Please try again.");
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="feedback-loading">Loading AI feedback...</div>;
  }

  if (error) {
    return <div className="feedback-error">{error}</div>;
  }

  return (
    <div className="feedback-container">
      <div className="feedback-tabs">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📋 Overview
        </button>
        <button
          className={`tab-button ${activeTab === "interview" ? "active" : ""}`}
          onClick={() => setActiveTab("interview")}
        >
          🎯 Interview Tips
        </button>
        <button
          className={`tab-button ${activeTab === "cover" ? "active" : ""}`}
          onClick={() => setActiveTab("cover")}
        >
          📝 Cover Letter
        </button>
      </div>

      <div className="feedback-content">
        {activeTab === "overview" && feedback && (
          <div className="feedback-section">
            <h2>💼 Overall Assessment</h2>
            <p className="assessment-text">{feedback.overall_assessment}</p>

            <h2>🚀 Career Recommendations</h2>
            <p className="recommendation-text">
              {feedback.career_recommendation}
            </p>

            <h2>💡 Interview Tips</h2>
            <ul className="tips-list">
              {feedback.interview_tips?.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>

            <h2>🎓 Skill Development Plan</h2>
            <div className="skill-plan">
              <h3>Priority Skills</h3>
              <ul>
                {feedback.skill_development_plan?.priority_skills?.map(
                  (skill, idx) => (
                    <li key={idx}>{skill}</li>
                  )
                )}
              </ul>

              <h3>Learning Resources</h3>
              <ul>
                {feedback.skill_development_plan?.learning_resources?.map(
                  (resource, idx) => (
                    <li key={idx}>{resource}</li>
                  )
                )}
              </ul>

              <p className="timeline">
                Estimated Timeline:{" "}
                {feedback.skill_development_plan?.estimated_timeline}
              </p>
            </div>

            <h2>✅ Optimization Checklist</h2>
            <div className="checklist">
              {feedback.optimization_checklist?.map((item, idx) => (
                <div key={idx} className="checklist-item">
                  <input type="checkbox" id={`check-${idx}`} />
                  <label htmlFor={`check-${idx}`}>{item}</label>
                </div>
              ))}
            </div>

            <div className="motivation-box">
              <h2>🌟 Motivation Boost</h2>
              <p>{feedback.motivation_boost}</p>
            </div>
          </div>
        )}

        {activeTab === "interview" && interviewTips && (
          <div className="feedback-section">
            <h2>🎯 Interview Preparation</h2>

            <h3>Technical Questions</h3>
            <div className="questions-list">
              {interviewTips.technical_questions?.map((item, idx) => (
                <div key={idx} className="question-card">
                  <h4>Q{idx + 1}: {item.question}</h4>
                  <p className="tip-text">
                    <strong>Tip:</strong> {item.tip}
                  </p>
                </div>
              ))}
            </div>

            <h3>Behavioral Questions</h3>
            <div className="questions-list">
              {interviewTips.behavioral_questions?.map((item, idx) => (
                <div key={idx} className="question-card">
                  <h4>Q{idx + 1}: {item.question}</h4>
                  <p className="tip-text">
                    <strong>Tip:</strong> {item.tip}
                  </p>
                </div>
              ))}
            </div>

            <h3>Preparation Tips</h3>
            <ul className="tips-list">
              {interviewTips.preparation_tips?.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>

            <h3>Common Mistakes to Avoid</h3>
            <div className="mistakes-list">
              {interviewTips.common_mistakes_to_avoid?.map((mistake, idx) => (
                <div key={idx} className="mistake-item">
                  ⚠️ {mistake}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "cover" && coverLetter && (
          <div className="feedback-section">
            <h2>📝 Cover Letter Template</h2>

            <div className="cover-letter-box">
              <div className="letter-part">
                <h3>Opening Paragraph</h3>
                <p>{coverLetter.opening_paragraph}</p>
              </div>

              <div className="letter-part">
                <h3>First Body Paragraph</h3>
                <p>{coverLetter.middle_paragraph_1}</p>
              </div>

              <div className="letter-part">
                <h3>Second Body Paragraph</h3>
                <p>{coverLetter.middle_paragraph_2}</p>
              </div>

              <div className="letter-part">
                <h3>Closing Paragraph</h3>
                <p>{coverLetter.closing_paragraph}</p>
              </div>
            </div>

            <div className="writing-aids">
              <div className="aid-section">
                <h3>Key Phrases to Use</h3>
                <div className="phrase-tags">
                  {coverLetter.key_phrases?.map((phrase, idx) => (
                    <span key={idx} className="phrase-tag">
                      {phrase}
                    </span>
                  ))}
                </div>
              </div>

              <div className="aid-section">
                <h3>Strong Action Verbs</h3>
                <div className="phrase-tags">
                  {coverLetter.action_verbs?.map((verb, idx) => (
                    <span key={idx} className="verb-tag">
                      {verb}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
