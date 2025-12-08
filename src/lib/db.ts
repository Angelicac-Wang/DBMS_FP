import { Pool } from 'pg';

// 建立 PostgreSQL 連接池
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'kpop_dance_db',
  user: process.env.DB_USER || 'yu',
  password: process.env.DB_PASSWORD,
  max: 20, // 連接池最大連接數
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 測試連接
pool.on('connect', () => {
  console.log('✓ PostgreSQL 連接成功');
});

pool.on('error', (err) => {
  console.error('PostgreSQL 連接錯誤:', err);
});

export default pool;

// 輔助函數：執行查詢
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
}

// 輔助函數：獲取單一結果
export async function queryOne(text: string, params?: any[]) {
  const res = await pool.query(text, params);
  return res.rows[0] || null;
}

// 輔助函數：獲取多個結果
export async function queryMany(text: string, params?: any[]) {
  const res = await pool.query(text, params);
  return res.rows;
}
