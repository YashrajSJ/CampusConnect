import { Link } from "react-router-dom";
import { Calendar, Sparkles, Users } from "lucide-react";
import SkillBadges from "./SkillBadges.jsx";
import { getSkillMatch } from "../utils/skillMatch.js";

export default function ProjectCard({ project, userSkills = [] }) {
  const short =
    project.description?.length > 115
      ? `${project.description.slice(0, 115)}...`
      : project.description;

  const platformMembers = project.members?.length || 0;
  const existingMembers = project.existingMembersCount || 0;
  const totalMembers = existingMembers + platformMembers;
  const teamSize = project.teamSize || 0;
  const spotsLeft = Math.max(0, teamSize - totalMembers);
  const fillPercent = teamSize > 0 ? Math.round((totalMembers / teamSize) * 100) : 0;

  const deadlineDate = project.deadline
    ? new Date(project.deadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    : null;

  // Calculate skill match if user skills are available
  const hasUserSkills = Array.isArray(userSkills) && userSkills.length > 0;
  const required = project.requiredSkills || [];
  const match = hasUserSkills
    ? getSkillMatch(userSkills, required)
    : null;

  return (
    <Link
      to={`/projects/${project._id}`}
      className="card-hover group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <div>
        {/* Top Badges Row */}
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {project.category}
            </span>
            {project.stage && (
              <span className="rounded-full bg-slate-50 border border-slate-200/60 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                {project.stage}
              </span>
            )}
            {project.mode && (
              <span className="rounded-full bg-slate-50 border border-slate-200/60 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                {project.mode}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {match && required.length > 0 && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  match.percent >= 70
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                    : match.percent >= 40
                    ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                    : "bg-slate-100 text-slate-600"
                }`}
                title={`${match.matched.length} of ${required.length} required skills matched`}
              >
                <Sparkles size={11} className="text-amber-500" />
                {match.percent}% match
              </span>
            )}

            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                project.isOpen
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {project.isOpen ? "Open" : "Closed"}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#00072D] transition-colors leading-snug">
          {project.title}
        </h3>

        {/* Role recruitment announcement */}
        {project.targetRole && (
          <p className="mt-1 text-xs font-semibold text-slate-700">
            Looking for: {project.targetRole}
          </p>
        )}

        {/* Description */}
        <p className="mt-2 text-xs leading-relaxed text-slate-500">{short}</p>

        {/* Skills */}
        <div className="mt-3.5">
          <SkillBadges skills={project.requiredSkills} />
        </div>
      </div>

      <div>
        {/* Team Progress Indicator */}
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <Users size={13} className="text-amber-500" />
              {totalMembers} of {teamSize} members
              {existingMembers > 0 && (
                <span className="text-[10px] text-slate-400">({existingMembers} offline)</span>
              )}
            </span>
            {project.isOpen && spotsLeft > 0 ? (
              <span className="text-[11px] font-bold text-[#00072D]">
                {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
              </span>
            ) : !project.isOpen ? (
              <span className="text-[11px] font-semibold text-slate-400">Team full</span>
            ) : null}
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-all ${
                fillPercent >= 100
                  ? "bg-slate-400"
                  : fillPercent >= 70
                  ? "bg-amber-400"
                  : "bg-[#00072D]"
              }`}
              style={{ width: `${Math.min(100, fillPercent)}%` }}
            />
          </div>
        </div>

        {/* Footer Meta */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          {deadlineDate && (
            <span className="inline-flex items-center gap-1">
              <Calendar size={12} />
              Due {deadlineDate}
            </span>
          )}
          {project.creatorId?.name && (
            <span className="text-slate-500 font-medium">
              by {project.creatorId.name}
              {project.creatorId.college ? ` · ${project.creatorId.college}` : ""}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
