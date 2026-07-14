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
    // Check if user is logged in and is a broker (based on local storage for MVP)
    // The backend truly enforces it, but we handle basic routing here.
    const userType = localStorage.getItem('user_type');
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      router.push('/login');
    } else if (userType !== 'broker') {
      router.push('/');
    } else {
      setIsBroker(true);
    }
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
      const token = localStorage.getItem('access_token');
      
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
        headers: {
          'Authorization': `Bearer ${token}`
        },
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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="glass sticky top-0 z-50 flex h-16 items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2 text-muted hover:text-brand transition-colors font-medium text-sm">
          ← Cancelar y Volver
        </Link>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10">
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
          
          <div className="p-8 rounded-3xl bg-surface border border-border shadow-xl shadow-brand/5 space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-4">Detalles Básicos</h2>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Título del Anuncio</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all"
                placeholder="Ej. Casa esquinera con amplio patio"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Descripción</label>
              <textarea 
                required
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all"
                placeholder="Describe los beneficios, ubicación cercana, etc..."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Precio ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all"
                  placeholder="150000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Tipo de Propiedad</label>
                <select 
                  value={propertyType}
                  onChange={e => setPropertyType(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all"
                >
                  <option value="casa">Casa</option>
                  <option value="dep">Departamento</option>
                  <option value="terreno">Terreno</option>
                  <option value="local">Local Comercial</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Etiquetas / Tags (separados por coma)</label>
              <input 
                type="text" 
                value={tags}
                onChange={e => setTags(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all"
                placeholder="Ej. 3 Habitaciones, 2 Baños, Piscina"
              />
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-surface border border-border shadow-xl shadow-brand/5 space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-4">Fotografía Principal</h2>
            
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2 text-muted">La imagen se optimizará y comprimirá automáticamente en el servidor para ahorrar espacio.</label>
              
              {imagePreview ? (
                <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-border group">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <label className="cursor-pointer bg-white/20 backdrop-blur-md px-6 py-2 rounded-xl text-white font-bold border border-white/30 hover:bg-white/30 transition-colors">
                       Cambiar Foto
                       <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                     </label>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-[400px] border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center bg-background/50 hover:bg-muted/5 transition-colors group">
                  <div className="w-20 h-20 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold">Haz clic para subir</h3>
                  <p className="text-muted text-sm mt-1">Soporta JPG, PNG</p>
                  <input type="file" required accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              )}
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-surface border border-border shadow-xl shadow-brand/5 space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-4">Ubicación de la Propiedad</h2>
            <p className="text-sm text-muted">Haz clic en el mapa para fijar la coordenada exacta del inmueble.</p>
            <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-border relative z-0">
               <MapPicker interactive={true} onLocationSelect={(lat, lng) => setLocation([lat, lng])} />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-bold text-lg shadow-lg shadow-brand/20 transition-all active:scale-[0.98] ${loading ? 'bg-brand/50 text-white/50 cursor-not-allowed' : 'bg-brand text-white hover:bg-brand-hover'}`}
          >
            {loading ? 'Publicando...' : 'Publicar Inmueble'}
          </button>
        </form>
      </main>
    </div>
  );
}
