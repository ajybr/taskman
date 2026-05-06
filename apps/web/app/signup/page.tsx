"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock } from "lucide-react";
import { useAuthStore } from "@/stores";
import { useSignup } from "@/hooks";
import { useToastStore } from "@/stores";
import { ToastContainer } from "@/components/common";
import { clientSignupSchema } from "@repo/auth/schemas";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

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

    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    const result = clientSignupSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      if (errors.name?.[0]) setNameError(errors.name[0]);
      if (errors.email?.[0]) setEmailError(errors.email[0]);
      if (errors.password?.[0]) setPasswordError(errors.password[0]);
      if (errors.confirmPassword?.[0])
        setConfirmPasswordError(errors.confirmPassword[0]);

      const firstError =
        errors.name?.[0] ||
        errors.email?.[0] ||
        errors.password?.[0] ||
        errors.confirmPassword?.[0] ||
        "Please fill in all fields correctly";
      addToast(firstError, "error");
      return;
    }

    try {
      await signup.mutateAsync({ name, email, password });
      router.push("/dashboard");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Signup failed", "error");
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
                  className="flex-1 validator"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </label>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="btn btn-primary w-full mt-6"
              disabled={signup.isPending}
            >
              {signup.isPending ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Sign Up"
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
                Sign up with Google
                <span className="badge  badge-primary-content  badge-sm">
                  Coming Soon
                </span>
              </button>
            </div>
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
