export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  severity: "info" | "warning" | "error" | "success";
  is_seen: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  items: Notification[];
  unread_count: number;
}

export interface InsightCard {
  id: string;
  type: string;
  title: string;
  body: string;
  severity: "info" | "warning" | "error" | "success";
  icon: string;
}
