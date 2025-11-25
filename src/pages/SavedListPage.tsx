import React, { useState, useMemo } from 'react';
import { Layout, Card, List, Button, Space, Typography, Tag, Empty } from 'antd';
import { CheckCircleOutlined, DeleteOutlined, SendOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCoverGroups } from '../context/CoverGroupContext';

const { Content } = Layout;
const { Text } = Typography;

export const SavedListPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    coverGroups,
    savedGroupIds,
    appliedGroupIds,
    appliedPositions,
    unsaveGroup,
    applyGroups
  } = useCoverGroups();
  
  // 改為存儲 { groupId: selectedPosition } 的對應關係
  const [selectedPositions, setSelectedPositions] = useState<Record<string, string>>({});
  
  // 已儲存的團體
  const savedGroups = useMemo(() => {
    return coverGroups.filter(g => savedGroupIds.includes(g.id));
  }, [coverGroups, savedGroupIds]);
  
  // 已申請的團體
  const appliedGroups = useMemo(() => {
    return coverGroups.filter(g => appliedGroupIds.includes(g.id));
  }, [coverGroups, appliedGroupIds]);
  
  // 處理申請
  const handleApply = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const selectedGroupIds = Object.keys(selectedPositions);
    
    if (selectedGroupIds.length === 0) {
      alert('請至少選擇一個團體和位置進行申請');
      return;
    }
    
    // 檢查是否所有選中的團體都有選擇位置
    const hasUnselectedPosition = selectedGroupIds.some(id => !selectedPositions[id]);
    if (hasUnselectedPosition) {
      alert('請為所有選中的團體選擇要申請的位置');
      return;
    }
    
    // 顯示申請摘要
    let summary = `確定要申請以下 ${selectedGroupIds.length} 個團體嗎？\n\n`;
    selectedGroupIds.forEach(id => {
      const group = coverGroups.find(g => g.id === id);
      if (group) {
        summary += `${group.groupName} - ${group.songName}\n申請位置：${selectedPositions[id]}\n\n`;
      }
    });
    summary += '送出後將無法取消。';
    
    const confirmed = window.confirm(summary);
    
    if (confirmed) {
      applyGroups(selectedGroupIds, selectedPositions);
      setSelectedPositions({});
      // 使用 alert 顯示成功訊息
      alert('已送出申請給舞團主揪，請耐心等候！');
    }
  };
  
  // 處理移除
  const handleRemove = (groupId: string) => {
    const confirmed = window.confirm('確定要從清單中移除這個團體嗎？');
    if (confirmed) {
      unsaveGroup(groupId);
      setSelectedPositions(prev => {
        const newState = { ...prev };
        delete newState[groupId];
        return newState;
      });
    }
  };
  
  // 選擇位置
  const selectPosition = (groupId: string, position: string) => {
    setSelectedPositions(prev => ({
      ...prev,
      [groupId]: position
    }));
  };
  
  // 取消選擇團體
  const deselectGroup = (groupId: string) => {
    setSelectedPositions(prev => {
      const newState = { ...prev };
      delete newState[groupId];
      return newState;
    });
  };
  
  return (
    <Content style={{ padding: '24px', width: '100%', maxWidth: '100%' }}>
      {/* 左右兩個卡片 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '7fr 3fr',
        gap: 20,
        alignItems: 'start',
        marginTop: '130px',
        marginBottom: 40
      }}>
        {/* 左側：已儲存舞團 */}
        <Card
          title={
            <Space>
              <span style={{ color: '#ff6b9d', fontWeight: 'bold' }}>💾 已儲存舞團</span>
              <Tag color="blue">{savedGroups.length}</Tag>
            </Space>
          }
          extra={
            savedGroups.length > 0 && (
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleApply}
                disabled={Object.keys(selectedPositions).length === 0}
                style={{
                  background: Object.keys(selectedPositions).length > 0 ? 'linear-gradient(135deg, #ff6b9d, #c44569)' : undefined,
                  border: 'none'
                }}
              >
                送出申請 ({Object.keys(selectedPositions).length})
              </Button>
            )
          }
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 240, 245, 0.9))',
            border: '2px solid rgba(255, 107, 157, 0.2)',
            borderRadius: 15,
            minHeight: 500
          }}
        >
          {savedGroups.length === 0 ? (
            <Empty description="尚未儲存任何團體">
              <Button type="primary" onClick={() => navigate('/')}>
                開始探索
              </Button>
            </Empty>
          ) : (
            <List
              dataSource={savedGroups}
              renderItem={(group) => {
                const isSelected = group.id in selectedPositions;
                const selectedPosition = selectedPositions[group.id];
                
                return (
                  <List.Item
                    style={{
                      background: isSelected ? 'linear-gradient(135deg, rgba(24, 144, 255, 0.1), rgba(64, 169, 255, 0.1))' : '#fff',
                      padding: 16,
                      marginBottom: 12,
                      borderRadius: 12,
                      border: isSelected ? '2px solid #1890ff' : '1px solid #f0f0f0',
                      transition: 'all 0.3s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(24, 144, 255, 0.2)' : '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                  >
                    <div style={{ width: '100%' }}>
                      {/* 上半部：團體資訊 */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ marginRight: 12, marginTop: 4 }}>
                          {isSelected ? (
                            <CheckCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                          ) : (
                            <div style={{ width: 24, height: 24, border: '2px solid #d9d9d9', borderRadius: '50%' }} />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <Space style={{ marginBottom: 8 }}>
                            <Text strong style={{ fontSize: 16 }}>
                              {group.groupName} - {group.songName}
                            </Text>
                            <Tag color="blue">{group.region}</Tag>
                          </Space>
                          <div style={{ marginTop: 8 }}>
                            <ClockCircleOutlined /> 共 {group.practiceTimes.length} 次練習 + 1 次拍攝
                          </div>
                        </div>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(group.id);
                          }}
                        >
                          移除
                        </Button>
                      </div>
                      
                      {/* 下半部：選擇位置 */}
                      <div style={{ 
                        background: 'rgba(240, 242, 245, 0.5)', 
                        padding: 12, 
                        borderRadius: 8,
                        marginTop: 8
                      }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                          ⭐ 請選擇要申請的位置：
                        </Text>
                        <Space wrap>
                          {group.missingPositions.map((pos) => (
                            <Tag
                              key={pos}
                              color={selectedPosition === pos ? 'blue' : 'default'}
                              style={{
                                cursor: 'pointer',
                                padding: '4px 12px',
                                fontSize: 14,
                                border: selectedPosition === pos ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                background: selectedPosition === pos ? '#e6f7ff' : '#fff',
                                fontWeight: selectedPosition === pos ? 'bold' : 'normal'
                              }}
                              onClick={() => selectPosition(group.id, pos)}
                            >
                              {pos}
                            </Tag>
                          ))}
                          {isSelected && (
                            <Button
                              size="small"
                              type="text"
                              onClick={() => deselectGroup(group.id)}
                              style={{ marginLeft: 8 }}
                            >
                              取消選擇
                            </Button>
                          )}
                        </Space>
                        {isSelected && selectedPosition && (
                          <div style={{ marginTop: 8 }}>
                            <Text type="success" style={{ fontSize: 12 }}>
                              ✓ 已選擇：{selectedPosition}
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          )}
        </Card>
        
        {/* 右側：已申請舞團 */}
        <Card
          title={
            <Space>
              <span style={{ color: '#52c41a', fontWeight: 'bold' }}>✅ 已申請舞團</span>
              <Tag color="success">{appliedGroups.length}</Tag>
            </Space>
          }
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(246, 255, 237, 0.9))',
            border: '2px solid rgba(82, 196, 26, 0.2)',
            borderRadius: 15,
            minHeight: 500
          }}
        >
          {appliedGroups.length === 0 ? (
            <Empty description="尚未申請任何團體">
              <Text type="secondary">選擇左側團體並送出申請後，將會顯示在這裡</Text>
            </Empty>
          ) : (
            <List
              dataSource={appliedGroups}
              renderItem={(group) => (
                <List.Item
                  style={{
                    padding: 16,
                    marginBottom: 12,
                    background: 'linear-gradient(135deg, rgba(82, 196, 26, 0.05), rgba(135, 208, 104, 0.05))',
                    borderRadius: 12,
                    border: '2px solid rgba(82, 196, 26, 0.3)',
                    boxShadow: '0 2px 8px rgba(82, 196, 26, 0.1)'
                  }}
                >
                  <List.Item.Meta
                    avatar={<CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
                    title={
                      <Space>
                        <Text strong style={{ fontSize: 16 }}>
                          {group.groupName} - {group.songName}
                        </Text>
                        <Tag color="success">等待團主回覆中</Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div>
                          <Text type="secondary">申請位置：</Text>
                          <Tag color="blue" style={{ marginLeft: 4, fontWeight: 'bold' }}>
                            {appliedPositions[group.id] || '未知'}
                          </Tag>
                        </div>
                        <Text type="secondary">
                          已送出申請，請耐心等待團主回覆
                        </Text>
                        <Text type="secondary">
                          聯絡方式：{group.contact}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>
    </Content>
  );
};

