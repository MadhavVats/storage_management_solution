"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "./ui/dialog"
import { FileIcon } from "lucide-react"
import Image from "next/image"

type AssetType = 'image' | 'video' | 'document' | 'pdf' | 'spreadsheet' | 'presentation' | 'audio' | 'archive' | 'code' | 'text' | 'unknown'

interface AssetViewerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  src: string
  name: string
  type: AssetType
  mimeType?: string
}

const getFileIcon = (type: AssetType) => {
  const iconSize = 48
  const iconClass = "text-muted-foreground"
  
  switch (type) {
    case 'pdf':
      return <FileIcon className={`${iconClass} text-red-500`} size={iconSize} />
    case 'document':
      return <FileIcon className={`${iconClass} text-blue-500`} size={iconSize} />
    case 'spreadsheet':
      return <FileIcon className={`${iconClass} text-green-500`} size={iconSize} />
    case 'presentation':
      return <FileIcon className={`${iconClass} text-orange-500`} size={iconSize} />
    case 'audio':
      return <FileIcon className={`${iconClass} text-purple-500`} size={iconSize} />
    case 'archive':
      return <FileIcon className={`${iconClass} text-yellow-500`} size={iconSize} />
    case 'code':
      return <FileIcon className={`${iconClass} text-gray-500`} size={iconSize} />
    case 'text':
      return <FileIcon className={`${iconClass} text-gray-700`} size={iconSize} />
    default:
      return <FileIcon className={iconClass} size={iconSize} />
  }
}

export function AssetViewerDialog({
  open,
  onOpenChange,
  src,
  name,
  type,
  mimeType = ''
}: AssetViewerDialogProps) {
  const renderContent = () => {
    switch (type) {
      case 'image':
        return (
          <div className="relative w-full h-[70vh] max-h-[800px] flex items-center justify-center">
            <Image
              src={src}
              alt={name}
              fill
              className="object-contain"
              unoptimized={src.startsWith('blob:')}
            />
          </div>
        )
      case 'video':
        return (
          <video
            src={src}
            controls
            className="w-full max-h-[80vh] max-w-4xl mx-auto"
            controlsList="nodownload"
          >
            Your browser does not support the video tag.
          </video>
        )
      case 'pdf':
        return (
          <div className="w-full h-[80vh] flex items-center justify-center">
            <iframe
              src={`${src}#toolbar=0&navpanes=0`}
              className="w-full h-full border-0"
              title={name}
            />
          </div>
        )
      default:
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4">
              {getFileIcon(type)}
            </div>
            <h3 className="text-lg font-medium">{name}</h3>
            <p className="text-sm text-muted-foreground mt-2">
              This file type is not previewable. Please download to view.
            </p>
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogTitle className="sr-only">
          {`Viewing ${name}`}
        </DialogTitle>
        <div className="flex items-center justify-center h-full">
          <div className="max-h-[85vh] w-full overflow-y-auto p-4">
            {renderContent()}
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
    mimeType?: string
  } | null>(null)

  const openAsset = (src: string, name: string, type: AssetType, mimeType?: string) => {
    setAsset({ src, name, type, mimeType })
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
        mimeType={asset.mimeType}
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

// Helper function to determine file type from mime type or extension
export function getFileType(filename: string, mimeType?: string): AssetType {
  if (!mimeType) {
    // Fallback to extension if mime type is not provided
    const extension = filename.split('.').pop()?.toLowerCase()
    
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv']
    const pdfExtensions = ['pdf']
    const docExtensions = ['doc', 'docx', 'odt', 'rtf']
    const sheetExtensions = ['xls', 'xlsx', 'ods', 'csv']
    const presentationExtensions = ['ppt', 'pptx', 'odp']
    const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'flac']
    const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz']
    const codeExtensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'hpp', 'html', 'css', 'scss', 'json', 'xml']
    const textExtensions = ['txt', 'md', 'markdown', 'log', 'ini', 'env', 'conf']
    
    if (extension) {
      if (imageExtensions.includes(extension)) return 'image'
      if (videoExtensions.includes(extension)) return 'video'
      if (pdfExtensions.includes(extension)) return 'pdf'
      if (docExtensions.includes(extension)) return 'document'
      if (sheetExtensions.includes(extension)) return 'spreadsheet'
      if (presentationExtensions.includes(extension)) return 'presentation'
      if (audioExtensions.includes(extension)) return 'audio'
      if (archiveExtensions.includes(extension)) return 'archive'
      if (codeExtensions.includes(extension)) return 'code'
      if (textExtensions.includes(extension)) return 'text'
    }
    
    return 'unknown'
  }
  
  // Check mime type
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'archive'
  if (mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('typescript')) return 'code'
  if (mimeType.startsWith('text/')) return 'text'
  
  return 'unknown'
}
