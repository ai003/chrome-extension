import React, { useState, useEffect } from 'react';

interface JobDetectorPanelProps {
  initialJobDescription?: string;
  onClose: () => void;
  onContinue: (jobDescription: string) => void;
  onStreamingComplete?: () => void; // NEW: Callback when streaming finishes
  isScanning?: boolean;   // NEW: Phase 1 - Shows spinner without streaming
  isStreaming?: boolean;  // NEW: Phase 2 - Shows streaming animation
}

const JobDetectorPanel: React.FC<JobDetectorPanelProps> = ({
  initialJobDescription = "",
  onClose,
  onContinue,
  onStreamingComplete, // NEW
  isScanning = false,
  isStreaming = false
}) => {
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [visibleText, setVisibleText] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [internalLoading, setInternalLoading] = useState(false);

  // Typing animation effect - keep this functionality
  useEffect(() => {
    if (isStreaming && initialJobDescription) {
      setInternalLoading(true);
      setVisibleText("");
      setLoadingProgress(0);

      const startTime = Date.now();
      let completed = false;

      const interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const timeProgress = Math.min(elapsedTime / 2500, 1);

        // Calculate character position based on time progress
        const characterPosition = Math.floor(timeProgress * initialJobDescription.length);

        if (timeProgress < 1) {
          setVisibleText(initialJobDescription.substring(0, characterPosition));
          setLoadingProgress(timeProgress * 100);
        } else {
          if (!completed) {
            completed = true;
            clearInterval(interval);

            // Set final state
            setVisibleText(initialJobDescription);
            setLoadingProgress(100);

            setTimeout(() => {
              setJobDescription(initialJobDescription);
              setInternalLoading(false);
              // NEW: Notify parent that streaming is complete
              onStreamingComplete?.();
            }, 100);
          }
        }
      }, 16);

      return () => clearInterval(interval);
    } else {
      //fallback option if nothing is working
      setJobDescription(initialJobDescription);
      setInternalLoading(false);
    }
  }, [isStreaming, initialJobDescription, onStreamingComplete]); // Add onStreamingComplete to deps

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
          <span className="header-title">ResumeGen</span>
        </div>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      {/* Content */}
      <div className="job-content">
        <label className="description-label">Edit Job Description</label>
        <div className="separator"></div>
        {/* Verify that it can work without isLoading*/}
        <textarea
          placeholder="Job description will appear here. You can edit if needed."
          value={isStreaming ? visibleText : jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          readOnly={isStreaming}
        />

        {/* Loading Overlay */}
        {(isScanning || (isStreaming && internalLoading)) && (
          <div className="loading-overlay">
            <div className="loading-spinner animate-spin"></div>
            <p className="loading-text">
              {isScanning ? "Scanning job description..." : "Processing..."}
            </p>
            {isStreaming && initialJobDescription && (
              <p className="loading-progress">
                {Math.round(loadingProgress)}% complete
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="footer">
        <button
          disabled={isScanning || isStreaming || jobDescription.trim().split(/\s+/).filter(word => word.length > 0).length < 50}
          className={`continue-button ${(isScanning || isStreaming || jobDescription.trim().split(/\s+/).filter(word => word.length > 0).length < 50) ? 'disabled less than 50 words' : ''}`}
          onClick={() => onContinue(jobDescription)}
        >
          Continue to Feedback
        </button>
      </div>
    </div>
  );
};

export default JobDetectorPanel;