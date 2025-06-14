import React from "react";
import Image from "next/image";
import { cn, getFileIcon } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  type: string;
  extension: string;
  url?: string;
  imageClassName?: string;
  className?: string;
  muxPlaybackId?: string;
  muxStatus?: 'preparing' | 'ready' | 'errored';
  muxThumbnail?: string;
}

export const Thumbnail = ({
  type,
  extension,
  url = "",
  imageClassName,
  className,
  muxPlaybackId,
  muxStatus,
  muxThumbnail,
}: Props) => {
  const isImage = type === "image" && extension !== "svg";
  const isVideo = type === "video";
  const isMuxVideo = isVideo && muxPlaybackId;

  // For Mux videos, use the thumbnail if available, otherwise use video icon
  let thumbnailSrc = url;
  if (isMuxVideo && muxThumbnail) {
    thumbnailSrc = muxThumbnail;
  } else if (!isImage) {
    thumbnailSrc = getFileIcon(extension, type);
  }

  const getStatusIcon = () => {
    if (!isMuxVideo) return null;
    
    switch (muxStatus) {
      case 'preparing':
        return <Clock className="w-3 h-3 text-yellow-500" />;
      case 'ready':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'errored':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <figure className={cn("thumbnail relative", className)}>
      <Image
        src={thumbnailSrc}
        alt="thumbnail"
        width={100}
        height={100}
        className={cn(
          "size-8 object-contain",
          imageClassName,
          (isImage || (isMuxVideo && muxThumbnail)) && "thumbnail-image",
        )}
      />
      {isMuxVideo && (
        <div className="absolute -top-1 -right-1">
          {getStatusIcon()}
        </div>
      )}
    </figure>
  );
};
export default Thumbnail;
