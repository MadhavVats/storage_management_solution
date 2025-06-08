import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // File storage and management
  files: defineTable({
    // File metadata
    name: v.string(),
    type: v.union(v.literal("document"), v.literal("image"), v.literal("video"), v.literal("audio"), v.literal("other")),
    extension: v.string(),
    size: v.number(),
    url: v.string(), // Convex file URL
    
    // File storage reference
    storageId: v.string(), // Convex storage ID
    
    // Ownership and access control
    owner: v.string(), // User ID who owns the file
    accountId: v.string(), // Account ID for organization
    users: v.array(v.string()), // Array of user emails who have access
  })
    .index("by_owner", ["owner"])
    .index("by_type", ["type"])
    .index("by_accountId", ["accountId"])
    .index("by_owner_and_type", ["owner", "type"])
    .searchIndex("search_files", {
      searchField: "name",
      filterFields: ["type", "owner", "accountId"]
    }),

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

    // New field for Annotorious data
    annotationData: v.optional(v.any()),
  })
    .index("by_document", ["documentId"])
    .index("by_parent", ["parentId"])
    .index("by_timestamp", ["timestamp"]),
});