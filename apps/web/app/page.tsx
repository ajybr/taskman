import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-5xl font-bold">TaskMan</h1>
          <p className="text-xl mt-4 text-base-content/70">
            Manage your projects and tasks with ease
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/login" className="btn btn-primary btn-lg">
            Login
          </Link>
          <Link href="/signup" className="btn btn-outline btn-lg">
            Sign Up
          </Link>
        </div>

        <div className="stats stats-vertical lg:stats-horizontal shadow mt-12">
          <div className="stat">
            <div className="stat-title">Projects</div>
            <div className="stat-value">Manage</div>
            <div className="stat-desc">Organize your work</div>
          </div>
          <div className="stat">
            <div className="stat-title">Tasks</div>
            <div className="stat-value">Track</div>
            <div className="stat-desc">Kanban board view</div>
          </div>
          <div className="stat">
            <div className="stat-title">Teams</div>
            <div className="stat-value">Collaborate</div>
            <div className="stat-desc">Work together</div>
          </div>
        </div>
      </div>
    </div>
  );
}