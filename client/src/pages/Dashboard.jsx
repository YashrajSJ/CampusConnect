import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  FolderKanban,
  Plus,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";
import api from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import Loader from "../components/Loader.jsx";
import SkillBadges from "../components/SkillBadges.jsx";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    setError("");
    return api
      .get("/users/me/dashboard")
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loader label="Loading your command centre..." />;

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
        <p className="text-lg font-semibold text-rose-800">Something went wrong</p>
        <p className="mt-1 text-sm text-rose-600">{error}</p>
        <button
          onClick={load}
          className="mt-4 rounded-xl bg-[#00072D] px-5 py-2 text-sm font-medium text-white hover:bg-[#0a1744] transition-colors shadow-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data?.user) return <Loader label="Loading dashboard..." />;

  const name = data.user.name || "Student";
  const createdProjects = data.createdProjects || [];
  const applications = data.applications || [];
  const recommended = data.recommendedProjects || [];
  const recentActivity = data.recentActivity || [];
  const expiringSoon = data.expiringSoonProjects || [];

  const totalPending = createdProjects.reduce(
    (sum, p) => sum + (p.pendingRequestsCount || 0),
    0
  );
  const teamsJoinedCount =
    data.metrics?.teamsJoined ?? data.metrics?.activeMemberships ?? 0;

  // Outstanding tasks calculation
  const hasOutstandingTasks =
    totalPending > 0 || expiringSoon.length > 0;

  return (
    <div className="space-y-8">
      {/* ── Welcome & Top Action Bar ── */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200/60">
              <Sparkles size={13} className="text-amber-500" /> Command Centre
            </span>
            {data.user.college && (
              <span className="text-xs font-medium text-slate-400">
                · {data.user.college}
              </span>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back, {name} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your collaborative teams, review incoming applicants, and discover new projects.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Browse Teams
          </Link>
          <Link
            to="/projects/create"
            className="inline-flex items-center gap-2 rounded-xl bg-[#00072D] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0a1744] transition-colors shadow-sm"
          >
            <Plus size={16} /> New Project
          </Link>
        </div>
      </div>

      {/* ── Metric Cards (Compact & Explanatory) ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Metric 1: Projects Created */}
        <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-xs transition hover:border-slate-300 hover:bg-slate-200/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Projects Created
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-amber-500 shadow-2xs border border-slate-200/60">
              <FolderKanban size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-extrabold text-slate-900">
              {data.metrics?.projectsCreated || 0}
            </p>
            <span className="text-xs text-slate-500">lead creator</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2.5 text-xs">
            <span className="text-slate-500">Active roster</span>
            <Link
              to="/projects/create"
              className="font-medium text-[#00072D] hover:text-[#0a1744]"
            >
              + Create new
            </Link>
          </div>
        </div>

        {/* Metric 2: Teams Joined (Fixed Logic) */}
        <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-xs transition hover:border-slate-300 hover:bg-slate-200/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Teams Joined
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-amber-500 shadow-2xs border border-slate-200/60">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-extrabold text-slate-900">{teamsJoinedCount}</p>
            <span className="text-xs text-slate-500">external teams</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2.5 text-xs">
            <span className="text-slate-500">Collaborating</span>
            <Link
              to="/projects"
              className="font-medium text-[#00072D] hover:text-[#0a1744]"
            >
              Find teammates →
            </Link>
          </div>
        </div>

        {/* Metric 3: Pending Requests */}
        <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-xs transition hover:border-slate-300 hover:bg-slate-200/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Requests
            </span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg shadow-2xs border border-slate-200/60 ${
                totalPending > 0
                  ? "bg-amber-100 text-amber-700"
                  : "bg-white text-amber-500"
              }`}
            >
              <Bell size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p
              className={`text-3xl font-extrabold ${
                totalPending > 0 ? "text-amber-600" : "text-slate-900"
              }`}
            >
              {totalPending}
            </p>
            <span className="text-xs text-slate-500">
              {totalPending === 1 ? "applicant" : "applicants"}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2.5 text-xs">
            <span className="text-slate-500">
              {totalPending > 0 ? "Action required" : "All caught up"}
            </span>
            {totalPending > 0 ? (
              <span className="font-semibold text-amber-600">Review below ↓</span>
            ) : (
              <span className="text-slate-400">No pending</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Outstanding Work / Action Required Banner ── */}
      {hasOutstandingTasks && (
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertCircle size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-amber-900">
                Action Required on Your Projects
              </h2>
              <div className="mt-2 space-y-1.5 text-xs text-amber-800">
                {totalPending > 0 && (
                  <p className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    You have <strong>{totalPending} join request{totalPending > 1 ? "s" : ""}</strong> waiting for your review.
                  </p>
                )}
                {expiringSoon.map((p) => (
                  <p key={p._id} className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    <strong>{p.title}</strong> deadline is approaching soon (
                    {new Date(p.deadline).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                    ).
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Recommended for You Section ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" /> Recommended For You
            </h2>
            <p className="text-xs text-slate-500">
              Open campus projects matching your skill profile.
            </p>
          </div>
          <Link
            to="/projects"
            className="text-xs font-semibold text-[#00072D] hover:text-[#0a1744]"
          >
            View all open projects →
          </Link>
        </div>

        {recommended.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
            <p className="text-sm font-medium text-slate-700">
              No matching projects found right now
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Make sure to add more skills in your profile or check out all open projects.
            </p>
            <Link
              to="/profile/edit"
              className="mt-3 inline-block rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Update your skills
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {recommended.map((proj) => {
              const match = proj.match || { percent: 0, matched: [], missing: [] };
              const filled = (proj.existingMembersCount || 0) + (proj.members?.length || 1);
              const spotsLeft = Math.max(0, (proj.teamSize || 4) - filled);

              return (
                <div
                  key={proj._id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                >
                  <div>
                    {/* Top match & category */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                        {proj.category}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          match.percent >= 70
                            ? "bg-emerald-50 text-emerald-700"
                            : match.percent >= 40
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {match.percent}% match
                      </span>
                    </div>

                    <Link
                      to={`/projects/${proj._id}`}
                      className="mt-2.5 block font-semibold text-slate-900 hover:text-[#00072D] transition-colors line-clamp-1 text-sm"
                    >
                      {proj.title}
                    </Link>

                    {proj.targetRole && (
                      <p className="mt-1 text-xs font-medium text-slate-700">
                        Looking for: {proj.targetRole}
                      </p>
                    )}

                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
                      {proj.description}
                    </p>

                    <div className="mt-3">
                      <SkillBadges skills={(proj.requiredSkills || []).slice(0, 3)} />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    <span className="text-slate-400">
                      {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
                    </span>
                    <Link
                      to={`/projects/${proj._id}`}
                      className="inline-flex items-center gap-1 font-semibold text-[#00072D] hover:text-[#0a1744]"
                    >
                      View <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Two Column Layout: My Projects & Recent Activity ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: My Created Projects (2 Cols) */}
        <section className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">My Created Projects</h2>
                <p className="text-xs text-slate-500">
                  Projects you are leading. Manage members and review applicants.
                </p>
              </div>
              {createdProjects.length > 0 && (
                <Link
                  to="/projects/create"
                  className="flex items-center gap-1 text-xs font-semibold text-[#00072D] hover:text-[#0a1744]"
                >
                  <Plus size={13} /> New
                </Link>
              )}
            </div>

            {createdProjects.length === 0 ? (
              <EmptyState
                title="No projects created yet"
                subtitle="Start your own project to find teammates with matching skills."
                action={
                  <Link
                    to="/projects/create"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#00072D] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a1744] transition-colors shadow-sm"
                  >
                    <Plus size={14} /> Create your first project
                  </Link>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="pb-3">Title & Role</th>
                      <th className="pb-3">Team</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Requests</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {createdProjects.map((project) => {
                      const filled =
                        (project.existingMembersCount || 0) +
                        (project.members?.length || 1);
                      return (
                        <tr
                          key={project._id}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="py-3.5 pr-3">
                            <Link
                              to={`/projects/${project._id}`}
                              className="font-semibold text-slate-900 hover:text-[#00072D] transition-colors block text-sm"
                            >
                              {project.title}
                            </Link>
                            <span className="text-[11px] text-slate-400">
                              {project.category}
                              {project.targetRole
                                ? ` · Role: ${project.targetRole}`
                                : ""}
                            </span>
                          </td>
                          <td className="py-3.5 pr-3 text-xs text-slate-600">
                            {filled}/{project.teamSize}
                          </td>
                          <td className="py-3.5 pr-3">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                project.isOpen
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {project.isOpen ? "Open" : "Closed"}
                            </span>
                          </td>
                          <td className="py-3.5 pr-3">
                            {project.pendingRequestsCount > 0 ? (
                              <Link
                                to={`/projects/${project._id}/requests`}
                                className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 hover:bg-amber-200 transition-colors"
                              >
                                <Bell size={11} />
                                {project.pendingRequestsCount} review
                              </Link>
                            ) : (
                              <span className="text-xs text-slate-400">0 pending</span>
                            )}
                          </td>
                          <td className="py-3.5 text-right">
                            <div className="flex justify-end gap-1.5">
                              <Link
                                to={`/projects/${project._id}`}
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                              >
                                View
                              </Link>
                              <Link
                                to={`/projects/${project._id}/requests`}
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-[#00072D] hover:bg-slate-100"
                              >
                                Review
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Recent Activity Feed (1 Col) */}
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock size={16} className="text-amber-500" /> Recent Activity
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Latest updates on your requests and teams.
            </p>

            {recentActivity.length === 0 ? (
              <p className="mt-6 text-center text-xs text-slate-400 py-6">
                No recent activity yet. When you apply to teams or receive requests, updates will show here!
              </p>
            ) : (
              <ul className="mt-4 space-y-3.5">
                {recentActivity.map((act) => {
                  const isAccepted = act.type?.includes("accepted");
                  const isRejected = act.type?.includes("rejected");
                  const isIncoming = act.type?.includes("incoming") || act.type?.includes("request");

                  return (
                    <li key={act.id} className="flex items-start gap-3 text-xs">
                      <div className="mt-0.5 flex-shrink-0">
                        {isAccepted ? (
                          <CheckCircle2 size={15} className="text-emerald-500" />
                        ) : isRejected ? (
                          <XCircle size={15} className="text-rose-500" />
                        ) : isIncoming ? (
                          <Bell size={15} className="text-amber-500" />
                        ) : (
                          <Clock size={15} className="text-amber-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        {act.link ? (
                          <Link
                            to={act.link}
                            className="font-medium text-slate-800 hover:text-[#00072D] transition-colors line-clamp-2"
                          >
                            {act.title}
                          </Link>
                        ) : (
                          <p className="font-medium text-slate-800 line-clamp-2">
                            {act.title}
                          </p>
                        )}
                        {act.subtitle && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{act.subtitle}</p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(act.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* ── My Applications Section ── */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Applications</h2>
            <p className="text-xs text-slate-500">
              Status of your requests to join other campus teams.
            </p>
          </div>
          <Link
            to="/projects"
            className="text-xs font-semibold text-[#00072D] hover:text-[#0a1744]"
          >
            Find more projects →
          </Link>
        </div>

        {applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            subtitle="Browse open projects and request to join a team that matches your skills."
            action={
              <Link
                to="/projects"
                className="text-sm font-semibold text-[#00072D] hover:text-[#0a1744]"
              >
                Browse open projects →
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {applications.map((app) => (
              <div
                key={app._id}
                className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-slate-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    {app.projectId ? (
                      <Link
                        to={`/projects/${app.projectId}`}
                        className="font-semibold text-slate-900 hover:text-[#00072D] transition-colors line-clamp-1 text-sm"
                      >
                        {app.projectTitle}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-slate-400 line-clamp-1">
                        {app.projectTitle}
                      </span>
                    )}
                    <span
                      className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${
                        statusStyles[app.status] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {app.status === "accepted"
                        ? "✓ Accepted"
                        : app.status === "rejected"
                        ? "✕ Rejected"
                        : "⏳ Pending"}
                    </span>
                  </div>

                  {app.appliedRole && (
                    <p className="mt-1 text-xs text-[#00072D] font-medium">
                      Applied for: {app.appliedRole}
                    </p>
                  )}

                  {app.message && (
                    <p className="mt-1.5 text-xs text-slate-500 italic bg-white/60 p-2 rounded-lg border border-slate-100">
                      "{app.message}"
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-200/50 pt-2.5 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(app.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>

                  {app.status === "rejected" && app.projectId && app.projectIsOpen && (
                    <Link
                      to={`/projects/${app.projectId}`}
                      className="font-semibold text-[#00072D] hover:text-[#0a1744]"
                    >
                      Re-apply →
                    </Link>
                  )}
                  {app.status === "accepted" && app.projectId && (
                    <Link
                      to={`/projects/${app.projectId}`}
                      className="font-semibold text-emerald-600 hover:text-emerald-800"
                    >
                      Team room →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
