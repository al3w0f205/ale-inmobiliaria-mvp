'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me/`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('bio', profile.bio || '');
      formData.append('phone_number', profile.phone_number || '');
      formData.append('cedula', profile.cedula || '');
      formData.append('whatsapp_number', profile.whatsapp_number || '');
      formData.append('instagram_username', profile.instagram_username || '');
      formData.append('facebook_url', profile.facebook_url || '');
      formData.append('company_name', profile.company_name || '');
      formData.append('office_address', profile.office_address || '');

      if (profile.avatar_file) {
        formData.append('avatar', profile.avatar_file);
      }
      if (profile.company_logo_file) {
        formData.append('company_logo', profile.company_logo_file);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me/`, {
        method: 'PATCH',
        body: formData,
        credentials: 'include'
      });

      if (res.ok) {
        setMessage('Perfil actualizado correctamente.');
      } else {
        const data = await res.json();
        setError(data.detail || 'Error al actualizar el perfil.');
      }
    } catch (err) {
      setError('Error de conexión.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-surface border border-border rounded-3xl p-8 shadow-sm">
          <h1 className="text-3xl font-black text-foreground mb-8">Mi Perfil</h1>

          {error && <div className="mb-6 p-4 bg-red-500/10 text-red-500 rounded-xl font-medium">{error}</div>}
          {message && <div className="mb-6 p-4 bg-green-500/10 text-green-500 rounded-xl font-medium">{message}</div>}

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Nombre de Usuario</label>
                <input 
                  type="text" 
                  value={profile?.username || ''} 
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 text-muted cursor-not-allowed font-medium" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={profile?.email || ''} 
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 text-muted cursor-not-allowed font-medium" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 flex items-center justify-between">
                  Teléfono
                </label>
                <input 
                  type="text" 
                  value={profile?.phone_number || ''}
                  onChange={e => setProfile({...profile, phone_number: e.target.value})}
                  placeholder="+593 9 1234 5678"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-brand/30 outline-none font-medium transition-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 flex items-center justify-between">
                  Cédula / ID
                  {profile?.identity_verified ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold text-green-500 bg-green-500/10 rounded-md border border-green-500/20">Verificado</span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold text-yellow-500 bg-yellow-500/10 rounded-md border border-yellow-500/20">Sin Verificar</span>
                  )}
                </label>
                <input 
                  type="text" 
                  value={profile?.cedula || ''}
                  onChange={e => setProfile({...profile, cedula: e.target.value})}
                  placeholder="1712345678"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-brand/30 outline-none font-medium transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Foto de Perfil (Avatar)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setProfile({ ...profile, avatar_file: e.target.files[0] });
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 text-sm font-medium focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Logotipo de la Inmobiliaria</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setProfile({ ...profile, company_logo_file: e.target.files[0] });
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 text-sm font-medium focus:outline-none" 
                />
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <h3 className="text-sm font-bold text-brand uppercase tracking-widest mb-4">Información de la Empresa</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Nombre Comercial</label>
                  <input 
                    type="text" 
                    value={profile?.company_name || ''}
                    onChange={e => setProfile({...profile, company_name: e.target.value})}
                    placeholder="Ej. Rondira Real Estate"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-brand/30 outline-none font-medium transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Dirección de Oficina</label>
                  <input 
                    type="text" 
                    value={profile?.office_address || ''}
                    onChange={e => setProfile({...profile, office_address: e.target.value})}
                    placeholder="Ej. Av. Amazonas y Eloy Alfaro"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-brand/30 outline-none font-medium transition-all" 
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <h3 className="text-sm font-bold text-brand uppercase tracking-widest mb-4">Redes Sociales de Contacto</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">WhatsApp</label>
                  <input 
                    type="text" 
                    value={profile?.whatsapp_number || ''}
                    onChange={e => setProfile({...profile, whatsapp_number: e.target.value})}
                    placeholder="+593987654321"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-brand/30 outline-none font-medium transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Instagram (Usuario)</label>
                  <input 
                    type="text" 
                    value={profile?.instagram_username || ''}
                    onChange={e => setProfile({...profile, instagram_username: e.target.value})}
                    placeholder="ejemplo_inmuebles"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-brand/30 outline-none font-medium transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Facebook (URL)</label>
                  <input 
                    type="text" 
                    value={profile?.facebook_url || ''}
                    onChange={e => setProfile({...profile, facebook_url: e.target.value})}
                    placeholder="https://facebook.com/pagina"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-brand/30 outline-none font-medium transition-all" 
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Biografía (Bio)</label>
              <textarea 
                value={profile?.bio || ''}
                onChange={e => setProfile({...profile, bio: e.target.value})}
                placeholder="Cuéntanos un poco sobre ti..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-brand/30 outline-none font-medium transition-all resize-none" 
              />
            </div>

            <div className="pt-6 border-t border-border flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="px-8 py-3 rounded-xl bg-brand text-white font-bold hover:bg-brand-hover transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
