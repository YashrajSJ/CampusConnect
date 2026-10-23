import express from "express";
import { PREDEFINED_SKILLS } from "../constants/skills.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import JoinRequest from "../models/JoinRequest.js";

const router = express.Router();

router.get("/me", async (req, res) => {
  try {
    const createdCount = await Project.countDocuments({ creatorId: req.dbUser._id });
    const teamsJoinedCount = await Project.countDocuments({
      members: req.dbUser._id,
      creatorId: { $ne: req.dbUser._id },
    });

    res.json({
      user: req.dbUser,
      metrics: {
        projectsCreated: createdCount,
        teamsJoined: teamsJoinedCount,
        activeMemberships: teamsJoinedCount,
      },
    });
  } catch (err) {
    console.error("GET /api/users/me error:", err);
    res.status(500).json({ message: "Failed to load user info" });
  }
});

router.get("/me/notifications", async (req, res) => {
  try {
    const userId = req.dbUser._id;

    // Get all projects owned by this user
    const ownedProjects = await Project.find({ creatorId: userId }).select("_id title").lean();
    const projectIds = ownedProjects.map((p) => p._id);

    if (projectIds.length === 0) {
      return res.json({ notifications: [], count: 0 });
    }

    // Get all pending join requests for those projects
    const pendingRequests = await JoinRequest.find({
      projectId: { $in: projectIds },
      status: "pending",
    })
      .populate("studentId", "name email college branch year skills")
      .sort({ createdAt: -1 })
      .lean();

    // Attach project title to each request
    const projectMap = {};
    ownedProjects.forEach((p) => { projectMap[p._id.toString()] = p.title; });

    const notifications = pendingRequests.map((req) => ({
      ...req,
      projectTitle: projectMap[req.projectId.toString()] || "Unknown project",
    }));

    res.json({ notifications, count: notifications.length });
  } catch (err) {
    console.error("GET /api/users/me/notifications error:", err);
    res.status(500).json({ message: "Failed to load notifications" });
  }
});

