// MongoDB 数据模型和集合名称定义
import { getCollection } from './mongodb';
import type { UserBehaviorEvent, UserSession, BehaviorAggregate } from '@/types/behavior';
import { ObjectId, type Collection } from 'mongodb';

// 集合名称常量
export const COLLECTIONS = {
  BEHAVIOR_EVENTS: 'user_behavior_events',
  SESSIONS: 'user_sessions',
  AGGREGATES: 'behavior_aggregates',
} as const;

// MongoDB 文档类型定义
export interface BehaviorEventDocument {
  _id?: ObjectId;
  event_id?: number; // 保留原 event_id 用于兼容
  user_id?: number | null;
  event_type: string;
  event_timestamp: Date;
  session_id: string;
  page_url?: string;
  referrer_url?: string;
  user_agent?: string;
  ip_address?: string;
  event_data: Record<string, any>;
  metadata: Record<string, any>;
  createdAt?: Date; // MongoDB 自动时间戳
}

export interface SessionDocument {
  _id?: ObjectId;
  session_id: string;
  user_id?: number | null;
  started_at: Date;
  ended_at?: Date | null;
  duration_seconds?: number;
  page_views?: number;
  events_count?: number;
  device_type?: string;
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  session_data: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AggregateDocument {
  _id?: ObjectId;
  aggregate_id?: number;
  date: Date;
  user_id?: number | null;
  event_type: string;
  count: number;
  aggregate_data: Record<string, any>;
  last_updated: Date;
}

/**
 * 将 UserBehaviorEvent 转换为 MongoDB 文档
 */
export function behaviorEventToDocument(event: UserBehaviorEvent): Omit<BehaviorEventDocument, '_id'> {
  return {
    event_id: event.event_id,
    user_id: event.user_id ?? null,
    event_type: event.event_type,
    event_timestamp: event.event_timestamp 
      ? new Date(event.event_timestamp) 
      : new Date(),
    session_id: event.session_id || '',
    page_url: event.page_url,
    referrer_url: event.referrer_url,
    user_agent: event.user_agent,
    ip_address: event.ip_address,
    event_data: event.event_data || {},
    metadata: event.metadata || {},
    createdAt: new Date(),
  };
}

/**
 * 将 MongoDB 文档转换为 UserBehaviorEvent
 */
export function documentToBehaviorEvent(doc: BehaviorEventDocument): UserBehaviorEvent {
  return {
    event_id: doc.event_id || doc._id?.toString().slice(-8).toUpperCase(),
    user_id: doc.user_id ?? null,
    event_type: doc.event_type as any,
    event_timestamp: doc.event_timestamp,
    session_id: doc.session_id,
    page_url: doc.page_url,
    referrer_url: doc.referrer_url,
    user_agent: doc.user_agent,
    ip_address: doc.ip_address,
    event_data: doc.event_data,
    metadata: doc.metadata,
  };
}

/**
 * 将 UserSession 转换为 MongoDB 文档
 */
export function sessionToDocument(session: UserSession): Omit<SessionDocument, '_id'> {
  return {
    session_id: session.session_id,
    user_id: session.user_id ?? null,
    started_at: session.started_at ? new Date(session.started_at) : new Date(),
    ended_at: session.ended_at ? new Date(session.ended_at) : null,
    duration_seconds: session.duration_seconds,
    page_views: session.page_views || 0,
    events_count: session.events_count || 0,
    device_type: session.device_type,
    browser: session.browser,
    os: session.os,
    country: session.country,
    city: session.city,
    session_data: session.session_data || {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * 获取行为事件集合
 */
export async function getBehaviorEventsCollection(): Promise<Collection<BehaviorEventDocument>> {
  return getCollection<BehaviorEventDocument>(COLLECTIONS.BEHAVIOR_EVENTS);
}

/**
 * 获取会话集合
 */
export async function getSessionsCollection(): Promise<Collection<SessionDocument>> {
  return getCollection<SessionDocument>(COLLECTIONS.SESSIONS);
}

/**
 * 获取聚合集合
 */
export async function getAggregatesCollection(): Promise<Collection<AggregateDocument>> {
  return getCollection<AggregateDocument>(COLLECTIONS.AGGREGATES);
}

