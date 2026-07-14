'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h1>
        <p className="text-gray-600 mb-8">
          Tu suscripción ha sido activada correctamente. Ahora puedes publicar tus propiedades en el marketplace.
        </p>
        
        <div className="space-y-3">
          <Link 
            href="/publish" 
            className="block w-full bg-[#111111] text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Publicar nueva propiedad
          </Link>
          <Link 
            href="/" 
            className="block w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
