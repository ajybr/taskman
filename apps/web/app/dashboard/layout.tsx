"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, X, UserPlus, Plus } from "lucide-react";
import { useAuthStore, useProjectStore } from "@/stores";
import { useProjects } from "@/hooks";
import { useInvite } from "@/hooks/useDashboard";
import { ToastContainer } from "@/components/common";
import { CreateProjectModal, JoinProjectModal } from "@/components/dashboard";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    logout,
  } = useAuthStore();
  const { currentProject, members } = useProjectStore();
  const { projects, fetchProjects, isLoading: projectLoading } = useProjects();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated, fetchProjects]);

  useEffect(() => {
    if (!projectId) {
      useProjectStore.getState().setCurrentProject(null);
    } else if (isAuthenticated) {
      useProjectStore.getState().setCurrentProject(projectId);
    }
  }, [projectId, isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleSelectProject = async (selectedProjectId: string) => {
    router.push(`/dashboard?projectId=${selectedProjectId}`);
    setShowProjectDropdown(false);
  };

  if (authLoading || projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <header className="navbar bg-base-100 shadow-sm px-6">
        <Link
          href="/"
          className="navbar-start text-xl font-bold text-primary hover:opacity-80 transition-opacity"
        >
          TASKMAN
        </Link>

        <div className="flex-none navbar-center gap-2">
          <div
            className="dropdown"
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
          >
            <button className="btn btn-ghost gap-2">
              {currentProject ? currentProject.name : "Select Project"}
              <ChevronDown className="h-4 w-4" />
            </button>
            {showProjectDropdown && (
              <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-64 mt-2">
                {filteredProjects.map((project) => (
                  <li key={project.id}>
                    <button onClick={() => handleSelectProject(project.id)}>
                      {project.name}
                      <span
                        className={`badge badge-sm ${project.role === "admin" ? "badge-success" : ""}`}
                      >
                        {project.role}
                      </span>
                    </button>
                  </li>
                ))}
                <li className="border-t border-base-300 mt-2 pt-2">
                  <button
                    onClick={() => {
                      setShowJoinModal(true);
                      setShowProjectDropdown(false);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Join Project
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setShowNewProject(true);
                      setShowProjectDropdown(false);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Project
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>

        <div className="navbar-end gap-2">
          {currentProject && (
            <Link href="/dashboard" className="btn btn-ghost btn-sm">
              Dashboard
            </Link>
          )}
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
              <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-2">
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
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <CreateProjectModal
        isOpen={showNewProject}
        onClose={() => setShowNewProject(false)}
      />

      <JoinProjectModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />

      <ToastContainer />
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <div className="navbar bg-base-100 shadow-sm px-6">
        <div className="navbar-start text-xl font-bold text-primary">
          TASKMAN
        </div>
        <div className="navbar-center"></div>
        <div className="navbar-end">
          <div className="w-8 h-8 rounded-full bg-primary"></div>
        </div>
      </div>
      <main className="flex-1 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
