import * as React from "react";
import { Annotorious, ImageAnnotator } from '@annotorious/react';
import '@annotorious/react/annotorious-react.css';
import { useAnnotationLogger } from '../hooks/useAnnotationLogger';

interface AnnotatedImageProps {
  src: string;
  alt: string;
  id?: string; // Add id to props interface
  className?: string;
  onAnnotationCreated?: (annotation: any) => void;
  onAnnotationUpdated?: (annotation: any, previous: any) => void;
  onAnnotationDeleted?: (annotation: any) => void;
  enableConsoleLogging?: boolean;
}

export function AnnotatedImage({ 
  src, 
  alt, 
  id, // Destructure id
  className = "",
  onAnnotationCreated,
  onAnnotationUpdated,
  onAnnotationDeleted,
  enableConsoleLogging = true
}: AnnotatedImageProps) {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <Annotorious>
        <AnnotationLogger 
          onAnnotationCreated={onAnnotationCreated}
          onAnnotationUpdated={onAnnotationUpdated}
          onAnnotationDeleted={onAnnotationDeleted}
          enableConsoleLogging={enableConsoleLogging}
        />
        <ImageAnnotator>
          <img
            id={id} // Apply id to img tag
            src={src}
            alt={alt}
            className={`max-w-full max-h-full object-contain ${className}`}
            style={{ display: 'block' }}
          />
        </ImageAnnotator>
      </Annotorious>
    </div>
  );
}

// Helper component to use the hook inside the Annotorious context
function AnnotationLogger({ 
  onAnnotationCreated, 
  onAnnotationUpdated, 
  onAnnotationDeleted, 
  enableConsoleLogging 
}: {
  onAnnotationCreated?: (annotation: any) => void;
  onAnnotationUpdated?: (annotation: any, previous: any) => void;
  onAnnotationDeleted?: (annotation: any) => void;
  enableConsoleLogging?: boolean;
}) {
  useAnnotationLogger({
    onAnnotationCreated,
    onAnnotationUpdated,
    onAnnotationDeleted,
    enableConsoleLogging
  });
  
  return null; // This component doesn't render anything
}
