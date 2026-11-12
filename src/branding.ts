// One file to rebrand and re-tune the app for an event.
// Shared by the frontend and Convex, so keep it free of browser imports.

export const BRAND = {
  appName: "Pole Design Hub",
  /** Who the student is giving their details to. Shown in the consent line. */
  company: "our engineering team",
  headline: "How much of this pole can you name?",
  pitch:
    "Five questions a round, 30 seconds each. Reach 500 points and you can hand your résumé straight to our engineers.",
  /** Optional. Shown under the consent line so people know who to ask for deletion. */
  privacyContact: "",
} as const;

/** Points needed before résumé upload and the prize draw open up. */
export const RESUME_UNLOCK_THRESHOLD = 500;

/** One-time bonus for filling in school, program, grad year and what you're looking for. */
export const PROFILE_BONUS = 100;

/**
 * Bump this whenever the consent wording changes.
 * The version and a timestamp are stored on every player record.
 */
export const CONSENT_VERSION = "2026-11-v1";

export function consentText(company: string = BRAND.company) {
  return `I agree that ${company} can store my details and quiz results, and contact me about jobs and student programs. I can ask for them to be deleted at any time.`;
}

/**
 * Prize draw. Set enabled to false if the event has no prize.
 * Nothing here is invented for you: fill in the real prize and closing time
 * before the event, and make sure the draw has written rules.
 */
export const DRAW = {
  enabled: true,
  id: "booth-draw",
  title: "Booth prize draw",
  prize: "Prize announced at the booth",
  closes: "Closes when the event ends",
  rules: "One entry per person. Ask at the booth for the full rules.",
} as const;

export const PROGRAMS = [
  "Electrical",
  "Civil",
  "Mechanical",
  "Computer or software",
  "Engineering technology",
  "Other",
] as const;

export const LOOKING_FOR = ["Co-op or internship", "New grad role", "Not looking yet"] as const;

export const ROLE_INTERESTS = [
  "Distribution design",
  "Transmission",
  "Protection and control",
  "Project management",
  "Not sure yet",
] as const;

export const SCHOOL_SUGGESTIONS = [
  "University of Saskatchewan",
  "University of Regina",
  "Saskatchewan Polytechnic",
  "Saskatchewan Indian Institute of Technologies",
  "University of Alberta",
  "University of Calgary",
  "University of Manitoba",
  "University of British Columbia",
];
