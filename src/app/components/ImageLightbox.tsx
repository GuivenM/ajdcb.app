import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

interface LightboxImage {
  src: string;
  alt?: string;
  downloadable?: boolean;
}

interface LightboxContextValue {
  openImage: (src: string, alt?: string, downloadable?: boolean) => void;
}

const LightboxContext = createContext<LightboxContextValue | undefined>(undefined);

export function ImageLightboxProvider({ children }: { children: React.ReactNode }) {
  const [image, setImage] = useState<LightboxImage | null>(null);

  const openImage = useCallback((src: string, alt?: string, downloadable = false) => {
    setImage({ src, alt, downloadable });
  }, []);

  const close = useCallback(() => setImage(null), []);

  useEffect(() => {
    if (!image) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [image, close]);

  async function handleDownload() {
    if (!image) return;
    try {
      const res = await fetch(image.src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.alt ? `${image.alt.replace(/[^a-z0-9-_]+/gi, '_')}.jpg` : 'photo.jpg';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Repli : ouvrir l'image dans un nouvel onglet si le téléchargement direct échoue (CORS...)
      window.open(image.src, '_blank');
    }
  }

  return (
    <LightboxContext.Provider value={{ openImage }}>
      {children}

      {image && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 sm:p-8"
          onClick={close}
        >
          <button
            onClick={close}
            aria-label="Fermer"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {image.downloadable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="absolute top-4 right-16 h-10 px-4 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" /> Télécharger
            </button>
          )}

          <img
            src={image.src}
            alt={image.alt || ''}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </LightboxContext.Provider>
  );
}

export function useLightbox() {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error('useLightbox doit être utilisé dans un ImageLightboxProvider');
  return ctx;
}
