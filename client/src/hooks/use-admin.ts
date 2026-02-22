import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { apiFetch, handleApiResponse } from "../lib/api";

export function useAdminUsers() {
  return useQuery({
    queryKey: [api.admin.users.path],
    queryFn: async () => {
      const res = await apiFetch(api.admin.users.path);
      return handleApiResponse(res, api.admin.users.responses[200]);
    },
  });
}

export function useAdminLivestock() {
  return useQuery({
    queryKey: [api.admin.livestock.path],
    queryFn: async () => {
      const res = await apiFetch(api.admin.livestock.path);
      return handleApiResponse(res, api.admin.livestock.responses[200]);
    },
  });
}
