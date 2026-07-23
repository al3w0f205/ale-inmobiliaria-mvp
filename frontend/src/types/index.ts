export interface User {
  id: number;
  username: string;
  email: string;
  user_type: 'client' | 'broker';
  phone_number?: string;
  bio?: string;
  avatar?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  is_staff?: boolean;
  cedula?: string;
  identity_verified?: boolean;
  whatsapp_number?: string;
  instagram_username?: string;
  facebook_url?: string;
  company_name?: string;
  company_logo?: string;
  office_address?: string;
  date_joined?: string;
}

export interface PropertyLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitud, latitud]
}

export interface Property {
  id: number;
  title: string;
  description: string;
  price: string;
  property_type: 'casa' | 'dep' | 'terreno' | 'local';
  location: PropertyLocation;
  bedrooms: number;
  bathrooms: string | number;
  area_sqm: string | number;
  tags: string[];
  image?: string;
  image_url?: string;
  is_published: boolean;
  created_at: string;
  views_count?: number;
  broker?: {
    id: number;
    name: string;
    phone: string;
    avatar?: string;
  };
}

export interface Payment {
  id: number;
  amount: string;
  payment_method: 'PAYPHONE' | 'DEUNA' | 'TRANSFER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  transaction_id?: string;
  receipt_image?: string;
  created_at: string;
  updated_at?: string;
  broker_username?: string;
}

export interface ChartPoint {
  date: string;
  revenue: number;
  properties: number;
}

export interface AdminStats {
  total_revenue: number;
  total_brokers: number;
  total_clients: number;
  active_subscriptions: number;
  published_properties: number;
  pending_payments: number;
}
