/**
 * Extracts job descriptions from LinkedIn job listing pages
 */
export function extractLinkedInJobDescription(): string | null {
  try {
    // LinkedIn keeps job descriptions in a div with specific classes
    // These selectors may need adjustment as LinkedIn updates their site
    const descriptionElement = document.querySelector('.job-view-layout .description__text');
    
    if (!descriptionElement) {
      console.log('LinkedIn extractor: Could not find job description element');
      return null;
    }
    
    // Clean up the text
    let descriptionText = descriptionElement.textContent || '';
    descriptionText = descriptionText.trim();
    
    // Remove excessive whitespace
    descriptionText = descriptionText.replace(/\s+/g, ' ');
    
    // Make sure we actually got something
    if (descriptionText.length < 20) {
      console.log('LinkedIn extractor: Description text too short, might be invalid');
      return null;
    }
    
    console.log('LinkedIn extractor: Successfully extracted job description');
    return descriptionText;
  } catch (error) {
    console.error('LinkedIn extractor: Error extracting job description', error);
    return null;
  }
}

/**
 * Checks if the current page is a LinkedIn job listing
 */
export function isLinkedInJobPage(): boolean {
  const url = window.location.href;
  return url.includes('linkedin.com/jobs/') && 
         (url.includes('/view/') || url.includes('/details/'));
}