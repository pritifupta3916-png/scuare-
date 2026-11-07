import fs from 'fs';
import path from 'path';
import { User, SparePart, SearchLog, AdminStats } from './types.js';
import { initialUsers, initialSpareParts, initialSearchLogs } from './seedData.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DbData {
  users: User[];
  spareParts: SparePart[];
  searchLogs: SearchLog[];
}

class DataStore {
  private users: User[] = [];
  private spareParts: SparePart[] = [];
  private searchLogs: SearchLog[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed: DbData = JSON.parse(fileContent);

        // Clamp prices under 600 if old seed existed
        if (parsed.spareParts && parsed.spareParts.length > 0) {
          this.spareParts = parsed.spareParts.map(p => ({
            ...p,
            price: p.price > 600 ? Math.floor(Math.random() * 350) + 249 : p.price
          }));
        } else {
          this.spareParts = [...initialSpareParts];
        }

        this.users = parsed.users && parsed.users.length > 0 ? parsed.users : [...initialUsers];
        this.searchLogs = parsed.searchLogs && parsed.searchLogs.length > 0 ? parsed.searchLogs : [...initialSearchLogs];
        this.save();
      } else {
        this.users = [...initialUsers];
        this.spareParts = [...initialSpareParts];
        this.searchLogs = [...initialSearchLogs];
        this.save();
      }
    } catch (err) {
      console.error('Error initializing DataStore, using defaults:', err);
      this.users = [...initialUsers];
      this.spareParts = [...initialSpareParts];
      this.searchLogs = [...initialSearchLogs];
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data: DbData = {
        users: this.users,
        spareParts: this.spareParts,
        searchLogs: this.searchLogs,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save DataStore to disk:', err);
    }
  }

  // --- USER METHODS ---
  public getUsers(): User[] {
    // For standard calls, omit passwordHash
    return this.users.map(({ passwordHash, ...user }) => user as User);
  }

  public getUsersForAdmin(): User[] {
    // For Developer / Admin dashboard: return complete user records with User ID, email, phone, and displayPassword!
    return this.users.map(u => ({
      ...u,
      displayPassword: u.displayPassword || 'encrypted (bcrypt)',
    }));
  }

  public getUserByEmailOrPhone(identifier: string): User | undefined {
    const cleanId = identifier.trim().toLowerCase();
    return this.users.find(u => u.email.toLowerCase() === cleanId || u.phone === identifier.trim());
  }

  public getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  public getUserByPhone(phone: string): User | undefined {
    return this.users.find(u => u.phone.trim() === phone.trim());
  }

  public createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastActive' | 'status' | 'searchesCount'> & { rawPassword?: string }): User {
    const isDevPhone = userData.phone.trim() === '7985114480';
    const role = isDevPhone ? 'DEVELOPER/ADMIN' : (userData.role || 'USER');

    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      role,
      displayPassword: userData.rawPassword || 'User-Defined Password',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      status: 'active',
      searchesCount: 0,
    };

    this.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUserLastActive(userId: string) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.lastActive = new Date().toISOString();
      this.save();
    }
  }

  public updateUserRole(userId: string, newRole: User['role']) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.role = newRole;
      this.save();
    }
  }

  public toggleUserStatus(userId: string): User | null {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.status = user.status === 'active' ? 'suspended' : 'active';
      this.save();
      return user;
    }
    return null;
  }

  // --- SPARE PART METHODS ---
  public getSpareParts(filters?: {
    query?: string;
    brand?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sort?: string;
  }): SparePart[] {
    let list = [...this.spareParts];

    // Ensure all prices under 600
    list = list.map(p => p.price > 600 ? { ...p, price: 599 } : p);

    if (filters) {
      const { query, brand, category, minPrice, maxPrice, inStock, sort } = filters;

      if (brand && brand !== 'All') {
        list = list.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
      }

      if (category && category !== 'All') {
        list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }

      if (minPrice !== undefined && !isNaN(minPrice)) {
        list = list.filter(p => p.price >= minPrice);
      }

      if (maxPrice !== undefined && !isNaN(maxPrice)) {
        list = list.filter(p => p.price <= maxPrice);
      }

      if (inStock) {
        list = list.filter(p => p.stock > 0);
      }

      if (query && query.trim() !== '') {
        const q = query.toLowerCase().trim();
        list = list.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.compatibleModels.some(m => m.toLowerCase().includes(q))
        );
      }

      if (sort === 'price-asc') {
        list.sort((a, b) => a.price - b.price);
      } else if (sort === 'price-desc') {
        list.sort((a, b) => b.price - a.price);
      } else if (sort === 'name') {
        list.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sort === 'stock') {
        list.sort((a, b) => b.stock - a.stock);
      }
    }

    return list;
  }

  public getSparePartById(id: string): SparePart | undefined {
    const part = this.spareParts.find(p => p.id === id);
    if (part && part.price > 600) {
      part.price = 599;
    }
    return part;
  }

  public createSparePart(partData: Omit<SparePart, 'id'>): SparePart {
    const newPart: SparePart = {
      ...partData,
      id: `part_${partData.brand.substring(0, 3).toLowerCase()}_${Date.now()}`,
      price: partData.price > 600 ? 599 : partData.price, // Ensure under 600
    };
    this.spareParts.push(newPart);
    this.save();
    return newPart;
  }

  public updateSparePart(id: string, updates: Partial<SparePart>): SparePart | null {
    const index = this.spareParts.findIndex(p => p.id === id);
    if (index !== -1) {
      const price = updates.price !== undefined && updates.price > 600 ? 599 : updates.price;
      this.spareParts[index] = { ...this.spareParts[index], ...updates, price: price ?? this.spareParts[index].price };
      this.save();
      return this.spareParts[index];
    }
    return null;
  }

  public deleteSparePart(id: string): boolean {
    const initialLen = this.spareParts.length;
    this.spareParts = this.spareParts.filter(p => p.id !== id);
    if (this.spareParts.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public getBrands(): { name: string; count: number }[] {
    const brandMap: Record<string, number> = {};
    for (const part of this.spareParts) {
      brandMap[part.brand] = (brandMap[part.brand] || 0) + 1;
    }
    return Object.entries(brandMap).map(([name, count]) => ({ name, count }));
  }

  // --- SEARCH LOG METHODS ---
  public addSearchLog(logData: {
    userId: string | null;
    userName: string;
    userPhone: string;
    userEmail: string;
    query: string;
    brandFilter?: string;
    categoryFilter?: string;
    resultsCount: number;
    ipAddress?: string;
    deviceInfo?: string;
  }): SearchLog {
    const q = logData.query.toLowerCase();
    const suspiciousPatterns = ['select', 'union', 'drop', 'script', '<script', 'delete', 'exec', '/*', 'eval(', 'alert('];
    let isSuspicious = false;
    let flagReason: string | undefined = undefined;

    if (suspiciousPatterns.some(p => q.includes(p))) {
      isSuspicious = true;
      flagReason = 'Potential code/SQL injection keywords detected in search parameter';
    } else if (q.length > 80) {
      isSuspicious = true;
      flagReason = 'Unusually long query string anomaly';
    }

    const newLog: SearchLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      userId: logData.userId,
      userName: logData.userName,
      userPhone: logData.userPhone,
      userEmail: logData.userEmail,
      query: logData.query,
      brandFilter: logData.brandFilter || 'All Brands',
      categoryFilter: logData.categoryFilter || 'All Categories',
      resultsCount: logData.resultsCount,
      ipAddress: logData.ipAddress || '127.0.0.1',
      deviceInfo: logData.deviceInfo || 'Standard Web Browser',
      timestamp: new Date().toISOString(),
      isSuspicious,
      flagReason,
    };

    this.searchLogs.unshift(newLog);
    if (this.searchLogs.length > 200) {
      this.searchLogs = this.searchLogs.slice(0, 200);
    }

    if (logData.userId) {
      const user = this.users.find(u => u.id === logData.userId);
      if (user) {
        user.searchesCount = (user.searchesCount || 0) + 1;
      }
    }

    this.save();
    return newLog;
  }

  public getSearchLogs(filters?: {
    suspiciousOnly?: boolean;
    userId?: string;
    query?: string;
  }): SearchLog[] {
    let logs = [...this.searchLogs];
    if (filters?.suspiciousOnly) {
      logs = logs.filter(l => l.isSuspicious);
    }
    if (filters?.userId) {
      logs = logs.filter(l => l.userId === filters.userId);
    }
    if (filters?.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim();
      logs = logs.filter(l =>
        l.query.toLowerCase().includes(q) ||
        l.userName.toLowerCase().includes(q) ||
        l.userPhone.includes(q) ||
        l.userEmail.toLowerCase().includes(q)
      );
    }
    return logs;
  }

  public toggleLogSuspicious(logId: string): SearchLog | null {
    const log = this.searchLogs.find(l => l.id === logId);
    if (log) {
      log.isSuspicious = !log.isSuspicious;
      if (log.isSuspicious && !log.flagReason) {
        log.flagReason = 'Manually flagged as suspicious by Developer/Admin';
      }
      this.save();
      return log;
    }
    return null;
  }

  public clearSearchLogs(): void {
    this.searchLogs = [];
    this.save();
  }

  public getAdminStats(): AdminStats {
    const totalUsers = this.users.length;
    const totalParts = this.spareParts.length;
    const totalSearches = this.searchLogs.length;
    const suspiciousSearchesCount = this.searchLogs.filter(l => l.isSuspicious).length;
    const lowStockCount = this.spareParts.filter(p => p.stock < 5).length;

    const queryCounts: Record<string, number> = {};
    for (const log of this.searchLogs) {
      const q = log.query.trim().toLowerCase();
      if (q) {
        queryCounts[q] = (queryCounts[q] || 0) + 1;
      }
    }

    const topSearchedQueries = Object.entries(queryCounts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const brandCounts: Record<string, number> = {};
    for (const part of this.spareParts) {
      brandCounts[part.brand] = (brandCounts[part.brand] || 0) + 1;
    }

    return {
      totalUsers,
      totalParts,
      totalSearches,
      suspiciousSearchesCount,
      lowStockCount,
      topSearchedQueries,
      brandCounts,
    };
  }
}

export const db = new DataStore();
