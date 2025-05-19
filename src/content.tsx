import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
// We'll comment out this import until we create the extractors
// import { extractJobDescription } from './content-script/extractors';

// This will be imported once we create the component
import JobDetectorPanel from './components/JobDetectorPanel';


// Wrap everything in an IIFE to avoid global scope pollution
(function () {
  const MOUNT_POINT_ID = 'job-detector-mount-point';

  let root: Root | null = null;
  let shadowHost: HTMLDivElement | null = null;

  function mountComponent(initialJobDescription: string) {
    if (document.getElementById(MOUNT_POINT_ID)) {
      // Already mounted
      return;
    }

    shadowHost = document.createElement('div');
    shadowHost.id = MOUNT_POINT_ID;
    document.body.appendChild(shadowHost);

    const shadowRoot = shadowHost.attachShadow({ mode: 'closed' });

    // Basic CSS Reset & Host Styling
    const styleReset = document.createElement('style');
    styleReset.textContent = `
  :host {
    all: initial;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2147483647;
    background-color: #2d2d2d;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    isolation: isolate; /* Added for style isolation */
    contain: content; /* Added for style isolation */
  }

  /* Reset for elements */
  div, span, h1, h2, h3, h4, h5, h6, p, button, textarea {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
    box-sizing: border-box;
  }

  /* Panel container */
  .panel-container {
    width: 320px;
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    background-color: #2d2d2d; /* Added for explicit background */
  }

  /* Header */
  .header {
    background-color: #6b21a8; /* Purple background */
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-content {
    display: flex;
    align-items: center;
  }

  .header-icon {
    background-color: #7e22ce; /* Purple-700 */
    height: 24px;
    width: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .header-title {
    margin-left: 8px;
    color: white;
    font-weight: 500;
    font-size: 14px;
  }

  .close-button {
    background: none;
    border: none;
    color: #e5e7eb; /* gray-200 */
    cursor: pointer;
    height: 32px;
    width: 32px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s, color 0.2s;
    font-size: 24px;  /* Make the × character larger */
    line-height: 1;   /* Important for vertical centering */
    font-weight: 300;
  }

  .close-button:hover {
    background-color: #7e22ce; /* Purple-700 */
    color: white;
  }

  /* Job description content area */
  .job-content {
    padding: 16px;
    position: relative;
    flex-grow: 1;
    background-color: #2d2d2d; /* Added for explicit background */
  }

  .description-label {
    color: #d1d5db; /* gray-300 */
    font-size: 14px;
    margin-bottom: 8px;
    display: block;
  }

  .separator {
    border-top: 1px solid #6B7280; /* gray-500 */
    margin-bottom: 8px;
  }

  textarea {
    background-color: #404040; /* Medium gray */
    color: white;
    width: 100%;
    min-height: 300px;
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #6B7280; /* gray-500 */
    resize: none;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.5;
  }

  textarea:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.5); /* Purple focus ring */
    border-color: transparent;
  }

  /* Loading overlay */
  .loading-overlay {
    position: absolute;
    inset: 16px;
    background-color: rgba(45, 45, 45, 0.9); /* Slightly transparent #2d2d2d */
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .loading-spinner {
    height: 32px;
    width: 32px;
    margin-bottom: 8px;
    border: 2px solid #4B5563; /* gray-600 */
    border-top: 2px solid #9333EA; /* Purple-600 */
    border-radius: 9999px;
  }

  .loading-text {
    color: #C4B5FD; /* Purple-300 */
    font-weight: 500;
    font-size: 14px;
  }

  .loading-progress {
    color: #9CA3AF; /* gray-400 */
    font-size: 12px;
    margin-top: 4px;
  }

  /* Footer */
  .footer {
    background-color: #2d2d2d; /* Same as container */
    padding: 16px;
    border-top: 1px solid #6B7280; /* gray-500 */
    display: flex;
    justify-content: flex-end;
  }

  .continue-button {
    background-color: #9333EA; /* Purple-600 */
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 500;
    width: 100%;
    text-align: center;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .continue-button:hover {
    background-color: #7E22CE; /* Purple-700 - darker on hover */
  }

  .continue-button.disabled {
    background-color: #4C1D95; /* Purple-900 */
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Animation for loading spinner */
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
    shadowRoot.appendChild(styleReset);

    // Link to Tailwind styles
    const tailwindStyles = document.createElement('link');
    tailwindStyles.rel = 'stylesheet';
    tailwindStyles.href = chrome.runtime.getURL('assets/popup.css');
    shadowRoot.appendChild(tailwindStyles);

    const appContainer = document.createElement('div');
    appContainer.id = 'job-detector-panel-container';
    shadowRoot.appendChild(appContainer);

    root = createRoot(appContainer);
    root.render(
      <React.StrictMode>
        <JobDetectorPanel
          initialJobDescription={initialJobDescription}
          isLoading={false}
          onClose={() => {
            unmountComponent();
          }}
          onContinue={(jobDescription: string) => {

            console.log('Job Detector: Continue with job description:', jobDescription);

            // Just log the data for now - we'll implement the site redirection later
            console.log('Job description to send:', jobDescription);

            // Later we'll add: window.open(yourActualSite, '_blank');

            unmountComponent();
          }}
        />
      </React.StrictMode>
    );
    console.log('Job Detector Panel mounted into shadow DOM.');
  }

  function unmountComponent() {
    if (root) {
      root.unmount();
      root = null;
      console.log('Job Detector Panel unmounted.');
    }
    if (shadowHost && shadowHost.parentNode) {
      shadowHost.parentNode.removeChild(shadowHost);
      shadowHost = null;
    }
  }

  // Temporary test function to use until we implement proper extractors
  function detectAndInject() {
    // For testing purposes, we'll use a sample job description
    const testJobDescription = `Frontend Developer
  
Location: Remote
Salary: $120K - $150K

We are seeking a frontend developer with React experience to join our team.
The ideal candidate will have 3+ years of experience working with:
- React and TypeScript
- Modern CSS frameworks
- State management solutions

This is a full-time remote position with competitive benefits.`;

    console.log("Job Detector: Testing with sample job description");
    mountComponent(testJobDescription);
    return true;
  }

  // Chrome extension message handler
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    console.log('Job Detector content script received message:', request);

    if (request.action === "injectJobDetectorPanel") {
      const jobDesc = typeof request.jobDescription === 'string'
        ? request.jobDescription
        : "No specific job description provided by message.";

      mountComponent(jobDesc);
      sendResponse({ status: "Panel injection initiated", jobDescription: jobDesc });
      return true;
    }

    if (request.action === "manualActivation") {
      mountComponent("");
      sendResponse({ status: "Manual panel activation initiated" });
      return true;
    }

    if (request.action === "closeJobDetectorPanel") {
      unmountComponent();
      sendResponse({ status: "Panel closed as per message" });
      return true;
    }

    if (request.action === "setJobDetectorLoading") {
      console.log("Job Detector: Received request to set loading state to", request.isLoading);
      sendResponse({ status: "Loading state update received by content script" });
      return true;
    }

    sendResponse({ status: "Unknown action", requestAction: request.action });
    return false;
  });

  console.log('Job Detector content script loaded and ready.');

  // For testing, automatically inject after a short delay
  setTimeout(() => {
    detectAndInject();
  }, 1500);

})();