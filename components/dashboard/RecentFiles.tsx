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
    openAsset(
      file.url,
      file.name,
      getFileType(file.name, file.mimeType),
      file.mimeType
    )
  }

  if (files.length === 0) {
    return <p className="empty-list">No files uploaded</p>
  }

  return (
    <>
      <ul className="mt-5 flex flex-col gap-5">
        {files.map((file: Models.Document) => (
          <div 
            key={file.$id} 
            className="flex items-center gap-3 hover:bg-accent/50 p-2 rounded-lg transition-colors cursor-pointer"
            onClick={() => handleFileClick(file)}
          >
            <Thumbnail
              type={file.type}
              extension={file.extension}
              url={file.url}
            />

            <div className="recent-file-details flex-1">
              <div className="flex items-center justify-between">
                <p className="recent-file-name">{file.name}</p>
                <ActionDropdown file={file} />
              </div>
              <div className="flex items-center justify-between mt-1">
                <FormattedDateTime date={file.$createdAt} className="caption" />
                <span className="text-xs text-muted-foreground">
                  {file.size ? (Number(file.size) / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </ul>
      <AssetViewer />
    </>
  )
}
