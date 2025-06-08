"use server";

import { constructConvexFileUrl, getFileType, parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { getCurrentUserFromClerk } from "@/lib/actions/clerk.actions";
import { convex } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) => {
  try {
    // Generate upload URL from Convex
    const postUrl = await convex.mutation(api.files.generateUploadUrl);

    // Upload the file to Convex storage
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    const { storageId } = await result.json();

    // Save file metadata to Convex database
    const fileType = getFileType(file.name);
    const fileDocument = {
      type: fileType.type as "document" | "image" | "video" | "audio" | "other",
      name: file.name,
      extension: fileType.extension,
      size: file.size,
      storageId,
      owner: ownerId,
      accountId,
      users: [],
    };

    const newFileId = await convex.mutation(api.files.createFile, fileDocument);

    revalidatePath(path);
    return parseStringify({ success: true, fileId: newFileId });
  } catch (error) {
    handleError(error, "Failed to upload file");
  }
};

export const getFiles = async ({
  types = [],
  searchText = "",
  sort = "$createdAt-desc",
  limit,
}: GetFilesProps) => {
  try {
    const currentUser = await getCurrentUserFromClerk();

    if (!currentUser) throw new Error("User not authenticated");

    const files = await convex.query(api.files.getUserFiles, {
      userEmail: currentUser.email,
      userId: currentUser.$id,
      types,
      searchText,
      sort,
      limit,
    });

    console.log({ files });
    return parseStringify({ documents: files, total: files.length });
  } catch (error) {
    handleError(error, "Failed to get files");
  }
};

export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: RenameFileProps) => {
  try {
    const newName = `${name}.${extension}`;
    await convex.mutation(api.files.renameFile, {
      fileId: fileId as Id<"files">,
      name: newName,
    });

    revalidatePath(path);
    return parseStringify({ success: true });
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

export const updateFileUsers = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {
  try {
    await convex.mutation(api.files.updateFileUsers, {
      fileId: fileId as Id<"files">,
      users: emails,
    });

    revalidatePath(path);
    return parseStringify({ success: true });
  } catch (error) {
    handleError(error, "Failed to update file users");
  }
};

export const deleteFile = async ({
  fileId,
  storageId,
  path,
}: DeleteFileProps) => {
  try {
    await convex.mutation(api.files.deleteFile, {
      fileId: fileId as Id<"files">,
      storageId: storageId!,
    });

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to delete file");
  }
};

// ============================== TOTAL FILE SPACE USED
export async function getTotalSpaceUsed() {
  try {
    const currentUser = await getCurrentUserFromClerk();
    if (!currentUser) throw new Error("User not authenticated");

    const totalSpace = await convex.query(api.files.getTotalSpaceUsed, {
      userId: currentUser.$id,
    });

    return parseStringify(totalSpace);
  } catch (error) {
    handleError(error, "Error calculating total space used: ");
  }
}
