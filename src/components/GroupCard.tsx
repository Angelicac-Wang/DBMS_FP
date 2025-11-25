import React, { useState } from 'react';
import { Card, Button, Tag, Space, Collapse, Typography } from 'antd';
import { SaveOutlined, CheckOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import type { CoverGroup } from '../types/types';
import { useCoverGroups } from '../context/CoverGroupContext';

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface GroupCardProps {
  group: CoverGroup;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  const { saveGroup, unsaveGroup, isSaved, isApplied } = useCoverGroups();
  const [expanded, setExpanded] = useState(false);
  
  const saved = isSaved(group.id);
  const applied = isApplied(group.id);
  
  const handleSaveToggle = () => {
    if (saved) {
      unsaveGroup(group.id);
    } else {
      saveGroup(group.id);
    }
  };
  
  const getRegionColor = (region: string) => {
    const colors: { [key: string]: string } = {
      '雙北': 'blue',
      '台中': 'green',
      '桃園': 'orange',
      '高雄': 'red'
    };
    return colors[region] || 'default';
  };
  
  return (
    <Card
      hoverable
      style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 240, 245, 0.9) 100%)',
        border: '2px solid transparent',
        backgroundClip: 'padding-box',
        position: 'relative',
        zIndex: 15
      }}
      bodyStyle={{ flex: 1, position: 'relative', zIndex: 2 }}
      title={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            {/* <div style={{
              width: 40,
              height: 40,
              background: 'linear-gradient(45deg, #ff6b9d, #c44569)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: 16,
              marginRight: 6,
              marginTop: 12,
              marginBottom: 10
            }}>
              {group.groupName.charAt(0)}
            </div> */}
            <div style={{ marginTop: 5, marginLeft: 5 }}>
              <Text strong style={{ fontSize: 24, color: '#333' }}>
                {group.groupName} - {group.songName}
              </Text>
            </div>
          </Space>
          <Tag 
            color={getRegionColor(group.region)}
            style={{ 
              borderRadius: 15,
              fontWeight: 'bold',
              fontSize: 12,
              marginTop: 6
            }}
          >
            {group.region}
          </Tag>
        </Space>
      }
      extra={
        applied ? (
          <Tag 
            color="success" 
            icon={<CheckOutlined />}
            style={{ borderRadius: 15, fontWeight: 'bold' }}
          >
            已申請 ✨
          </Tag>
        ) : (
          <Button
            type={saved ? 'default' : 'primary'}
            icon={saved ? <CheckOutlined /> : <SaveOutlined />}
            onClick={handleSaveToggle}
            style={{ 
              borderRadius: 20,
              fontWeight: 'bold',
              height: 36,
              marginTop: 6
            }}
          >
            {saved ? '已儲存' : '儲存'}
          </Button>
        )
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 缺的位置 */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.1), rgba(196, 69, 105, 0.1))',
          padding: 12,
          borderRadius: 15,
          border: '1px solid rgba(255, 107, 157, 0.2)'
        }}>
          <Text strong style={{ color: '#ff6b9d', fontSize: 14 }}>
            🎭 缺的位置：
          </Text>
          <Space size={4} wrap style={{ marginLeft: 8, marginTop: 4 }}>
            {group.missingPositions.map((position, index) => (
              <Tag 
                key={index} 
                color="volcano"
                style={{ 
                  borderRadius: 12,
                  fontWeight: 'bold',
                  fontSize: 12
                }}
              >
                {position}
              </Tag>
            ))}
          </Space>
        </div>
        
        {/* 練習時間 */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(24, 144, 255, 0.1), rgba(135, 208, 104, 0.1))',
          padding: 12,
          borderRadius: 15,
          border: '1px solid rgba(24, 144, 255, 0.2)'
        }}>
          <Text strong style={{ color: '#1890ff', fontSize: 14 }}>
            <ClockCircleOutlined /> 練習時間：
          </Text>
          <div style={{ marginLeft: 24, marginTop: 4 }}>
            {group.practiceTimes.map((time, index) => (
              <div key={index} style={{ marginBottom: 4 }}>
                <Text style={{ 
                  color: '#333',
                  fontSize: 13,
                  fontWeight: 500
                }}>
                  {time.fullString}
                </Text>
              </div>
            ))}
          </div>
        </div>
        
        {/* 練習地點 */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(82, 196, 26, 0.1), rgba(135, 208, 104, 0.1))',
          padding: 12,
          borderRadius: 15,
          border: '1px solid rgba(82, 196, 26, 0.2)'
        }}>
          <Text strong style={{ color: '#52c41a', fontSize: 14 }}>
            <EnvironmentOutlined /> 練習地點：
          </Text>
          <Text style={{ 
            marginLeft: 8, 
            color: '#333',
            fontSize: 13
          }}>
            {group.practiceLocation}
          </Text>
        </div>
        
        {/* 拍攝資訊 */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(250, 173, 20, 0.1), rgba(255, 193, 7, 0.1))',
          padding: 12,
          borderRadius: 15,
          border: '1px solid rgba(250, 173, 20, 0.2)'
        }}>
          <Text strong style={{ color: '#faad14', fontSize: 14 }}>
            📹 拍攝：
          </Text>
          <Text style={{ 
            marginLeft: 8, 
            color: '#333',
            fontSize: 13
          }}>
            {group.shootingTime.fullString} {group.shootingLocation}
          </Text>
        </div>
        
        {/* 展開詳情 */}
        <Collapse
          ghost
          activeKey={expanded ? ['1'] : []}
          onChange={() => setExpanded(!expanded)}
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 240, 245, 0.6))',
            borderRadius: 15,
            border: '1px solid rgba(255, 107, 157, 0.2)'
          }}
        >
          <Panel 
            header={
              <span style={{ 
                color: '#ff6b9d', 
                fontWeight: 'bold',
                fontSize: 14
              }}>
                🔍 查看完整詳情
              </span>
            } 
            key="1"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <div>
                <Text strong style={{ color: '#ff6b9d' }}>📋 規則與要求：</Text>
                <Paragraph style={{ marginLeft: 16, marginTop: 4, color: '#333' }}>
                  {group.rules}
                </Paragraph>
              </div>
              
              <div>
                <Text strong style={{ color: '#ff6b9d' }}>📝 詳細說明：</Text>
                <Paragraph style={{ marginLeft: 16, marginTop: 4, color: '#333' }}>
                  {group.description}
                </Paragraph>
              </div>
              
              <div>
                <Text strong style={{ color: '#ff6b9d' }}>👤 主揪名稱：</Text>
                <Text code style={{ marginLeft: 8, color: '#333' }}>
                  {group.contact}
                </Text>
              </div>
            </Space>
          </Panel>
        </Collapse>
      </Space>
    </Card>
  );
};

