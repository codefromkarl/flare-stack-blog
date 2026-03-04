import { queryOptions } from "@tanstack/react-query";
import { getAllFriendLinksFn } from "../api/friend-links.admin.api";
import {
  getApprovedFriendLinksFn,
  getMyFriendLinksFn,
} from "../api/friend-links.user.api";
import type { FriendLinkStatus } from "@/lib/db/schema";

export const FRIEND_LINKS_KEYS = {
  all: ["friend-links"] as const,
  approved: ["friend-links", "approved"] as const,
  mine: ["friend-links", "mine"] as const,
  admin: ["friend-links", "admin"] as const,
};

export function myFriendLinksQuery() {
  return queryOptions({
    queryKey: FRIEND_LINKS_KEYS.mine,
    queryFn: async () => {
      const result = await getMyFriendLinksFn();
      if (result.error) {
        return [];
      }
      return result.data;
    },
  });
}

export function approvedFriendLinksQuery() {
  return queryOptions({
    queryKey: FRIEND_LINKS_KEYS.approved,
    queryFn: () => getApprovedFriendLinksFn(),
  });
}

export function allFriendLinksQuery(
  options: {
    offset?: number;
    limit?: number;
    status?: FriendLinkStatus;
  } = {},
) {
  return queryOptions({
    queryKey: [...FRIEND_LINKS_KEYS.admin, options],
    queryFn: async () => {
      const result = await getAllFriendLinksFn({ data: options });
      if (result.error) {
        const reason = result.error.reason;
        switch (reason) {
          case "UNAUTHENTICATED":
            throw new Error("登录状态已失效，请重新登录");
          case "PERMISSION_DENIED":
            throw new Error("权限不足，仅管理员可查看");
          default: {
            reason satisfies never;
            throw new Error("未知错误");
          }
        }
      }
      return result.data;
    },
  });
}
