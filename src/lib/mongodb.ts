import { MongoClient, Db, Collection } from 'mongodb';

// MongoDB 连接配置
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB_NAME || 'kpop_dance_analytics';

let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * 连接到 MongoDB
 */
export async function connectToMongoDB(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    console.log('✓ MongoDB 连接成功');
    return db;
  } catch (error) {
    console.error('MongoDB 连接错误:', error);
    throw error;
  }
}

/**
 * 获取 MongoDB 数据库实例
 */
export async function getMongoDB(): Promise<Db> {
  if (!db) {
    return await connectToMongoDB();
  }
  return db;
}

/**
 * 获取集合（Collection）
 */
export async function getCollection<T = any>(collectionName: string): Promise<Collection<T>> {
  const database = await getMongoDB();
  return database.collection<T>(collectionName);
}

/**
 * 关闭 MongoDB 连接
 */
export async function closeMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB 连接已关闭');
  }
}

// 在应用关闭时清理连接
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await closeMongoDB();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await closeMongoDB();
    process.exit(0);
  });
}

export default { connectToMongoDB, getMongoDB, getCollection, closeMongoDB };

