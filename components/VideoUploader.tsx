'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Video, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import * as UpChunk from '@mux/upchunk';
import { refreshDashboard } from '@/lib/actions/refresh.actions';

interface VideoUploaderProps {
  owner: string;
  accountId: string;
  onUploadComplete?: (fileId: string) => void;
  className?: string;
}

interface UploadProgress {
  progress: number;
  isUploading: boolean;
  fileName: string;
  uploadId?: string;
}

export function VideoUploader({ 
  owner, 
  accountId, 
  onUploadComplete, 
  className 
}: VideoUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    isUploading: false,
    fileName: '',
  });
  
  const { toast } = useToast();
  const createMuxFile = useMutation(api.files.createMuxFile);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a video file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (limit to 5GB for now)
    const maxSize = 5 * 1024 * 1024 * 1024; // 5GB
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Video files must be smaller than 5GB.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
  }, [toast]);

  const startUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      setUploadProgress({
        progress: 0,
        isUploading: true,
        fileName: selectedFile.name,
      });

      // Step 1: Get Mux direct upload URL
      const muxResponse = await fetch('/api/mux/direct-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: selectedFile.name,
          fileSize: selectedFile.size,
        }),
      });

      if (!muxResponse.ok) {
        throw new Error('Failed to create Mux upload URL');
      }

      const { uploadId, uploadUrl } = await muxResponse.json();

      setUploadProgress(prev => ({ ...prev, uploadId }));

      // Step 2: Get Convex storage URL for backup
      const storageUrl = await generateUploadUrl();

      // Step 3: Upload to Mux using UpChunk
      const upChunk = UpChunk.createUpload({
        endpoint: uploadUrl,
        file: selectedFile,
        chunkSize: 30720, // 30MB chunks
      });

      // Handle upload progress
      upChunk.on('progress', (progressEvent) => {
        const progress = Math.round((progressEvent.detail / selectedFile.size) * 100);
        setUploadProgress(prev => ({ ...prev, progress }));
      });

      // Handle upload completion
      upChunk.on('success', async () => {
        try {
          // Step 4: Also upload to Convex storage as backup
          const storageResponse = await fetch(storageUrl, {
            method: 'POST',
            body: selectedFile,
          });

          if (!storageResponse.ok) {
            throw new Error('Failed to upload to storage');
          }

          const { storageId } = await storageResponse.json();

          // Step 5: Create file record in database
          const fileId = await createMuxFile({
            name: selectedFile.name,
            size: selectedFile.size,
            storageId,
            owner,
            accountId,
            muxUploadId: uploadId,
          });

          setUploadProgress({
            progress: 100,
            isUploading: false,
            fileName: '',
          });

          toast({
            title: 'Upload successful',
            description: 'Your video is being processed and will be available shortly.',
          });

          // Refresh the dashboard to show the new file
          await refreshDashboard();

          onUploadComplete?.(fileId);
          setSelectedFile(null);

        } catch (error) {
          console.error('Error creating file record:', error);
          toast({
            title: 'Upload failed',
            description: 'Failed to save file information.',
            variant: 'destructive',
          });
        }
      });

      // Handle upload errors
      upChunk.on('error', (errorEvent) => {
        console.error('Upload error:', errorEvent.detail);
        setUploadProgress({
          progress: 0,
          isUploading: false,
          fileName: '',
        });
        toast({
          title: 'Upload failed',
          description: 'There was an error uploading your video.',
          variant: 'destructive',
        });
      });

    } catch (error) {
      console.error('Upload initialization error:', error);
      setUploadProgress({
        progress: 0,
        isUploading: false,
        fileName: '',
      });
      toast({
        title: 'Upload failed',
        description: 'Failed to initialize video upload.',
        variant: 'destructive',
      });
    }
  }, [selectedFile, owner, accountId, generateUploadUrl, createMuxFile, onUploadComplete, toast]);

  const cancelUpload = useCallback(() => {
    setSelectedFile(null);
    setUploadProgress({
      progress: 0,
      isUploading: false,
      fileName: '',
    });
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {!selectedFile && !uploadProgress.isUploading && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Video className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="video-upload" className="cursor-pointer">
              <span className="text-base font-medium text-gray-900">
                Upload a video
              </span>
              <p className="text-sm text-gray-500 mt-1">
                MP4, MOV, AVI, or WebM up to 5GB
              </p>
            </label>
            <Input
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      )}

      {selectedFile && !uploadProgress.isUploading && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Video className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={startUpload}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </Button>
              <Button
                variant="outline"
                onClick={cancelUpload}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {uploadProgress.isUploading && (
        <div className="border rounded-lg p-4 bg-blue-50">
          <div className="flex items-center space-x-3 mb-3">
            <Video className="h-8 w-8 text-blue-500" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{uploadProgress.fileName}</p>
              <p className="text-sm text-gray-500">
                Uploading... {uploadProgress.progress}%
              </p>
            </div>
          </div>
          <Progress value={uploadProgress.progress} className="w-full" />
          {uploadProgress.uploadId && (
            <p className="text-xs text-gray-500 mt-2">
              Upload ID: {uploadProgress.uploadId}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
