import Papa from 'papaparse';
import type { CoverGroup, PracticeTime, ShootingTime } from '../types/types';

// 解析時間字串：2025-10-15（五） 19:00-21:00 或 2025-10-15(五) 19:00-21:00 或 2025-10-25（五） 14:00
export const parseTimeString = (timeString: string): PracticeTime | ShootingTime => {
  // 先嘗試解析完整時間範圍（練習時間）- 支援全形和半形括號
  const fullTimeRegex = /(\d{4}-\d{2}-\d{2})[（(](.+?)[）)]\s*(\d{2}:\d{2})-(\d{2}:\d{2})/;
  const fullMatch = timeString.trim().match(fullTimeRegex);
  
  if (fullMatch) {
    return {
      date: fullMatch[1],
      day: fullMatch[2],
      startTime: fullMatch[3],
      endTime: fullMatch[4],
      fullString: timeString
    };
  }
  
  // 再嘗試解析只有開始時間的格式（拍攝時間）- 支援全形和半形括號
  const startTimeRegex = /(\d{4}-\d{2}-\d{2})[（(](.+?)[）)]\s*(\d{2}:\d{2})/;
  const startMatch = timeString.trim().match(startTimeRegex);
  
  if (startMatch) {
    return {
      date: startMatch[1],
      day: startMatch[2],
      startTime: startMatch[3],
      endTime: '', // 拍攝時間沒有結束時間
      fullString: timeString
    };
  }
  
  console.error('無法解析時間字串:', timeString);
  return {
    date: '',
    day: '',
    startTime: '',
    endTime: '',
    fullString: timeString
  };
};

// 將 CSV 原始資料轉換為 CoverGroup 物件
const transformCsvRow = (row: any): CoverGroup => {
  const practiceTimes = row.practice_times
    .split('|')
    .map((time: string) => parseTimeString(time));
  
  const shootingTime = parseTimeString(row.shooting_time);
  
  const missingPositions = row.missing_positions
    .split(',')
    .map((pos: string) => pos.trim());
  
  return {
    id: row.id,
    groupName: row.group_name,
    songName: row.song_name,
    missingPositions,
    region: row.region,
    practiceTimes,
    practiceLocation: row.practice_location,
    shootingTime,
    shootingLocation: row.shooting_location,
    rules: row.rules,
    description: row.description,
    contact: row.contact,
    groupType: row.group_type as '男團' | '女團'
  };
};

// 解析 CSV 檔案
export const parseCoverGroupsCsv = async (csvPath: string): Promise<CoverGroup[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvPath, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const coverGroups = results.data.map(transformCsvRow);
          resolve(coverGroups);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

