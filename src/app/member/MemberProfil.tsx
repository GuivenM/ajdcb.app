import React, { useRef, useState } from 'react';
import { Loader2, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { membreApi, ApiError } from '../../lib/memberApi';
import { useMemberAuth } from '../context/MemberAuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export function MemberProfil() {
  const { membre, refresh } = useMemberAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [whatsapp, setWhatsapp] = useState(membre?.whatsapp || '');
  const [facebook, setFacebook] = useState(membre?.facebook || '');
  const [instagram, setInstagram] = useState(membre?.instagram || '');
  const [linkedin, setLinkedin] = useState(membre?.linkedin || '');
  const [twitter, setTwitter] = useState(membre?.twitter || '');
  const [saving, setSaving] = useState(false);

  if (!membre) return null;

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('whatsapp', whatsapp);
      formData.append('facebook', facebook);
      formData.append('instagram', instagram);
      formData.append('linkedin', linkedin);
      formData.append('twitter', twitter);
      if (photoFile) formData.append('photo', photoFile);

      await membreApi.postForm('/v1/membre/profil', formData, 'PUT');
      await refresh();
      toast.success('Profil mis à jour');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Mon profil</h1>
      <p className="text-slate-500 mb-6">
        Poste et commission sont gérés par le Bureau Exécutif — le reste, c'est vous.
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-20 h-20 rounded-full bg-brand-green-100 overflow-hidden flex items-center justify-center text-brand-green-700 font-bold text-2xl shrink-0"
          >
            {photoPreview || membre.photo ? (
              <img src={photoPreview || membre.photo!} alt={membre.nom} className="w-full h-full object-cover" />
            ) : (
              <span>
                {membre.prenom?.[0]}
                {membre.nom?.[0]}
              </span>
            )}
            <span className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <div>
            <p className="font-semibold text-slate-900">{membre.nom_complet}</p>
            <p className="text-sm text-slate-500">{membre.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" placeholder="+229 00 00 00 00" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input id="facebook" placeholder="facebook.com/..." value={facebook} onChange={(e) => setFacebook(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" placeholder="@..." value={instagram} onChange={(e) => setInstagram(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input id="linkedin" placeholder="linkedin.com/in/..." value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter">X / Twitter</Label>
            <Input id="twitter" placeholder="@..." value={twitter} onChange={(e) => setTwitter(e.target.value)} />
          </div>
        </div>

        <Button type="submit" disabled={saving} className="bg-brand-green-600 hover:bg-brand-green-700">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
        </Button>
      </form>
    </div>
  );
}
