import * as React from "react";
import { Annotorious, ImageAnnotator } from '@annotorious/react';
import '@annotorious/react/annotorious-react.css';

interface AnnotatedImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function AnnotatedImage({ src, alt, className = "" }: AnnotatedImageProps) {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <Annotorious>
        <ImageAnnotator>
          <img
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
