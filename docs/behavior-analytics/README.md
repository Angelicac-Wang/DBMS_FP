# 行為分析系統文件

此資料夾包含所有與行為分析（Behavior Analytics）系統相關的文件。

## 📁 文件結構

### 資料庫相關
- `behavior_analytics_schema.sql` - 資料庫表結構和索引
- `behavior_analytics_rls.sql` - RLS 策略（原始版本）
- `behavior_analytics_rls_safe.sql` - RLS 策略（安全版本，推薦使用）
- `test_analytics.sql` - 測試和檢查腳本

### 文件說明
- `BEHAVIOR_ANALYTICS_README.md` - 完整使用文件
- `BEHAVIOR_ANALYTICS_QUICKSTART.md` - 快速開始指南
- `BEHAVIOR_ANALYTICS_SETUP.md` - 設置完成指南
- `BEHAVIOR_ANALYTICS_SUMMARY.md` - 實現總結
- `RLS_說明.md` - RLS 禁用與啟用的區別說明
- `RLS_安全說明.md` - RLS 安全防護說明
- `DEBUG_ANALYTICS.md` - 除錯指南

## 💻 程式碼位置

程式碼文件保留在原始位置：

- `src/lib/behavior-analytics.ts` - 核心工具函數
- `src/hooks/useBehaviorTracking.ts` - React Hook
- `src/components/BehaviorTracker.tsx` - 追蹤組件
- `src/types/behavior.ts` - TypeScript 類型定義
- `src/app/api/analytics/` - API 路由

## 🚀 快速開始

1. 執行 `behavior_analytics_schema.sql` 創建資料表
2. 執行 `behavior_analytics_rls_safe.sql` 設置 RLS 策略
3. 參考 `BEHAVIOR_ANALYTICS_QUICKSTART.md` 開始使用

## 📚 相關文件

詳細說明請參考：
- [完整使用文件](./BEHAVIOR_ANALYTICS_README.md)
- [快速開始指南](./BEHAVIOR_ANALYTICS_QUICKSTART.md)

