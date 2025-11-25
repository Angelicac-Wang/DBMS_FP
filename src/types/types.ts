// 練習時間的結構
export interface PracticeTime {
  date: string; // 2025-10-15
  day: string; // 五
  startTime: string; // 19:00
  endTime: string; // 21:00
  fullString: string; // 原始字串
}

// 拍攝時間的結構
export interface ShootingTime {
  date: string;
  day: string;
  startTime: string;
  endTime: string;
  fullString: string;
}

// Cover 團體的資料結構
export interface CoverGroup {
  id: string;
  groupName: string;
  songName: string;
  missingPositions: string[];
  region: string;
  practiceTimes: PracticeTime[];
  practiceLocation: string;
  shootingTime: ShootingTime;
  shootingLocation: string;
  rules: string;
  description: string;
  contact: string;
  groupType: '男團' | '女團';
}

// 行事曆事件
export interface CalendarEvent {
  id: string; // 唯一標識符：groupId-practice-0 或 groupId-shooting
  groupId: string;
  groupName: string;
  songName: string;
  type: 'practice' | 'shooting';
  date: string;
  day: string;
  startTime: string;
  endTime: string;
  location: string;
}

// 應用狀態
export interface AppState {
  coverGroups: CoverGroup[];
  savedGroupIds: string[]; // 已儲存的團 ID
  appliedGroupIds: string[]; // 已申請的團 ID
  selectedCalendarGroupIds: string[]; // 行事曆中勾選要顯示的團 ID
}

// 篩選條件
export interface FilterState {
  searchQuery: string;
  selectedRegion: string | null;
}

