import React, { useState, useMemo } from 'react';
import { Layout, Input, Select, Spin, Alert, Empty, DatePicker } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { useCoverGroups } from '../context/CoverGroupContext';
import { GroupCard } from '../components/GroupCard';

const { Content } = Layout;
const { RangePicker } = DatePicker;

export const HomePage: React.FC = () => {
  const { coverGroups, loading, error } = useCoverGroups();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<string>('團名');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  
  // 篩選後的團體
  const filteredGroups = useMemo(() => {
    return coverGroups.filter(group => {
      // 搜尋過濾
      let matchesSearch = true;
      
      switch (searchType) {
        case '團名':
          if (searchQuery.trim() !== '') {
            matchesSearch = group.groupName.toLowerCase().includes(searchQuery.toLowerCase());
          }
          break;
        case '歌名':
          if (searchQuery.trim() !== '') {
            matchesSearch = group.songName.toLowerCase().includes(searchQuery.toLowerCase());
          }
          break;
        case '地區':
          if (selectedRegion !== '') {
            matchesSearch = group.region === selectedRegion;
          }
          break;
        case '練習時間':
          if (dateRange && dateRange[0] && dateRange[1]) {
            const startDate = dateRange[0].format('YYYY-MM-DD');
            const endDate = dateRange[1].format('YYYY-MM-DD');
            // 檢查所有練習時間都在選擇的日期範圍內
            matchesSearch = group.practiceTimes.length > 0 && 
              group.practiceTimes.every(practice => {
                return practice.date >= startDate && practice.date <= endDate;
              });
          }
          break;
        default:
          matchesSearch = true;
      }
      
      return matchesSearch;
    });
  }, [coverGroups, searchQuery, searchType, selectedRegion, dateRange]);
  
  // 清除所有篩選
  const clearAllFilters = () => {
    setSearchQuery('');
    setSearchType('團名');
    setSelectedRegion('');
    setDateRange(null);
  };
  
  // 動態 placeholder
  const getSearchPlaceholder = () => {
    switch (searchType) {
      case '團名':
        return '搜尋團名...';
      case '歌名':
        return '搜尋歌名...';
      case '地區':
        return '搜尋地區...';
      case '練習時間':
        return '搜尋練習時間...';
      default:
        return '搜尋...';
    }
  };
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="載入中..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ padding: '50px 20px' }}>
        <Alert
          message="載入失敗"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }
  
  const hasActiveFilters = searchQuery || selectedRegion || dateRange;
  
  return (
    <Content style={{ padding: '24px', width: '100%', maxWidth: '100%' }}>
      
      {/* 搜尋區域 - 隨頁面滾動 */}
      <div style={{ 
        position: 'relative',
        display: 'flex', 
        gap: 12, 
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        padding: '20px 24px',
        background: 'transparent',
        marginTop: 100
      }}>
        {/* 中間：搜尋欄位 */}
        <div style={{ 
          display: 'flex', 
          gap: 12, 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* 根據搜尋類型顯示不同的輸入組件 */}
          {searchType === '地區' ? (
            <Select
              size="large"
              placeholder="選擇地區"
              value={selectedRegion}
              onChange={setSelectedRegion}
              allowClear
              style={{ 
                width: 300,
                minWidth: 250
              }}
              options={[
                { label: '雙北', value: '雙北' },
                { label: '台中', value: '台中' },
                { label: '桃園', value: '桃園' },
                { label: '高雄', value: '高雄' }
              ]}
            />
          ) : searchType === '練習時間' ? (
            <RangePicker
              size="large"
              placeholder={['開始日期', '結束日期']}
              value={dateRange}
              onChange={setDateRange}
              format="YYYY-MM-DD"
              style={{ 
                width: 300,
                minWidth: 250
              }}
            />
          ) : (
            <Input
              size="large"
              placeholder={getSearchPlaceholder()}
              prefix={<SearchOutlined style={{ color: '#ff6b9d' }} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              style={{ 
                width: 300,
                minWidth: 250
              }}
            />
          )}
          <Select
            size="large"
            value={searchType}
            onChange={setSearchType}
            style={{ width: 120 }}
            options={[
              { label: '團名', value: '團名' },
              { label: '歌名', value: '歌名' },
              { label: '地區', value: '地區' },
              { label: '練習時間', value: '練習時間' }
            ]}
          />
          {hasActiveFilters && (
            <a 
              onClick={clearAllFilters}
              style={{ 
                color: '#ff6b9d',
                fontWeight: 'bold',
                textDecoration: 'none',
                fontSize: 14
              }}
            >
              ✨ 清除篩選
            </a>
          )}
        </div>

        {/* 右側：團體數量顯示 - 固定在畫面右邊 */}
        <div style={{
          position: 'absolute',
          right: 2,
          background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.15), rgba(196, 69, 105, 0.15))',
          padding: '2px 16px',
          borderRadius: 20,
          border: '2px solid rgba(255, 107, 157, 0.3)',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ 
            fontSize: 16,
            color: '#333',
            fontWeight: 'bold'
          }}>
            找到 <span style={{ 
              color: '#ff6b9d',
              fontSize: 20,
              fontWeight: 'bold'
            }}>
              {filteredGroups.length}
            </span> 個團體 ✨
          </span>
        </div>
      </div>
      
      <div>
      {filteredGroups.length === 0 ? (
        <Empty 
          description={
            hasActiveFilters 
              ? "沒有符合條件的團體，請嘗試調整篩選條件" 
              : "目前沒有任何團體"
          } 
        />
      ) : (
        <div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
            marginTop: 2,
            marginBottom: 40
          }}>
            {filteredGroups.map(group => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        </div>
      )}
      </div>
    </Content>
  );
};

