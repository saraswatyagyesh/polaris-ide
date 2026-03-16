import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { verifyAuth } from "./auth";


export const create = mutation({
    args: {
        name: v.string(),
        importStatus: v.union(v.literal("importing"), v.literal("completed"), v.literal("failed")),
        exportStatus: v.optional(v.union(v.literal("exporting"), v.literal("completed"), v.literal("failed"), v.literal("cancelled"))),
    },
    handler: async (ctx, args) => {

        const identity = await verifyAuth(ctx);

        const projectId = await ctx.db.insert("projects", {
            name: args.name,
            ownerId: identity.subject,
            updatedAt: Date.now(),
            importStatus: args.importStatus,
            exportStatus: args.exportStatus
        });

        return projectId;
    },
});

export const getPartial = query({
    args: { limit: v.number(), }, handler: async (ctx, args) => {

        const identity = await verifyAuth(ctx);

        return await ctx.db.query("projects").withIndex("by_owner", (q) => q.eq("ownerId", identity.subject)).take(args.limit);
    },
});

export const get = query({
    args: {}, handler: async (ctx) => {

        const identity = await verifyAuth(ctx);

        return await ctx.db.query("projects").withIndex("by_owner", (q) => q.eq("ownerId", identity.subject)).collect();
    },
});

export const getById = query({
    args: { id: v.id("projects") }, handler: async (ctx, args) => {

        const identity = await verifyAuth(ctx);
        const project = await ctx.db.get("projects", args.id)

        // return await ctx.db.query("projects").withIndex("by_owner", (q) => q.eq("ownerId", identity.subject)).collect(); <-- DELETED

        if (!project) { throw new Error("Project not found") }
        if (project.ownerId !== identity.subject) { throw new Error("Unauthorized access to this project"); }

        return project;
    },
});

export const rename = mutation({
    args: { id: v.id("projects"), name: v.string(), }, handler: async (ctx, args) => {

        const identity = await verifyAuth(ctx);
        const project = await ctx.db.get("projects", args.id)

        // return await ctx.db.query("projects").withIndex("by_owner", (q) => q.eq("ownerId", identity.subject)).collect(); <-- DELETED

        if (!project) { throw new Error("Project not found") }
        if (project.ownerId !== identity.subject) { throw new Error("Unauthorized access to this project"); }

        await ctx.db.patch("projects", args.id, { name: args.name, updatedAt: Date.now(), });
    },
}); 