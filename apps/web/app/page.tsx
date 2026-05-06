"use client";
import Link from "next/link";
import Plasma from "./Plasma";
import { useState } from "react";
import { useAuthStore } from "@/stores";
import { useRouter } from "next/navigation";

export default function Home() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { logout } = useAuthStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div
      className="bg-base-300"
      style={{ width: "100%", height: "100vh", position: "relative" }}
    >
      <Plasma
        color=""
        speed={0.6}
        direction="pingpong"
        scale={1.1}
        opacity={0.8}
        mouseInteractive={true}
      />

      <div className="absolute top-0 left-0 right-0 p-4 z-50">
        <div className="navbar bg-neutral/20 backdrop-blur-md shadow-sm px-6  mx-auto rounded-box">
          <Link
            href="/"
            className="navbar-start text-xl font-bold text-primary hover:opacity-80 transition-opacity"
          >
            TASKMAN
          </Link>

          <div className="navbar-end gap-2">
            {!user ? (
              <Link href="/login" className="btn btn-primary btn-sm">
                Login
              </Link>
            ) : (
              <div className="dropdown dropdown-end">
                <button
                  className="btn btn-ghost btn-circle avatar"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="w-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </button>
                {showUserMenu && (
                  <ul className="dropdown-content z-[50] menu p-2 shadow bg-base-100  rounded-box w-52 mt-2">
                    <li className="menu-item px-3 py-2">
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-xs text-base-content/60">
                        {user?.email}
                      </div>
                    </li>
                    <li>
                      <button onClick={handleLogout}>Logout</button>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-8 w-full">
          <div className="mockup-browser bg-base-100/30 backdrop-blur-md w-full border border-base-300 rounded-lg flex-1">
            <div className="mockup-browser-toolbar">
              <div className="input">https://taskman.app/dashboard</div>
            </div>
            <img
              src="/dashboard.png"
              alt="Dashboard"
              className="w-full h-auto"
            />
          </div>

          <div className="flex-1 max-w-xl z-20">
            <h1 className="text-5xl font-bold">
              Capture, organize, and tackle your to-dos from anywhere.
            </h1>
            <p className="py-6 text-base-content/80">
              TaskMan helps teams collaborate seamlessly with powerful project
              management, intuitive kanban boards, and real-time updates. Stay
              focused and deliver results.
            </p>
            <Link href="/dashboard" className="btn btn-primary btn-lg">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
