/**
 * 数据迁移脚本：将行为数据从 PostgreSQL 迁移到 MongoDB
 * 
 * 使用方法：
 * 1. 确保 MongoDB 已启动并配置好环境变量
 * 2. 运行: npx tsx scripts/migrate-behavior-to-mongodb.ts
 */

import pool from '../src/lib/db';
import { connectToMongoDB, closeMongoDB } from '../src/lib/mongodb';
import { getBehaviorEventsCollection, getSessionsCollection, getAggregatesCollection } from '../src/lib/mongodb-models';
import type { BehaviorEventDocument, SessionDocument, AggregateDocument } from '../src/lib/mongodb-models';

async function migrateBehaviorEvents() {
  console.log('开始迁移行为事件数据...');
  
  try {
    // 从 PostgreSQL 查询所有行为事件
    const result = await pool.query('SELECT * FROM user_behavior_events ORDER BY event_timestamp');
    const events = result.rows;
    
    if (events.length === 0) {
      console.log('没有找到需要迁移的行为事件数据');
      return;
    }

    console.log(`找到 ${events.length} 条行为事件记录`);

    // 连接到 MongoDB
    await connectToMongoDB();
    const collection = await getBehaviorEventsCollection();

    // 批量插入到 MongoDB
    const documents: BehaviorEventDocument[] = events.map((event: any) => ({
      event_id: event.event_id,
      user_id: event.user_id,
      event_type: event.event_type,
      event_timestamp: new Date(event.event_timestamp),
      session_id: event.session_id,
      page_url: event.page_url,
      referrer_url: event.referrer_url,
      user_agent: event.user_agent,
      ip_address: event.ip_address,
      event_data: typeof event.event_data === 'string' 
        ? JSON.parse(event.event_data) 
        : event.event_data || {},
      metadata: typeof event.metadata === 'string'
        ? JSON.parse(event.metadata)
        : event.metadata || {},
      createdAt: new Date(),
    }));

    // 分批插入（每批 1000 条），跳过已存在的记录
    const batchSize = 1000;
    let inserted = 0;
    let skipped = 0;
    
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      try {
        const result = await collection.insertMany(batch, { ordered: false });
        inserted += result.insertedCount;
        console.log(`已插入 ${inserted}/${documents.length} 条记录`);
      } catch (error: any) {
        // 如果是重复键错误，尝试逐个插入
        if (error.code === 11000) {
          for (const doc of batch) {
            try {
              await collection.insertOne(doc);
              inserted++;
            } catch (e: any) {
              if (e.code === 11000) {
                skipped++;
              } else {
                throw e;
              }
            }
          }
          console.log(`已插入 ${inserted}/${documents.length} 条记录（跳过 ${skipped} 条重复记录）`);
        } else {
          throw error;
        }
      }
    }

    if (skipped > 0) {
      console.log(`✓ 成功迁移 ${inserted} 条行为事件记录到 MongoDB（跳过 ${skipped} 条已存在的记录）`);
    } else {
      console.log(`✓ 成功迁移 ${inserted} 条行为事件记录到 MongoDB`);
    }
  } catch (error: any) {
    console.error('迁移行为事件时出错:', error);
    throw error;
  }
}

