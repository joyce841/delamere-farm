import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type LivestockCreateInput } from "@shared/routes";
import { apiFetch, handleApiResponse } from "../lib/api";

export function useLivestock() {
  return useQuery({
    queryKey: [api.livestock.list.path],
    queryFn: async () => {
      const res = await apiFetch(api.livestock.list.path);
      return handleApiResponse(res, api.livestock.list.responses[200]);
    },
  });
}

export function useLivestockDetails(id: number) {
  return useQuery({
    queryKey: [api.livestock.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.livestock.get.path, { id });
      const res = await apiFetch(url);
      if (res.status === 404) return null;
      return handleApiResponse(res, api.livestock.get.responses[200]);
    },
    enabled: !!id,
  });
}

export function useCreateLivestock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: LivestockCreateInput) => {
      const res = await apiFetch(api.livestock.create.path, {
        method: api.livestock.create.method,
        body: JSON.stringify(data),
      });
      return handleApiResponse(res, api.livestock.create.responses[201]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.livestock.list.path] });
    },
  });
}

export function useDeleteLivestock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.livestock.delete.path, { id });
      const res = await apiFetch(url, { method: api.livestock.delete.method });
      return handleApiResponse(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.livestock.list.path] });
    },
  });
}
