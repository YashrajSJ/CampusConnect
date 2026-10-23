import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpDown,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Github,
  GraduationCap,
  Linkedin,
  MessageSquare,
  Sparkles,
  Users,
  X,
  XCircle,
} from "lucide-react";
import api from "../api/client.js";
import Loader from "../components/Loader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import SkillBadges from "../components/SkillBadges.jsx";
import { getSkillMatch } from "../utils/skillMatch.js";

export default function ProjectRequests() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [requests, setRequests] = useState([]);
  const [sortBy, setSortBy] = useState("match"); // "match" or "date"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState("");

  async function load() {
    const res = await api.get(`/projects/${id}/requests`);
    setProject(res.data.project);
    setRequests(res.data.requests);
  }

  useEffect(() => {
    setLoading(true);
    load()
      .catch((err) => setError(err.response?.data?.message || "Failed to load requests"))
      .finally(() => setLoading(false));
  }, [id]);

  async function decide(requestId, action) {
    setActingId(requestId);
    setError("");
    try {
      await api.put(`/join-requests/${requestId}/${action}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setActingId("");
    }
  }

  if (loading) return <Loader label="Loading applicant requests..." />;
  if (!project && error) {
    return <p className="rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>;
  }

  const rawPending = requests.filter((r) => r.status === "pending");
  const processed = requests.filter((r) => r.status !== "pending");

  // Sort pending requests by skill match score or date
  const pending = [...rawPending].sort((a, b) => {
    if (sortBy === "match") {
      const matchA = getSkillMatch(a.studentId?.skills || [], project?.requiredSkills || []).percent;
      const matchB = getSkillMatch(b.studentId?.skills || [], project?.requiredSkills || []).percent;
      return matchB - matchA;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const totalMembers = (project.existingMembersCount || 0) + (project.members?.length || 0);
  const spotsLeft = Math.max(0, project.teamSize - totalMembers);

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <Link
            to={`/projects/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00072D] hover:text-[#0a1744]"
          >
            <ArrowLeft size={13} /> Back to project
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Applicant Roster & Join Requests
          </h1>
          {project && (
            <p className="mt-1 text-sm text-slate-500">
              <span className="font-semibold text-slate-800">{project.title}</span> ·{" "}
              {totalMembers} of {project.teamSize} slots filled ({spotsLeft} spot
              {spotsLeft !== 1 ? "s" : ""} left)
            </p>
          )}
        </div>

        {/* Capacity Indicator Pill */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold shadow-xs">
          <Users size={15} className="text-amber-500" />
          <span>
            {spotsLeft > 0 ? (
              <span className="text-emerald-700">{spotsLeft} spots available</span>
            ) : (
              <span className="text-slate-400">Team full</span>
            )}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
          {error}
        </div>
      )}

      {/* ── Pending Requests Section ── */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Pending Applicants</h2>
            {pending.length > 0 && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                {pending.length} awaiting decision
              </span>
            )}
          </div>

          {/* Sort Menu */}
          {pending.length > 1 && (
            <div className="flex items-center gap-1.5 text-xs">
              <ArrowUpDown size={13} className="text-slate-400" />
              <span className="text-slate-400 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-slate-400 cursor-pointer"
              >
                <option value="match">Highest Skill Match ✨</option>
                <option value="date">Application Date (Newest)</option>
              </select>
            </div>
          )}
        </div>

        {pending.length === 0 ? (
          <EmptyState
            title="No pending requests"
            subtitle="When interested classmates apply to join your project, their profiles and pitch notes will show up here."
          />
        ) : (
          <div className="space-y-4">
            {pending.map((request) => {
              const student = request.studentId;
              const match = getSkillMatch(
                student?.skills || [],
                project?.requiredSkills || []
              );
              const isActing = actingId === request._id;

              return (
                <div
                  key={request._id}
                  className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-5 transition hover:border-slate-300"
                >
                  {/* Top Bar: Candidate Avatar, Names, Match & Decision Actions */}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00072D] text-base font-bold text-amber-400 shadow-xs">
                        {student?.name?.charAt(0)?.toUpperCase() || "S"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-bold text-slate-900">
                            {student?.name || "Student"}
                          </p>
                          {request.appliedRole && (
                            <span className="rounded-full bg-slate-100 border border-slate-200/60 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                              Applying for: {request.appliedRole}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 mt-0.5">
                          {student?.college || "College not set"}
                          {student?.branch ? ` · ${student.branch}` : ""}
                          {student?.year ? ` (${student.year})` : ""}
                        </p>

                        {/* Skill Match Score Pill */}
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                              match.percent >= 70
                                ? "bg-emerald-100 text-emerald-800"
                                : match.percent >= 40
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            <Sparkles size={11} className="text-amber-500" />
                            {match.percent}% Match ({match.matched.length}/
                            {project?.requiredSkills?.length || 0} skills)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Decision Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        disabled={isActing || spotsLeft === 0}
                        onClick={() => decide(request._id, "accept")}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
                      >
                        <Check size={14} strokeWidth={3} />
                        {isActing ? "Accepting..." : "Accept Candidate"}
                      </button>
                      <button
                        disabled={isActing}
                        onClick={() => decide(request._id, "reject")}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition"
                      >
                        <X size={14} />
                        Reject
                      </button>
                    </div>
                  </div>

                  {/* Intro Pitch Message */}
                  {request.message && (
                    <div className="mt-3.5 rounded-xl border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700 flex items-start gap-2">
                      <MessageSquare size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-800 block text-[11px] mb-0.5">
                          Applicant's Pitch Note:
                        </span>
                        <p className="italic">"{request.message}"</p>
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  {student?.bio && (
                    <p className="mt-2.5 text-xs leading-relaxed text-slate-600 border-t border-slate-200/50 pt-2.5">
                      {student.bio}
                    </p>
                  )}

                  {/* Skills tags */}
                  {student?.skills?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Candidate Skills:
                      </p>
                      <SkillBadges skills={student.skills} />
                    </div>
                  )}

                  {/* Portfolio links & application timestamp */}
                  <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 pt-2.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock size={11} />
                      Applied on{" "}
                      {new Date(request.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>

                    <div className="flex items-center gap-3">
                      {student?.github && (
                        <a
                          href={student.github}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-slate-900"
                        >
                          <Github size={13} /> GitHub <ExternalLink size={10} />
                        </a>
                      )}
                      {student?.linkedin && (
                        <a
                          href={student.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800"
                        >
                          <Linkedin size={13} /> LinkedIn <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Processed Decisions History ── */}
      {processed.length > 0 && (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Past Decisions ({processed.length})
          </h2>
          <div className="divide-y divide-slate-100">
            {processed.map((request) => (
              <div
                key={request._id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
                    {request.studentId?.name?.charAt(0)?.toUpperCase() || "S"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {request.studentId?.name || "Student"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {request.appliedRole ? `Role: ${request.appliedRole} · ` : ""}
                      {request.studentId?.college || ""}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${
                    request.status === "accepted"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {request.status === "accepted" ? "✓ Accepted" : "✕ Not Selected"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
