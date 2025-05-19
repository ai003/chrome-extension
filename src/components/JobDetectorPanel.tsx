import React, { useState, useEffect } from 'react';

interface JobDetectorPanelProps {
  initialJobDescription?: string;
  onClose: () => void;
  onContinue: (jobDescription: string) => void;
  isLoading?: boolean;
}

const JobDetectorPanel: React.FC<JobDetectorPanelProps> = ({
  initialJobDescription = "",
  onClose,
  onContinue,
  isLoading = false
}) => {
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [visibleText, setVisibleText] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Typing animation effect - keep this functionality
  useEffect(() => {
    if (isLoading && initialJobDescription) {
      const interval = setInterval(() => {
        if (loadingProgress < initialJobDescription.length) {
          const newProgress = Math.min(
            loadingProgress + Math.floor(Math.random() * 5) + 1,
            initialJobDescription.length
          );
          setLoadingProgress(newProgress);
          setVisibleText(initialJobDescription.substring(0, newProgress));
        } else {
          clearInterval(interval);
          setJobDescription(initialJobDescription);
        }
      }, 50);

      return () => clearInterval(interval);
    } else {
      setJobDescription(initialJobDescription);
    }
  }, [isLoading, loadingProgress, initialJobDescription]);

  return (
    <div className="panel-container">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"></path>
              <path d="M8 7h6"></path>
              <path d="M8 11h8"></path>
              <path d="M8 15h5"></path>
            </svg>
          </div>
          <span className="header-title">Job Detector</span>
        </div>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      {/* Content */}
      <div className="job-content">
        <label className="description-label">Edit Job Description</label>
        <div className="separator"></div>
        <textarea
          placeholder="Job description will appear here. You can edit if needed."
          value={isLoading ? visibleText : jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          readOnly={isLoading}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner animate-spin"></div>
            <p className="loading-text">Scanning job description...</p>
            {initialJobDescription && (
              <p className="loading-progress">
                {Math.round((loadingProgress / initialJobDescription.length) * 100)}% complete
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="footer">
        <button
          className={`continue-button ${(isLoading || !jobDescription.trim()) ? 'disabled' : ''}`}
          disabled={isLoading || !jobDescription.trim()}
          onClick={() => onContinue(jobDescription)}
        >
          Continue to ResumeGen
        </button>
      </div>
    </div>
  );
};

export default JobDetectorPanel;