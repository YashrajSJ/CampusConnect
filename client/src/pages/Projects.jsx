import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpDown,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import api from "../api/client.js";
import ProjectCard from "../components/ProjectCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Loader from "../components/Loader.jsx";
import {
  PREDEFINED_SKILLS,
  PROJECT_CATEGORIES,
  PROJECT_ROLES,
} from "../constants/skills.js";
import { getSkillMatch } from "../utils/skillMatch.js";

const PAGE_SIZE = 12;

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [role, setRole] = useState("All");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest", "match", "deadline"
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");

  async function handleSeedDemoProjects() {
    setSeeding(true);
    setError("");
    try {
      await api.get("/dev/seed-projects");
      setPage(1);
      const params = {
        q,
        category,
        role,
        skills: selectedSkill || undefined,
        sort: sortBy === "match" ? "newest" : sortBy,
        page: 1,
        limit: PAGE_SIZE,
      };
      const res = await api.get("/projects", { params });
      setProjects(res.data.projects || []);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to seed demo projects. Make sure the server is running.");
    } finally {
      setSeeding(false);
    }
  }

  // Load current user profile for skill-matching
  useEffect(() => {
    api
      .get("/users/me")
      .then((res) => setCurrentUser(res.data.user))
      .catch(() => {});
  }, []);

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    setPage(1);
  }, [q, category, role, selectedSkill, sortBy]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = {
          q,
          category,
          role,
          skills: selectedSkill || undefined,
          sort: sortBy === "match" ? "newest" : sortBy,
          page,
          limit: PAGE_SIZE,
        };

        const res = await api.get("/projects", { params });
        let list = res.data.projects || [];

        // If sort by best match is requested, sort locally based on user skills
        if (sortBy === "match" && currentUser?.skills?.length) {
          list = [...list].sort((a, b) => {
            const matchA = getSkillMatch(currentUser.skills, a.requiredSkills || []).percent;
            const matchB = getSkillMatch(currentUser.skills, b.requiredSkills || []).percent;
            return matchB - matchA;
          });
        }

        setProjects(list);
        setPagination(res.data.pagination);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [q, category, role, selectedSkill, sortBy, page, currentUser]);

  const userSkills = currentUser?.skills || [];
  const hasActiveFilters =
    q || category !== "All" || role !== "All" || selectedSkill || sortBy !== "newest";

  function clearAllFilters() {
    setQ("");
    setCategory("All");
    setRole("All");
    setSelectedSkill("");
    setSortBy("newest");
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-200/80 px-3 py-1 text-xs font-semibold text-slate-700">
              Campus Collaborations
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Open Projects
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Find an open team that matches your skills, or connect with creators to build together.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSeedDemoProjects}
            disabled={seeding}
            title="Pre-feed 15 realistic campus projects for teacher presentation"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-50"
          >
            <Sparkles size={14} className="text-amber-500" />
            {seeding ? "Seeding..." : "Seed 15 Projects"}
          </button>
          <Link
            to="/projects/create"
            className="inline-flex items-center gap-2 rounded-xl bg-[#00072D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0a1744] transition-colors shadow-sm"
          >
            <Plus size={16} /> Create Project
          </Link>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-xs">
        {/* Row 1: Search & Core Dropdowns */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search projects by title, stack, or description..."
              className="w-full rounded-xl border border-slate-300/80 bg-slate-200/60 py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative">
            <SlidersHorizontal
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none rounded-xl border border-slate-300/80 bg-slate-200/60 py-2.5 pl-8 pr-8 text-xs font-medium text-slate-700 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 cursor-pointer shadow-2xs"
            >
              <option value="All">All Categories</option>
              {PROJECT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Briefcase
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="appearance-none rounded-xl border border-slate-300/80 bg-slate-200/60 py-2.5 pl-8 pr-8 text-xs font-medium text-slate-700 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 cursor-pointer shadow-2xs"
            >
              <option value="All">All Roles</option>
              {PROJECT_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Menu */}
          <div className="relative">
            <ArrowUpDown
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none rounded-xl border border-slate-300/80 bg-slate-200/60 py-2.5 pl-8 pr-8 text-xs font-medium text-slate-700 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 cursor-pointer shadow-2xs"
            >
              <option value="newest">Newest First</option>
              <option value="match">Best Skill Match ✨</option>
              <option value="deadline">Nearest Deadline ⏳</option>
            </select>
          </div>
        </div>

        {/* Row 2: Skill Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200 text-xs">
          <span className="font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter size={11} /> Filter Skill:
          </span>
          <button
            type="button"
            onClick={() => setSelectedSkill("")}
            className={`rounded-full px-2.5 py-0.5 text-xs transition ${
              !selectedSkill
                ? "bg-slate-900 text-white font-medium shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Any
          </button>
          {PREDEFINED_SKILLS.map((skill) => {
            const active = selectedSkill === skill;
            return (
              <button
                key={skill}
                type="button"
                onClick={() => setSelectedSkill(active ? "" : skill)}
                className={`rounded-full px-2.5 py-0.5 text-xs transition ${
                  active
                    ? "bg-[#00072D] text-white font-semibold shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {skill}
              </button>
            );
          })}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="ml-auto text-xs font-semibold text-rose-600 hover:text-rose-800"
            >
              Reset all
            </button>
          )}
        </div>
      </div>

      {/* ── Results Display ── */}
      {loading ? (
        <Loader label="Searching open campus projects..." />
      ) : error ? (
        <div className="rounded-xl bg-rose-50 p-6 text-center">
          <p className="text-rose-700 text-sm font-medium">{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No open projects found"
          subtitle={
            hasActiveFilters
              ? "No open projects matched your active filters. Try clearing some filters or searching for different keywords."
              : "No campus projects are currently recruiting. Be the first to start a team!"
          }
          action={
            hasActiveFilters ? (
              <button
                onClick={clearAllFilters}
                className="rounded-xl bg-[#00072D] px-4 py-2 text-xs font-medium text-white hover:bg-[#0a1744]"
              >
                Clear all filters
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <Link
                  to="/projects/create"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#00072D] px-4 py-2 text-xs font-medium text-white hover:bg-[#0a1744]"
                >
                  <Plus size={14} /> Create a Project
                </Link>
                <button
                  type="button"
                  onClick={handleSeedDemoProjects}
                  disabled={seeding}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs disabled:opacity-50"
                >
                  <Sparkles size={13} className="text-amber-500" />
                  {seeding ? "Seeding 15 Projects..." : "Seed 15 Sample Campus Projects"}
                </button>
              </div>
            )
          }
        />
      ) : (
        <>
          {/* Header count caption */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <p>
              Showing {projects.length} project{projects.length !== 1 ? "s" : ""}
              {category !== "All" ? ` in "${category}"` : ""}
              {role !== "All" ? ` looking for "${role}"` : ""}
              {selectedSkill ? ` requiring ${selectedSkill}` : ""}
              {q ? ` matching "${q}"` : ""}
            </p>
            {userSkills.length > 0 && (
              <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                <Sparkles size={11} className="text-amber-500" /> Matches calculated from your profile skills
              </span>
            )}
          </div>

          {/* Single-Result Balanced Experience vs Multi-Result Grid */}
          {projects.length === 1 ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="max-w-xl">
                <ProjectCard
                  project={projects[0]}
                  userSkills={userSkills}
                />
              </div>

              {/* Balanced discovery card so single project isn't stretched or left alone */}
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-6 flex flex-col justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    💡 Can't find the exact match?
                  </span>
                  <h3 className="mt-3 text-base font-bold text-slate-900">
                    Start your own project and recruit campus teammates!
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Have an idea for a hackathon, course project, or open-source repo? Create a listing with the exact roles and skills you need, and review interested classmates.
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    to="/projects/create"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00072D] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0a1744] transition shadow-sm"
                  >
                    <Plus size={14} /> Create a Project Now
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  userSkills={userSkills}
                />
              ))}
            </div>
          )}

          {/* Pagination controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="text-xs font-medium text-slate-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNext}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
