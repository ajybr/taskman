"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import { useAuthStore } from "@/stores";
import { useLogin } from "@/hooks";
import { useToastStore } from "@/stores";
import { ToastContainer } from "@/components/common";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const login = useLogin();
  const { addToast } = useToastStore();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login.mutateAsync({ email, password });
      router.push("/dashboard");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Login failed");
    }
  };

  if (authLoading || isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 w-full max-w-md shadow-xl">
        <div className="card-body gap-4">
          <fieldset>
            <legend className="fieldset-legend font-bold text-center text-2xl  w-fit">
              <div>Welcome Back</div>
              <a href="/" className="text-primary hover:opacity-80">
                TASKMAN
              </a>
            </legend>

            <div className="mt-6 space-y-4">
              <label className="floating-label input input-bordered flex items-center gap-3 w-full">
                <span>Your Email</span>
                <Mail className="h-5 w-5 opacity-50" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="flex-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label className="floating-label input input-bordered flex items-center gap-3 w-full">
                <span>Password</span>
                <Lock className="h-5 w-5 opacity-50" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="flex-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full mt-6"
              disabled={login.isPending}
            >
              {login.isPending ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Login"
              )}
            </button>
          </fieldset>

          <div className="divider">OR</div>

          <p className="text-center text-sm">
            Don't have an account?{" "}
            <a href="/signup" className="link link-primary">
              Sign up
            </a>
          </p>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

