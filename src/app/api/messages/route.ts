import { z } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { convex } from "@/lib/convex-client";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

const requestSchema = z.object({ conversationId: z.string(), message: z.string(), });

export async function POST(request: Request) {

    const { userId } = await auth();
    if (!userId) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

    const internalKey = process.env.CONVEX_INTERNAL_KEY;
    if (!internalKey) { return NextResponse.json({ error: "Internal key not configured" }, { status: 500 }); }

    const body = await request.json();
    const { conversationId, message } = requestSchema.parse(body);

    // Call convex mutation query
    const conversation = await convex.query(api.system.getConversationById, { conversationId: conversationId as Id<"conversations">, internalKey });
    if (!conversation) { return NextResponse.json({ eror: "Conversation not found" }, { status: 404 }); }
    const projectId = conversation.projectId;

    await convex.mutation(api.system.createMessage, {
        internalKey,
        conversationId: conversationId as Id<"conversations">,
        projectId,
        role: "user",
        content: message,
    });

    const assistantMessageId = await convex.mutation(api.system.createMessage, {
        internalKey,
        conversationId: conversationId as Id<"conversations">,
        projectId,
        role: "assistant",
        content: "",
        status: "processing",
    });

    return NextResponse.json({
        success: true,
        eventId: 0,
        messageId: assistantMessageId,
    });
    // Invoke Inngest background jobs
};