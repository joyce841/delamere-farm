import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type AuthLoginInput, type AuthRegisterInput } from "@shared/routes";
import { User } from "@shared/schema";
import { apiFetch, handleApiResponse } from "../lib/api";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const res = await apiFetch(api.auth.me.path);
      if (res.status === 401) {
        localStorage.removeItem("token");
        return null;
      }
      return handleApiResponse(res, api.auth.me.responses[200]);
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: AuthLoginInput) => {
      const res = await apiFetch(api.auth.login.path, {
        method: api.auth.login.method,
        body: JSON.stringify(credentials),
      });
      return handleApiResponse(res, api.auth.login.responses[200]);
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      queryClient.setQueryData(["/api/auth/me"], data.user);
      // Force full page reload so React Query cache is cleared with correct role
      if (data.user.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else if (data.user.role === "seller") {
        window.location.href = "/seller/dashboard";
      } else {
        window.location.href = "/buyer/dashboard";
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: AuthRegisterInput) => {
      const res = await apiFetch(api.auth.register.path, {
        method: api.auth.register.method,
        body: JSON.stringify(data),
      });
      return handleApiResponse(res, api.auth.register.responses[201]);
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      queryClient.setQueryData(["/api/auth/me"], data.user);
      // Force full page reload so React Query cache is cleared with correct role
      if (data.user.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else if (data.user.role === "seller") {
        window.location.href = "/seller/dashboard";
      } else {
        window.location.href = "/buyer/dashboard";
      }
    },
  });

  const logout = () => {
    localStorage.removeItem("token");
    queryClient.clear();
    window.location.href = "/";
  };

  return {
    user,
    isLoading,
    error,
    login: loginMutation,
    register: registerMutation,
    logout,
    isAuthenticated: !!user,
  };
}