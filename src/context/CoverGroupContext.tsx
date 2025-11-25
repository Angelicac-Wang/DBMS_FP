import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CoverGroup, CalendarEvent } from '../types/types';
import { parseCoverGroupsCsv } from '../utils/csvParser';

interface CoverGroupContextType {
  coverGroups: CoverGroup[];
  loading: boolean;
  error: string | null;
  
  // 儲存與申請狀態
  savedGroupIds: string[];
  appliedGroupIds: string[];
  appliedPositions: Record<string, string>; // { groupId: position }
  
  // 行事曆相關
  selectedCalendarGroupIds: string[];
  calendarEvents: CalendarEvent[];
  
  // 操作方法
  saveGroup: (groupId: string) => void;
  unsaveGroup: (groupId: string) => void;
  applyGroups: (groupIds: string[], positions: Record<string, string>) => void;
  toggleCalendarGroup: (groupId: string) => void;
  
  // 檢查狀態
  isSaved: (groupId: string) => boolean;
  isApplied: (groupId: string) => boolean;
}

const CoverGroupContext = createContext<CoverGroupContextType | undefined>(undefined);

export const useCoverGroups = () => {
  const context = useContext(CoverGroupContext);
  if (!context) {
    throw new Error('useCoverGroups must be used within CoverGroupProvider');
  }
  return context;
};

interface CoverGroupProviderProps {
  children: ReactNode;
}

export const CoverGroupProvider: React.FC<CoverGroupProviderProps> = ({ children }) => {
  const [coverGroups, setCoverGroups] = useState<CoverGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 從 localStorage 讀取狀態
  const [savedGroupIds, setSavedGroupIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('savedGroupIds');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [appliedGroupIds, setAppliedGroupIds] = useState<string[]>(() => {
    const applied = localStorage.getItem('appliedGroupIds');
    return applied ? JSON.parse(applied) : [];
  });
  
  const [appliedPositions, setAppliedPositions] = useState<Record<string, string>>(() => {
    const positions = localStorage.getItem('appliedPositions');
    return positions ? JSON.parse(positions) : {};
  });
  
  const [selectedCalendarGroupIds, setSelectedCalendarGroupIds] = useState<string[]>(() => {
    const selected = localStorage.getItem('selectedCalendarGroupIds');
    return selected ? JSON.parse(selected) : [];
  });
  
  // 載入 CSV 資料
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await parseCoverGroupsCsv('/data/cover_groups.csv');
        setCoverGroups(data);
        setError(null);
      } catch (err) {
        setError('無法載入資料，請確認 CSV 檔案是否存在');
        console.error('Error loading CSV:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // 儲存狀態到 localStorage
  useEffect(() => {
    localStorage.setItem('savedGroupIds', JSON.stringify(savedGroupIds));
  }, [savedGroupIds]);
  
  useEffect(() => {
    localStorage.setItem('appliedGroupIds', JSON.stringify(appliedGroupIds));
  }, [appliedGroupIds]);
  
  useEffect(() => {
    localStorage.setItem('appliedPositions', JSON.stringify(appliedPositions));
  }, [appliedPositions]);
  
  useEffect(() => {
    localStorage.setItem('selectedCalendarGroupIds', JSON.stringify(selectedCalendarGroupIds));
  }, [selectedCalendarGroupIds]);
  
  // 生成行事曆事件
  const calendarEvents: CalendarEvent[] = React.useMemo(() => {
    const events: CalendarEvent[] = [];
    
    selectedCalendarGroupIds.forEach(groupId => {
      const group = coverGroups.find(g => g.id === groupId);
      if (!group) return;
      
      // 加入練習時間
      group.practiceTimes.forEach((practice, index) => {
        events.push({
          id: `${groupId}-practice-${index}`,
          groupId,
          groupName: group.groupName,
          songName: group.songName,
          type: 'practice',
          date: practice.date,
          day: practice.day,
          startTime: practice.startTime,
          endTime: practice.endTime,
          location: group.practiceLocation
        });
      });
      
      // 加入拍攝時間
      events.push({
        id: `${groupId}-shooting`,
        groupId,
        groupName: group.groupName,
        songName: group.songName,
        type: 'shooting',
        date: group.shootingTime.date,
        day: group.shootingTime.day,
        startTime: group.shootingTime.startTime,
        endTime: group.shootingTime.endTime,
        location: group.shootingLocation
      });
    });
    
    return events;
  }, [selectedCalendarGroupIds, coverGroups]);
  
  // 操作方法
  const saveGroup = (groupId: string) => {
    if (!savedGroupIds.includes(groupId) && !appliedGroupIds.includes(groupId)) {
      setSavedGroupIds(prev => [...prev, groupId]);
    }
  };
  
  const unsaveGroup = (groupId: string) => {
    setSavedGroupIds(prev => prev.filter(id => id !== groupId));
    setSelectedCalendarGroupIds(prev => prev.filter(id => id !== groupId));
  };
  
  const applyGroups = (groupIds: string[], positions: Record<string, string>) => {
    setAppliedGroupIds(prev => [...prev, ...groupIds]);
    setAppliedPositions(prev => ({ ...prev, ...positions }));
    setSavedGroupIds(prev => prev.filter(id => !groupIds.includes(id)));
  };
  
  const toggleCalendarGroup = (groupId: string) => {
    setSelectedCalendarGroupIds(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };
  
  const isSaved = (groupId: string) => savedGroupIds.includes(groupId);
  const isApplied = (groupId: string) => appliedGroupIds.includes(groupId);
  
  const value: CoverGroupContextType = {
    coverGroups,
    loading,
    error,
    savedGroupIds,
    appliedGroupIds,
    appliedPositions,
    selectedCalendarGroupIds,
    calendarEvents,
    saveGroup,
    unsaveGroup,
    applyGroups,
    toggleCalendarGroup,
    isSaved,
    isApplied
  };
  
  return (
    <CoverGroupContext.Provider value={value}>
      {children}
    </CoverGroupContext.Provider>
  );
};

