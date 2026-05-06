"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import { useAuthStore } from "@/stores";
import { useLogin } from "@/hooks";
import { useToastStore } from "@/stores";
import { ToastContainer } from "@/components/common";
import { loginSchema } from "@repo/auth/schemas";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

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

    setEmailError("");
    setPasswordError("");

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      if (errors.email?.[0]) {
        setEmailError(errors.email[0]);
      }
      if (errors.password?.[0]) {
        setPasswordError(errors.password[0]);
      }
      const firstError = errors.email?.[0] || errors.password?.[0] || "Please fill in all fields correctly";
      addToast(firstError, "error");
      return;
    }

    try {
      await login.mutateAsync({ email, password });
      router.push("/dashboard");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Login failed", "error");
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
              <div>
                <label className={`floating-label input input-bordered flex items-center gap-3 w-full ${emailError ? "input-error" : ""}`}>
                  <span>Your Email</span>
                  <Mail className="h-5 w-5 opacity-50" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="flex-1"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                  />
                </label>
                {emailError && (
                  <label className="label">
                    <span className="label-text-alt text-error">{emailError}</span>
                  </label>
                )}
              </div>

              <div>
                <label className={`floating-label input input-bordered flex items-center gap-3 w-full ${passwordError ? "input-error" : ""}`}>
                  <span>Password</span>
                  <Lock className="h-5 w-5 opacity-50" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="flex-1"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                  />
                </label>
                {passwordError && (
                  <label className="label">
                    <span className="label-text-alt text-error">{passwordError}</span>
                  </label>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="btn btn-primary w-full mt-6"
              disabled={login.isPending}
            >
              {login.isPending ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Login"
              )}
            </button>

            <div className="space-y-2 mt-4">
              <button className="btn  w-full" disabled>
                <svg
                  aria-label="Google logo"
                  width="16"
                  height="16"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <g>
                    <path d="m0 0H512V512H0" fill="#fff"></path>
                    <path
                      fill="#34a853"
                      d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
                    ></path>
                    <path
                      fill="#4285f4"
                      d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
                    ></path>
                    <path
                      fill="#fbbc02"
                      d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
                    ></path>
                    <path
                      fill="#ea4335"
                      d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
                    ></path>
                  </g>
                </svg>
                Login with Google
                <span className="badge badge-primary-content badge-sm">
                  Coming Soon
                </span>
              </button>
            </div>
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
