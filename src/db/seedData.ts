import { SparePart, User, SearchLog } from './types.js';
import bcrypt from 'bcryptjs';

// Pre-hashed default passwords
const defaultAdminHash = bcrypt.hashSync('admin123', 10);
const defaultUserHash = bcrypt.hashSync('user123', 10);

export const initialUsers: User[] = [
  {
    id: 'usr_admin_7985',
    name: 'Priti Gupta (Lead Dev)',
    email: 'admin@mobilix.com',
    phone: '7985114480',
    passwordHash: defaultAdminHash,
    displayPassword: 'admin123',
    role: 'DEVELOPER/ADMIN',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    lastActive: new Date().toISOString(),
    status: 'active',
    searchesCount: 42,
  },
  {
    id: 'usr_tech_9876',
    name: 'Rahul Sharma Repair Tech',
    email: 'rahul.fix@gmail.com',
    phone: '9876543210',
    passwordHash: defaultUserHash,
    displayPassword: 'user123',
    role: 'USER',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    lastActive: new Date(Date.now() - 3600000).toISOString(),
    status: 'active',
    searchesCount: 18,
  },
  {
    id: 'usr_user_9812',
    name: 'Amit Patel',
    email: 'amit.patel@outlook.com',
    phone: '9812345678',
    passwordHash: defaultUserHash,
    displayPassword: 'user123',
    role: 'USER',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    lastActive: new Date(Date.now() - 7200000).toISOString(),
    status: 'active',
    searchesCount: 9,
  },
  {
    id: 'usr_user_9123',
    name: 'Suresh Kumar Mobile Hub',
    email: 'suresh.parts@yahoo.com',
    phone: '9123456789',
    passwordHash: defaultUserHash,
    displayPassword: 'user123',
    role: 'USER',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    lastActive: new Date(Date.now() - 1200000).toISOString(),
    status: 'active',
    searchesCount: 24,
  }
];

