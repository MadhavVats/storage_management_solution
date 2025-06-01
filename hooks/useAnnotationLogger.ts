import { useEffect } from 'react';
import { useAnnotator } from '@annotorious/react';
import type { AnnotoriousImageAnnotator } from '@annotorious/react';

interface AnnotationLoggerOptions {
  onAnnotationCreated?: (annotation: any) => void;
  onAnnotationUpdated?: (annotation: any, previous: any) => void;
  onAnnotationDeleted?: (annotation: any) => void;
  enableConsoleLogging?: boolean;
}

/**
 * Custom hook for logging annotation lifecycle events in Annotorious
 * 
 * @param options Configuration options for the logger
 * @returns The annotator instance for additional operations if needed
 */
export function useAnnotationLogger(options: AnnotationLoggerOptions = {}) {
  const {
    onAnnotationCreated,
    onAnnotationUpdated,
    onAnnotationDeleted,
    enableConsoleLogging = true
  } = options;

  const annotator = useAnnotator<AnnotoriousImageAnnotator>();

  useEffect(() => {
    if (!annotator) return;

    // Handler for annotation creation
    const handleCreateAnnotation = (annotation: any) => {
      if (enableConsoleLogging) {
        console.log('Annotation created:', annotation);
      }
      
      if (onAnnotationCreated) {
        onAnnotationCreated(annotation);
      }
    };

    // Handler for annotation updates
    const handleUpdateAnnotation = (annotation: any, previous: any) => {
      if (enableConsoleLogging) {
        console.log('Annotation updated:', { annotation, previous });
      }
      
      if (onAnnotationUpdated) {
        onAnnotationUpdated(annotation, previous);
      }
    };

    // Handler for annotation deletion
    const handleDeleteAnnotation = (annotation: any) => {
      if (enableConsoleLogging) {
        console.log('Annotation deleted:', annotation);
      }
      
      if (onAnnotationDeleted) {
        onAnnotationDeleted(annotation);
      }
    };

    // Attach event listeners
    annotator.on('createAnnotation', handleCreateAnnotation);
    annotator.on('updateAnnotation', handleUpdateAnnotation);
    annotator.on('deleteAnnotation', handleDeleteAnnotation);

    // Cleanup function to remove event listeners
    return () => {
      annotator.off('createAnnotation', handleCreateAnnotation);
      annotator.off('updateAnnotation', handleUpdateAnnotation);
      annotator.off('deleteAnnotation', handleDeleteAnnotation);
    };
  }, [annotator, onAnnotationCreated, onAnnotationUpdated, onAnnotationDeleted, enableConsoleLogging]);

  return annotator;
}
