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