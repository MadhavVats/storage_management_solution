import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Generate upload URL for file storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Create file record after successful upload
export const createFile = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("document"), v.literal("image"), v.literal("video"), v.literal("audio"), v.literal("other")),
    extension: v.string(),
    size: v.number(),
    storageId: v.string(),
    owner: v.string(),
    accountId: v.string(),
    users: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Get the file URL from storage
    const url = await ctx.storage.getUrl(args.storageId);
    
    if (!url) {
      throw new Error("Failed to get file URL");
    }

    // Create file document
    const fileId = await ctx.db.insert("files", {
      name: args.name,
      type: args.type,
      extension: args.extension,
      size: args.size,
      url,
      storageId: args.storageId,
      owner: args.owner,
      accountId: args.accountId,
      users: args.users || [],
    });

    return fileId;
  },
});

// Create file record for Mux video upload
export const createMuxFile = mutation({
  args: {
    name: v.string(),
    size: v.number(),
    storageId: v.string(),
    owner: v.string(),
    accountId: v.string(),
    users: v.optional(v.array(v.string())),
    muxUploadId: v.string(),
    muxAssetId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the file URL from storage
    const url = await ctx.storage.getUrl(args.storageId);
    
    if (!url) {
      throw new Error("Failed to get file URL");
    }

    // Create file document with Mux fields
    const fileId = await ctx.db.insert("files", {
      name: args.name,
      type: "video",
      extension: "mp4", // Default for Mux videos
      size: args.size,
      url,
      storageId: args.storageId,
      owner: args.owner,
      accountId: args.accountId,
      users: args.users || [],
      muxUploadId: args.muxUploadId,
      muxAssetId: args.muxAssetId,
      muxStatus: "preparing",
    });

    return fileId;
  },
});

// Update Mux file status and metadata
export const updateMuxFile = mutation({
  args: {
    fileId: v.id("files"),
    muxAssetId: v.optional(v.string()),
    muxPlaybackId: v.optional(v.string()),
    muxStatus: v.optional(v.union(
      v.literal("preparing"), 
      v.literal("ready"), 
      v.literal("errored")
    )),
    muxThumbnail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { fileId, ...updateData } = args;
    
    // Filter out undefined values
    const updates = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(fileId, updates);
    
    return await ctx.db.get(fileId);
  },
});

// Get files for a user
export const getFiles = query({
  args: {
    owner: v.string(),
    types: v.optional(v.array(v.string())),
    searchText: v.optional(v.string()),
    sort: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("files").withIndex("by_owner", (q) => q.eq("owner", args.owner));

    // Apply type filter if provided
    if (args.types && args.types.length > 0) {
      query = query.filter((q) => {
        return args.types!.some(type => q.eq(q.field("type"), type));
      });
    }

    // Apply search text filter if provided
    if (args.searchText) {
      query = query.filter((q) => q.gte(q.field("name"), args.searchText!));
    }

    // Apply sorting and get results
    let orderedQuery;
    if (args.sort) {
      const [sortBy, orderBy] = args.sort.split("-");
      if (orderBy === "desc") {
        orderedQuery = query.order("desc");
      } else {
        orderedQuery = query.order("asc");
      }
    } else {
      orderedQuery = query.order("desc"); // Default to newest first
    }

    // Apply limit if provided
    let results = await orderedQuery.collect();
    
    if (args.limit) {
      results = results.slice(0, args.limit);
    }

    return results;
  },
});

// Get all files that user has access to (owned + shared)
export const getUserFiles = query({
  args: {
    userEmail: v.string(),
    userId: v.string(),
    types: v.optional(v.array(v.string())),
    searchText: v.optional(v.string()),
    sort: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get files owned by user
    const ownedFiles = await ctx.db
      .query("files")
      .withIndex("by_owner", (q) => q.eq("owner", args.userId))
      .collect();

    // Get files shared with user
    const sharedFiles = await ctx.db
      .query("files")
      .filter((q) => q.neq(q.field("owner"), args.userId))
      .filter((q) => q.gt(q.field("users"), []))
      .collect();

    // Filter shared files to only include those where user has access
    const accessibleSharedFiles = sharedFiles.filter(file => 
      file.users.includes(args.userEmail)
    );

    // Combine and deduplicate
    const allFiles = [...ownedFiles, ...accessibleSharedFiles];

    // Apply filters
    let filteredFiles = allFiles;

    if (args.types && args.types.length > 0) {
      filteredFiles = filteredFiles.filter(file => args.types!.includes(file.type));
    }

    if (args.searchText) {
      filteredFiles = filteredFiles.filter(file => 
        file.name.toLowerCase().includes(args.searchText!.toLowerCase())
      );
    }

    // Sort files
    if (args.sort) {
      const [sortBy, orderBy] = args.sort.split("-");
      filteredFiles.sort((a, b) => {
        const aVal = (a as any)[sortBy] || a._creationTime;
        const bVal = (b as any)[sortBy] || b._creationTime;
        
        if (orderBy === "desc") {
          return bVal > aVal ? 1 : -1;
        } else {
          return aVal > bVal ? 1 : -1;
        }
      });
    } else {
      // Default sort by creation time desc
      filteredFiles.sort((a, b) => b._creationTime - a._creationTime);
    }

    // Apply limit
    if (args.limit) {
      filteredFiles = filteredFiles.slice(0, args.limit);
    }

    return filteredFiles;
  },
});

// Rename file
export const renameFile = mutation({
  args: {
    fileId: v.id("files"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.fileId, {
      name: args.name,
    });
    
    return { success: true };
  },
});

// Update file users (sharing)
export const updateFileUsers = mutation({
  args: {
    fileId: v.id("files"),
    users: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.fileId, {
      users: args.users,
    });
    
    return { success: true };
  },
});

// Delete file
export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    // Delete file from storage
    await ctx.storage.delete(args.storageId);
    
    // Delete file document
    await ctx.db.delete(args.fileId);
    
    return { success: true };
  },
});

// Get total space used by user
export const getTotalSpaceUsed = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("files")
      .withIndex("by_owner", (q) => q.eq("owner", args.userId))
      .collect();

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024, // 2GB available storage
    };

    files.forEach((file) => {
      const fileType = file.type;
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;

      // Update latest date if this file is newer
      const fileDate = new Date(file._creationTime).toISOString();
      if (!totalSpace[fileType].latestDate || fileDate > totalSpace[fileType].latestDate) {
        totalSpace[fileType].latestDate = fileDate;
      }
    });

    return totalSpace;
  },
});

// Get file by ID
export const getFileById = query({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.fileId);
  },
});

// Search files using full-text search
export const searchFiles = query({
  args: {
    searchText: v.string(),
    userId: v.string(),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let searchQuery = ctx.db
      .query("files")
      .withSearchIndex("search_files", (q) => q.search("name", args.searchText));

    if (args.type) {
      searchQuery = searchQuery.filter((q) => q.eq(q.field("type"), args.type));
    }

    // Filter by owner
    searchQuery = searchQuery.filter((q) => q.eq(q.field("owner"), args.userId));

    return await searchQuery.collect();
  },
});

// Get files that need Mux status polling (videos in preparing state)
export const getFilesNeedingMuxPolling = query({
  args: {
    owner: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("files")
      .withIndex("by_owner", (q) => q.eq("owner", args.owner))
      .filter((q) => 
        q.and(
          q.eq(q.field("type"), "video"),
          q.eq(q.field("muxStatus"), "preparing")
        )
      )
      .collect();
  },
});