// All Spare Part Prices UNDER ₹600!
export const initialSpareParts: SparePart[] = [
  // --- APPLE ---
  {
    id: 'part_apl_01',
    name: 'iPhone 15 Pro Max OLED Screen Digitizer Flex',
    brand: 'Apple',
    compatibleModels: ['iPhone 15 Pro Max', 'A3106'],
    category: 'Screens',
    price: 549, // Under 600
    stock: 14,
    qualityGrade: 'OEM Original',
    sku: 'APL-15PM-OLED-01',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    specifications: {
      'Refresh Rate': '120Hz ProMotion',
      'Resolution': '2796 x 1290 pixels',
      'Frame Included': 'Yes'
    },
    installationDifficulty: 'Expert',
    description: 'High quality replacement display assembly for iPhone 15 Pro Max.',
    featured: true
  },
  {
    id: 'part_apl_02',
    name: 'iPhone 15 Pro Li-Ion Battery Unit 4422mAh',
    brand: 'Apple',
    compatibleModels: ['iPhone 15 Pro Max', 'A3106'],
    category: 'Batteries',
    price: 389, // Under 600
    stock: 35,
    qualityGrade: 'OEM Original',
    sku: 'APL-15PM-BAT-02',
    imageUrl: 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=600&auto=format&fit=crop&q=80',
    specifications: {
      'Capacity': '4422 mAh',
      'Voltage': '3.87V'
    },
    installationDifficulty: 'Medium',
    description: '100% Health OEM Replacement Battery for iPhone 15 Pro Max.',
    featured: false
  },
  {
    id: 'part_apl_03',
    name: 'iPhone 14 Pro 48MP Rear Camera Lens IC',
    brand: 'Apple',
    compatibleModels: ['iPhone 14 Pro', 'iPhone 14 Pro Max'],
    category: 'Camera Modules',
    price: 499, // Under 600
    stock: 8,
    qualityGrade: 'OEM Original',
    sku: 'APL-14P-CAM-03',
    imageUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
    specifications: {
      'Main Sensor': '48MP OIS',
      'Lens': 'Crystal Glass'
    },
    installationDifficulty: 'Expert',
    description: 'Replacement camera lens module array for iPhone 14 Pro series.',
    featured: true
  },
  {
    id: 'part_apl_04',
    name: 'iPhone 15 Type-C Charging Port Board Flex',
    brand: 'Apple',
    compatibleModels: ['iPhone 15', 'iPhone 15 Plus'],
    category: 'Charging Ports',
    price: 249, // Under 600
    stock: 42,
    qualityGrade: 'Grade A++',
    sku: 'APL-15-CHG-04',
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
    specifications: {
      'Port Type': 'USB-C 2.0',
      'Microphone': 'Built-in Mic'
    },
    installationDifficulty: 'Medium',
    description: 'Bottom dock flex assembly with USB-C connector port.',
    featured: false
  },

  // --- SAMSUNG ---
  {
    id: 'part_sam_01',
    name: 'Galaxy S24 Ultra AMOLED Screen Panel Assembly',
    brand: 'Samsung',
    compatibleModels: ['Galaxy S24 Ultra', 'SM-S928B'],
    category: 'Screens',
    price: 589, // Under 600
    stock: 12,
    qualityGrade: 'OEM Original',
    sku: 'SAM-S24U-SCR-01',
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
    specifications: {
      'Display Tech': 'Dynamic AMOLED 2X',
      'Refresh Rate': '120Hz'
    },
    installationDifficulty: 'Expert',
    description: 'Official screen replacement unit for Galaxy S24 Ultra.',
    featured: true
  },
  {
    id: 'part_sam_02',
    name: 'Galaxy S23 Ultra 5000mAh Battery Cell',
    brand: 'Samsung',
    compatibleModels: ['Galaxy S23 Ultra', 'SM-S918B'],
    category: 'Batteries',
    price: 349, // Under 600
    stock: 28,
    qualityGrade: 'OEM Original',
    sku: 'SAM-S23U-BAT-02',
    imageUrl: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=600&auto=format&fit=crop&q=80',
    specifications: {
      'Capacity': '5000 mAh',
      'Charging': '45W Super Fast'
    },
    installationDifficulty: 'Medium',
    description: 'Original SDI battery cell for Galaxy S23 Ultra.',
    featured: false
  },
  {
    id: 'part_sam_04',
    name: 'Galaxy S22 Ultra Type-C Charging Sub-Board',
    brand: 'Samsung',
    compatibleModels: ['Galaxy S22 Ultra', 'SM-S908B'],
    category: 'Charging Ports',
    price: 199, // Under 600
    stock: 50,
    qualityGrade: 'Grade A++',
    sku: 'SAM-S22U-CHG-04',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    specifications: {
      'Port': 'USB 3.2',
      'SIM Slot': 'Dual SIM IC'
    },
    installationDifficulty: 'Easy',
    description: 'Sub-board PCB assembly with type-c socket.',
    featured: false
  },

  // --- XIAOMI ---
  {
    id: 'part_xio_01',
    name: 'Xiaomi 14 Pro 120Hz Curved Display Digitizer',
    brand: 'Xiaomi',
    compatibleModels: ['Xiaomi 14 Pro', '23116PN5BC'],
    category: 'Screens',
    price: 499, // Under 600
    stock: 19,
    qualityGrade: 'OEM Original',
    sku: 'XMI-14P-OLED-01',
    imageUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',
    specifications: {
      'Panel': 'AMOLED 120Hz',
      'Brightness': '3000 nits'
    },
    installationDifficulty: 'Medium',
    description: 'Curved AMOLED display panel with pre-installed fingerprint bracket.',
    featured: true
  },
  {
    id: 'part_xio_02',
    name: 'Redmi Note 13 Pro+ 5000mAh Battery (120W)',
    brand: 'Xiaomi',
    compatibleModels: ['Redmi Note 13 Pro+'],
    category: 'Batteries',
    price: 299, // Under 600
    stock: 40,
    qualityGrade: 'OEM Original',
    sku: 'XMI-RN13P-BAT-02',
    imageUrl: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=600&auto=format&fit=crop&q=80',
    specifications: {
      'Capacity': '5000 mAh',
      'Fast Charge': '120W HyperCharge'
    },
    installationDifficulty: 'Easy',
    description: 'Genuine battery replacement supporting 120W fast charging.',
    featured: false
  },

  // --- REALME ---
  {
    id: 'part_rlm_01',
    name: 'Realme 12 Pro+ Curved AMOLED Display Screen',
    brand: 'Realme',
    compatibleModels: ['Realme 12 Pro+', 'RMX3840'],
    category: 'Screens',
    price: 429, // Under 600
    stock: 22,
    qualityGrade: 'OEM Original',
    sku: 'RLM-12PP-SCR-01',
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
    specifications: {
      'Refresh Rate': '120Hz',
      'Curvature': '61 Degree'
    },
    installationDifficulty: 'Medium',
    description: 'Vibrant OLED panel with precision curvature for Realme 12 Pro+.',
    featured: true
  },
  {
    id: 'part_rlm_02',
    name: 'Realme GT 5 Pro 5400mAh Battery Unit',
    brand: 'Realme',
    compatibleModels: ['Realme GT 5 Pro'],
    category: 'Batteries',
    price: 279, // Under 600
    stock: 31,
    qualityGrade: 'OEM Original',
    sku: 'RLM-GT5P-BAT-02',
    imageUrl: 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=600&auto=format&fit=crop&q=80',
    specifications: {
      'Capacity': '5400 mAh',
      'Speed': '100W SuperVOOC'
    },
    installationDifficulty: 'Medium',
    description: 'High-density battery module for Realme GT 5 Pro.',
    featured: false
  },

  // --- VIVO ---
  {
    id: 'part_vvo_01',
    name: 'Vivo X100 Pro ZEISS Main Camera Glass IC',
    brand: 'Vivo',
    compatibleModels: ['Vivo X100 Pro', 'V2324A'],
    category: 'Camera Modules',
    price: 529, // Under 600
    stock: 7,
    qualityGrade: 'OEM Original',
    sku: 'VVO-X100P-CAM-01',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
    specifications: {
      'Lens': 'ZEISS T* Coating',
      'Sensor': '1-inch Sony IMX989'
    },
    installationDifficulty: 'Expert',
    description: 'Camera module replacement with ZEISS T* anti-reflective optics.',
    featured: true
  },
  {
    id: 'part_vvo_03',
    name: 'Vivo Y200e 5G Charging Port Sub-Board PCB',
    brand: 'Vivo',
    compatibleModels: ['Vivo Y200e 5G'],
    category: 'Charging Ports',
    price: 159, // Under 600
    stock: 55,
    qualityGrade: 'Grade A++',
    sku: 'VVO-Y200-CHG-03',
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
    specifications: {
      'Speed': '44W FlashCharge'
    },
    installationDifficulty: 'Easy',
    description: 'Original sub-board replacement for charging issues on Vivo Y200e.',
    featured: false
  },

  // --- ONEPLUS ---
  {
    id: 'part_1plus_01',
    name: 'OnePlus 12 2K LTPO AMOLED Screen Digitizer',
    brand: 'OnePlus',
    compatibleModels: ['OnePlus 12', 'CPH2581'],
    category: 'Screens',
    price: 579, // Under 600
    stock: 14,
    qualityGrade: 'OEM Original',
    sku: '1PL-12-SCR-01',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    specifications: {
      'Display': '2K LTPO AMOLED',
      'Touch': 'Aqua Touch'
    },
    installationDifficulty: 'Expert',
    description: '2K screen module with rain/wet hand touch technology.',
    featured: true
  },
  {
    id: 'part_1plus_02',
    name: 'OnePlus 12R 5500mAh Battery Cell',
    brand: 'OnePlus',
    compatibleModels: ['OnePlus 12R', 'CPH2585'],
    category: 'Batteries',
    price: 369, // Under 600
    stock: 33,
    qualityGrade: 'OEM Original',
    sku: '1PL-12R-BAT-02',
    imageUrl: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=600&auto=format&fit=crop&q=80',
    specifications: {
      'Capacity': '5500 mAh',
      'Fast Charge': '100W SUPERVOOC'
    },
    installationDifficulty: 'Medium',
    description: 'High capacity battery cell for OnePlus 12R.',
    featured: false
  },

  // --- GOOGLE PIXEL ---
  {
    id: 'part_pxl_01',
    name: 'Google Pixel 8 Pro Super Actua Display Digitizer',
    brand: 'Google Pixel',
    compatibleModels: ['Pixel 8 Pro', 'GC3VE'],
    category: 'Screens',
    price: 599, // Under 600
    stock: 9,
    qualityGrade: 'OEM Original',
    sku: 'PXL-8P-SCR-01',
    imageUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',
    specifications: {
      'Display': 'Super Actua OLED',
      'Glass': 'Gorilla Glass Victus 2'
    },
    installationDifficulty: 'Expert',
    description: 'Super Actua display panel with under-display optical fingerprint scanner.',
    featured: true
  }
];

export const initialSearchLogs: SearchLog[] = [
  {
    id: 'log_101',
    userId: 'usr_tech_9876',
    userName: 'Rahul Sharma Repair Tech',
    userPhone: '9876543210',
    userEmail: 'rahul.fix@gmail.com',
    query: 'iPhone 15 Pro Max Screen OLED',
    brandFilter: 'Apple',
    categoryFilter: 'Screens',
    resultsCount: 1,
    ipAddress: '103.24.112.45',
    deviceInfo: 'Chrome / Windows 11',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    isSuspicious: false,
  },
  {
    id: 'log_102',
    userId: 'usr_user_9123',
    userName: 'Suresh Kumar Mobile Hub',
    userPhone: '9123456789',
    userEmail: 'suresh.parts@yahoo.com',
    query: 'Galaxy S24 Ultra Battery 5000mAh',
    brandFilter: 'Samsung',
    categoryFilter: 'Batteries',
    resultsCount: 1,
    ipAddress: '49.36.198.12',
    deviceInfo: 'Safari / macOS Sonoma',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    isSuspicious: false,
  }
];
