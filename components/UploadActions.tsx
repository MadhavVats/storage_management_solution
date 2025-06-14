"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Upload, Video, FileImage, FileText, ChevronDown } from "lucide-react";
import Image from "next/image";
import FileUploader from "@/components/FileUploader";
import { VideoUploader } from "@/components/VideoUploader";
import { cn } from "@/lib/utils";

interface UploadActionsProps {
  ownerId: string;
  accountId: string;
  className?: string;
}

const UploadActions = ({ ownerId, accountId, className }: UploadActionsProps) => {
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [currentUploadType, setCurrentUploadType] = useState<'general' | 'video'>('general');

  const handleVideoUploadComplete = (fileId: string) => {
    console.log('Video upload completed:', fileId);
    setIsVideoDialogOpen(false);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Regular File Upload Button */}
      <FileUploader ownerId={ownerId} accountId={accountId} className="mr-2" />
      
      {/* Video Upload Button */}
      <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          >
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Video</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-600" />
              Upload Video
            </DialogTitle>
          </DialogHeader>
          <VideoUploader 
            owner={ownerId}
            accountId={accountId}
            onUploadComplete={handleVideoUploadComplete}
            className="mt-4"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadActions;
