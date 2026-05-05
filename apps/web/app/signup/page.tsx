"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock } from "lucide-react";
import { useAuthStore } from "@/stores";
import { useSignup } from "@/hooks";
import { useToastStore } from "@/stores";
import { ToastContainer } from "@/components/common";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const signup = useSignup();
  const { addToast } = useToastStore();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      addToast("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      addToast("Password must be at least 8 characters");
      return;
    }

    try {
      await signup.mutateAsync({ name, email, password });
      router.push("/dashboard");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Signup failed");
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
              <div>Create New</div>
              <a href="/" className="text-primary hover:opacity-80">
                TASKMAN
              </a>
            </legend>

            <div className="mt-6 space-y-4">
              <label className="floating-label input input-bordered flex items-center gap-3 w-full">
                <span>Your Name</span>
                <User className="h-5 w-5 opacity-50" />
                <input
                  type="text"
                  placeholder="Your name"
                  className="flex-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  minLength={2}
                  maxLength={50}
                  required
                />
              </label>

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
                  placeholder="At least 8 characters"
                  className="flex-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  maxLength={100}
                  required
                />
              </label>

              <label className="floating-label input input-bordered flex items-center gap-3 w-full">
                <span>Confirm Password</span>
                <Lock className="h-5 w-5 opacity-50" />
                <input
                  type="password"
                  placeholder="Confirm your password"
                  className="flex-1"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full mt-6"
              disabled={signup.isPending}
            >
              {signup.isPending ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Sign Up"
              )}
            </button>
          </fieldset>

          <div className="divider">OR</div>

          <p className="text-center text-sm">
            Already have an account?{" "}
            <a href="/login" className="link link-primary">
              Login
            </a>
          </p>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

