import { useEffect } from "react";

const DEFAULT_TITLE =
  "AI Resume Analyzer - Free Resume Scoring, Feedback & Interview Tips";
const DEFAULT_DESCRIPTION =
  "Analyze your resume with AI. Get instant score, detailed feedback, missing skills, interview tips and cover letter suggestions in seconds.";

export default function useSEO({ title, description } = {}) {
  useEffect(() => {
    document.title = title ? `${title} | AI Resume Analyzer` : DEFAULT_TITLE;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description || DEFAULT_DESCRIPTION);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", description || DEFAULT_DESCRIPTION);

    const clean = () => {
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute("content", DEFAULT_DESCRIPTION);
      document
        .querySelector('meta[property="og:description"]')
        ?.setAttribute("content", DEFAULT_DESCRIPTION);
    };
    return clean;
  }, [title, description]);
}