import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type OrderCreateInput } from "@shared/routes";
import { apiFetch, handleApiResponse } from "../lib/api";

export function useMyOrders() {
  return useQuery({
    queryKey: [api.orders.myOrders.path],
    queryFn: async () => {
      const res = await apiFetch(api.orders.myOrders.path);
      return handleApiResponse(res, api.orders.myOrders.responses[200]);
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: OrderCreateInput) => {
      const res = await apiFetch(api.orders.create.path, {
        method: api.orders.create.method,
        body: JSON.stringify(data),
      });
      return handleApiResponse(res, api.orders.create.responses[201]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.myOrders.path] });
    },
  });
}
