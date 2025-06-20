"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import { useAssetViewer, getFileType } from "../../components/asset-viewer-dialog"
import { Thumbnail } from "../Thumbnail"
import { FormattedDateTime } from "../FormattedDateTime"
import ActionDropdown from "../ActionDropdown"

interface RecentFilesProps {
  limit?: number
}

export function RecentFiles({ limit = 10 }: RecentFilesProps) {
  const { user } = useUser()
  const { AssetViewer, openAsset } = useAssetViewer()

  // Use Convex real-time query instead of static props
  const files = useQuery(
    api.files.getUserFiles,
    user?.id ? {
      userEmail: user.emailAddresses[0]?.emailAddress || "",
      userId: user.id,
      types: [],
      searchText: "",
      sort: "$createdAt-desc",
      limit
    } : "skip"
  )

  const handleFileClick = (file: any) => {
    const fileType = getFileType(file.name, file.mimeType)
    if (fileType) {
      // Check if it's a Mux video
      const muxPlaybackId = file.muxPlaybackId
      const muxStatus = file.muxStatus
      const muxThumbnail = file.muxThumbnail
      
      openAsset(
        file.url,
        file.name,
        fileType,
        muxPlaybackId,
        muxStatus,
        muxThumbnail
      )
    }
  }

  // Show loading state
  if (!user) {
    return <p className="empty-list">Please sign in to view files</p>
  }

  if (files === undefined) {
    return <p className="empty-list">Loading files...</p>
  }

  if (files.length === 0) {
    return <p className="empty-list">No files uploaded</p>
  }

  return (
    <>
      <div className="mt-5 flex flex-col gap-5">
        {files.map((file: any) => (
          <div
            key={file._id}
            className="flex items-center justify-between gap-3 hover:bg-accent/50 p-2 rounded-lg transition-colors"
          >
            {/* Clickable area for file info and opening */}
            <div
              className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
              onClick={() => handleFileClick(file)}
            >
              <Thumbnail
                type={file.type}
                extension={file.extension}
                url={file.url}
                muxPlaybackId={file.muxPlaybackId}
                muxStatus={file.muxStatus}
                muxThumbnail={file.muxThumbnail}
              />
              {/* Container for text details */}
              <div className="recent-file-details flex-1 min-w-0">
                <p className="recent-file-name truncate font-medium text-sm">
                  {file.name}
                </p>
                {/* Container for date and size */}
                <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                  <FormattedDateTime date={file._creationTime} />
                  <span>
                    {file.size ? (Number(file.size) / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Dropdown, pushed to the far right by justify-between on parent */}
            <div className="flex-shrink-0">
              <ActionDropdown file={file} />
            </div>
          </div>
        ))}
      </div>
      <AssetViewer />
    </>
  )
}
