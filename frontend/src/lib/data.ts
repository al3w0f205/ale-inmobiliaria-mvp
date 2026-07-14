export const properties = [
  {
    id: 1,
    title: 'Casa en el Valle',
    description: 'Hermosa propiedad con amplio jardín, ideal para familias. Ubicada en una zona tranquila y segura, a solo 10 minutos de centros comerciales y escuelas de prestigio. Cuenta con acabados de lujo, cocina abierta tipo americana, y una pérgola ideal para barbacoas.',
    price: '120,000',
    location: { type: 'Point', coordinates: [-78.4678, -0.1807] as [number, number] }, // Quito
    tags: ['3 Hab', '2 Baños', '150 m²'],
    image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    broker: {
      name: 'Maria González',
      phone: '+593 99 123 4567'
    }
  },
  {
    id: 2,
    title: 'Departamento moderno',
    description: 'Centro de la ciudad, espectacular vista y acabados de lujo. Edificio inteligente con gimnasio, piscina y guardianía 24/7. Perfecto para ejecutivos o parejas jóvenes que buscan un estilo de vida urbano.',
    price: '85,000',
    location: { type: 'Point', coordinates: [-79.9000, -2.1833] as [number, number] }, // Guayaquil
    tags: ['2 Hab', '2 Baños', '90 m²'],
    image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    broker: {
      name: 'Carlos Ruiz',
      phone: '+593 98 765 4321'
    }
  }
];
