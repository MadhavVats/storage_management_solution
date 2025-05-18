"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "./ui/dialog"
import { Annotorious, ImageAnnotator } from '@annotorious/react'
import '@annotorious/react/annotorious-react.css'

type AssetType = 'image' | 'video'

interface AssetViewerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  src: string
  name: string
  type: AssetType
}

export function AssetViewerDialog({
  open,
  onOpenChange,
  src,
  name,
  type,
}: AssetViewerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogTitle className="sr-only">
          {`Viewing ${name}`}
        </DialogTitle>
        <div className="flex items-center justify-center h-full">
          <div className="max-h-[85vh] w-full overflow-y-auto p-4">
            {type === 'image' ? (
              <div className="w-full h-[70vh] max-h-[800px] flex items-center justify-center p-4">
                <div className="relative w-full h-full max-w-full max-h-full">
                  <Annotorious>
                    <ImageAnnotator>
                      <img
                        src={src}
                        alt={name}
                        className="max-w-full max-h-full w-auto h-auto object-contain mx-auto block"
                      />
                    </ImageAnnotator>
                  </Annotorious>
                </div>
              </div>
            ) : (
              <video
                src={src}
                controls
                className="w-full max-h-[80vh] max-w-4xl mx-auto"
                controlsList="nodownload"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
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
  } | null>(null)

  const openAsset = (src: string, name: string, type: AssetType) => {
    setAsset({ src, name, type })
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
