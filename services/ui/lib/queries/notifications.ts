import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Notification {
  id: number;
  level: string;
  title: string;
  message: string;
  data: Record<string, string> | null;
  read: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  data: Notification[];
  total: number;
}

interface NotificationsParams {
  status?: string;
  level?: string;
  limit?: number;
  offset?: number;
}

async function fetchNotifications(
  params: NotificationsParams
): Promise<NotificationsResponse> {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  if (params.level) sp.set("level", params.level);
  sp.set("limit", String(params.limit ?? 20));
  sp.set("offset", String(params.offset ?? 0));

  const res = await fetch(`/api/notifications?${sp}`);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export function useNotifications(params: NotificationsParams) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => fetchNotifications(params),
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export type { Notification, NotificationsResponse, NotificationsParams };
