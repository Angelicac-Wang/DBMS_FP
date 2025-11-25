import React, { useMemo, useState, useEffect } from 'react';
import { Layout, Calendar, Badge, Card, Checkbox, Space, Typography, List, Tag, Modal } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, CrownOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useCoverGroups } from '../context/CoverGroupContext';
import type { CalendarEvent } from '../types/types';
import { findConflictingEvents, getEventsForDate } from '../utils/timeConflict';

const { Content } = Layout;
const { Text } = Typography;

export const CalendarPage: React.FC = () => {
  const {
    coverGroups,
    savedGroupIds,
    appliedGroupIds,
    selectedCalendarGroupIds,
    calendarEvents,
    toggleCalendarGroup
  } = useCoverGroups();
  
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  
  // 動態隱藏多餘的日期
  useEffect(() => {
    const hideExtraDates = () => {
      const endOfMonth = currentDate.endOf('month');
      const lastDayOfWeek = endOfMonth.day(); // 0=Sunday, 6=Saturday
      
      // 計算應該顯示到哪一天
      let validEndDate;
      if (lastDayOfWeek === 6) {
        validEndDate = endOfMonth;
      } else {
        validEndDate = endOfMonth.add(6 - lastDayOfWeek, 'day');
      }
      
      // 隱藏超出範圍的日期
      const calendarCells = document.querySelectorAll('.ant-picker-calendar .ant-picker-cell');
      calendarCells.forEach((cell) => {
        const cellElement = cell as HTMLElement;
        const dateText = cellElement.textContent;
        if (dateText) {
          const cellDate = dayjs(`${currentDate.format('YYYY-MM')}-${dateText.padStart(2, '0')}`);
          if (cellDate.isAfter(validEndDate)) {
            cellElement.style.display = 'none';
          } else {
            cellElement.style.display = '';
          }
        }
      });
    };
    
    // 延遲執行，確保行事曆已經渲染
    const timer = setTimeout(hideExtraDates, 100);
    return () => clearTimeout(timer);
  }, [currentDate]);
  
  // 可以選擇的團體（已儲存或已申請的）
  const selectableGroups = useMemo(() => {
    const allIds = [...savedGroupIds, ...appliedGroupIds];
    return coverGroups.filter(g => allIds.includes(g.id));
  }, [coverGroups, savedGroupIds, appliedGroupIds]);
  
  // 找出衝突的事件 ID
  const conflictingEventIds = useMemo(() => {
    return findConflictingEvents(calendarEvents);
  }, [calendarEvents]);
  
  // 日曆單元格渲染
  const dateCellRender = (value: Dayjs) => {
    const dateString = value.format('YYYY-MM-DD');
    const events = getEventsForDate(calendarEvents, dateString);
    
    if (events.length === 0) return null;
    
    return (
      <div style={{
        maxHeight: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingRight: 4
      }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {events.map(event => {
            const isConflict = conflictingEventIds.has(event.id);
            const statusType = isConflict ? 'error' : event.type === 'shooting' ? 'warning' : 'processing';
            
            return (
              <li key={event.id} style={{ marginBottom: 4 }}>
                <Badge status={statusType} />
                <Text
                  style={{
                    fontSize: 12,
                    marginLeft: 6,
                    color: isConflict ? '#ff4d4f' : undefined,
                    fontWeight: isConflict ? 'bold' : undefined
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    showEventDetail(event, isConflict);
                  }}
                >
                  {event.startTime} {event.songName}
                  {isConflict && ' ⚠️'}
                </Text>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  // 自定義日曆單元格點擊處理
  const onCellClick = (value: Dayjs, info: any) => {
    console.log('Cell clicked:', value.format('YYYY-MM-DD')); // 調試用
    console.log('Click info:', info); // 調試用
    
    // 只有在用戶真正點擊日期格子時才顯示（不是切換月份觸發的）
    if (info.source === 'date') {
      console.log('About to call showDateDetail...'); // 調試用
      try {
        showDateDetail(value);
        console.log('showDateDetail called successfully'); // 調試用
      } catch (error) {
        console.error('Error in showDateDetail:', error); // 調試用
      }
    } else {
      console.log('Ignoring click - not a date click'); // 調試用
    }
  };
  
  // 顯示事件詳情
  const showEventDetail = (event: CalendarEvent, isConflict: boolean) => {
    Modal.info({
      title: `${event.groupName} - ${event.songName}`,
      content: (
        <Space direction="vertical" size="middle">
          <div>
            <Tag color={event.type === 'shooting' ? 'orange' : 'blue'}>
              {event.type === 'shooting' ? '拍攝' : '練習'}
            </Tag>
            {isConflict && (
              <Tag color="red">時間衝突！</Tag>
            )}
          </div>
          <div>
            <CalendarOutlined /> {event.date}（{event.day}） {event.startTime}-{event.endTime}
          </div>
          <div>
            <EnvironmentOutlined /> {event.location}
          </div>
        </Space>
      )
    });
  };

  // 顯示日期詳細內容
  const showDateDetail = (value: Dayjs) => {
    console.log('showDateDetail called with:', value.format('YYYY-MM-DD')); // 調試用
    const dateString = value.format('YYYY-MM-DD');
    const events = getEventsForDate(calendarEvents, dateString);
    console.log('Events for date:', events); // 調試用
    
    if (events.length === 0) {
      console.log('No events found, showing empty alert'); // 調試用
      alert(`${value.format('YYYY年MM月DD日')}（${value.format('dddd')}）\n\n📅 這一天沒有安排任何活動`);
      return;
    }

    // 按時間排序事件
    const sortedEvents = events.sort((a, b) => {
      const timeA = a.startTime;
      const timeB = b.startTime;
      return timeA.localeCompare(timeB);
    });

    console.log('Sorted events:', sortedEvents); // 調試用
    console.log('About to show Modal.info...'); // 調試用

    // 創建詳細信息字符串
    let detailText = `${value.format('YYYY年MM月DD日')}（${value.format('dddd')}）的活動安排：\n\n`;
    
    sortedEvents.forEach((event, index) => {
      const isConflict = conflictingEventIds.has(event.id);
      detailText += `${index + 1}. ${event.type === 'shooting' ? '📹 拍攝' : '💃 練習'}`;
      if (isConflict) detailText += ' ⚠️ 時間衝突';
      detailText += `\n   時間：${event.startTime} - ${event.endTime}\n`;
      detailText += `   歌曲：🎵 ${event.songName}\n`;
      detailText += `   團體：👥 ${event.groupName}\n`;
      detailText += `   地點：📍 ${event.location}\n\n`;
    });
    
    // 使用 window.alert 顯示詳細信息
    alert(detailText);
  };
  
  // 統計衝突數量
  const conflictCount = useMemo(() => {
    return conflictingEventIds.size / 2; // 每個衝突涉及兩個事件，所以除以2
  }, [conflictingEventIds]);
  
  return (
    <Content style={{ 
      padding: '24px', 
      width: '100%', 
      maxWidth: '100%',
      position: 'relative',
      minHeight: '100vh',
      marginBottom: 40
    }}>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '280px 1fr', 
        gap: 20, 
        marginTop: 130,
        maxWidth: '1300px',
        margin: '130px auto 0'
      }}>
        {/* 左側：團體選擇和圖標說明 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CrownOutlined style={{ color: '#ff6b9d' }} />
                <span style={{ color: '#ff6b9d', fontWeight: 'bold' }}>已儲存的團體</span>
              </div>
            } 
            style={{ 
              height: 'fit-content',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 240, 245, 0.9))',
              border: '2px solid rgba(255, 107, 157, 0.2)',
              borderRadius: 15
            }}
          >
          {selectableGroups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>💔</div>
              <Text type="secondary">尚未儲存任何團體</Text>
            </div>
          ) : (
            <List
              dataSource={selectableGroups}
              renderItem={(group) => {
                const isSelected = selectedCalendarGroupIds.includes(group.id);
                const isApplied = appliedGroupIds.includes(group.id);
                
                return (
                  <List.Item style={{ padding: '8px 0' }}>
                    <Space direction="vertical" size={0} style={{ width: '100%' }}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleCalendarGroup(group.id)}
                        style={{ 
                          transform: 'scale(1.1)'
                        }}
                      >
                        <Text strong style={{ color: '#333' }}>
                          {group.groupName} - {group.songName}
                        </Text>
                      </Checkbox>
                      {isApplied && (
                        <Tag 
                          color="success" 
                          style={{ 
                            marginLeft: 24,
                            borderRadius: 10,
                            fontSize: 11
                          }}
                        >
                          ✅ 已申請
                        </Tag>
                      )}
                    </Space>
                  </List.Item>
                );
              }}
            />
          )}
          
          {conflictCount > 0 && (
            <div style={{ 
              marginTop: 16, 
              padding: 12, 
              background: 'linear-gradient(135deg, rgba(255, 77, 79, 0.1), rgba(255, 193, 7, 0.1))', 
              borderRadius: 10,
              border: '1px solid rgba(255, 77, 79, 0.2)'
            }}>
              <Text type="warning" strong style={{ color: '#ff4d4f' }}>
                ⚠️ 發現 {conflictCount} 個時間衝突！
              </Text>
            </div>
          )}
          </Card>
          
          {/* 左側卡片下方的圖標說明 */}
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(235, 244, 253, 0.8))',
            borderRadius: 15,
            border: '2px solid rgba(107, 166, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space>
                <Badge status="processing" />
                <Text style={{ color: '#1890ff' }}>💃 練習</Text>
              </Space>
              <Space>
                <Badge status="warning" />
                <Text style={{ color: '#faad14' }}>📹 拍攝</Text>
              </Space>
              <Space>
                <Badge status="error" />
                <Text type="danger">⚠️ 時間衝突</Text>
              </Space>
            </Space>
          </div>
        </div>
        
        {/* 右側：縮小的事行曆 */}
        <Card style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 240, 245, 0.9))',
          border: '2px solid rgba(255, 107, 157, 0.2)',
          borderRadius: 15
        }}>
          <div style={{ transform: 'scale(1)', transformOrigin: 'top left' }}>
            <Calendar
              cellRender={dateCellRender}
              fullscreen={false}
              value={currentDate}
              onPanelChange={(date) => setCurrentDate(date)}
              onSelect={onCellClick}
              headerRender={({ value, onChange }) => {
                return (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    marginBottom: 16
                  }}>
                    {/* 左側：年月顯示 */}
                    <div style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: '#333'
                    }}>
                      {value.format('YYYY年MM月')}
                    </div>
                    
                    {/* 右側：下拉選單和月份切換按鈕 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* 年份下拉選單 */}
                      <select
                        value={value.year()}
                        onChange={(e) => onChange(value.year(parseInt(e.target.value)))}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #d9d9d9',
                          borderRadius: 4,
                          background: '#fff',
                          fontSize: 14,
                          color: '#333'
                        }}
                      >
                        {Array.from({ length: 10 }, (_, i) => 2020 + i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      
                      {/* 月份下拉選單 */}
                      <select
                        value={value.month()}
                        onChange={(e) => onChange(value.month(parseInt(e.target.value)))}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #d9d9d9',
                          borderRadius: 4,
                          background: '#fff',
                          fontSize: 14,
                          color: '#333'
                        }}
                      >
                        {Array.from({ length: 12 }, (_, i) => i).map(month => (
                          <option key={month} value={month}>
                            {month + 1}月
                          </option>
                        ))}
                      </select>
                      
                      {/* 月份切換按鈕 */}
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => onChange(value.subtract(1, 'month'))}
                          style={{
                            width: 32,
                            height: 32,
                            border: '1px solid #d9d9d9',
                            borderRadius: 6,
                            background: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                            color: '#666',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = '#ff6b9d';
                            e.currentTarget.style.color = '#ff6b9d';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = '#d9d9d9';
                            e.currentTarget.style.color = '#666';
                          }}
                        >
                          ‹
                        </button>
                        <button
                          onClick={() => onChange(value.add(1, 'month'))}
                          style={{
                            width: 32,
                            height: 32,
                            border: '1px solid #d9d9d9',
                            borderRadius: 6,
                            background: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                            color: '#666',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = '#ff6b9d';
                            e.currentTarget.style.color = '#ff6b9d';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = '#d9d9d9';
                            e.currentTarget.style.color = '#666';
                          }}
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        </Card>
      </div>
      
    </Content>
  );
};

