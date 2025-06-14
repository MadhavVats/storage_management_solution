'use client';

import React from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye } from 'lucide-react';

interface MuxVideoPlayerProps {
  playbackId?: string;
  muxStatus?: 'preparing' | 'ready' | 'errored';
  thumbnail?: string;
  title?: string;
  className?: string;
  metadata?: {
    video_id?: string;
    video_title?: string;
    viewer_user_id?: string;
    [key: string]: any;
  };
  onLoadStart?: () => void;
  onLoadedData?: () => void;
  onError?: (error: any) => void;
}

export function MuxVideoPlayer({
  playbackId,
  muxStatus = 'preparing',
  thumbnail,
  title,
  className = '',
  metadata,
  onLoadStart,
  onLoadedData,
  onError,
}: MuxVideoPlayerProps) {
  // Show loading state for videos that are still processing
  if (muxStatus === 'preparing' || !playbackId) {
    return (
      <div className={`relative aspect-video bg-gray-100 rounded-lg overflow-hidden ${className}`}>
        {thumbnail && (
          <img
            src={thumbnail}
            alt={title || 'Video thumbnail'}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">Processing video...</p>
            <Badge variant="secondary" className="mt-2">
              <Clock className="w-3 h-3 mr-1" />
              {muxStatus}
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  // Show error state for failed videos
  if (muxStatus === 'errored') {
    return (
      <div className={`relative aspect-video bg-red-50 border border-red-200 rounded-lg overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-red-600">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-sm">Failed to process video</p>
            <Badge variant="destructive" className="mt-2">
              Error
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  // Render the Mux player for ready videos
  return (
    <div className={`relative ${className}`}>
      <MuxPlayer
        playbackId={playbackId}
        metadata={{
          video_title: title,
          ...metadata,
        }}
        accent-color="#3b82f6" // Blue accent color
        controls
        style={{
          aspectRatio: '16/9',
          width: '100%',
        }}
        poster={thumbnail}
        onLoadStart={onLoadStart}
        onLoadedData={onLoadedData}
        onError={onError}
      />
      
      {/* Status indicator */}
      <div className="absolute top-2 right-2">
        <Badge variant="default" className="bg-green-500">
          <Eye className="w-3 h-3 mr-1" />
          Ready
        </Badge>
      </div>
    </div>
  );
}
