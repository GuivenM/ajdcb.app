import React from 'react';
import { useLightbox } from './ImageLightbox';
import { cn } from './Navbar';

interface ZoomableProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  downloadable?: boolean;
}

/**
 * Usage : remplacer <img src=".." className=".." /> par
 * <Zoomable src=".." className=".." downloadable={isAdmin} /> — le clic
 * ouvre l'image en grand ; tout le reste (className, alt...) passe tel quel.
 */
export function Zoomable({ src, alt, className, downloadable = false, ...rest }: ZoomableProps) {
  const { openImage } = useLightbox();

  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt || ''}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openImage(src, alt, downloadable);
      }}
      className={cn('cursor-zoom-in', className)}
      {...rest}
    />
  );
}
