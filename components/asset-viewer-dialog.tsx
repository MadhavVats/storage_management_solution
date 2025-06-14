"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "./ui/dialog"
import { AnnotatedImage } from "./annotated-image"
import CommentsSystem from "../comments-system"
import { MuxVideoPlayer } from "./MuxVideoPlayer"

type AssetType = 'image' | 'video'

interface AssetViewerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  src: string
  name: string
  type: AssetType
  muxPlaybackId?: string
  muxStatus?: 'preparing' | 'ready' | 'errored'
  muxThumbnail?: string
}

export function AssetViewerDialog({
  open,
  onOpenChange,
  src,
  name,
  type,
  muxPlaybackId,
  muxStatus,
  muxThumbnail,
}: AssetViewerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[95vh] p-0 overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">
          {`Viewing ${name}`}
        </DialogTitle>
        <div className="flex-1 flex items-center justify-center min-h-0">
          {type === 'image' ? (
            <CommentsSystem src={src} name={name} />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-6">
              {muxPlaybackId ? (
                <MuxVideoPlayer
                  playbackId={muxPlaybackId}
                  muxStatus={muxStatus || 'ready'}
                  thumbnail={muxThumbnail}
                  title={name}
                  className="w-full h-full"
                  metadata={{
                    video_title: name,
                  }}
                />
              ) : (
                <video
                  src={src}
                  controls
                  className="max-w-full max-h-full object-contain"
                  controlsList="nodownload"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function useAssetViewer() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [asset, setAsset] = React.useState<{
    src: string
    name: string
    type: AssetType
    muxPlaybackId?: string
    muxStatus?: 'preparing' | 'ready' | 'errored'
    muxThumbnail?: string
  } | null>(null)

  const openAsset = (
    src: string, 
    name: string, 
    type: AssetType, 
    muxPlaybackId?: string,
    muxStatus?: 'preparing' | 'ready' | 'errored',
    muxThumbnail?: string
  ) => {
    setAsset({ src, name, type, muxPlaybackId, muxStatus, muxThumbnail })
    setIsOpen(true)
  }

  const closeAsset = () => {
    setIsOpen(false)
    // Small delay to allow the dialog to close before clearing the asset
    setTimeout(() => setAsset(null), 300)
  }

  const AssetViewer = () => {
    if (!asset) return null
    
    return (
      <AssetViewerDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        src={asset.src}
        name={asset.name}
        type={asset.type}
        muxPlaybackId={asset.muxPlaybackId}
        muxStatus={asset.muxStatus}
        muxThumbnail={asset.muxThumbnail}
      />
    )
  }

  return {
    AssetViewer,
    openAsset,
    closeAsset,
    isOpen
  }
}

// Helper function to determine if a file is an image or video
export function getFileType(filename: string, mimeType?: string): AssetType | null {
  if (mimeType) {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    return null
  }
  
  // Fallback to extension if mime type is not provided
  const extension = filename.split('.').pop()?.toLowerCase()
  if (!extension) return null
  
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv']
  
  if (imageExtensions.includes(extension)) return 'image'
  if (videoExtensions.includes(extension)) return 'video'
  
  return null
}
