export function exportWorkdayJobDescription(): string | null {
    const selectors = [
        '[data-automation-id="jobPostingDescription"]',
        '.jobPostingDescription', // Common class name, though less specific
        '[role="main"] .wd-text' // More generic, but might catch it within main content
        // Add other selectors here if needed, in order of preference
    ];

    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
            const description = element.textContent.trim();
            if (description) {
                // Basic check to ensure it's not just whitespace or very short
                // You might want to add more sophisticated checks here, e.g., min length
                if (description.length > 100) { // Arbitrary minimum length
                    console.log(`Job Detector: Extracted Workday description using selector: ${selector}`);
                    return description;
                }
            }
        }
    }

    console.log("Job Detector: Could not extract Workday job description using known selectors.");
    return null;
}
