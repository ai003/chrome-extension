import { extractLinkedInJobDescription, isLinkedInJobPage } from './linkedin';
import { exportWorkdayJobDescription } from './workday';

/**
 * Detect the current site and extract job description using the appropriate extractor
 * @returns Job description text or null if not detected
 */
export function extractJobDescription(): string | null {
  const hostname = window.location.hostname;

  if (hostname.includes('myworkdayjobs.com') || hostname.includes('workday.com')) {
    return exportWorkdayJobDescription();
  }

  // Check which site we're on and use the appropriate extractor
  if (isLinkedInJobPage()) {
    return extractLinkedInJobDescription();
  }

  // Add support for more job sites here
  // if (isIndeedJobPage()) {
  //   return extractIndeedJobDescription();
  // }

  // No matching job site detected
  console.log(`Job Detector: No specific extractor for hostname: ${hostname}`);
  return null;
}