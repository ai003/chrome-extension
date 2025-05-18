import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
// We'll comment out this import until we create the extractors
// import { extractJobDescription } from './content-script/extractors';

// This will be imported once we create the component
import JobDetectorPanel from './components/JobDetectorPanel';

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
      all: initial; /* Reset all inherited styles */
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      position: fixed; /* Crucial for floating panel */
      top: 20px;
      right: 20px;
      z-index: 2147483647; /* Max z-index to be on top of everything */
    }
    /* More comprehensive reset */
    div, span, applet, object, iframe,
    h1, h2, h3, h4, h5, h6, p, blockquote, pre,
    a, abbr, acronym, address, big, cite, code,
    del, dfn, em, img, ins, kbd, q, s, samp,
    small, strike, strong, sub, sup, tt, var,
    b, u, i, center,
    dl, dt, dd, ol, ul, li,
    fieldset, form, label, legend,
    table, caption, tbody, tfoot, thead, tr, th, td,
    article, aside, canvas, details, embed,
    figure, figcaption, footer, header, hgroup,
    main, menu, nav, output, ruby, section, summary,
    time, mark, audio, video {
      margin: 0;
      padding: 0;
      border: 0;
      font-size: 100%;
      font: inherit;
      vertical-align: baseline;
      box-sizing: border-box; /* Better box model */
    }
    article, aside, details, figcaption, figure,
    footer, header, hgroup, main, menu, nav, section {
      display: block;
    }
    *[hidden] {
        display: none !important; /* Ensure hidden elements are not displayed */
    }
    body {
      line-height: 1; /* Reset from host page */
    }
    ol, ul {
      list-style: none;
    }
    blockquote, q {
      quotes: none;
    }
    blockquote:before, blockquote:after,
    q:before, q:after {
      content: '';
      content: none;
    }
    table {
      border-collapse: collapse;
      border-spacing: 0;
    }
    /* Basic styles for our panel elements */
    button {
      cursor: pointer;
    }
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
    tailwindStyles.href = chrome.runtime.getURL('index.css');
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