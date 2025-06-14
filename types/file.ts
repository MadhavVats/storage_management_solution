// Shared file document interface that works with both Convex and Appwrite
export interface FileDocument {
  _id?: string;
  $id?: string;
  name: string;
  extension: string;
  url: string;
  type: string;
  size: number;
  storageId: string;
  owner?: any;
  users?: string[];
  _creationTime?: number;
  $createdAt?: string;
  $updatedAt?: string;
  muxAssetId?: string;
  muxPlaybackId?: string;
  muxStatus?: "preparing" | "ready" | "errored";
  muxUploadId?: string;
  muxThumbnail?: string;
  [key: string]: any;
}
