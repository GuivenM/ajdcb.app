import imageCompression from 'browser-image-compression';

/**
 * Compresse une image sélectionnée par l'utilisateur avant l'envoi au serveur.
 * Le backend recompresse déjà en WebP, donc on reste raisonnable ici :
 * l'objectif est surtout de réduire le poids avant l'upload (mobile, réseau lent).
 */
export async function compressImage(file: File): Promise<File> {
  try {
    return await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
    });
  } catch (error) {
    console.error('Compression échouée, envoi du fichier original :', error);
    return file;
  }
}
