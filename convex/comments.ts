import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper to recursively fetch replies (if your schema stores them flatly)
// This is a conceptual helper. Actual fetching might be more complex
// depending on how you structure replies and want to limit depth/recursion.
async function fetchReplies(db: any, commentId: Id<"comments">): Promise<any[]> {
  const replies = await db
    .query("comments")
    .withIndex("by_parentId", (q: any) => q.eq("parentId", commentId))
    .collect();
  
  for (const reply of replies) {
    reply.replies = await fetchReplies(db, reply._id);
  }
  return replies;
}

// Query to get all comments for a specific document
export const getComments = query({
  args: {
    documentId: v.optional(v.string()),
    documentSrc: v.optional(v.string()) 
  },
  handler: async (ctx, args) => {
    let comments;
    
    if (args.documentId) {
      comments = await ctx.db
        .query("comments")
        .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
        .order("desc")
        .collect();
    } else if (args.documentSrc) {
      comments = await ctx.db
        .query("comments")
        .filter((q) => q.eq(q.field("documentSrc"), args.documentSrc))
        .order("desc")
        .collect();
    } else {
      // Get all comments if no filter specified
      comments = await ctx.db
        .query("comments")
        .withIndex("by_timestamp")
        .order("desc")
        .collect();
    }

    // Organize comments into a hierarchical structure
    const topLevelComments = comments.filter(comment => !comment.parentId);
    const replies = comments.filter(comment => comment.parentId);

    // Build the comment tree
    return topLevelComments.map(comment => ({
      ...comment,
      replies: replies
        .filter(reply => reply.parentId === comment._id)
        .sort((a, b) => a.timestamp - b.timestamp) // Sort replies chronologically
    }));
  },
});

// Mutation to add a new comment
export const addComment = mutation({
  args: {
    content: v.string(),
    authorName: v.string(),
    authorInitials: v.string(),
    authorAvatar: v.optional(v.string()),
    documentSrc: v.optional(v.string()),
    documentId: v.optional(v.string()),
    annotationData: v.optional(v.any()), // Add annotationData here
  },
  handler: async (ctx, args) => {
    const commentId = await ctx.db.insert("comments", {
      content: args.content,
      authorName: args.authorName,
      authorInitials: args.authorInitials,
      authorAvatar: args.authorAvatar,
      timestamp: Date.now(),
      resolved: false,
      documentSrc: args.documentSrc,
      documentId: args.documentId,
      annotationData: args.annotationData, // Persist annotationData
      // parentId is not set here, as this is a top-level comment
    });
    return commentId;
  },
});

// Mutation to resolve/unresolve a comment
export const toggleResolveComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }
    
    await ctx.db.patch(args.commentId, {
      resolved: !comment.resolved,
    });
    
    return args.commentId;
  },
});

// Mutation to delete a comment
export const deleteComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    // First, delete all replies to this comment
    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentId", args.commentId))
      .collect();
    
    for (const reply of replies) {
      await ctx.db.delete(reply._id);
    }
    
    // Then delete the comment itself
    await ctx.db.delete(args.commentId);
    
    return args.commentId;
  },
});

// Mutation to add a reply to a comment
export const addReply = mutation({
  args: {
    parentId: v.id("comments"),
    content: v.string(),
    authorName: v.string(),
    authorInitials: v.string(),
    authorAvatar: v.optional(v.string()),
    // annotationData is not typically added to replies directly, but could be if needed
  },
  handler: async (ctx, args) => {
    // Get the parent comment to inherit document info
    const parentComment = await ctx.db.get(args.parentId);
    if (!parentComment) {
      throw new Error("Parent comment not found");
    }
    
    const replyId = await ctx.db.insert("comments", {
      content: args.content,
      timestamp: Date.now(),
      resolved: false,
      authorName: args.authorName,
      authorAvatar: args.authorAvatar,
      authorInitials: args.authorInitials,
      parentId: args.parentId,
      documentId: parentComment.documentId,
      documentSrc: parentComment.documentSrc,
    });
    
    return replyId;
  },
});