async function migrateSessions() {
  console.log('开始迁移会话数据...');
  
  try {
    // 从 PostgreSQL 查询所有会话
    const result = await pool.query('SELECT * FROM user_sessions ORDER BY started_at');
    const sessions = result.rows;
    
    if (sessions.length === 0) {
      console.log('没有找到需要迁移的会话数据');
      return;
    }

    console.log(`找到 ${sessions.length} 条会话记录`);

    const collection = await getSessionsCollection();

    // 批量插入到 MongoDB
    const documents: SessionDocument[] = sessions.map((session: any) => ({
      session_id: session.session_id,
      user_id: session.user_id,
      started_at: new Date(session.started_at),
      ended_at: session.ended_at ? new Date(session.ended_at) : null,
      duration_seconds: session.duration_seconds,
      page_views: session.page_views || 0,
      events_count: session.events_count || 0,
      device_type: session.device_type,
      browser: session.browser,
      os: session.os,
      country: session.country,
      city: session.city,
      session_data: typeof session.session_data === 'string'
        ? JSON.parse(session.session_data)
        : session.session_data || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // 分批插入，使用 upsert 处理重复的 session_id
    const batchSize = 1000;
    let inserted = 0;
    let updated = 0;
    
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      // 使用 bulkWrite 进行 upsert 操作
      const operations = batch.map(doc => ({
        updateOne: {
          filter: { session_id: doc.session_id },
          update: { $set: doc },
          upsert: true
        }
      }));
      
      const result = await collection.bulkWrite(operations, { ordered: false });
      inserted += result.upsertedCount;
      updated += result.modifiedCount;
      console.log(`已处理 ${inserted + updated}/${documents.length} 条记录（新增 ${inserted}，更新 ${updated}）`);
    }

    console.log(`✓ 成功迁移 ${inserted} 条新会话记录到 MongoDB（更新 ${updated} 条已存在的记录）`);
  } catch (error: any) {
    console.error('迁移会话时出错:', error);
    throw error;
  }
}

async function migrateAggregates() {
  console.log('开始迁移聚合数据...');
  
  try {
    // 先检查表是否存在
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'behavior_aggregates'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('behavior_aggregates 表不存在，跳过聚合数据迁移');
      return;
    }

    // 从 PostgreSQL 查询所有聚合数据
    const result = await pool.query('SELECT * FROM behavior_aggregates ORDER BY date');
    const aggregates = result.rows;
    
    if (aggregates.length === 0) {
      console.log('没有找到需要迁移的聚合数据');
      return;
    }

    console.log(`找到 ${aggregates.length} 条聚合记录`);

    const collection = await getAggregatesCollection();

    // 批量插入到 MongoDB
    const documents: AggregateDocument[] = aggregates.map((agg: any) => ({
      aggregate_id: agg.aggregate_id,
      date: new Date(agg.date),
      user_id: agg.user_id,
      event_type: agg.event_type,
      count: agg.count,
      aggregate_data: typeof agg.aggregate_data === 'string'
        ? JSON.parse(agg.aggregate_data)
        : agg.aggregate_data || {},
      last_updated: new Date(agg.last_updated),
    }));

    // 分批插入
    const batchSize = 1000;
    let inserted = 0;
    
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const result = await collection.insertMany(batch, { ordered: false });
      inserted += result.insertedCount;
      console.log(`已插入 ${inserted}/${documents.length} 条记录`);
    }

    console.log(`✓ 成功迁移 ${inserted} 条聚合记录到 MongoDB`);
  } catch (error: any) {
    // 如果是表不存在的错误，优雅处理
    if (error.code === '42P01') {
      console.log('behavior_aggregates 表不存在，跳过聚合数据迁移');
      return;
    }
    console.error('迁移聚合数据时出错:', error);
    throw error;
  }
}

async function main() {
  console.log('========================================');
  console.log('开始数据迁移：PostgreSQL -> MongoDB');
  console.log('========================================\n');

  try {
    // 迁移行为事件
    await migrateBehaviorEvents();
    console.log('');

    // 迁移会话
    await migrateSessions();
    console.log('');

    // 迁移聚合数据（如果失败不影响整体迁移）
    try {
      await migrateAggregates();
      console.log('');
    } catch (error: any) {
      // 聚合数据迁移失败不影响整体迁移
      console.log('⚠️  聚合数据迁移跳过（表可能不存在）\n');
    }

    console.log('========================================');
    console.log('✓ 数据迁移完成！');
    console.log('========================================');
  } catch (error: any) {
    console.error('\n❌ 迁移失败:', error);
    process.exit(1);
  } finally {
    // 关闭连接
    await pool.end();
    await closeMongoDB();
  }
}

// 运行迁移
if (require.main === module) {
  main();
}

export { main as migrateBehaviorToMongoDB };

