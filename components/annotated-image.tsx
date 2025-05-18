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
    <div className="relative w-full h-full max-w-full max-h-full">
      <Annotorious>
        <ImageAnnotator>
          <img
            src={src}
            alt={alt}
            className={`max-w-full max-h-full w-auto h-auto object-contain mx-auto block ${className}`}
          />
        </ImageAnnotator>
      </Annotorious>
    </div>
  );
}
