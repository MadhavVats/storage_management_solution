"use client"

import { Models } from "node-appwrite"
import { useAssetViewer, getFileType } from "../../components/asset-viewer-dialog"
import { Thumbnail } from "../Thumbnail"
import { FormattedDateTime } from "../FormattedDateTime"
import ActionDropdown from "../ActionDropdown"

interface RecentFilesProps {
  files: Models.Document[]
}

export function RecentFiles({ files }: RecentFilesProps) {
  const { AssetViewer, openAsset } = useAssetViewer()

  const handleFileClick = (file: Models.Document) => {
    const fileType = getFileType(file.name, file.mimeType)
    if (fileType) {
      openAsset(
        file.url,
        file.name,
        fileType
      )
    }
  }

  if (files.length === 0) {
    return <p className="empty-list">No files uploaded</p>
  }

  return (
    <>
      <div className="mt-5 flex flex-col gap-5">
        {files.map((file: Models.Document) => (
          <div
            key={file.$id}
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
              />
              {/* Container for text details */}
              <div className="recent-file-details flex-1 min-w-0">
                <p className="recent-file-name truncate font-medium text-sm">
                  {file.name}
                </p>
                {/* Container for date and size */}
                <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                  <FormattedDateTime date={file.$createdAt} />
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
