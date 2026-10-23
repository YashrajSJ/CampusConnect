import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Github,
  GraduationCap,
  Linkedin,
  MapPin,
  Pencil,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import api from "../api/client.js";
import Loader from "../components/Loader.jsx";
import SkillBadges from "../components/SkillBadges.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { PROJECT_ROLES } from "../constants/skills.js";
import { getSkillMatch } from "../utils/skillMatch.js";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [me, setMe] = useState(null);
  const [joinRequest, setJoinRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState("");

  // Modals state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyRole, setApplyRole] = useState("");
  const [applyMessage, setApplyMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaving, setLeaving] = useState(false);

  async function load() {
    const [projectRes, meRes] = await Promise.all([
      api.get(`/projects/${id}`),
      api.get("/users/me"),
    ]);
    setProject(projectRes.data.project);
    setJoinRequest(projectRes.data.joinRequest);
    setMe(meRes.data.user);
    if (projectRes.data.project?.targetRole) {
      setApplyRole(projectRes.data.project.targetRole);
    }
  }

  useEffect(() => {
    setLoading(true);
    load()
      .catch((err) => setError(err.response?.data?.message || "Failed to load project"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSendApplication(e) {
    e.preventDefault();
    setActing(true);
    setError("");
    try {
      await api.post(`/projects/${id}/join`, {
        appliedRole: applyRole || project?.targetRole || "Collaborator",
        message: applyMessage,
      });
      setShowApplyModal(false);
      setApplyMessage("");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send request");
    } finally {
      setActing(false);
    }
  }

  async function deleteProject() {
    setDeleting(true);
    try {
      await api.delete(`/projects/${id}`);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete project");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  }

  async function leaveProject() {
    setLeaving(true);
    try {
      await api.delete(`/projects/${id}/members/me`);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to leave project");
      setShowLeaveModal(false);
    } finally {
      setLeaving(false);
    }
  }

  if (loading) return <Loader label="Loading project details..." />;
  if (!project) return <p className="rounded-xl bg-rose-50 p-4 text-rose-700">{error || "Project not found"}</p>;

  const myId = me?._id?.toString();
  const ownerId = (project.creatorId?._id || project.creatorId)?.toString();
  const isOwner = Boolean(myId && ownerId && myId === ownerId);
  const isMember = Boolean(myId && project.members?.some((m) => (m._id || m)?.toString() === myId));
  const match = getSkillMatch(me?.skills || [], project.requiredSkills || []);
  const existingMembers = project.existingMembersCount || 0;
  const totalMembers = existingMembers + (project.members?.length || 0);
  const spotsLeft = Math.max(0, project.teamSize - totalMembers);

  const deadlineFormatted = project.deadline
    ? new Date(project.deadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "TBD";

  return (
    <>
      {/* ── Apply to Join Modal ── */}
      {showApplyModal && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => !acting && setShowApplyModal(false)}
          />
          <div className="modal-dialog relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setShowApplyModal(false)}
              disabled={acting}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500 border border-amber-200/60">
                <Send size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Request to Join {project.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Introduce yourself to the project lead and declare your target role.
                </p>
              </div>
            </div>

            <form onSubmit={handleSendApplication} className="mt-4 space-y-4">
              {/* Skill Match Highlight */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-500" /> Your Skill Match: {match.percent}%
                  </p>
                  <p className="text-[11px] text-slate-600">
                    {match.matched.length} of {project.requiredSkills?.length || 0} required skills matched.
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    match.percent >= 70
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-800"
                  }`}
                >
                  {match.percent}%
                </span>
              </div>

              {/* Role selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Applying for Role
                </label>
                <select
                  value={applyRole}
                  onChange={(e) => setApplyRole(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 cursor-pointer"
                >
                  {project.targetRole && (
                    <option value={project.targetRole}>
                      {project.targetRole} (Recruited by Project)
                    </option>
                  )}
                  {PROJECT_ROLES.filter((r) => r !== project.targetRole).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pitch note */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Short Introduction / Contribution Pitch (Optional)
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {applyMessage.length}/300
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={300}
                  placeholder="e.g. Hey! I have built React & Express apps in hackathons and would love to build your backend APIs and database models..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  disabled={acting}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={acting}
                  className="rounded-xl bg-[#00072D] px-5 py-2 text-xs font-bold text-white hover:bg-[#0a1744] disabled:opacity-60 transition shadow-sm"
                >
                  {acting ? "Submitting Request..." : "Send Join Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmModal
          title="Delete this project?"
          message={`"${project.title}" will be permanently removed along with all applicant requests. This action cannot be undone.`}
          confirmLabel="Yes, Delete Project"
          onConfirm={deleteProject}
          onCancel={() => setShowDeleteModal(false)}
          loading={deleting}
          danger
        />
      )}

      {/* Leave Confirmation Modal */}
      {showLeaveModal && (
        <ConfirmModal
          title="Leave this project?"
          message={`You will be removed from "${project.title}". You can re-apply later if slots remain open.`}
          confirmLabel="Yes, Leave Project"
          onConfirm={leaveProject}
          onCancel={() => setShowLeaveModal(false)}
          loading={leaving}
          danger
        />
      )}

      {/* ── Main Layout ── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column (8 of 12) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Main Identity Hero Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
            {/* Top Badges Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {project.category}
                </span>
                {project.stage && (
                  <span className="rounded-full bg-slate-100 border border-slate-200/60 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                    Stage: {project.stage}
                  </span>
                )}
                {project.mode && (
                  <span className="rounded-full bg-slate-50 border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {project.mode}
                  </span>
                )}
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  project.isOpen
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {project.isOpen ? `Open · ${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left` : "Closed"}
              </span>
            </div>

            {/* Title & Creator */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {project.title}
              </h1>
              <p className="mt-1.5 text-xs text-slate-500">
                Created by{" "}
                <span className="font-semibold text-slate-800">
                  {project.creatorId?.name || "Unknown"}
                </span>
                {project.creatorId?.college ? ` (${project.creatorId.college})` : ""}
                {project.creatorId?.branch ? ` · ${project.creatorId.branch}` : ""}
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            {/* Opportunity Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Recruiting
                </p>
                <p className="mt-0.5 font-semibold text-slate-800 truncate">
                  {project.targetRole || "Collaborator"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Team Slots
                </p>
                <p className="mt-0.5 font-semibold text-slate-800">
                  {totalMembers}/{project.teamSize} Filled
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Commitment
                </p>
                <p className="mt-0.5 font-semibold text-slate-800 truncate">
                  {project.commitment || "Flexible"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Deadline
                </p>
                <p className="mt-0.5 font-semibold text-slate-800 truncate">
                  {deadlineFormatted}
                </p>
              </div>
            </div>

            {/* Description Body */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                About the Project
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {project.description}
              </p>
            </div>

            {/* Action Bar based on relationship */}
            <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-3">
              {isOwner ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs">
                    👑 Owner
                  </span>
                  <Link
                    to={`/projects/${id}/requests`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#00072D] px-4 py-2 text-xs font-bold text-white hover:bg-[#0a1744] transition shadow-sm"
                  >
                    Manage Requests
                  </Link>
                  <Link
                    to={`/projects/${id}/edit`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Pencil size={13} /> Edit
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              ) : isMember ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs">
                    <Check size={14} strokeWidth={3} /> You are on this team
                  </span>
                  <button
                    onClick={() => setShowLeaveModal(true)}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                  >
                    Leave Team
                  </button>
                </div>
              ) : joinRequest?.status === "pending" ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-4 py-2 text-xs font-bold text-amber-800">
                    <Clock size={14} /> Request Pending Review
                  </span>
                  <span className="text-xs text-slate-400">
                    The owner has been notified.
                  </span>
                </div>
              ) : joinRequest?.status === "rejected" ? (
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 border border-rose-100">
                    Previous application was not accepted
                  </span>
                  {project.isOpen && (
                    <button
                      onClick={() => setShowApplyModal(true)}
                      className="rounded-xl bg-[#00072D] px-4 py-2 text-xs font-bold text-white hover:bg-[#0a1744] shadow-sm"
                    >
                      Re-apply with Note
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setShowApplyModal(true)}
                    disabled={!project.isOpen}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#00072D] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0a1744] disabled:opacity-50 transition shadow-sm"
                  >
                    <Send size={13} />
                    {project.isOpen ? "Request to Join Team" : "Team is Full"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Team Members Roster */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Team Members</h2>
                <p className="text-xs text-slate-500">
                  {totalMembers} of {project.teamSize} positions filled.
                </p>
              </div>
              {spotsLeft > 0 && project.isOpen && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
                </span>
              )}
            </div>

            {existingMembers > 0 && (
              <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 text-xs text-amber-800 flex items-center gap-2 font-medium">
                <Users size={15} className="text-amber-500 flex-shrink-0" />
                <span>
                  {existingMembers} teammate{existingMembers !== 1 ? "s" : ""} already recruited offline by the creator.
                </span>
              </div>
            )}

            <div className="divide-y divide-slate-100">
              {project.members?.map((member) => {
                const memberId = (member._id || member)?.toString();
                const isCreator = memberId === ownerId;

                return (
                  <div
                    key={memberId}
                    className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#00072D] text-sm font-bold text-amber-400 shadow-xs">
                        {member.name?.charAt(0)?.toUpperCase() || "S"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-slate-900 truncate">
                            {member.name || "Student"}
                          </p>
                          {isCreator && (
                            <span className="rounded-md bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                              LEAD
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {member.college || member.email}
                          {member.branch ? ` · ${member.branch}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {member.github && (
                        <a
                          href={member.github}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title="GitHub"
                        >
                          <Github size={15} />
                        </a>
                      )}
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                          title="LinkedIn"
                        >
                          <Linkedin size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar (4 of 12) */}
        <aside className="space-y-6 lg:col-span-4">
          {/* WhatsApp Group Box (Members only) */}
          {isMember && project.whatsappNumber && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <Phone size={16} /> Team WhatsApp Group
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Connect with your teammates in real-time for meetings, sprint planning, and chat.
              </p>
              <p className="text-xs font-mono font-semibold text-emerald-900 bg-white/70 p-2 rounded-lg border border-emerald-200">
                {project.whatsappNumber}
              </p>
              <a
                href={`https://wa.me/${project.whatsappNumber.replace(/[^\d+]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                Open WhatsApp Chat
              </a>
            </div>
          )}

          {/* Skill Match Breakdown Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" /> Skill Match Score
                </h2>
                <p className="text-[11px] text-slate-400">
                  Compared against your profile skills.
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  match.percent >= 70
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : match.percent >= 40
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {match.percent}%
              </span>
            </div>

            {/* Progress meter */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  match.percent >= 70
                    ? "bg-emerald-500"
                    : match.percent >= 40
                    ? "bg-amber-500"
                    : "bg-[#00072D]"
                }`}
                style={{ width: `${match.percent}%` }}
              />
            </div>

            {/* Skills you have */}
            {match.matched.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  You have ({match.matched.length})
                </p>
                <SkillBadges skills={match.matched} tone="emerald" />
              </div>
            )}

            {/* Missing skills */}
            {match.missing.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Missing ({match.missing.length})
                </p>
                <SkillBadges skills={match.missing} tone="rose" />
              </div>
            )}
          </div>

          {/* Required Skills All */}
          {project.requiredSkills?.length > 0 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Required Project Stack
              </h2>
              <SkillBadges skills={project.requiredSkills} />
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
