import type { CalendarEvent } from '../types/types';
import dayjs from 'dayjs';

// 檢查兩個時間範圍是否重疊
export const hasTimeOverlap = (
  date1: string,
  start1: string,
  end1: string,
  date2: string,
  start2: string,
  end2: string
): boolean => {
  // 如果不是同一天，就沒有衝突
  if (date1 !== date2) {
    return false;
  }

  // 將時間轉換為可比較的格式
  const startTime1 = dayjs(`${date1} ${start1}`);
  const endTime1 = dayjs(`${date1} ${end1}`);
  const startTime2 = dayjs(`${date2} ${start2}`);
  const endTime2 = dayjs(`${date2} ${end2}`);

  // 檢查時間是否重疊
  // 重疊條件：開始時間1 < 結束時間2 且 結束時間1 > 開始時間2
  return startTime1.isBefore(endTime2) && endTime1.isAfter(startTime2);
};

// 找出衝突的事件
export const findConflictingEvents = (events: CalendarEvent[]): Set<string> => {
  const conflicts = new Set<string>();

  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const event1 = events[i];
      const event2 = events[j];

      if (
        hasTimeOverlap(
          event1.date,
          event1.startTime,
          event1.endTime,
          event2.date,
          event2.startTime,
          event2.endTime
        )
      ) {
        conflicts.add(event1.id);
        conflicts.add(event2.id);
      }
    }
  }

  return conflicts;
};

// 取得某一天的所有事件
export const getEventsForDate = (events: CalendarEvent[], date: string): CalendarEvent[] => {
  return events.filter(event => event.date === date);
};

