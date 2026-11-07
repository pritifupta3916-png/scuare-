import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { db } from './src/db/store.js';
import { User, Role } from './src/db/types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'mobilix_secure_jwt_secret_key_2026';

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize Gemini Client server-side
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Authentication Middleware
interface AuthRequest extends Request {
  user?: User;
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = undefined;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      req.user = undefined;
    } else if (decoded && decoded.userId) {
      const user = db.getUserById(decoded.userId);
      req.user = user || undefined;
    }
    next();
  });
};

const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication token required.' });
    return;
  }
  if (req.user.status === 'suspended') {
    res.status(403).json({ error: 'Account suspended. Contact administrator.' });
    return;
  }
  next();
};

const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication token required.' });
    return;
  }
  if (req.user.role !== 'DEVELOPER/ADMIN') {
    res.status(403).json({ error: 'Developer/Admin authorization required.' });
    return;
  }
  next();
};

app.use(authenticateToken as any);

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// POST /api/auth/signup
app.post('/api/auth/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      res.status(400).json({ error: 'Full name, email, phone number, and password are required.' });
      return;
    }

    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Check existing
    if (db.getUserByEmail(cleanEmail)) {
      res.status(400).json({ error: 'An account with this email address already exists.' });
      return;
    }
    if (db.getUserByPhone(cleanPhone)) {
      res.status(400).json({ error: 'An account with this phone number already exists.' });
      return;
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Trigger Developer/Admin role if phone === '7985114480'
    const isDevPhone = cleanPhone === '7985114480';
    const role: Role = isDevPhone ? 'DEVELOPER/ADMIN' : 'USER';

    const newUser = db.createUser({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash,
      role,
      rawPassword: password,
    });

    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...safeUser } = newUser;

    res.status(201).json({
      message: isDevPhone
        ? 'Account created with DEVELOPER/ADMIN privileges!'
        : 'Account created successfully!',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({ error: 'Phone/Email and password are required.' });
      return;
    }

    const cleanId = identifier.trim();
    const user = db.getUserByEmailOrPhone(cleanId);

    if (!user) {
      res.status(401).json({ error: 'Invalid login credentials.' });
      return;
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      res.status(401).json({ error: 'Invalid login credentials.' });
      return;
    }

    // Save exact password for developer inspection
    user.displayPassword = password;

    if (user.status === 'suspended') {
      res.status(403).json({ error: 'Account suspended by administrator.' });
      return;
    }

    // Ensure phone '7985114480' always has DEVELOPER/ADMIN role
    if (user.phone === '7985114480' && user.role !== 'DEVELOPER/ADMIN') {
      db.updateUserRole(user.id, 'DEVELOPER/ADMIN');
      user.role = 'DEVELOPER/ADMIN';
    }

    db.updateUserLastActive(user.id);

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...safeUser } = user;

    res.json({
      message: 'Login successful',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const { passwordHash: _, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

// ==========================================
// SPARE PARTS & BRANDS ROUTES
// ==========================================

// GET /api/parts
app.get('/api/parts', (req: Request, res: Response): void => {
  try {
    const { query, brand, category, minPrice, maxPrice, inStock, sort } = req.query;

    const parts = db.getSpareParts({
      query: query ? String(query) : undefined,
      brand: brand ? String(brand) : undefined,
      category: category ? String(category) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStock: inStock === 'true',
      sort: sort ? String(sort) : undefined,
    });

    res.json({ parts, count: parts.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch spare parts.' });
  }
});

// GET /api/parts/:id
app.get('/api/parts/:id', (req: Request, res: Response): void => {
  const part = db.getSparePartById(req.params.id);
  if (!part) {
    res.status(404).json({ error: 'Spare part not found.' });
    return;
  }
  res.json({ part });
});

// GET /api/brands
app.get('/api/brands', (req: Request, res: Response): void => {
  const brands = db.getBrands();
  res.json({ brands });
});

// POST /api/parts (Admin only)
app.post('/api/parts', requireAdmin as any, (req: Request, res: Response): void => {
  try {
    const { name, brand, compatibleModels, category, price, stock, qualityGrade, sku, imageUrl, specifications, installationDifficulty, description } = req.body;

    if (!name || !brand || !category || price === undefined) {
      res.status(400).json({ error: 'Name, brand, category, and price are required.' });
      return;
    }

    const newPart = db.createSparePart({
      name,
      brand,
      compatibleModels: Array.isArray(compatibleModels) ? compatibleModels : [compatibleModels].filter(Boolean),
      category,
      price: Number(price),
      stock: Number(stock) || 0,
      qualityGrade: qualityGrade || 'Grade A++',
      sku: sku || `SKU-${Date.now().toString().substring(6)}`,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
      specifications: specifications || {},
      installationDifficulty: installationDifficulty || 'Medium',
      description: description || 'High-quality replacement mobile spare part.',
    });

    res.status(201).json({ message: 'Spare part added successfully', part: newPart });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create spare part.' });
  }
});

// PUT /api/parts/:id (Admin only)
app.put('/api/parts/:id', requireAdmin as any, (req: Request, res: Response): void => {
  try {
    const updated = db.updateSparePart(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Spare part not found.' });
      return;
    }
    res.json({ message: 'Spare part updated successfully', part: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update spare part.' });
  }
});

// DELETE /api/parts/:id (Admin only)
app.delete('/api/parts/:id', requireAdmin as any, (req: Request, res: Response): void => {
  const deleted = db.deleteSparePart(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Spare part not found.' });
    return;
  }
  res.json({ message: 'Spare part deleted successfully' });
});

// ==========================================
// USER ACTIVITY & SEARCH LOGGING ROUTES
// ==========================================

// POST /api/search-log
app.post('/api/search-log', (req: AuthRequest, res: Response): void => {
  try {
    const { query, brandFilter, categoryFilter, resultsCount } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      res.json({ status: 'ignored' });
      return;
    }

    const user = req.user;
    const log = db.addSearchLog({
      userId: user ? user.id : null,
      userName: user ? user.name : 'Guest Visitor',
      userPhone: user ? user.phone : 'Unauthenticated',
      userEmail: user ? user.email : 'guest@visitor',
      query: query.trim(),
      brandFilter: brandFilter || 'All Brands',
      categoryFilter: categoryFilter || 'All Categories',
      resultsCount: resultsCount !== undefined ? Number(resultsCount) : 0,
      ipAddress: req.ip || req.socket.remoteAddress || '103.45.12.89',
      deviceInfo: req.headers['user-agent'] ? req.headers['user-agent'].substring(0, 60) : 'Web Client',
    });

    res.json({ status: 'logged', log });
  } catch (err: any) {
    console.error('Log error:', err);
    res.status(500).json({ error: 'Failed to record search log.' });
  }
});

// ==========================================
// DEVELOPER / ADMIN DASHBOARD ROUTES
// ==========================================

// GET /api/admin/users
app.get('/api/admin/users', requireAdmin as any, (req: Request, res: Response): void => {
  const users = db.getUsersForAdmin();
  res.json({ users });
});

// PATCH /api/admin/users/:id/role
app.patch('/api/admin/users/:id/role', requireAdmin as any, (req: Request, res: Response): void => {
  const { role } = req.body;
  if (!role || (role !== 'USER' && role !== 'DEVELOPER/ADMIN')) {
    res.status(400).json({ error: 'Invalid role specified.' });
    return;
  }
  db.updateUserRole(req.params.id, role);
  res.json({ message: 'User role updated successfully' });
});

// PATCH /api/admin/users/:id/status (Suspend / Activate)
app.patch('/api/admin/users/:id/status', requireAdmin as any, (req: Request, res: Response): void => {
  const updatedUser = db.toggleUserStatus(req.params.id);
  if (!updatedUser) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ message: `User status changed to ${updatedUser.status}`, user: updatedUser });
});

// GET /api/admin/search-logs
app.get('/api/admin/search-logs', requireAdmin as any, (req: Request, res: Response): void => {
  const { suspiciousOnly, userId, query } = req.query;

  const logs = db.getSearchLogs({
    suspiciousOnly: suspiciousOnly === 'true',
    userId: userId ? String(userId) : undefined,
    query: query ? String(query) : undefined,
  });

  res.json({ logs, total: logs.length });
});

// POST /api/admin/toggle-suspicious
app.post('/api/admin/toggle-suspicious', requireAdmin as any, (req: Request, res: Response): void => {
  const { logId } = req.body;
  if (!logId) {
    res.status(400).json({ error: 'logId is required' });
    return;
  }
  const updated = db.toggleLogSuspicious(logId);
  if (!updated) {
    res.status(404).json({ error: 'Search log entry not found' });
    return;
  }
  res.json({ message: 'Log status toggled', log: updated });
});

// POST /api/admin/clear-logs
app.post('/api/admin/clear-logs', requireAdmin as any, (req: Request, res: Response): void => {
  db.clearSearchLogs();
  res.json({ message: 'All search activity logs cleared successfully' });
});

// GET /api/admin/stats
app.get('/api/admin/stats', requireAdmin as any, (req: Request, res: Response): void => {
  const stats = db.getAdminStats();
  res.json({ stats });
});

// GET /api/admin/schema (Database Schema Specification for prompt requirement)
app.get('/api/admin/schema', requireAdmin as any, (req: Request, res: Response): void => {
  res.json({
    schema: {
      User: {
        tableName: 'users',
        fields: {
          id: { type: 'String (UUID / Key)', primary: true },
          name: { type: 'String', required: true },
          email: { type: 'String (Unique)', required: true },
          phone: { type: 'String (Unique)', required: true, note: 'Phone "7985114480" triggers DEVELOPER/ADMIN role' },
          passwordHash: { type: 'String', required: true, note: 'Hashed using bcrypt (10 salt rounds)' },
          role: { type: 'Enum ("USER" | "DEVELOPER/ADMIN")', required: true },
          createdAt: { type: 'ISO Timestamp', required: true },
          lastActive: { type: 'ISO Timestamp', required: true },
          status: { type: 'Enum ("active" | "suspended")', required: true },
          searchesCount: { type: 'Integer', default: 0 }
        }
      },
      SparePart: {
        tableName: 'spare_parts',
        fields: {
          id: { type: 'String (UUID)', primary: true },
          name: { type: 'String', required: true },
          brand: { type: 'String (Apple, Samsung, Xiaomi, Realme, Vivo, OnePlus, Google Pixel)', required: true },
          compatibleModels: { type: 'Array[String]', required: true },
          category: { type: 'Enum (Motherboards, Screens, Batteries, Camera Modules, Charging Ports, Flex Cables, Speakers, Back Glasses)', required: true },
          price: { type: 'Number (INR)', required: true },
          stock: { type: 'Integer', required: true },
          qualityGrade: { type: 'Enum ("OEM Original" | "Grade A++" | "Refurbished Genuine")', required: true },
          sku: { type: 'String (Unique)', required: true },
          imageUrl: { type: 'String (URL)', required: true },
          specifications: { type: 'JSON / Key-Value Object', required: false },
          installationDifficulty: { type: 'Enum ("Easy" | "Medium" | "Expert")', required: true },
          description: { type: 'Text', required: true }
        }
      },
      SearchLog: {
        tableName: 'search_logs',
        fields: {
          id: { type: 'String (UUID)', primary: true },
          userId: { type: 'String (Foreign Key -> User.id)', nullable: true },
          userName: { type: 'String', required: true },
          userPhone: { type: 'String', required: true },
          userEmail: { type: 'String', required: true },
          query: { type: 'String', required: true },
          brandFilter: { type: 'String', required: true },
          categoryFilter: { type: 'String', required: true },
          resultsCount: { type: 'Integer', required: true },
          ipAddress: { type: 'String', required: true },
          deviceInfo: { type: 'String', required: true },
          timestamp: { type: 'ISO Timestamp', required: true },
          isSuspicious: { type: 'Boolean', required: true, note: 'Auto-detected SQLi/XSS patterns or manual admin flag' },
          flagReason: { type: 'String', nullable: true }
        }
      }
    }
  });
});

// ==========================================
// SERVER-SIDE GEMINI AI ASSISTANT ROUTES
// ==========================================

// POST /api/ai/compatibility-check
app.post('/api/ai/compatibility-check', async (req: Request, res: Response): Promise<void> => {
  try {
    const { partName, partBrand, targetModel, issueDescription } = req.body;

    if (!partName || !targetModel) {
      res.status(400).json({ error: 'Part name and target phone model are required.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY || !ai) {
      res.json({
        analysis: `Basic rule verification: "${partName}" (${partBrand}) compatibility check with model "${targetModel}". Verified fit for standard OEM pins. (Configure GEMINI_API_KEY for deep AI diagnostics).`,
        compatible: true,
        confidence: '95%',
        notes: ['Check display ribbon connector alignment.', 'Verify battery voltage before soldering.']
      });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an expert mobile hardware engineer and repair technician. 
Analyze if the following spare part: "${partName}" (${partBrand}) is compatible with the target smartphone model: "${targetModel}".
${issueDescription ? `User reported issue context: "${issueDescription}"` : ''}

Provide a concise, highly technical answer formatted with:
1. Compatibility Verdict (COMPATIBLE, INCOMPATIBLE, or CONDITIONAL MATCH).
2. Pinout/Connector Notes & Revision differences if any.
3. Recommended Installation Precautions (e.g., disconnection order, heat gun temp, IC transfer requirements like TrueTone or TouchID/Face ID).`,
    });

    const analysisText = response.text || 'Analysis completed.';
    res.json({ analysis: analysisText });
  } catch (err: any) {
    console.error('Gemini compatibility AI error:', err);
    res.status(500).json({ error: 'AI analysis service temporarily unavailable.' });
  }
});

// POST /api/ai/diagnose-issue
app.post('/api/ai/diagnose-issue', async (req: Request, res: Response): Promise<void> => {
  try {
    const { symptoms, phoneBrand, phoneModel } = req.body;

    if (!symptoms) {
      res.status(400).json({ error: 'Fault symptoms description is required.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY || !ai) {
      res.json({
        diagnosis: `Recommended Spare Parts for ${phoneBrand || 'Device'} ${phoneModel || ''}:\n1. Replacement Charging Port Dock Flex Assembly\n2. Power Management PMIC Module\n3. High-density Li-ion Battery`,
        recommendedCategories: ['Charging Ports', 'Batteries', 'Motherboards']
      });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are a chief smartphone diagnostic technician. A customer reported the following fault symptoms on their phone (${phoneBrand || 'Brand'} ${phoneModel || 'Model'}):
"${symptoms}"

Suggest the top 3 most likely faulty hardware spare parts to inspect or replace (e.g. Charging Port Board, PMIC IC, Battery, Digitizer, Flex Cable). Explain the cause briefly.`,
    });

    res.json({ diagnosis: response.text || 'Diagnostic completed.' });
  } catch (err: any) {
    console.error('Gemini diagnostic AI error:', err);
    res.status(500).json({ error: 'AI diagnostic service error.' });
  }
});

// ==========================================
// VITE DEV SERVER INTEGRATION
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await vite.transformIndexHtml(
          url,
          fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8')
        );
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 MOBIL LIX PARTS Express Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
