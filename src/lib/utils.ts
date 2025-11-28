/**
 * 格式化日期為中文格式
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = weekdays[date.getDay()];
  return `${date.getFullYear()}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}(${weekday})`;
}

/**
 * 格式化時間（只取時分）
 */
export function formatTime(timeStr: string): string {
  return timeStr.substring(0, 5);
}

/**
 * 格式化時長（秒數轉為 MM:SS）
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 獲取專案狀態文字
 */
export function getStatusText(status: string): string {
  switch (status) {
    case 'A':
      return '招募中';
    case 'D':
      return '進行中';
    case 'F':
      return '已完成';
    default:
      return '未知';
  }
}

/**
 * 獲取專案狀態顏色
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'A':
      return 'bg-blue-100 text-blue-700';
    case 'D':
      return 'bg-yellow-100 text-yellow-700';
    case 'F':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

/**
 * 獲取團體類型文字
 */
export function getGroupTypeText(type: string): string {
  switch (type) {
    case 'B':
      return '男團';
    case 'G':
      return '女團';
    case 'M':
      return '混團';
    default:
      return '未知';
  }
}

/**
 * 從地點推斷地區
 */
export function inferRegionFromLocation(location: string): string {
  if (location.includes('雙連') || location.includes('台北') || location.includes('新北')) {
    return '雙北';
  } else if (location.includes('台中')) {
    return '台中';
  } else if (location.includes('高雄')) {
    return '高雄';
  } else if (location.includes('桃園')) {
    return '桃園';
  } else if (location.includes('新竹')) {
    return '新竹';
  } else if (location.includes('台南')) {
    return '台南';
  }
  return '';
}

