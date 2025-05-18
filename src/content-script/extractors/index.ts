import { extractLinkedInJobDescription, isLinkedInJobPage } from './linkedin';

/**
 * Detect the current site and extract job description using the appropriate extractor
 * @returns Job description text or null if not detected
 */
export function extractJobDescription(): string | null {
  // Check which site we're on and use the appropriate extractor
  if (isLinkedInJobPage()) {
    return extractLinkedInJobDescription();
  }
  
  // Add support for more job sites here
  // if (isIndeedJobPage()) {
  //   return extractIndeedJobDescription();
  // }
  
  // No matching job site detected
  console.log('Job Detector: Not on a supported job listing page');
  return null;
}