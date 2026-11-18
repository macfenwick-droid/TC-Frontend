/**
 * The last ticket submission, kept for the Thank You page (this tab only).
 * Stored in sessionStorage so a refresh of /thank-you still shows it; every read/write is
 * guarded because storage can be blocked (private mode, disabled site data).
 */
export type SubmittedSingle = {
  kind: "single";
  orderId: number | null;
  eventName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  state: string;
  section: string;
  row: string;
  seats: string;
  quantity: number;
  restrictedView: boolean;
  primarySite: string;
};

export type SubmittedSeason = {
  kind: "season";
  orderIds: number[];
  team: string;
  section: string;
  row: string;
  seats: string;
  quantity: number;
  faceValue: number;
  games: Array<{ name: string; date: string; time: string; venue: string; state: string }>;
};

export type Submission = SubmittedSingle | SubmittedSeason;

const KEY = "tc:last-submission";

export function saveSubmission(s: Submission) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Storage unavailable: the Thank You page just shows its generic copy.
  }
}

export function readSubmissionRaw(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function parseSubmission(raw: string | null): Submission | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Submission;
    return s && (s.kind === "single" || s.kind === "season") ? s : null;
  } catch {
    return null;
  }
}
