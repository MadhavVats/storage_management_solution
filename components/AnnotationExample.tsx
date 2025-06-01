import React from 'react';
import { AnnotatedImage } from '../components/annotated-image';

export function AnnotationExample() {
  const handleAnnotationCreated = (annotation: any) => {
    // Custom logging or API calls when annotation is created
    console.log('Custom handler - Annotation created:', annotation);
    
    // Example: Send to analytics or save to database
    // analytics.track('annotation_created', { id: annotation.id });
    // saveAnnotationToDatabase(annotation);
  };

  const handleAnnotationUpdated = (annotation: any, previous: any) => {
    console.log('Custom handler - Annotation updated:', { annotation, previous });
    
    // Example: Update in database
    // updateAnnotationInDatabase(annotation);
  };

  const handleAnnotationDeleted = (annotation: any) => {
    console.log('Custom handler - Annotation deleted:', annotation);
    
    // Example: Remove from database
    // deleteAnnotationFromDatabase(annotation.id);
  };

  return (
    <div className="w-full h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Image Annotation Example</h1>
      
      <div className="w-full h-96 border border-gray-300 rounded-lg overflow-hidden">
        <AnnotatedImage
          src="/assets/images/photo.png"
          alt="Sample image for annotation"
          onAnnotationCreated={handleAnnotationCreated}
          onAnnotationUpdated={handleAnnotationUpdated}
          onAnnotationDeleted={handleAnnotationDeleted}
          enableConsoleLogging={true}
          className="border-0"
        />
      </div>
      
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Click and drag to create rectangular annotations</li>
          <li>Click on existing annotations to select and edit them</li>
          <li>Check the browser console to see logging output</li>
          <li>Custom handlers are called for create, update, and delete events</li>
        </ul>
      </div>
    </div>
  );
}
