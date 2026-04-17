export interface FeedbackLink {
  id:         string;
  user_id:    string;
  room_id:    string;
  token:      string;
  question:   string;
  expires_at: string;
  is_active:  boolean;
  created_at: string;
}

export interface FeedbackResponse {
  id:         string;
  link_id:    string;
  name:       string | null;
  message:    string;
  rating:     number | null;
  created_at: string;
}

export type FeedbackLinkWithStats = FeedbackLink & {
  response_count: number;
};

export const DURATION_OPTIONS = [
  { value: 1,  label: "1 Tag"  },
  { value: 7,  label: "7 Tage" },
  { value: 30, label: "30 Tage" },
] as const;
