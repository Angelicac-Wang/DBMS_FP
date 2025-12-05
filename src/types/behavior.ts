// 行为数据分析类型定义

export type EventType = 
  | 'page_view'
  | 'click'
  | 'search'
  | 'project_view'
  | 'project_apply'
  | 'project_create'
  | 'song_view'
  | 'group_view'
  | 'profile_view'
  | 'video_play'
  | 'video_pause'
  | 'video_complete'
  | 'form_submit'
  | 'form_abandon'
  | 'login'
  | 'logout'
  | 'signup'
  | 'error'
  | 'custom';

export interface BaseEventData {
  [key: string]: any;
}

export interface PageViewEventData extends BaseEventData {
  page_title?: string;
  page_path?: string;
  page_category?: string;
}

export interface ClickEventData extends BaseEventData {
  element_id?: string;
  element_class?: string;
  element_text?: string;
  element_type?: string;
  target_url?: string;
}

export interface ProjectViewEventData extends BaseEventData {
  project_id?: number;
  project_title?: string;
  song_id?: number;
  group_id?: number;
}

export interface SearchEventData extends BaseEventData {
  query?: string;
  filters?: Record<string, any>;
  results_count?: number;
  selected_result?: number;
}

export interface UserBehaviorEvent {
  event_id?: number;
  user_id?: number | null;
  event_type: EventType;
  event_timestamp?: Date | string;
  session_id?: string;
  page_url?: string;
  referrer_url?: string;
  user_agent?: string;
  ip_address?: string;
  event_data: BaseEventData;
  metadata?: {
    device_type?: 'desktop' | 'mobile' | 'tablet';
    browser?: string;
    os?: string;
    screen_width?: number;
    screen_height?: number;
    language?: string;
    timezone?: string;
    country?: string;
    city?: string;
    [key: string]: any;
  };
}

export interface UserSession {
  session_id: string;
  user_id?: number | null;
  started_at?: Date | string;
  ended_at?: Date | string | null;
  duration_seconds?: number;
  page_views?: number;
  events_count?: number;
  device_type?: string;
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  session_data?: Record<string, any>;
}

export interface BehaviorAggregate {
  aggregate_id?: number;
  date: string | Date;
  user_id?: number | null;
  event_type: EventType;
  count: number;
  aggregate_data?: Record<string, any>;
  last_updated?: Date | string;
}

export interface BehaviorQuery {
  user_id?: number;
  event_type?: EventType | EventType[];
  start_date?: Date | string;
  end_date?: Date | string;
  session_id?: string;
  limit?: number;
  offset?: number;
  order_by?: 'event_timestamp' | 'event_type';
  order?: 'asc' | 'desc';
}

export interface BehaviorStats {
  total_events: number;
  unique_users: number;
  unique_sessions: number;
  events_by_type: Record<string, number>;
  events_by_date: Array<{
    date: string;
    count: number;
  }>;
}

