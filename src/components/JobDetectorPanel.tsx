import React, { useState, useEffect } from 'react';

// Interface for component props
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

  // Handle streaming text effect during loading
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

  // Using simple inline styles for now
  // We'll use Tailwind classes once that's set up properly
  return (
    <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col max-h-[90vh] overflow-hidden z-50">
      {/* Header */}
      <div className="py-3 px-4 flex flex-row items-center justify-between border-b">
        <div className="flex items-center">
          <div className="bg-blue-600 h-6 w-6 rounded flex items-center justify-center">
            {/* Simple icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"></path>
              <path d="M8 7h6"></path>
              <path d="M8 11h8"></path>
              <path d="M8 15h5"></path>
            </svg>
          </div>
          <span className="ml-2 font-medium text-sm">Job Detector</span>
        </div>
        <button 
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 flex-grow relative">
        <textarea
          placeholder="Job description will appear here. You can edit if needed."
          value={isLoading ? visibleText : jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="w-full min-h-[400px] resize-none border rounded-md p-2 text-sm"
          readOnly={isLoading}
        />
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 m-4 bg-white/80 rounded-md flex flex-col items-center justify-center">
            <div className="animate-spin h-8 w-8 mb-2 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
            <p className="text-blue-600 font-medium">Scanning job description...</p>
            {initialJobDescription && (
              <p className="text-gray-500 text-xs mt-1">
                {Math.round((loadingProgress / initialJobDescription.length) * 100)}% complete
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 pt-2 border-t">
        <button 
          className={`w-full py-2 rounded-md text-white ${!isLoading && jobDescription.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
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