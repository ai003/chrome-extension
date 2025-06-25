import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
// This will be imported once we create the component
import JobDetectorPanel from './components/JobDetectorPanel';


// Wrap everything in an IIFE to avoid global scope pollution
(function () {
  const MOUNT_POINT_ID = 'job-detector-mount-point';

  // CLEAR SESSION DATA ON EVERY PAGE LOAD
  sessionStorage.removeItem('jobDetectorShown');

  let root: Root | null = null;
  let shadowHost: HTMLDivElement | null = null;
  let detectionTimeout: NodeJS.Timeout | null = null;

  function mountComponent(initialJobDescription: string,
    isStreaming: boolean = false,
    isScanning: boolean = false
  ) {
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
          isScanning={isScanning}     // NEW
          isStreaming={isStreaming}   // NEW
          onClose={() => {
            unmountComponent();
          }}
          onContinue={handleContinueToFeedback}
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

  // Simple retry function for content extraction
  function tryExtractWithRetry(maxAttempts = 3) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const content = extractJobDescription();
      if (content) {
        console.log(`Job Detector: Content extracted on attempt ${attempt + 1}`);
        return content;
      }
      // For synchronous retry, we'll just try multiple times immediately
      // since extraction is typically synchronous DOM querying
    }
    console.log('Job Detector: All extraction attempts failed');
    return '';
  }

  // Temporary test function to use until we implement proper extractors
  //   function detectAndInject(extractedDescription?: string | null) {
  //     let jobContent = extractedDescription;

  //     if (!jobContent) {
  //       console.log('Job Detector: No job description found, trying to extract...');
  //       jobContent = tryExtractWithRetry(); // Try to extract content
  //     }

  //     const jobDescriptionToMount = jobContent || `Frontend Developer

  // Location: Remote
  // Salary: $120K - $150K

  // We are seeking a frontend developer with React experience to join our team.
  // The ideal candidate will have 3+ years of experience working with:
  // - React and TypeScript
  // - Modern CSS frameworks
  // - State management solutions

  // This is a full-time remote position with competitive benefits.`; // Fallback text

  //     // Simple rule: animate only if we extracted real content
  //     const hasRealContent = !!(jobContent && jobContent.trim().length > 50);

  //     console.log("Job Detector: Mounting with description:", jobDescriptionToMount.substring(0, 200) + '...');
  //     mountComponent(jobDescriptionToMount.trim(), hasRealContent);
  //     return true;
  //   }

  // Shared API logic for continue functionality
  async function handleContinueToFeedback(jobDescription: string) {
    try {
      const response = await fetch('https://us-central1-resumegen-d74ba.cloudfunctions.net/storeJob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          jobUrl: window.location.href
        })
      });

      console.log('storeJob response status:', response.status);

      const responseData = await response.json();
      console.log('storeJob response data:', responseData);

      if (!response.ok) {
        console.error('storeJob failed:', responseData);
        return;
      }

      const { jobId: serverJobId } = responseData;
      console.log('Opening window with serverJobId:', serverJobId);

      window.open(`https://www.resumegen.co?job=${serverJobId}`, '_blank');
      unmountComponent();
    } catch (error) {
      console.error('Failed to store job:', error);
    }
  }

  function updateComponent(newDescription: string, isStreaming: boolean, isScanning: boolean) {
    if (root) {
      root.render(
        <React.StrictMode>
          <JobDetectorPanel
            initialJobDescription={newDescription}
            isScanning={isScanning}
            isStreaming={isStreaming}
            onClose={() => unmountComponent()}
            onStreamingComplete={() => {
              // NEW: This gets called when streaming animation finishes
              updateComponent(newDescription, false, false); // Clear isStreaming
            }}
            onContinue={handleContinueToFeedback}
          />
        </React.StrictMode>
      );
    }
  }

  function extractAndUpdate(preFoundContent?: string) {
    let finalContent = preFoundContent;

    // Skip extraction since we already have content
    if (!finalContent) {
      console.log('Job Detector: No content passed, trying extraction...');
      finalContent = tryExtractWithRetry();
    }

    const jobDescriptionToMount = finalContent || `Frontend Developer
  
Location: Remote
Salary: $120K - $150K

We are seeking a frontend developer with React experience to join our team.
The ideal candidate will have 3+ years of experience working with:
- React and TypeScript
- Modern CSS frameworks
- State management solutions

This is a full-time remote position with competitive benefits.`;

    const hasRealContent = !!(finalContent && finalContent.trim().length > 50);

    console.log("Job Detector: Switching to final state with content:", jobDescriptionToMount.substring(0, 200) + '...');    // Switch states based on content found
    if (hasRealContent) {
      updateComponent(jobDescriptionToMount.trim(), true, false); // Start streaming
      // REMOVE: The setTimeout - now handled by onStreamingComplete callback
    } else {
      updateComponent(jobDescriptionToMount.trim(), false, false); // Show instantly
    }
  }

  // Chrome extension message handler
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    console.log('Job Detector content script received message:', request);

    if (request.action === "injectJobDetectorPanel") {
      const jobDesc = typeof request.jobDescription === 'string'
        ? request.jobDescription
        : "No specific job description provided by message.";

      mountComponent(jobDesc, false, false);
      sendResponse({ status: "Panel injection initiated", jobDescription: jobDesc });
      return true;
    }

    if (request.action === "manualActivation") {
      mountComponent("", false, false); // No animation for manual activation with empty content
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

  // Simple job description extractor
  function extractJobDescription(): string {
    try {
      const url = window.location.href;

      // Check for Workday
      if (url.includes('.myworkdayjobs.com')) {
        const workdayElement = document.querySelector('[data-automation-id="jobPostingDescription"]');
        if (workdayElement) {
          console.log('Job Detector: Found Workday job description');
          return workdayElement.textContent || '';
        }
      }

      // Check for Ashby
      if (url.includes('jobs.ashbyhq.com')) {
        const ashbyElement = document.querySelector('._descriptionText_14ib5_206');
        if (ashbyElement) {
          console.log('Job Detector: Found Ashby job description');
          return ashbyElement.textContent || '';
        }
      }

      // Check for Greenhouse
      if (url.includes('job-boards.greenhouse.io')) {
        const greenhouseElement = document.querySelector('.job__description.body');
        if (greenhouseElement) {
          console.log('Job Detector: Found Greenhouse job description');
          return greenhouseElement.textContent || '';
        }
      }

      // Generic fallback - try common selectors
      const genericSelectors = [
        '.job-description',
        '.description',
        '[class*="description"]',
        '.job-details',
        '.job-content'
      ];

      for (const selector of genericSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent && element.textContent.length > 100) {
          console.log(`Job Detector: Found generic job description using selector: ${selector}`);
          return element.textContent;
        }
      }

      console.log('Job Detector: No job description found');
      return '';
    } catch (error) {
      console.error('Job Detector: Error extracting job description:', error);
      return '';
    }
  }

  // New URL pattern detection logic
  function isJobPage() {
    const url = window.location.href;

    if (url.includes('jobs.ashbyhq.com')) {
      // Match: jobs.ashbyhq.com/CompanyName/UUID (overview page)
      // Don't match: jobs.ashbyhq.com/CompanyName/UUID/application (for now)
      const ashbyOverviewPattern = /jobs\.ashbyhq\.com\/[^\/]+\/[a-f0-9-]+$/i;
      if (ashbyOverviewPattern.test(url)) {
        console.log("Ashby overview page detected");
        return true;
      }
    }

    // Enhanced exclusion patterns to catch completion/confirmation pages
    const excludePatterns = [
      /\/browse[\/\?]/i,
      /\/search[\/\?]/i,
      /thank[\s-]?you/i,
      /success/i,
      /confirmation/i,
      /submitted/i,
      /completed/i,
      /\/jobTasks\//i,           // Workday specific
      /\/application$/i,         // Ends with /application
      /applythankyou/i,          // Qualtrics
      /\/questions[\/\?]/i,      // NEW: /questions/ or /questions?
      /\/apply[\/\?]/i,          // NEW: /apply/ or /apply?  
      /\/submit[\/\?]/i          // NEW: /submit/ or /submit?

    ];

    // If URL matches any exclude pattern, return false immediately
    if (excludePatterns.some(pattern => pattern.test(url))) {
      console.log("Excluded URL pattern detected");
      return false;
    }

    // Enhanced job URL patterns with more specific matching
    const jobUrlPatterns = [
      // Only match job listing patterns, not application submission pages
      /\/job[s]?\/(?!.*thank|.*complete)/i,
      /\/career[s]?\/(?!.*task|.*complete)/i,
      /\/position[s]?\/(?!.*thank|.*complete)/i,
      /\/vacancy(?!.*complete)/i,
      /\/vacancies\/(?!.*complete)/i,
      /\/opening[s]?\/(?!.*complete)/i,
      /\/job-description/i,
      /\/job-details/i,
      /\/job-posting/i
    ];


    return jobUrlPatterns.some(pattern => pattern.test(url));
  }

  /*
  function hasJobContent() {

    // Add null safety check
    const bodyText = document.body?.textContent;
    if (!bodyText) {
      console.log("No body text content available");
      return false;
    }

    const pageText = bodyText.toLowerCase();
    // Check for application completion indicators first
    const completionIndicators = [
      'application submitted',
      'thank you for applying',
      'application received',
      'successfully applied',
      'application complete',
      'completed application',
      'job application completed',
      'thank you for your interest',
      'application has been submitted',
      'we have received your application'
    ];

    if (completionIndicators.some(indicator => pageText.includes(indicator))) {
      console.log("Application completion content detected");
      return false;
    }

    // Check for specific Workday application completion elements
    if (document.querySelector('.completed-task') ||
      document.querySelector('[data-automation-id="completedTaskList"]')) {
      console.log("Workday application completion page detected");
      return false;
    }

    // Enhanced job content detection
    const jobIndicators = [
      'responsibilities',
      'requirements',
      'qualifications',
      'skills required',
      'job description',
      'about this job',
      'position overview',
      'job summary',
      'what you\\'ll do'
    ];

    // Require multiple job indicators for more confidence
    const matchedIndicators = jobIndicators.filter(marker => pageText.includes(marker));

    return matchedIndicators.length >= 2 && pageText.length > 1000;
  }
  */

  // Create unique job identifier from URL
  function getUrlJobId(): string | null {
    const url = window.location.href;

    // Extract job identifier patterns
    const jobPatterns = [
      /\/job\/.*?\/([^\/\?]+)/i,           // /job/.../R34288
      /\/jobs\/(\d+)/i,                    // /jobs/12345  
      /\/position\/(\d+)/i,                // /position/12345
      /jobId=([^&]+)/i,                    // ?jobId=6889008
      /\/([^\/]+)\/([0-9a-f-]{36})/i       // /Jerry/4dfd6c73-44aa-4e23-9ca1-0b6dc59a6d50 (Ashby format)
    ];

    for (let pattern of jobPatterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        // For Ashby format, use the job ID (second capture group)
        const jobId = match[2] || match[1];
        return `${window.location.hostname}-${jobId}`;
      }
    }

    return null;
  }



  // Main detection logic
  async function initializeJobDetector() {

    // Clear any existing timeout to prevent multiple detections
    if (detectionTimeout) {
      clearTimeout(detectionTimeout);
    }

    console.log("Job Detector Debug:");
    console.log("- URL:", window.location.href);
    console.log("- URL Check (isJobPage):", isJobPage());

    if (!isJobPage()) {
      console.log("Job Detector: Not a job page URL based on isJobPage().");
      return;
    }

    const urlJobId = getUrlJobId();
    console.log("- Extracted URL Job ID:", urlJobId);

    if (!urlJobId) {
      console.log("Job Detector: Could not identify a unique job ID from the URL.");
      return;
    }

    // PHASE 1: Mount with scanning state immediately
    console.log("Job Detector: Mounting component with scanning state...");
    mountComponent("", false, true); // (content, isStreaming, isScanning)

    // PHASE 2: Wait for job content specifically
    const foundContent = await waitForJobContent();
    extractAndUpdate(foundContent); // Pass the found content

    //previously called detect and inject
  }

  // Wait for job content to be available
  function waitForJobContent(): Promise<string> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const content = extractJobDescription();
        if (content && content.length > 100) {
          clearInterval(checkInterval);
          resolve(content); // Return the found content
        }
      }, 250); // Check every 250ms

      // Fallback timeout
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(''); // Return empty string if timeout
      }, 10000); // Max 10 seconds
    });
  }

  // Run the detector when the content script loads
  initializeJobDetector();



})();