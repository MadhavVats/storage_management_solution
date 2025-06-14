"use client";

import React from 'react';
import { useMuxPolling } from '@/hooks/useMuxPolling';
import { useUser } from '@clerk/nextjs';

interface MuxPollingProviderProps {
  children: React.ReactNode;
}

const MuxPollingProvider: React.FC<MuxPollingProviderProps> = ({ children }) => {
  const { user } = useUser();
  
  // Initialize Mux polling - this will automatically start polling
  // for any files that need Mux status updates
  useMuxPolling({
    owner: user?.id || '',
    enabled: !!user?.id,
    onVideoReady: (fileId, muxData) => {
      console.log('Video ready:', fileId, muxData);
    }
  });

  return <>{children}</>;
};

export default MuxPollingProvider;
