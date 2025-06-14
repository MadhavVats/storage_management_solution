import { useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface UseMuxPollingOptions {
  owner: string;
  intervalMs?: number;
  enabled?: boolean;
  onVideoReady?: (fileId: string, muxData: any) => void;
}

export function useMuxPolling({
  owner,
  intervalMs = 5000, // Poll every 5 seconds by default
  enabled = true,
  onVideoReady,
}: UseMuxPollingOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get files that need polling (videos in "preparing" state)
  const filesNeedingPolling = useQuery(
    api.files.getFilesNeedingMuxPolling,
    enabled ? { owner } : "skip"
  );

  useEffect(() => {
    if (!enabled || !filesNeedingPolling || filesNeedingPolling.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start polling for video status
    const pollVideoStatus = async () => {
      try {
        for (const file of filesNeedingPolling) {
          if (!file.muxUploadId && !file.muxAssetId) continue;

          // Check status with Mux API
          const queryParams = new URLSearchParams();
          if (file.muxUploadId) queryParams.set('uploadId', file.muxUploadId);
          if (file.muxAssetId) queryParams.set('assetId', file.muxAssetId);

          const response = await fetch(`/api/mux/status?${queryParams}`);
          if (!response.ok) continue;

          const { upload, asset } = await response.json();

          // Update file record if status has changed
          if (asset && asset.status !== file.muxStatus) {
            const updateData: any = {
              muxStatus: asset.status,
            };

            if (asset.id && !file.muxAssetId) {
              updateData.muxAssetId = asset.id;
            }

            if (asset.playbackIds && asset.playbackIds.length > 0) {
              updateData.muxPlaybackId = asset.playbackIds[0].id;
            }

            if (asset.thumbnail) {
              updateData.muxThumbnail = asset.thumbnail;
            }

            // Update the file in the database
            await fetch('/api/mux/update-file', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fileId: file._id,
                ...updateData,
              }),
            });

            // Trigger callback if video is ready
            if (asset.status === 'ready' && onVideoReady) {
              onVideoReady(file._id, asset);
            }
          }
        }
      } catch (error) {
        console.error('Error polling Mux status:', error);
      }
    };

    // Initial poll
    pollVideoStatus();

    // Set up interval
    intervalRef.current = setInterval(pollVideoStatus, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, filesNeedingPolling, intervalMs, onVideoReady]);

  return {
    filesNeedingPolling: filesNeedingPolling || [],
    isPolling: enabled && (filesNeedingPolling?.length || 0) > 0,
  };
}
