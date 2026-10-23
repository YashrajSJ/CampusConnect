import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  CheckCircle,
  Clock,
  ExternalLink,
  FolderKanban,
  Github,
  GraduationCap,
  Linkedin,
  Pencil,
  Sparkles,
  Users,
} from "lucide-react";
import api from "../api/client.js";
import Loader from "../components/Loader.jsx";
import { SKILL_CATEGORIES } from "../constants/skills.js";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [createdProjects, setCreatedProjects] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("created");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/users/me"), api.get("/users/me/dashboard")])
      .then(([meRes, dashRes]) => {
        setUser(meRes.data.user);
        setMetrics(dashRes.data.metrics);
        setCreatedProjects(dashRes.data.createdProjects || []);
        // Memberships = accepted applications where project still exists
        const accepted = (dashRes.data.applications || []).filter(
          (a) => a.status === "accepted" && a.projectId
        );
        setMemberships(accepted);
        setApplications(dashRes.data.applications || []);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading developer profile..." />;
  if (error) return <p className="rounded-xl bg-rose-50 p-4 text-xs text-rose-700">{error}</p>;
  if (!user) return null;

  // Calculate profile completeness score & missing items
  const checks = [
    { label: "Add college", valid: Boolean(user.college) },
    { label: "Add branch", valid: Boolean(user.branch) },
    { label: "Add headline", valid: Boolean(user.headline) },
    { label: "Write a bio", valid: Boolean(user.bio) },
    { label: "Select skills", valid: (user.skills || []).length >= 2 },
    { label: "Link GitHub", valid: Boolean(user.github) },
    { label: "Link LinkedIn", valid: Boolean(user.linkedin) },
  ];
  const completedCount = checks.filter((c) => c.valid).length;
  const completenessPercent = Math.round((completedCount / checks.length) * 100);
  const missingSuggestions = checks.filter((c) => !c.valid);

  const userSkillsSet = new Set(user.skills || []);
  const teamsJoinedCount = metrics?.teamsJoined ?? metrics?.activeMemberships ?? 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* ── Profile Header Card ── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00072D] text-2xl font-black text-amber-400 shadow-sm">
              {user.name?.charAt(0)?.toUpperCase() || "S"}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {user.name || "Student"}
                </h1>
                {user.isOpenToCollaborate ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Open to collaborate
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
                    Busy right now
                  </span>
                )}
              </div>

              {/* Headline */}
              <p className="mt-1 text-sm font-medium text-slate-700">
                {user.headline || "Passionate student developer & collaborator"}
              </p>

              {/* Academic Tags */}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                {user.college && (
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap size={13} className="text-amber-500" />
                    {user.college}
                  </span>
                )}
                {user.branch && <span>· {user.branch}</span>}
                {user.year && (
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {user.year}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Edit Profile Action */}
          <Link
            to="/profile/edit"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <Pencil size={13} /> Edit Profile
          </Link>
        </div>

        {/* Bio */}
        {user.bio ? (
          <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-600 whitespace-pre-wrap">
            {user.bio}
          </p>
        ) : (
          <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400 italic">
            No bio added yet.{" "}
            <Link to="/profile/edit" className="text-[#00072D] font-medium not-italic hover:underline">
              Add a quick intro →
            </Link>
          </div>
        )}

        {/* Social Links Row */}
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-xs">
          {user.github ? (
            <a
              href={user.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              <Github size={14} /> GitHub <ExternalLink size={10} className="text-slate-400" />
            </a>
          ) : (
            <Link
              to="/profile/edit"
              className="text-xs text-slate-400 hover:text-[#00072D] inline-flex items-center gap-1"
            >
              <Github size={13} /> + Link GitHub
            </Link>
          )}

          {user.linkedin ? (
            <a
              href={user.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/60 px-3 py-1.5 font-medium text-blue-700 hover:bg-blue-100 transition"
            >
              <Linkedin size={14} /> LinkedIn <ExternalLink size={10} className="text-blue-400" />
            </a>
          ) : (
            <Link
              to="/profile/edit"
              className="text-xs text-slate-400 hover:text-[#00072D] inline-flex items-center gap-1"
            >
              <Linkedin size={13} /> + Link LinkedIn
            </Link>
          )}

          {user.commitment && (
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-slate-500">
              <Clock size={12} className="text-slate-400" /> Availability: <strong>{user.commitment}</strong>
            </span>
          )}
        </div>
      </div>

      {/* ── Profile Completeness Widget (If < 100%) ── */}
      {completenessPercent < 100 && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" /> Profile {completenessPercent}% Complete
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Completing your developer profile boosts your acceptance rate on campus teams.
              </p>
            </div>
            <Link
              to="/profile/edit"
              className="rounded-lg bg-[#00072D] px-3 py-1 text-xs font-semibold text-white hover:bg-[#0a1744] transition"
            >
              Complete Profile
            </Link>
          </div>

          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#00072D] transition-all duration-500"
              style={{ width: `${completenessPercent}%` }}
            />
          </div>

          {missingSuggestions.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
              <span>Suggestions:</span>
              {missingSuggestions.slice(0, 3).map((item) => (
                <Link
                  key={item.label}
                  to="/profile/edit"
                  className="rounded-md border border-slate-300 bg-white px-2 py-0.5 font-medium text-[#00072D] hover:bg-slate-100"
                >
                  + {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Stats & Preferences Row ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <FolderKanban size={15} className="text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Created
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {metrics?.projectsCreated || 0}
          </p>
          <p className="text-[11px] text-slate-400">Projects as leader</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Users size={15} className="text-emerald-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Teams Joined
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{teamsJoinedCount}</p>
          <p className="text-[11px] text-slate-400">Active memberships</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Briefcase size={15} className="text-amber-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Preferred Roles
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {(user.preferredRoles || []).length > 0 ? (
              user.preferredRoles.map((r) => (
                <span
                  key={r}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                >
                  {r}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">Any collaborative role</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Categorized Skills Section ── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Technical Stack & Verified Skills ({user.skills?.length || 0})
          </h2>
          <Link
            to="/profile/edit"
            className="text-xs font-semibold text-[#00072D] hover:text-[#0a1744]"
          >
            Manage Skills →
          </Link>
        </div>

        {user.skills?.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            No skills added yet. Select your skills so projects can match your profile!
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(SKILL_CATEGORIES).map(([cat, catSkills]) => {
              const matched = catSkills.filter((s) => userSkillsSet.has(s));
              if (matched.length === 0) return null;

              return (
                <div key={cat} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-2">
                    {cat}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {matched.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700 shadow-2xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {user.interests?.length > 0 && (
          <div className="border-t border-slate-100 pt-3 text-xs">
            <span className="font-semibold text-slate-500">Interests & Hobbies: </span>
            <span className="text-slate-700">{user.interests.join(" · ")}</span>
          </div>
        )}
      </div>

      {/* ── Tabbed Portfolio: Created, Joined, Applications ── */}
      <div className="space-y-3">
        <div className="flex border-b border-slate-200 text-sm font-medium text-slate-500">
          <button
            onClick={() => setActiveTab("created")}
            className={`pb-2.5 px-3 border-b-2 font-semibold transition ${
              activeTab === "created"
                ? "border-[#00072D] text-[#00072D]"
                : "border-transparent hover:text-slate-800"
            }`}
          >
            My Projects ({createdProjects.length})
          </button>
          <button
            onClick={() => setActiveTab("teams")}
            className={`pb-2.5 px-3 border-b-2 font-semibold transition ${
              activeTab === "teams"
                ? "border-[#00072D] text-[#00072D]"
                : "border-transparent hover:text-slate-800"
            }`}
          >
            Teams I'm In ({memberships.length})
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`pb-2.5 px-3 border-b-2 font-semibold transition ${
              activeTab === "applications"
                ? "border-[#00072D] text-[#00072D]"
                : "border-transparent hover:text-slate-800"
            }`}
          >
            Applications ({applications.length})
          </button>
        </div>

        {/* Tab 1: Created */}
        {activeTab === "created" && (
          <div className="space-y-2">
            {createdProjects.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl bg-white">
                You haven't created any projects yet.
              </p>
            ) : (
              createdProjects.map((p) => (
                <Link
                  key={p._id}
                  to={`/projects/${p._id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3 hover:border-slate-300 transition shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">{p.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {p.category} · {p.members?.length || 1}/{p.teamSize} members filled
                      {p.targetRole ? ` · Role: ${p.targetRole}` : ""}
                    </p>
                  </div>
                  <span
                    className={`ml-3 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      p.isOpen ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {p.isOpen ? "Open" : "Closed"}
                  </span>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Teams I'm In */}
        {activeTab === "teams" && (
          <div className="space-y-2">
            {memberships.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl bg-white">
                You haven't joined any external teams yet. Browse open projects to apply!
              </p>
            ) : (
              memberships.map((m) => (
                <Link
                  key={m._id}
                  to={`/projects/${m.projectId}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3 hover:border-emerald-300 transition shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">
                      {m.projectTitle}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Joined as active collaborator
                    </p>
                  </div>
                  <span className="ml-3 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 text-[11px] font-bold">
                    ✓ Member
                  </span>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Applications */}
        {activeTab === "applications" && (
          <div className="space-y-2">
            {applications.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl bg-white">
                No active applications.
              </p>
            ) : (
              applications.map((app) => (
                <div
                  key={app._id}
                  className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="min-w-0">
                    {app.projectId ? (
                      <Link
                        to={`/projects/${app.projectId}`}
                        className="font-semibold text-sm text-slate-900 hover:text-[#00072D] truncate block"
                      >
                        {app.projectTitle}
                      </Link>
                    ) : (
                      <span className="font-semibold text-sm text-slate-400 truncate block">
                        {app.projectTitle}
                      </span>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">
                      Applied {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span
                    className={`ml-3 rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${
                      app.status === "accepted"
                        ? "bg-emerald-50 text-emerald-700"
                        : app.status === "rejected"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
