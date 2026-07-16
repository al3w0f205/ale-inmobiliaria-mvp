'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import map to avoid SSR issues
const MapPicker = dynamic(() => import('@/components/MapComponent'), { ssr: false });

export default function PublishPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBroker, setIsBroker] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [propertyType, setPropertyType] = useState('casa');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me/`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.user_type !== 'broker') {
            router.push('/');
          } else {
            setIsBroker(true);
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!location) {
      setError('Debes seleccionar la ubicación en el mapa.');
      setLoading(false);
      return;
    }

    try {
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('property_type', propertyType);
      
      // Parse tags (comma separated)
      const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t);
      tagsArray.forEach(tag => {
          formData.append('tags', tag);
      });

      // DRF GeometryField expects GeoJSON string when parsing from form-data
      const geoJson = {
          type: 'Point',
          coordinates: [location[1], location[0]] // lon, lat
      };
      formData.append('location', JSON.stringify(geoJson));

      if (image) {
        formData.append('image', image);
      } else {
        // Provide a fallback if they don't upload an image for now
        formData.append('image_url_fallback', 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80');
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/`, {
        method: 'POST',
        credentials: 'include',
        body: formData, // fetch handles multipart boundary automatically
      });

      if (res.ok) {
        router.push('/');
      } else {
        const data = await res.json();
        setError(JSON.stringify(data));
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  if (!isBroker) return null; // Wait for redirect

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden selection:bg-brand/20 selection:text-brand">
      {/* Fondo Dinámico Premium (Grid + Aurora) */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <header className="fixed top-0 inset-x-0 z-50 flex h-20 items-center px-6 bg-surface/50 backdrop-blur-2xl border-b border-border shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-foreground/80 hover:text-brand transition-colors font-bold text-sm">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Cancelar y Volver
        </Link>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 relative z-10 pt-32 pb-20">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-brand">Publicar Propiedad</h1>
          <p className="text-muted text-lg">Sube las fotos y datos para comenzar a recibir interesados.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-8">
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          
          <div className="p-8 md:p-10 rounded-[2rem] bg-surface/80 backdrop-blur-xl border border-border shadow-2xl shadow-brand/5 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-2xl font-black flex items-center gap-3">
              Detalles Básicos
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent ml-4"></div>
            </h2>
            
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Título del Anuncio</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-4 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all font-medium"
                placeholder="Ej. Casa esquinera con amplio patio"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Descripción</label>
              <textarea 
                required
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-4 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all font-medium resize-none"
                placeholder="Describe los beneficios, ubicación cercana, etc..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Precio de Venta ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all font-bold text-lg"
                    placeholder="150000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Tipo de Propiedad</label>
                <select 
                  value={propertyType}
                  onChange={e => setPropertyType(e.target.value)}
                  className="w-full px-4 py-4 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all font-medium cursor-pointer"
                >
                  <option value="casa">Casa</option>
                  <option value="dep">Departamento</option>
                  <option value="terreno">Terreno</option>
                  <option value="local">Local Comercial</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Etiquetas / Tags (separados por coma)</label>
              <input 
                type="text" 
                value={tags}
                onChange={e => setTags(e.target.value)}
                className="w-full px-4 py-4 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all font-medium"
                placeholder="Ej. 3 Habitaciones, 2 Baños, Piscina"
              />
            </div>
          </div>

          <div className="p-8 md:p-10 rounded-[2rem] bg-surface/80 backdrop-blur-xl border border-border shadow-2xl shadow-brand/5 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <h2 className="text-2xl font-black flex items-center gap-3">
              Fotografía Principal
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent ml-4"></div>
            </h2>
            
            <div className="mt-4">
              <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-4">La imagen se optimizará automáticamente para la web.</label>
              
              {imagePreview ? (
                <div className="relative w-full h-[400px] rounded-3xl overflow-hidden border border-border group shadow-inner">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                     <label className="cursor-pointer bg-white/10 backdrop-blur-md px-8 py-4 rounded-2xl text-white font-bold border border-white/20 hover:bg-white/20 transition-colors shadow-2xl">
                       Reemplazar Fotografía
                       <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                     </label>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-[400px] border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center bg-background/50 hover:bg-brand/5 hover:border-brand/30 transition-colors group cursor-pointer">
                  <div className="w-24 h-24 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-brand/5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-black text-foreground">Sube la mejor foto de la propiedad</h3>
                  <p className="text-muted text-sm mt-2 font-medium">Soporta JPG, PNG de alta resolución</p>
                  <input type="file" required accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              )}
            </div>
          </div>

          <div className="p-8 md:p-10 rounded-[2rem] bg-surface/80 backdrop-blur-xl border border-border shadow-2xl shadow-brand/5 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-3 mb-2">
                Ubicación
                <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent ml-4"></div>
              </h2>
              <p className="text-sm font-bold text-muted">Haz clic en el mapa para fijar la coordenada exacta del inmueble.</p>
            </div>
            
            <div className="w-full h-[450px] rounded-3xl overflow-hidden border border-border relative z-0 shadow-inner">
               <MapPicker interactive={true} onLocationSelect={(lat, lng) => setLocation([lat, lng])} />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-6 rounded-[2rem] font-black text-xl shadow-2xl transition-all active:scale-95 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 ${loading ? 'bg-brand/50 text-white/50 cursor-not-allowed' : 'bg-brand text-white hover:bg-brand-hover hover:shadow-brand/20'}`}
          >
            {loading ? 'Subiendo datos y optimizando...' : 'Publicar Inmueble Ahora'}
          </button>
        </form>
      </main>
    </div>
  );
}
