import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

export const AUTH_KEY = ["auth"];

export function useCurrentUser() {
  const { user, isAuthenticated } = useAuthStore();
  return { user, isAuthenticated };
}

export function useLogin() {
  const queryClient = useQueryClient();
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEY });
    },
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  const signup = useAuthStore((s) => s.signup);

  return useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      signup(name, email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEY });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}