router.get("/me/dashboard", async (req, res) => {
  try {
    const userId = req.dbUser._id;
    const userSkills = new Set(req.dbUser.skills || []);

    const [createdProjects, applications, createdCount, teamsJoinedCount] = await Promise.all([
      Project.find({ creatorId: userId }).sort({ createdAt: -1 }).lean(),
      JoinRequest.find({ studentId: userId })
        .populate("projectId", "title isOpen category deadline targetRole stage")
        .sort({ updatedAt: -1 })
        .lean(),
      Project.countDocuments({ creatorId: userId }),
      Project.countDocuments({ members: userId, creatorId: { $ne: userId } }),
    ]);

    // Get pending request counts per created project
    const projectIds = (createdProjects || []).map((p) => p._id);
    const pendingCounts = projectIds.length
      ? await JoinRequest.aggregate([
          { $match: { projectId: { $in: projectIds }, status: "pending" } },
          { $group: { _id: "$projectId", count: { $sum: 1 } } },
        ])
      : [];

    const pendingCountMap = {};
    pendingCounts.forEach(({ _id, count }) => {
      pendingCountMap[_id.toString()] = count;
    });

    // Recommended projects for current user (top 3 open projects user hasn't joined and doesn't own)
    const openCandidates = await Project.find({
      creatorId: { $ne: userId },
      members: { $ne: userId },
      isOpen: true,
      deadline: { $gte: new Date() },
    })
      .populate("creatorId", "name college")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const recommendedProjects = openCandidates
      .map((proj) => {
        const required = proj.requiredSkills || [];
        const matched = required.filter((s) => userSkills.has(s));
        const missing = required.filter((s) => !userSkills.has(s));
        const percent = required.length ? Math.round((matched.length / required.length) * 100) : 100;
        return {
          ...proj,
          match: { percent, matched, missing },
        };
      })
      .sort((a, b) => b.match.percent - a.match.percent || new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

    // Recent activity (e.g. applications updated or new requests received)
    const incomingPending = projectIds.length
      ? await JoinRequest.find({ projectId: { $in: projectIds } })
          .populate("studentId", "name college branch")
          .populate("projectId", "title")
          .sort({ updatedAt: -1 })
          .limit(5)
          .lean()
      : [];

    const activity = [
      ...incomingPending.map((req) => ({
        id: req._id,
        type: `request_${req.status}`,
        title:
          req.status === "pending"
            ? `${req.studentId?.name || "A student"} requested to join ${req.projectId?.title || "your project"}`
            : `${req.studentId?.name || "Applicant"} was ${req.status} for ${req.projectId?.title || "your project"}`,
        subtitle: req.appliedRole ? `Role: ${req.appliedRole}` : req.studentId?.college || "",
        date: req.updatedAt || req.createdAt,
        link: req.projectId?._id ? `/projects/${req.projectId._id}/requests` : null,
      })),
      ...(applications || []).slice(0, 5).map((app) => ({
        id: app._id,
        type: `application_${app.status}`,
        title:
          app.status === "accepted"
            ? `Your request to join ${app.projectId?.title || "a project"} was accepted! 🎉`
            : app.status === "rejected"
            ? `Your application for ${app.projectId?.title || "a project"} was not selected.`
            : `Application sent for ${app.projectId?.title || "a project"} (pending review)`,
        subtitle: app.status === "accepted" ? "You are now a team member" : "",
        date: app.updatedAt || app.createdAt,
        link: app.projectId?._id ? `/projects/${app.projectId._id}` : null,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // Approaching deadlines (created projects due within 7 days)
    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);
    const expiringSoon = createdProjects.filter(
      (p) => p.isOpen && new Date(p.deadline) > new Date() && new Date(p.deadline) <= in7Days
    );

    res.json({
      user: req.dbUser,
      metrics: {
        projectsCreated: createdCount,
        teamsJoined: teamsJoinedCount,
        activeMemberships: teamsJoinedCount,
      },
      createdProjects: (createdProjects || []).map((p) => ({
        ...p,
        pendingRequestsCount: pendingCountMap[p._id.toString()] || 0,
      })),
      applications: (applications || []).map((app) => ({
        _id: app._id,
        status: app.status,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        message: app.message,
        appliedRole: app.appliedRole,
        projectTitle: app.projectId?.title || "Deleted project",
        projectId: app.projectId?._id,
        projectIsOpen: app.projectId?.isOpen,
      })),
      recommendedProjects,
      recentActivity: activity,
      expiringSoonProjects: expiringSoon.map((p) => ({
        _id: p._id,
        title: p.title,
        deadline: p.deadline,
      })),
    });
  } catch (err) {
    console.error("GET /api/users/me/dashboard error:", err);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const {
      name,
      college,
      branch,
      year,
      bio,
      headline,
      preferredRoles,
      isOpenToCollaborate,
      commitment,
      skills,
      interests,
      github,
      linkedin,
    } = req.body;

    if (skills && !Array.isArray(skills)) {
      return res.status(400).json({ message: "Skills must be an array" });
    }

    if (skills) {
      const invalid = skills.filter((s) => !PREDEFINED_SKILLS.includes(s));
      if (invalid.length) {
        return res.status(400).json({ message: "Invalid skills selected" });
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.dbUser._id,
      {
        name: name ?? req.dbUser.name,
        college: college ?? req.dbUser.college,
        branch: branch ?? req.dbUser.branch,
        year: year ?? req.dbUser.year,
        bio: bio ?? req.dbUser.bio,
        headline: headline ?? req.dbUser.headline,
        preferredRoles: Array.isArray(preferredRoles) ? preferredRoles : req.dbUser.preferredRoles,
        isOpenToCollaborate:
          isOpenToCollaborate !== undefined ? Boolean(isOpenToCollaborate) : req.dbUser.isOpenToCollaborate,
        commitment: commitment ?? req.dbUser.commitment,
        skills: skills ?? req.dbUser.skills,
        interests: Array.isArray(interests)
          ? interests
          : typeof interests === "string"
            ? interests
                .split(",")
                .map((i) => i.trim())
                .filter(Boolean)
            : req.dbUser.interests,
        github: github ?? req.dbUser.github,
        linkedin: linkedin ?? req.dbUser.linkedin,
      },
      { new: true }
    );

    res.json({ user: updated });
  } catch (err) {
    console.error("PUT /api/users/profile error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;
