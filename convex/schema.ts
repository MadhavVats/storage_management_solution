import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  comments: defineTable({
    // Comment content and metadata
    content: v.string(),
    timestamp: v.number(), // Unix timestamp for consistent sorting
    resolved: v.boolean(),
    
    // Author information
    authorName: v.string(),
    authorAvatar: v.optional(v.string()),
    authorInitials: v.string(),
    
    // For threading/replies - if null, it's a top-level comment
    parentId: v.optional(v.id("comments")),
    
    // Associated file/document (you can link this to your file management system)
    documentId: v.optional(v.string()), // This could be the file ID or name
    documentSrc: v.optional(v.string()), // The file source URL
  })
    .index("by_document", ["documentId"])
    .index("by_parent", ["parentId"])
    .index("by_timestamp", ["timestamp"]),
});