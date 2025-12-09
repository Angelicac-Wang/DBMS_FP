/**
 * 创建 MongoDB 索引脚本
 * 
 * 使用方法：
 * npx tsx scripts/create-mongodb-indexes.ts
 */

import { connectToMongoDB, closeMongoDB } from '../src/lib/mongodb';
import { getBehaviorEventsCollection, getSessionsCollection, getAggregatesCollection } from '../src/lib/mongodb-models';

async function createIndexes() {
  console.log('开始创建 MongoDB 索引...\n');

  try {
    await connectToMongoDB();

    // 行为事件索引
    console.log('创建行为事件索引...');
    const eventsCollection = await getBehaviorEventsCollection();
    
    await eventsCollection.createIndex({ user_id: 1 });
    console.log('  ✓ user_id 索引');

    await eventsCollection.createIndex({ event_type: 1 });
    console.log('  ✓ event_type 索引');

    await eventsCollection.createIndex({ event_timestamp: -1 });
    console.log('  ✓ event_timestamp 索引');

    await eventsCollection.createIndex({ session_id: 1 });
    console.log('  ✓ session_id 索引');

    // JSON 字段索引（用于查询 event_data 中的字段）
    await eventsCollection.createIndex({ 'event_data.project_id': 1 });
    console.log('  ✓ event_data.project_id 索引');

    await eventsCollection.createIndex({ 'event_data.song_id': 1 });
    console.log('  ✓ event_data.song_id 索引');

    // 复合索引
    await eventsCollection.createIndex({ user_id: 1, event_timestamp: -1 });
    console.log('  ✓ user_id + event_timestamp 复合索引');

    await eventsCollection.createIndex({ event_type: 1, event_timestamp: -1 });
    console.log('  ✓ event_type + event_timestamp 复合索引');

    // 会话索引
    console.log('\n创建会话索引...');
    const sessionsCollection = await getSessionsCollection();
    
    await sessionsCollection.createIndex({ session_id: 1 }, { unique: true });
    console.log('  ✓ session_id 唯一索引');

    await sessionsCollection.createIndex({ user_id: 1 });
    console.log('  ✓ user_id 索引');

    await sessionsCollection.createIndex({ started_at: -1 });
    console.log('  ✓ started_at 索引');

    // 聚合数据索引
    console.log('\n创建聚合数据索引...');
    const aggregatesCollection = await getAggregatesCollection();
    
    await aggregatesCollection.createIndex(
      { date: 1, user_id: 1, event_type: 1 },
      { unique: true }
    );
    console.log('  ✓ date + user_id + event_type 唯一复合索引');

    await aggregatesCollection.createIndex({ date: 1 });
    console.log('  ✓ date 索引');

    await aggregatesCollection.createIndex({ event_type: 1 });
    console.log('  ✓ event_type 索引');

    console.log('\n========================================');
    console.log('✓ 所有索引创建完成！');
    console.log('========================================');

    // 显示索引列表
    console.log('\n行为事件索引列表:');
    const eventIndexes = await eventsCollection.indexes();
    eventIndexes.forEach((idx: any) => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    console.log('\n会话索引列表:');
    const sessionIndexes = await sessionsCollection.indexes();
    sessionIndexes.forEach((idx: any) => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    console.log('\n聚合数据索引列表:');
    const aggregateIndexes = await aggregatesCollection.indexes();
    aggregateIndexes.forEach((idx: any) => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

  } catch (error: any) {
    console.error('创建索引时出错:', error);
    throw error;
  } finally {
    await closeMongoDB();
  }
}

// 运行脚本
if (require.main === module) {
  createIndexes().catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });
}

export { createIndexes };

