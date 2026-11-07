import React, { useState } from 'react';
import { X, Database, Copy, Check, Table, ShieldCheck, Key } from 'lucide-react';

interface DatabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSchemaModal: React.FC<DatabaseSchemaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const [activeSchemaTab, setActiveSchemaTab] = useState<'User' | 'SparePart' | 'SearchLog' | 'FullSQL'>('User');

  const schemas = {
    User: {
      tableName: 'users',
      description: 'Stores user accounts, credentials hashed with bcrypt, and role definitions.',
      fields: [
        { name: 'id', type: 'VARCHAR(64)', key: 'PRIMARY KEY', desc: 'Unique user identifier' },
        { name: 'name', type: 'VARCHAR(255)', key: 'NOT NULL', desc: 'User full name' },
        { name: 'email', type: 'VARCHAR(255)', key: 'UNIQUE NOT NULL', desc: 'Primary email address' },
        { name: 'phone', type: 'VARCHAR(20)', key: 'UNIQUE NOT NULL', desc: 'Phone number (Phone "7985114480" triggers DEVELOPER/ADMIN role)' },
        { name: 'passwordHash', type: 'VARCHAR(255)', key: 'NOT NULL', desc: 'Bcrypt hashed password (10 salt rounds, plain text never stored)' },
        { name: 'role', type: 'ENUM("USER", "DEVELOPER/ADMIN")', key: 'DEFAULT "USER"', desc: 'Role-Based Access Control permission level' },
        { name: 'createdAt', type: 'TIMESTAMP', key: 'DEFAULT CURRENT_TIMESTAMP', desc: 'Registration timestamp' },
        { name: 'lastActive', type: 'TIMESTAMP', key: 'NOT NULL', desc: 'Last API session timestamp' },
        { name: 'status', type: 'ENUM("active", "suspended")', key: 'DEFAULT "active"', desc: 'Account access status' },
        { name: 'searchesCount', type: 'INT', key: 'DEFAULT 0', desc: 'Cumulative search queries executed' },
      ]
    },
    SparePart: {
      tableName: 'spare_parts',
      description: 'Contains catalog of mobile replacement components organized by brand slot.',
      fields: [
        { name: 'id', type: 'VARCHAR(64)', key: 'PRIMARY KEY', desc: 'Unique spare part SKU identifier' },
        { name: 'name', type: 'VARCHAR(255)', key: 'NOT NULL', desc: 'Full descriptive title of the component' },
        { name: 'brand', type: 'VARCHAR(100)', key: 'INDEXED', desc: 'Phone brand slot (Apple, Samsung, Xiaomi, Realme, Vivo, OnePlus, Google Pixel)' },
        { name: 'compatibleModels', type: 'TEXT[] (JSON Array)', key: 'NOT NULL', desc: 'List of smartphone models and revision numbers supported' },
        { name: 'category', type: 'ENUM(...)', key: 'INDEXED', desc: 'Screens, Batteries, Camera Modules, Charging Ports, Motherboards, Flex Cables, Speakers, Back Glasses' },
        { name: 'price', type: 'DECIMAL(10,2)', key: 'NOT NULL', desc: 'Wholesale dealer price in INR (₹)' },
        { name: 'stock', type: 'INT', key: 'NOT NULL', desc: 'Current available inventory count' },
        { name: 'qualityGrade', type: 'ENUM("OEM Original", "Grade A++", "Refurbished Genuine")', key: 'NOT NULL', desc: 'Component quality classification' },
        { name: 'sku', type: 'VARCHAR(100)', key: 'UNIQUE NOT NULL', desc: 'Stock keeping unit barcode string' },
        { name: 'imageUrl', type: 'TEXT', key: 'NOT NULL', desc: 'High-res product photography URL' },
        { name: 'specifications', type: 'JSONB / KV Object', key: 'NULLABLE', desc: 'Technical parameters (voltage, refresh rate, MP rating, etc.)' },
        { name: 'installationDifficulty', type: 'ENUM("Easy", "Medium", "Expert")', key: 'NOT NULL', desc: 'Technician repair skill level requirement' },
      ]
    },
    SearchLog: {
      tableName: 'search_logs',
      description: 'Records real-time user search queries for platform monitoring and security anomaly detection.',
      fields: [
        { name: 'id', type: 'VARCHAR(64)', key: 'PRIMARY KEY', desc: 'Unique telemetry record ID' },
        { name: 'userId', type: 'VARCHAR(64)', key: 'FOREIGN KEY -> users.id', desc: 'ID of authenticated user (or NULL for guest)' },
        { name: 'userName', type: 'VARCHAR(255)', key: 'NOT NULL', desc: 'User name at time of search' },
        { name: 'userPhone', type: 'VARCHAR(20)', key: 'NOT NULL', desc: 'User phone number' },
        { name: 'userEmail', type: 'VARCHAR(255)', key: 'NOT NULL', desc: 'User email ID' },
        { name: 'query', type: 'TEXT', key: 'NOT NULL', desc: 'Raw search query string entered by user' },
        { name: 'brandFilter', type: 'VARCHAR(100)', key: 'DEFAULT "All Brands"', desc: 'Brand slot filter applied during query' },
        { name: 'categoryFilter', type: 'VARCHAR(100)', key: 'DEFAULT "All Categories"', desc: 'Component category filter applied' },
        { name: 'resultsCount', type: 'INT', key: 'NOT NULL', desc: 'Number of spare parts returned' },
        { name: 'ipAddress', type: 'VARCHAR(45)', key: 'NOT NULL', desc: 'Client IP address' },
        { name: 'deviceInfo', type: 'VARCHAR(255)', key: 'NOT NULL', desc: 'Browser User-Agent device string' },
        { name: 'timestamp', type: 'TIMESTAMP', key: 'DEFAULT CURRENT_TIMESTAMP', desc: 'Exact search execution timestamp' },
        { name: 'isSuspicious', type: 'BOOLEAN', key: 'DEFAULT FALSE', desc: 'Flagged true if SQLi/XSS keywords or anomalies detected' },
        { name: 'flagReason', type: 'VARCHAR(255)', key: 'NULLABLE', desc: 'Explanation for security flag' },
      ]
    }
  };

  const sqlCode = `-- PostgreSQL / MySQL Schema Specification for Mobilix Mobile Spare Parts Directory

-- 1. USERS TABLE (RBAC & Bcrypt Hashed Authentication)
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- Hashed with bcrypt (10 rounds)
  role VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER', 'DEVELOPER/ADMIN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  searches_count INT DEFAULT 0
);

-- Note: System automatically assigns DEVELOPER/ADMIN role if phone = '7985114480'

-- 2. SPARE PARTS TABLE
CREATE TABLE spare_parts (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL, -- Apple, Samsung, Xiaomi, Realme, Vivo, OnePlus, Google Pixel
  compatible_models JSONB NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  quality_grade VARCHAR(50) NOT NULL, -- 'OEM Original', 'Grade A++', 'Refurbished Genuine'
  sku VARCHAR(100) UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  specifications JSONB,
  installation_difficulty VARCHAR(20) NOT NULL DEFAULT 'Medium'
);

CREATE INDEX idx_spare_parts_brand ON spare_parts(brand);
CREATE INDEX idx_spare_parts_category ON spare_parts(category);

-- 3. SEARCH LOGS TABLE (User Activity Telemetry & Anomaly Detection)
CREATE TABLE search_logs (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(255) NOT NULL,
  user_phone VARCHAR(20) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  query TEXT NOT NULL,
  brand_filter VARCHAR(100) DEFAULT 'All Brands',
  category_filter VARCHAR(100) DEFAULT 'All Categories',
  results_count INT NOT NULL DEFAULT 0,
  ip_address VARCHAR(45) NOT NULL,
  device_info VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_suspicious BOOLEAN DEFAULT FALSE,
  flag_reason VARCHAR(255)
);

CREATE INDEX idx_search_logs_user_id ON search_logs(user_id);
CREATE INDEX idx_search_logs_suspicious ON search_logs(is_suspicious);
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                Complete Database Schema Architecture
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Data models for User, SparePart, and SearchLog tables
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'SQL Schema Copied!' : 'Copy SQL Schema'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3 flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 gap-2">
          {(['User', 'SparePart', 'SearchLog', 'FullSQL'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSchemaTab(tab)}
              className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
                activeSchemaTab === tab
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab === 'FullSQL' ? '📄 Full DDL Script (SQL)' : `Table: ${tab}`}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeSchemaTab !== 'FullSQL' ? (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs">
                <span className="font-extrabold text-indigo-900 dark:text-indigo-200 block">
                  Table: <span className="font-mono text-indigo-600 dark:text-indigo-400">{schemas[activeSchemaTab].tableName}</span>
                </span>
                <p className="text-slate-600 dark:text-indigo-300 mt-0.5">
                  {schemas[activeSchemaTab].description}
                </p>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase text-[10px]">
                      <th className="p-3">Field Name</th>
                      <th className="p-3">Data Type</th>
                      <th className="p-3">Constraint / Key</th>
                      <th className="p-3">Description & Security Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {schemas[activeSchemaTab].fields.map((field, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {field.key.includes('PRIMARY') && <Key className="w-3.5 h-3.5 text-amber-500" />}
                          {field.name}
                        </td>
                        <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400">{field.type}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-500">{field.key}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">{field.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="relative">
              <pre className="p-4 bg-slate-950 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                {sqlCode}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Compliant with bcrypt hashing & RBAC trigger specification</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
