export type Role = 'USER' | 'DEVELOPER/ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  displayPassword?: string; // Stored for developer admin view
  role: Role;
  createdAt: string;
  lastActive: string;
  status: 'active' | 'suspended';
  searchesCount: number;
}

export type Category = 
  | 'Motherboards'
  | 'Screens'
  | 'Batteries'
  | 'Camera Modules'
  | 'Charging Ports'
  | 'Flex Cables'
  | 'Speakers & Microphones'
  | 'Back Glasses & Housings';

export interface SparePart {
  id: string;
  name: string;
  brand: string;
  compatibleModels: string[];
  category: Category;
  price: number;
  stock: number;
  qualityGrade: 'OEM Original' | 'Grade A++' | 'Refurbished Genuine';
  sku: string;
  imageUrl: string;
  specifications: Record<string, string>;
  installationDifficulty: 'Easy' | 'Medium' | 'Expert';
  description: string;
  featured?: boolean;
}

export interface SearchLog {
  id: string;
  userId: string | null;
  userName: string;
  userPhone: string;
  userEmail: string;
  query: string;
  brandFilter?: string;
  categoryFilter?: string;
  resultsCount: number;
  ipAddress: string;
  deviceInfo: string;
  timestamp: string;
  isSuspicious: boolean;
  flagReason?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalParts: number;
  totalSearches: number;
  suspiciousSearchesCount: number;
  lowStockCount: number;
  topSearchedQueries: { query: string; count: number }[];
  brandCounts: Record<string, number>;
}
