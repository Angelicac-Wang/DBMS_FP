# Kprofiles.com 可抓取的 KPOP_IDOLS 欄位分析

根據 `KPOP_IDOLS` 表的結構和 Kprofiles.com 的實際內容，以下是可抓取的欄位分析：

## KPOP_IDOLS 表結構

```sql
CREATE TABLE KPOP_IDOLS (
    idol_id BIGINT PRIMARY KEY,           -- 需要生成（不在網站上）
    group_id BIGINT,                      -- 需要從團體資訊對應（不在網站上）
    nationality VARCHAR(20) NOT NULL,     -- ✅ 可以抓取
    stage_name VARCHAR(30) NOT NULL,      -- ✅ 可以抓取
    stage_name_kr VARCHAR(30) NOT NULL,   -- ✅ 可以抓取
    debut_date DATE NOT NULL              -- ✅ 可以抓取（從團體資訊）
);
```

## 可抓取的欄位

### ✅ 可以直接抓取的欄位

#### 1. **stage_name** (藝名 - 英文)
- **來源**: `<span>Stage Name:</span> Jisoo (지수)`
- **提取方式**: 提取 "Stage Name:" 後面的文字，取括號前的部分
- **範例**: "Jisoo", "Jennie", "Rosé", "Lisa"
- **準確度**: ⭐⭐⭐⭐⭐ 非常高

#### 2. **stage_name_kr** (藝名 - 韓文)
- **來源**: `<span>Stage Name:</span> Jisoo (지수)`
- **提取方式**: 提取 "Stage Name:" 後面的文字，取括號中的韓文部分
- **範例**: "지수", "제니", "로제", "리사"
- **準確度**: ⭐⭐⭐⭐⭐ 非常高

#### 3. **nationality** (國籍)
- **來源**: Facts 區塊中的 "born in ..." 資訊
- **提取方式**: 從出生地推斷國籍
  - "South Korea" / "Korea" → "South Korea"
  - "Thailand" → "Thailand"
  - "New Zealand" / "Australia" → "New Zealand" 或 "Australia"
  - "Japan" → "Japan"
  - "China" → "China"
- **範例**: 
  - Jisoo: "She was born in Gunpo, Gyeonggi-do, South Korea" → "South Korea"
  - Lisa: "Lisa was born in Buriram Province, Thailand" → "Thailand"
  - Rosé: "She was born in Auckland, New Zealand" → "New Zealand"
- **準確度**: ⭐⭐⭐⭐ 高（需要解析文字，可能有少數例外）

#### 4. **debut_date** (出道日期)
- **來源**: 團體頁面的團體出道日期
- **提取方式**: 從團體資訊中取得（所有成員通常共用團體出道日期）
- **範例**: BLACKPINK 所有成員都是 "2016-08-08"
- **準確度**: ⭐⭐⭐⭐⭐ 非常高

### ❌ 無法直接抓取的欄位

#### 1. **idol_id** (偶像 ID)
- **原因**: 這是資料庫主鍵，需要系統生成
- **解決方案**: 使用自動遞增或時間戳生成

#### 2. **group_id** (團體 ID)
- **原因**: 這是外鍵，需要從 `KPOP_GROUPS` 表對應
- **解決方案**: 根據團體名稱匹配 `KPOP_GROUPS.group_name` 或 `group_namekr`

## 網站上還有但不在表中的資訊

以下資訊在 Kprofiles.com 上可以找到，但不在 `KPOP_IDOLS` 表中：

1. **Birth Name** (本名)
   - 範例: "Kim Ji-soo (김지수)", "Kim Jennie (김제니)"
   
2. **Position(s)** (職位)
   - 範例: "Lead Vocalist, Visual", "Main Rapper, Lead Vocalist"
   - **注意**: 這個我們已經在抓取了，但不在 `KPOP_IDOLS` 表中

3. **Birthday** (生日)
   - 範例: "January 3, 1995"
   
4. **Height / Weight** (身高/體重)
   - 範例: "162 cm", "44 kg"
   
5. **Blood Type** (血型)
   - 範例: "A", "B", "O", "AB"
   
6. **MBTI Type** (MBTI 人格類型)
   - 範例: "ISTP", "INFJ"
   
7. **Instagram / YouTube / Spotify** (社群媒體連結)
   - 範例: Instagram 帳號、YouTube 頻道連結等

## 建議的抓取策略

### 方案 1: 只抓取表中有對應的欄位
抓取以下欄位：
- ✅ `stage_name` (從 Stage Name 提取)
- ✅ `stage_name_kr` (從 Stage Name 括號中提取)
- ✅ `nationality` (從 Facts 中的出生地推斷)
- ✅ `debut_date` (從團體資訊取得)

### 方案 2: 擴展資料表結構（如果需要的話）
如果未來需要更多資訊，可以考慮新增欄位：
- `birth_name` VARCHAR(50)
- `birth_name_kr` VARCHAR(50)
- `birthday` DATE
- `height` INT (cm)
- `weight` DECIMAL(4,1) (kg)
- `blood_type` CHAR(2)
- `mbti_type` VARCHAR(10)

## 實作建議

1. **擴展現有的 `fetch-kprofiles-groups.ts` 腳本**
   - 在提取成員資訊時，同時提取：
     - Stage Name (英文和韓文)
     - 從 Facts 區塊提取出生地資訊來推斷國籍
     - 從團體資訊取得出道日期

2. **建立新的腳本 `fetch-kprofiles-idols.ts`**
   - 專門用於提取並匯入 `KPOP_IDOLS` 表
   - 需要先有 `KPOP_GROUPS` 的資料（因為需要 `group_id`）

3. **資料對應邏輯**
   - 使用團體名稱匹配 `KPOP_GROUPS` 表來取得 `group_id`
   - 生成唯一的 `idol_id`（可以使用時間戳或遞增 ID）

## 範例輸出格式

```json
{
  "idols": [
    {
      "stage_name": "Jisoo",
      "stage_name_kr": "지수",
      "nationality": "South Korea",
      "debut_date": "2016-08-08",
      "group_name": "BLACKPINK"
    },
    {
      "stage_name": "Jennie",
      "stage_name_kr": "제니",
      "nationality": "South Korea",
      "debut_date": "2016-08-08",
      "group_name": "BLACKPINK"
    },
    {
      "stage_name": "Rosé",
      "stage_name_kr": "로제",
      "nationality": "New Zealand",
      "debut_date": "2016-08-08",
      "group_name": "BLACKPINK"
    },
    {
      "stage_name": "Lisa",
      "stage_name_kr": "리사",
      "nationality": "Thailand",
      "debut_date": "2016-08-08",
      "group_name": "BLACKPINK"
    }
  ]
}
```


