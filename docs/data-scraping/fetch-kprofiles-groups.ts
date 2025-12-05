/**
 * Kprofiles.com KPOP 團體資料抓取腳本
 * 
 * 使用方法：
 * npx tsx scripts/fetch-kprofiles-groups.ts [--output=output.json] [--limit=10] [--groups=groups.txt] [--save-links=links.txt] [--start=0] [--end=50] [--offset=0]
 * 
 * 參數說明：
 *   --output=檔案路徑   指定輸出 JSON 檔案路徑（預設: kpop-groups.json）
 *   --limit=數量       限制抓取的團體數量（從頭開始，或與 --offset 搭配使用）
 *   --groups=檔案路徑  從檔案讀取團體 URL 列表（每行一個 URL）
 *   --save-links=檔案  保存所有找到的連結列表到檔案（方便後續分批處理）
 *   --start=行數       指定開始的行數（從 0 開始，與 --end 搭配使用）
 *   --end=行數         指定結束的行數（不包含，與 --start 搭配使用）
 *   --offset=行數      指定從第幾行開始（與 --limit 搭配使用，例如 --offset=50 --limit=50）
 * 
 * 使用範例：
 *   # 1. 先保存所有連結列表（建議先執行一次）
 *   npx tsx scripts/fetch-kprofiles-groups.ts --save-links=all-links.txt
 * 
 *   # 2. 從連結列表檔案讀取，抓取第 0-49 行（前 50 個）
 *   npx tsx scripts/fetch-kprofiles-groups.ts --groups=all-links.txt --start=0 --end=50 --output=batch1.json
 * 
 *   # 3. 抓取第 50-99 行（接下來 50 個）
 *   npx tsx scripts/fetch-kprofiles-groups.ts --groups=all-links.txt --start=50 --end=100 --output=batch2.json
 * 
 *   # 4. 或使用 offset + limit（從第 100 行開始，抓 50 個）
 *   npx tsx scripts/fetch-kprofiles-groups.ts --groups=all-links.txt --offset=100 --limit=50 --output=batch3.json
 * 
 *   # 5. 簡單用法：只限制數量（從頭開始）
 *   npx tsx scripts/fetch-kprofiles-groups.ts --output=kpop-groups.json --limit=20
 * 
 *   # 6. 從檔案讀取團體列表
 *   npx tsx scripts/fetch-kprofiles-groups.ts --groups=group-urls.txt --output=result.json
 * 
 * 輸出格式：
 *   {
 *     "BLACKPINK": {
 *       "members": [
 *         { 
 *           "name": "Jisoo", 
 *           "position": ["Lead Vocal", "Visual"],
 *           "nationality": "South Korea",
 *           "debut_date": "2016-08-08"
 *         },
 *         { 
 *           "name": "Jennie", 
 *           "position": ["Main Rapper", "Lead Vocal"],
 *           "nationality": "South Korea",
 *           "debut_date": "2016-08-08"
 *         },
 *         ...
 *       ],
 *       "debut_date": "2016-08-08"
 *     },
 *     ...
 *   }
 */

import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';

interface Member {
  // KPOP_IDOLS 表所需欄位（與資料庫欄位名稱匹配）
  stage_name: string; // 藝名（英文）
  stage_name_kr: string; // 藝名（韓文）
  nationality?: string; // 國籍
  debut_date?: string; // 出道日期
}

interface KpopGroup {
  members: Member[];
  // KPOP_GROUPS 表所需欄位（與資料庫欄位名稱匹配）
  debut_date?: string; // 團體出道日期
  group_namekr?: string; // 團體名稱（韓文）
  company?: string; // 經紀公司
  group_type?: 'B' | 'G' | 'M'; // 團體類型：B=Boy Group, G=Girl Group, M=Mixed
  member_count?: number; // 成員數量
  logo_image?: string; // Logo 圖片 URL
  discription?: string; // 描述
}

interface KpopGroupsData {
  [groupName: string]: KpopGroup;
}

/**
 * 延遲函數，避免請求過快
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 取得 HTML 內容
 */
async function fetchHTML(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.error(`❌ 無法取得 ${url}:`, error);
    throw error;
  }
}

/**
 * 從單一頁面提取所有 profile 連結
 */
async function extractProfileLinksFromPage(url: string, isSolo: boolean = false): Promise<string[]> {
  try {
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const profileUrls = new Set<string>();
    
    // 從整個 article 標籤提取連結（排除導航選單、header、footer）
    // 這對於 Girl Groups、Boy Groups 等列表頁面很重要，因為它們可能有大量連結
    $('article').find('a[href*="profile"]').each((_, element) => {
      // 檢查是否在導航選單、header 或 footer 中
      const $parent = $(element).closest(
        '.menu, .sub-menu, nav, .herald-menu, .herald-mobile-nav, .main-navigation, ' +
        'header, footer, .herald-site-header, .herald-site-footer, ' +
        '.menu-item, .herald-mob-nav'
      );
      if ($parent.length > 0) {
        return; // 跳過導航選單中的連結
      }
      
      let profileUrl = $(element).attr('href');
      if (!profileUrl) return;
      
      // 處理相對路徑
      if (profileUrl.startsWith('/')) {
        profileUrl = `https://kprofiles.com${profileUrl}`;
      } else if (!profileUrl.startsWith('http')) {
        return;
      }
      
      // 排除的關鍵字
      const excludeKeywords = [
        'list',
        'who-wore',
        'quiz',
        'poll',
        'guide',
        'discography',
        'coverography',
        'where-are-they',
        'suggestion',
        'survival',
        'company',
        'trainee',
        'youtuber',
        'tiktok',
        'model',
        'ulzzang',
        'forum',
        'actor-profile',
        'actress-profile',
        'singers-profile',
        'groups-profiles',
        'duets-profiles',
        'co-ed-groups-profiles',
        'wp-json',
        'xmlrpc',
        'feed',
        'comments/feed',
      ];
      
      const shouldExclude = excludeKeywords.some(keyword => 
        profileUrl.toLowerCase().includes(keyword)
      );
      
      if (shouldExclude) {
        return;
      }
      
      // 對於團體：保留包含以下格式的 URL：
      // - "-members-profile"
      // - "-member-profile" (單數)
      // - "-profile" (某些團體如 nmixx, aespa)
      // - "-members-profile-and-facts" (某些團體如 triples)
      // - "-profile-facts" 或 "-profile-and-facts" (某些團體)
      // 對於 Solo：保留包含 "-profile" 但不包含 "members" 的 URL
      if (isSolo) {
        const hasProfile = profileUrl.includes('-profile') || 
                          profileUrl.includes('-profile-facts') || 
                          profileUrl.includes('-profile-and-facts');
        const isMembersProfile = profileUrl.includes('-members-profile') || 
                                profileUrl.includes('-member-profile') ||
                                profileUrl.includes('member-profile');
        const isListPage = profileUrl.includes('solo-singers') || 
                          profileUrl.includes('male-solo-singers') || 
                          profileUrl.includes('female-solo-singers');
        
        if (hasProfile && !isMembersProfile && !isListPage) {
          profileUrls.add(profileUrl);
        }
      } else {
        // 團體的 profile 格式多樣化
        // 只要包含 "-profile" 且不在排除列表中，就認為是團體 profile
        const hasProfile = profileUrl.includes('-profile') || 
                          profileUrl.includes('-profile-facts') || 
                          profileUrl.includes('-profile-and-facts');
        
        // 排除列表頁面和特定類型的 profile
        const isExcluded = 
          profileUrl.includes('solo-singers') ||
          profileUrl.includes('groups-profiles') ||
          profileUrl.includes('duets-profiles') ||
          profileUrl.includes('co-ed-groups-profiles') ||
          profileUrl.includes('actor-profile') ||
          profileUrl.includes('actress-profile') ||
          profileUrl.includes('singers-profile') ||
          profileUrl.includes('disbanded-kpop');
        
        if (hasProfile && !isExcluded) {
          profileUrls.add(profileUrl);
        }
      }
    });
    
    return Array.from(profileUrls);
  } catch (error) {
    console.log(`  ⚠️  無法從 ${url} 提取連結: ${error}`);
    return [];
  }
}

/**
 * 解析 HTML 並提取團體列表
 * 從所有分類頁面（Girl Groups, Boy Groups, Co-ed, Duos, Solo）提取 profile 連結
 */
async function getGroupList(filePath?: string): Promise<string[]> {
  // 如果提供了檔案路徑，從檔案讀取
  if (filePath) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const urls = fileContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#') && line.startsWith('http'));
      
      if (urls.length > 0) {
        console.log(`✅ 從檔案讀取 ${urls.length} 個團體 URL`);
        return urls;
      }
    } catch (error) {
      console.log(`⚠️  無法讀取檔案 ${filePath}，將嘗試自動搜尋...`);
    }
  }

  // 定義所有分類頁面
  const categoryPages = [
    { name: 'Girl Groups', url: 'https://kprofiles.com/k-pop-girl-groups/', isSolo: false },
    { name: 'Boy Groups', url: 'https://kprofiles.com/k-pop-boy-groups/', isSolo: false },
    { name: 'Co-ed Groups', url: 'https://kprofiles.com/co-ed-groups-profiles/', isSolo: false },
    { name: 'Duos', url: 'https://kprofiles.com/kpop-duets-profiles/', isSolo: false },
    { name: 'Female Soloists', url: 'https://kprofiles.com/kpop-solo-singers/', isSolo: true },
    { name: 'Male Soloists', url: 'https://kprofiles.com/kpop-male-solo-singers/', isSolo: true },
  ];

  const allProfileUrls = new Set<string>();
  
  console.log('🔍 開始從各分類頁面提取 profile 連結...\n');
  
  for (const category of categoryPages) {
    console.log(`📋 處理 ${category.name}...`);
    const urls = await extractProfileLinksFromPage(category.url, category.isSolo);
    console.log(`  ✅ 找到 ${urls.length} 個 profile 連結`);
    
    urls.forEach(url => allProfileUrls.add(url));
    
    // 延遲以避免請求過快
    await delay(1000);
  }

  const finalUrls = Array.from(allProfileUrls);
  
  if (finalUrls.length > 0) {
    console.log(`\n✅ 總共找到 ${finalUrls.length} 個 profile 連結`);
    return finalUrls;
  }

  // 如果無法自動找到，返回一些常見的團體 URL
  console.log('⚠️  無法自動找到團體列表，使用預設的常見團體...');
  console.log('💡 提示: 您可以建立一個文字檔案，每行一個團體 URL，然後使用 --groups=檔案路徑 參數');
  
  // 注意：這些 URL 需要根據實際的 Kprofiles.com 結構調整
  // 建議使用 --groups 參數手動指定正確的 URL
  return [
    'https://kprofiles.com/black-pink-members-profile/',
    'https://kprofiles.com/twice-members-profile/',
    'https://kprofiles.com/bts-bangtan-boys-members-profile/',
    'https://kprofiles.com/red-velvet-members-profile/',
    'https://kprofiles.com/aespa-members-profile/',
    'https://kprofiles.com/newjeans-members-profile/',
    'https://kprofiles.com/ive-members-profile/',
    'https://kprofiles.com/le-sserafim-members-profile/',
    'https://kprofiles.com/idle-members-profile/',
    'https://kprofiles.com/stray-kids-members-profile/',
  ];
}

/**
 * 從文字中提取國籍資訊
 * 優先匹配更具體的 "born in" 資訊，避免被其他關鍵字誤判
 */
function extractNationality(text: string): string | null {
  // 優先匹配 "born in" 的具體地點（最準確）
  // 使用更精確的模式，確保匹配到完整的 "born in [地點], [國家]" 格式
  // 注意：地點可能包含多個逗號分隔的部分（例如 "Gunpo, Gyeonggi-do, South Korea"）
  const bornInPatterns = [
    // 匹配 "born in [城市], [地區], [國家]" 或 "born in [城市], [國家]" 格式
    // 使用 .*? 來匹配任意數量的逗號分隔的地點部分，直到找到國家名稱
    { pattern: /born\s+in\s+.*?thailand/i, nationality: 'Thailand' },
    { pattern: /born\s+in\s+.*?new\s+zealand/i, nationality: 'New Zealand' },
    { pattern: /born\s+in\s+.*?australia/i, nationality: 'Australia' },
    { pattern: /born\s+in\s+.*?japan/i, nationality: 'Japan' },
    { pattern: /born\s+in\s+.*?china/i, nationality: 'China' },
    { pattern: /born\s+in\s+.*?taiwan/i, nationality: 'Taiwan' },
    { pattern: /born\s+in\s+.*?philippines/i, nationality: 'Philippines' },
    { pattern: /born\s+in\s+.*?indonesia/i, nationality: 'Indonesia' },
    { pattern: /born\s+in\s+.*?vietnam/i, nationality: 'Vietnam' },
    { pattern: /born\s+in\s+.*?(?:united\s+states|usa|us)/i, nationality: 'United States' },
    { pattern: /born\s+in\s+.*?canada/i, nationality: 'Canada' },
    { pattern: /born\s+in\s+.*?(?:south\s+)?korea/i, nationality: 'South Korea' },
  ];
  
  // 先檢查 "born in" 的具體地點（最優先）
  for (const { pattern, nationality } of bornInPatterns) {
    if (pattern.test(text)) {
      return nationality;
    }
  }
  
  // 如果沒有找到 "born in"，再檢查其他關鍵字（但優先級較低）
  // 注意：這些模式可能會誤判，所以只在沒有 "born in" 時使用
  const generalPatterns = [
    { pattern: /\bthailand\b|\bthai\b/i, nationality: 'Thailand' },
    { pattern: /\bnew\s+zealand\b/i, nationality: 'New Zealand' },
    { pattern: /\baustralia\b|\baustralian\b/i, nationality: 'Australia' },
    { pattern: /\bjapan\b|\bjapanese\b/i, nationality: 'Japan' },
    { pattern: /\bchina\b|\bchinese\b/i, nationality: 'China' },
    { pattern: /\btaiwan\b|\btaiwanese\b/i, nationality: 'Taiwan' },
    { pattern: /\bphilippines\b|\bfilipino\b/i, nationality: 'Philippines' },
    { pattern: /\bindonesia\b|\bindonesian\b/i, nationality: 'Indonesia' },
    { pattern: /\bvietnam\b|\bvietnamese\b/i, nationality: 'Vietnam' },
    { pattern: /\b(?:united\s+states|usa|us|american)\b/i, nationality: 'United States' },
    { pattern: /\bcanada\b|\bcanadian\b/i, nationality: 'Canada' },
    // 將 "korean" 放在最後，避免誤判（例如 "is Korean, but born in New Zealand"）
    { pattern: /\b(?:south\s+)?korea\b|\bkorean\b/i, nationality: 'South Korea' },
  ];
  
  for (const { pattern, nationality } of generalPatterns) {
    if (pattern.test(text)) {
      return nationality;
    }
  }
  
  return null;
}

/**
 * 從團體頁面提取出道日期
 */
function extractGroupDebutDate($: cheerio.CheerioAPI): string | null {
  // 方法 1: 從頁面開頭的介紹段落中尋找（通常包含出道日期）
  $('p').each((_, p) => {
    const $p = $(p);
    const text = $p.text();
    
    // 檢查是否包含團體介紹（通常會提到出道日期）
    if (text.toLowerCase().includes('debuted') || 
        text.toLowerCase().includes('debut') ||
        text.toLowerCase().includes('debuted on')) {
      
      // 尋找日期格式: "August 8, 2016" 或 "August 8 2016"
      const datePatterns = [
        /([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/g,
        /(\d{4}-\d{2}-\d{2})/g, // YYYY-MM-DD
        /(\d{1,2}\/\d{1,2}\/\d{4})/g, // MM/DD/YYYY
      ];
      
      for (const pattern of datePatterns) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
          try {
            const dateStr = match[1];
            let date: Date;
            
            // 如果是 "Month Day, Year" 格式，手動解析避免時區問題
            const monthDayYearMatch = dateStr.match(/([A-Z][a-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
            if (monthDayYearMatch) {
              const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                                  'july', 'august', 'september', 'october', 'november', 'december'];
              const monthName = monthDayYearMatch[1].toLowerCase();
              const monthIndex = monthNames.indexOf(monthName);
              const day = parseInt(monthDayYearMatch[2], 10);
              const year = parseInt(monthDayYearMatch[3], 10);
              
              if (monthIndex >= 0 && day >= 1 && day <= 31 && year >= 1990 && year <= 2030) {
                // 使用 UTC 時間來避免時區問題
                date = new Date(Date.UTC(year, monthIndex, day));
              } else {
                date = new Date(dateStr);
              }
            } else {
              date = new Date(dateStr);
            }
            
            if (!isNaN(date.getTime())) {
              // 驗證日期是否合理（1900-2100 之間）
              const year = date.getFullYear();
              if (year >= 1990 && year <= 2030) {
                // 使用本地日期來避免時區問題
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
              }
            }
          } catch (e) {
            // 繼續嘗試下一個匹配
          }
        }
      }
    }
  });
  
  // 方法 2: 從整個頁面文字中尋找
  const pageText = $('body').text();
  const debutPatterns = [
    // 標準格式
    /debuted?\s+on\s+([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i,
    /debut\s+date[:\s]+([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i,
    /debut[:\s]+([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i,
    // 處理 "made their Korean debut on" 格式
    /made\s+their\s+(?:Korean|Japanese|English)?\s+debut\s+on\s+([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i,
    // 處理 "debuted as a X-member group on" 格式
    /debuted\s+as\s+a\s+\d+-member\s+group\s+on\s+([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i,
    // 處理 "officially debuted on" 格式
    /officially\s+debuted?\s+on\s+([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i,
  ];
  
  for (const pattern of debutPatterns) {
    const match = pageText.match(pattern);
    if (match && match[1]) {
      try {
        const dateStr = match[1];
        let date: Date;
        
        // 如果是 "Month Day, Year" 格式，手動解析避免時區問題
        const monthDayYearMatch = dateStr.match(/([A-Z][a-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
        if (monthDayYearMatch) {
          const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                              'july', 'august', 'september', 'october', 'november', 'december'];
          const monthName = monthDayYearMatch[1].toLowerCase();
          const monthIndex = monthNames.indexOf(monthName);
          const day = parseInt(monthDayYearMatch[2], 10);
          const year = parseInt(monthDayYearMatch[3], 10);
          
          if (monthIndex >= 0 && day >= 1 && day <= 31 && year >= 1990 && year <= 2030) {
            // 使用 UTC 時間來避免時區問題
            date = new Date(Date.UTC(year, monthIndex, day));
          } else {
            date = new Date(dateStr);
          }
        } else {
          date = new Date(dateStr);
        }
        
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          if (year >= 1990 && year <= 2030) {
            // 使用本地日期來避免時區問題
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          }
        }
      } catch (e) {
        // 繼續嘗試下一個模式
      }
    }
  }
  
  return null;
}

/**
 * 從成員的 Facts 區塊提取國籍
 */
function extractMemberNationality($: cheerio.CheerioAPI, memberName: string): string | null {
  // 尋找包含成員姓名的 Facts 區塊
  let factsText = '';
  
  $('p').each((_, p) => {
    const $p = $(p);
    const text = $p.text();
    const html = $p.html() || '';
    
    // 檢查是否是該成員的 Facts 區塊
    if (text.includes(`${memberName} Facts`) || 
        html.includes(`<strong>${memberName} Facts`)) {
      // 取得這個段落和接下來的幾個段落（Facts 通常跨越多個段落）
      // 但要在遇到下一個成員的 Facts 區塊時停止
      let factsContent = text;
      let $nextP = $p.next('p');
      let count = 0;
      while ($nextP.length > 0 && count < 10) { // 最多讀取後續 10 個段落
        const nextText = $nextP.text();
        const nextHtml = $nextP.html() || '';
        
        // 如果遇到下一個成員的 Facts 區塊，停止
        if (nextText.includes('Facts:') && 
            !nextText.includes(`${memberName} Facts`)) {
          break;
        }
        
        factsContent += ' ' + nextText;
        $nextP = $nextP.next('p');
        count++;
      }
      factsText = factsContent;
      return false; // 找到就停止
    }
  });
  
  // 如果沒找到明確的 Facts 標題，尋找包含成員姓名和 "born" 的段落
  if (!factsText) {
    $('p').each((_, p) => {
      const $p = $(p);
      const text = $p.text();
      
      // 確保這個段落是關於該成員的（包含成員姓名）
      if (text.includes(memberName) && text.toLowerCase().includes('born')) {
        // 檢查是否包含 "born in" 的完整句子
        if (/born\s+in/i.test(text)) {
          factsText = text;
          return false; // 找到就停止
        }
      }
    });
  }
  
  // 從找到的文字中提取國籍
  if (factsText) {
    return extractNationality(factsText);
  }
  
  return null;
}

/**
 * 提取團體韓文名稱
 */
function extractGroupNameKr($: cheerio.CheerioAPI): string | null {
  // 從頁面內容中尋找 "GROUP_NAME (韓文)" 格式
  const pageText = $('body').text();
  
  // 尋找括號中的韓文字符（韓文 Unicode 範圍：\uAC00-\uD7A3）
  const koreanPattern = /\(([\uAC00-\uD7A3\s]+)\)/;
  const match = pageText.match(koreanPattern);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // 從 HTML 中尋找 <strong>GROUP_NAME (韓文)</strong> 格式
  $('p').each((_, p) => {
    const $p = $(p);
    const html = $p.html() || '';
    const koreanMatch = html.match(/<strong>.*?\(([\uAC00-\uD7A3\s]+)\)/);
    if (koreanMatch && koreanMatch[1]) {
      return koreanMatch[1].trim();
    }
  });
  
  return null;
}

/**
 * 提取經紀公司名稱
 */
function extractCompany($: cheerio.CheerioAPI): string | null {
  const pageText = $('body').text();
  const pageHtml = $('body').html() || '';
  
  // 尋找 "under COMPANY" 或 "from COMPANY" 格式
  // 支援多種公司後綴：Entertainment, Labels, Records, Music, Company, Studio
  const companyPatterns = [
    // 優先：從 HTML 中提取 <strong> 標籤中的公司名稱
    /under\s+<strong>([^<]+(?:Entertainment|Labels|Records|Music|Company|Studio))<\/strong>/i,
    /under\s+<strong>([^<]+)<\/strong>\s+and/i, // 處理 "under ADOR and HYBE Labels"
    // 從純文字中提取
    /under\s+([A-Z][a-zA-Z\s&]+(?:Entertainment|Labels|Records|Music|Company|Studio))/i,
    /from\s+([A-Z][a-zA-Z\s&]+(?:Entertainment|Labels|Records|Music|Company|Studio))/i,
    // 如果有多個公司（用 "and" 連接），取第一個
    /under\s+([A-Z][a-zA-Z\s&]+?)\s+and\s+[A-Z][a-zA-Z\s&]+(?:Labels|Entertainment|Records)/i,
  ];
  
  for (const pattern of companyPatterns) {
    const match = pageHtml.match(pattern) || pageText.match(pattern);
    if (match && match[1]) {
      let company = match[1].trim();
      // 清理 HTML 標籤
      company = company.replace(/<[^>]+>/g, '').trim();
      // 移除多餘的空白
      company = company.replace(/\s+/g, ' ').trim();
      
      // 驗證公司名稱長度（VARCHAR(20)）
      if (company && company.length <= 20) {
        return company;
      } else if (company && company.length > 20) {
        // 如果超過長度，嘗試截取主要部分
        const parts = company.split(/\s+/);
        if (parts.length > 1) {
          // 取第一個單詞（通常是公司名稱的主要部分）
          const mainPart = parts[0];
          if (mainPart.length <= 20) {
            return mainPart;
          }
        }
      }
    }
  }
  
  return null;
}

/**
 * 提取團體類型
 */
function extractGroupType($: cheerio.CheerioAPI): 'B' | 'G' | 'M' | null {
  const pageText = $('body').text().toLowerCase();
  
  if (pageText.includes('girl group') || pageText.includes('girl-group')) {
    return 'G';
  } else if (pageText.includes('boy group') || pageText.includes('boy-group')) {
    return 'B';
  } else if (pageText.includes('co-ed') || pageText.includes('mixed')) {
    return 'M';
  }
  
  // 從 URL 或分類推斷
  const url = $('meta[property="og:url"]').attr('content') || '';
  if (url.includes('girl-groups') || url.includes('kpop-girl-groups')) {
    return 'G';
  } else if (url.includes('boy-groups') || url.includes('kpop-boy-groups')) {
    return 'B';
  } else if (url.includes('co-ed')) {
    return 'M';
  }
  
  return null;
}

/**
 * 提取 Logo 圖片 URL
 */
function extractLogoImage($: cheerio.CheerioAPI): string | null {
  // 尋找 "Official Logo" 區塊中的圖片
  $('p').each((_, p) => {
    const $p = $(p);
    const text = $p.text();
    const html = $p.html() || '';
    
    if (text.includes('Official Logo') || text.includes('Logo:')) {
      // 方法 1: 尋找這個段落中的圖片（可能在 <br /> 後面）
      const $img = $p.find('img').first();
      if ($img.length > 0) {
        let src = $img.attr('src');
        if (src) {
          // 確保是完整的 URL
          if (src.startsWith('//')) {
            src = 'https:' + src;
          } else if (src.startsWith('/')) {
            src = 'https://kprofiles.com' + src;
          }
          // 排除網站 Logo
          if (!src.includes('herald_logo') && !src.includes('site-logo')) {
            return src;
          }
        }
      }
      
      // 方法 2: 如果段落中沒有直接包含 img，檢查下一個段落
      const $nextP = $p.next('p');
      if ($nextP.length > 0) {
        const $nextImg = $nextP.find('img').first();
        if ($nextImg.length > 0) {
          let src = $nextImg.attr('src');
          if (src) {
            if (src.startsWith('//')) {
              src = 'https:' + src;
            } else if (src.startsWith('/')) {
              src = 'https://kprofiles.com' + src;
            }
            // 排除網站 Logo
            if (!src.includes('herald_logo') && !src.includes('site-logo')) {
              return src;
            }
          }
        }
      }
      
      // 方法 3: 檢查同一段落中 <br /> 後面的圖片（HTML 格式）
      // 支援多種格式：<br />、<br>、換行等
      const brMatch = html.match(/Official\s+Logo[^<]*(?:<br\s*\/?>|\n)\s*<img[^>]+src=["']([^"']+)["']/i);
      if (brMatch && brMatch[1]) {
        let src = brMatch[1];
        if (src.startsWith('//')) {
          src = 'https:' + src;
        } else if (src.startsWith('/')) {
          src = 'https://kprofiles.com' + src;
        }
        if (!src.includes('herald_logo') && !src.includes('site-logo')) {
          return src;
        }
      }
      
      // 方法 4: 檢查同一段落中所有圖片，找到最可能是 Logo 的
      const $allImgs = $p.find('img');
      if ($allImgs.length > 0) {
        for (let i = 0; i < $allImgs.length; i++) {
          const $img = $($allImgs[i]);
          let src = $img.attr('src');
          if (src) {
            if (src.startsWith('//')) {
              src = 'https:' + src;
            } else if (src.startsWith('/')) {
              src = 'https://kprofiles.com' + src;
            }
            // 排除網站 Logo，但包含 "logo" 關鍵字的可能是團體 Logo
            if (!src.includes('herald_logo') && !src.includes('site-logo')) {
              // 如果 URL 中包含團體名稱或 "logo"，更可能是 Logo
              if (src.toLowerCase().includes('logo') || src.toLowerCase().includes('twice') || 
                  src.toLowerCase().includes('bts') || src.toLowerCase().includes('blackpink')) {
                return src;
              }
            }
          }
        }
      }
    }
  });
  
  // 如果沒找到，尋找頁面中包含 "logo" 關鍵字的圖片（排除網站 Logo）
  const $imgs = $('img');
  for (let i = 0; i < $imgs.length; i++) {
    const $img = $($imgs[i]);
    let src = $img.attr('src') || '';
    const alt = ($img.attr('alt') || '').toLowerCase();
    
    // 排除網站 Logo
    if (src.includes('herald_logo') || src.includes('site-logo')) {
      continue;
    }
    
    if (src.includes('logo') || alt.includes('logo')) {
      // 確保是完整的 URL
      if (src.startsWith('//')) {
        src = 'https:' + src;
      } else if (src.startsWith('/')) {
        src = 'https://kprofiles.com' + src;
      }
      return src;
    }
  }
  
  return null;
}

/**
 * 提取團體描述
 */
function extractDescription($: cheerio.CheerioAPI): string | null {
  // 從頁面開頭的介紹段落提取
  // 通常在第一個包含 "Members Profile and Facts" 的段落
  $('p').each((_, p) => {
    const $p = $(p);
    const text = $p.text().trim();
    const html = $p.html() || '';
    
    // 尋找包含 "Members Profile and Facts" 或 "Members Profile" 的段落
    if (text.includes('Members Profile')) {
      // 移除標題部分（"BLACKPINK Members Profile and Facts:"）
      let cleanText = text.replace(/^.*?Members Profile[^:]*:\s*/i, '');
      
      // 如果移除標題後還有內容，繼續處理
      if (cleanText.length < 30) {
        // 可能標題和內容分開了，嘗試從 HTML 中提取
        cleanText = html
          .replace(/<strong>.*?Members Profile[^<]*<\/strong>/i, '')
          .replace(/<img[^>]*>/gi, '')
          .replace(/<a[^>]*>.*?<\/a>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      } else {
        // 清理 HTML 標籤
        cleanText = cleanText
          .replace(/<img[^>]*>/gi, '')
          .replace(/<a[^>]*>.*?<\/a>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
      
      // 移除過長的連結文字和特殊字符
      cleanText = cleanText.replace(/\[.*?\]/g, '');
      
      // 如果文字太短，可能是標題，跳過
      if (cleanText.length < 30) {
        return null; // 繼續尋找
      }
      
      // 限制描述長度為 500 字符
      if (cleanText.length <= 500) {
        return cleanText;
      } else {
        // 在句號或逗號處截斷
        const truncated = cleanText.substring(0, 497);
        const lastPeriod = truncated.lastIndexOf('.');
        const lastComma = truncated.lastIndexOf(',');
        const cutPoint = Math.max(lastPeriod, lastComma);
        
        if (cutPoint > 400) {
          return truncated.substring(0, cutPoint + 1);
        } else {
          return truncated + '...';
        }
      }
    }
  });
  
  return null;
}

/**
 * 從團體頁面提取成員資訊
 */
async function extractGroupData(groupUrl: string): Promise<{ 
  groupName: string; 
  members: Member[]; 
  debut_date?: string;
  group_namekr?: string;
  company?: string;
  group_type?: 'B' | 'G' | 'M';
  member_count?: number;
  logo_image?: string;
  discription?: string;
} | null> {
  try {
    console.log(`📥 正在處理: ${groupUrl}`);
    const html = await fetchHTML(groupUrl);
    const $ = cheerio.load(html);
    
    // 提取團體名稱
    let groupName = '';
    
    // 方法 1: 從 <h1> 標籤取得
    const h1 = $('h1').first().text().trim();
    if (h1) {
      groupName = h1
        .replace(/\s*Profile.*$/i, '')
        .replace(/\s*-\s*Kprofiles.*$/i, '')
        .trim();
    }
    
    // 方法 2: 從 <title> 標籤取得
    if (!groupName) {
      const title = $('title').text().trim();
      if (title) {
        groupName = title
          .replace(/\s*Profile.*$/i, '')
          .replace(/\s*-\s*Kprofiles.*$/i, '')
          .trim();
      }
    }
    
    // 方法 3: 從 URL 取得
    if (!groupName) {
      const urlMatch = groupUrl.match(/\/([^\/]+)-profile\/?$/);
      if (urlMatch) {
        groupName = urlMatch[1]
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
          .toUpperCase();
      }
    }

    // 提取團體出道日期
    const groupDebutDate = extractGroupDebutDate($);
    
    const members: Member[] = [];

    // 方法 1: 尋找包含 "Stage Name:" 的成員區塊
    // Kprofiles 的格式通常是: Stage Name: Jisoo (지수)
    // 需要從這個格式中提取 stage_name 和 stage_name_kr
    
    $('p').each((_, p) => {
      const $p = $(p);
      const text = $p.text();
      const html = $p.html() || '';
      
      // 尋找包含 "Stage Name:" 的段落
      if (text.includes('Stage Name:') || text.includes('Stage Name')) {
        // 提取 Stage Name 的內容
        // 格式可能是: "Stage Name: Jisoo (지수)" 或 "Stage Name: Jisoo (지수)<br />"
        const stageNameMatch = text.match(/Stage\s+Name[:\s]+([^(]+)\s*\(([^)]+)\)/i) || 
                                        html.match(/Stage\s+Name[:\s]+([^(<]+)\s*\(([^)]+)\)/i);
        
        if (stageNameMatch && stageNameMatch[1] && stageNameMatch[2]) {
          let stageName = stageNameMatch[1].trim();
          let stageNameKr = stageNameMatch[2].trim();
          
          // 清理 HTML 標籤
          stageName = stageName.replace(/<[^>]+>/g, '').trim();
          stageNameKr = stageNameKr.replace(/<[^>]+>/g, '').trim();
          
          // 驗證 stage_name 和 stage_name_kr 是否有效
          if (stageName && stageName.length > 0 && stageName.length <= 30 &&
              stageNameKr && stageNameKr.length > 0 && stageNameKr.length <= 30) {
            
            // 提取國籍（使用 stage_name 作為成員識別）
            const nationality = extractMemberNationality($, stageName);
            
            members.push({
              stage_name: stageName,
              stage_name_kr: stageNameKr,
              nationality: nationality || undefined,
              debut_date: groupDebutDate || undefined,
            });
          }
        } else {
          // 如果沒有括號格式，嘗試只提取英文名稱
          // 格式可能是: "Stage Name: Jisoo"
          const simpleMatch = text.match(/Stage\s+Name[:\s]+([^\n<:]+)/i) ||
                              html.match(/Stage\s+Name[:\s]+([^\n<:]+)/i);
          
          if (simpleMatch && simpleMatch[1]) {
            let stageName = simpleMatch[1].trim();
            stageName = stageName.replace(/<[^>]+>/g, '').trim();
            
            // 如果只有英文名稱，韓文名稱設為空（但資料庫要求 NOT NULL，所以需要處理）
            // 先檢查是否能從其他地方找到韓文名稱
            let stageNameKr = '';
            
            // 嘗試從同一段落或前一個段落尋找韓文名稱
            // 或者從 "Korean Name:" 中提取
            const koreanNameMatch = text.match(/Korean\s+Name[:\s]+[^(]+\s*\(([^)]+)\)/i) ||
                                   html.match(/Korean\s+Name[:\s]+[^(<]+\s*\(([^)]+)\)/i);
            
            if (koreanNameMatch && koreanNameMatch[1]) {
              stageNameKr = koreanNameMatch[1].trim().replace(/<[^>]+>/g, '').trim();
            }
            
            // 如果還是沒有韓文名稱，嘗試從團體韓文名稱推斷（不準確，但至少不會是空）
            if (!stageNameKr) {
              // 從頁面中尋找可能的韓文名稱（在成員區塊附近）
              const $memberBlock = $p.parent();
              const memberText = $memberBlock.text();
              const koreanCharMatch = memberText.match(/[\uAC00-\uD7A3]+/);
              if (koreanCharMatch) {
                stageNameKr = koreanCharMatch[0];
              }
            }
            
            // 如果驗證通過，加入成員列表
            if (stageName && stageName.length > 0 && stageName.length <= 30) {
              // 如果沒有韓文名稱，使用英文名稱作為備用（雖然不理想，但至少符合 NOT NULL 約束）
              if (!stageNameKr || stageNameKr.length === 0) {
                stageNameKr = stageName; // 備用方案
              }
              
              if (stageNameKr.length <= 30) {
                const nationality = extractMemberNationality($, stageName);
                
                members.push({
                  stage_name: stageName,
                  stage_name_kr: stageNameKr,
                  nationality: nationality || undefined,
                  debut_date: groupDebutDate || undefined,
                });
              }
            }
          }
        }
      }
    });

    // 方法 2: 如果方法 1 沒找到，嘗試從整個頁面中尋找所有 "Stage Name:" 出現的位置
    if (members.length === 0) {
      // 嘗試從整個頁面中尋找所有 "Stage Name:" 出現的位置
      const pageText = $('body').text();
      const pageHtml = $('body').html() || '';
      const stageNameMatches = [
        ...pageText.matchAll(/Stage\s+Name[:\s]+([^(]+)\s*\(([^)]+)\)/gi),
        ...pageHtml.matchAll(/Stage\s+Name[:\s]+([^(<]+)\s*\(([^)]+)\)/gi)
      ];
      
      for (const match of stageNameMatches) {
        if (match[1] && match[2]) {
          let stageName = match[1].trim();
          let stageNameKr = match[2].trim();
          
          // 清理 HTML 標籤
          stageName = stageName.replace(/<[^>]+>/g, '').trim();
          stageNameKr = stageNameKr.replace(/<[^>]+>/g, '').trim();
          
          if (stageName && stageName.length > 0 && stageName.length <= 30 &&
              stageNameKr && stageNameKr.length > 0 && stageNameKr.length <= 30) {
            
            // 檢查是否已經存在
            const exists = members.some(m => 
              m.stage_name.toLowerCase() === stageName.toLowerCase()
            );
            
            if (!exists) {
              const nationality = extractMemberNationality($, stageName);
              
              members.push({
                stage_name: stageName,
                stage_name_kr: stageNameKr,
                nationality: nationality || undefined,
                debut_date: groupDebutDate || undefined,
              });
            }
          }
        }
      }
    }

    // 方法 3: 如果前兩種方法都沒找到，嘗試從其他格式提取（已移除，因為不再需要）
    // 舊的方法 2: 如果方法 1 沒找到，嘗試尋找表格格式的成員資訊
    if (false && members.length === 0) {
      $('table').each((_, table) => {
        const $table = $(table);
        const headers: string[] = [];
        
        // 取得表頭
        $table.find('thead tr th, thead tr td, tr:first-child th, tr:first-child td').each((_, th) => {
          const headerText = $(th).text().trim().toLowerCase();
          headers.push(headerText);
        });
        
        // 尋找 Name 或 Member 欄位的索引
        const nameIndex = headers.findIndex(h => 
          h.includes('name') || h.includes('member') || h === ''
        );
        const positionIndex = headers.findIndex(h => 
          h.includes('position') || h.includes('role')
        );
        
        // 如果找到表頭，處理資料行
        if (nameIndex >= 0 || headers.length > 0) {
          $table.find('tbody tr, tr').each((_, row) => {
            const $row = $(row);
            const cells = $row.find('td, th');
            
            if (cells.length === 0) return;
            
            // 取得姓名（通常是第一欄或 nameIndex 欄）
            const nameCell = cells.eq(nameIndex >= 0 ? nameIndex : 0);
            let memberName = nameCell.text().trim();
            
            // 清理姓名
            memberName = memberName
              .split(/[–—\-]/)[0] // 取破折號前的部分
              .replace(/\s+/g, ' ')
              .trim();
            
            // 跳過標題行和無效行
            if (!memberName || 
                memberName.toLowerCase().includes('name') ||
                memberName.toLowerCase().includes('member') ||
                memberName.toLowerCase().includes('position') ||
                memberName.length < 2 ||
                memberName.length > 50) {
              return;
            }
            
            // 取得職位
            const positions: string[] = [];
            
            if (positionIndex >= 0) {
              const positionCell = cells.eq(positionIndex);
              let positionText = positionCell.text().trim();
              
              if (positionText && !positionText.toLowerCase().includes('position')) {
                // 分割多個職位
                const splitPositions = positionText
                  .split(/[,/|、•·]/)
                  .map(p => p.trim())
                  .filter(p => p && p.length > 0);
                positions.push(...splitPositions);
              }
            }
            
            // 如果沒有找到明確的職位欄位，從整行內容中提取
            if (positions.length === 0) {
              const rowText = $row.text().toLowerCase();
              const positionKeywords = [
                { keyword: 'main vocal', label: 'Main Vocal' },
                { keyword: 'lead vocal', label: 'Lead Vocal' },
                { keyword: 'vocal', label: 'Vocal' },
                { keyword: 'main rapper', label: 'Main Rapper' },
                { keyword: 'lead rapper', label: 'Lead Rapper' },
                { keyword: 'rapper', label: 'Rapper' },
                { keyword: 'main dancer', label: 'Main Dancer' },
                { keyword: 'lead dancer', label: 'Lead Dancer' },
                { keyword: 'dancer', label: 'Dancer' },
                { keyword: 'visual', label: 'Visual' },
                { keyword: 'center', label: 'Center' },
                { keyword: 'leader', label: 'Leader' },
                { keyword: 'maknae', label: 'Maknae' },
                { keyword: 'sub vocal', label: 'Sub Vocal' },
                { keyword: 'sub rapper', label: 'Sub Rapper' },
              ];
              
              for (const { keyword, label } of positionKeywords) {
                if (rowText.includes(keyword) && !positions.includes(label)) {
                  positions.push(label);
                }
              }
            }
            
            if (memberName) {
              members.push({
                name: memberName,
                position: positions.length > 0 ? positions : ['Unknown'],
              });
            }
          });
        }
      });
    }

    // 去重複成員（根據 stage_name）
    const uniqueMembers = members.filter((member, index, self) =>
      index === self.findIndex(m => 
        m.stage_name.toLowerCase() === member.stage_name.toLowerCase()
      )
    );

    if (uniqueMembers.length === 0) {
      console.log(`  ⚠️  無法提取成員資訊`);
      return null;
    }

    console.log(`  ✅ 找到 ${uniqueMembers.length} 位成員: ${uniqueMembers.map(m => m.stage_name).join(', ')}`);
    
    // 提取團體資訊（KPOP_GROUPS 表所需欄位）
    const groupNameKr = extractGroupNameKr($);
    const company = extractCompany($);
    const groupType = extractGroupType($);
    const logoImage = extractLogoImage($);
    const description = extractDescription($);
    
    return {
      groupName: groupName || 'Unknown',
      members: uniqueMembers,
      debut_date: groupDebutDate || undefined,
      group_namekr: groupNameKr || undefined,
      company: company || undefined,
      group_type: groupType || undefined,
      member_count: uniqueMembers.length,
      logo_image: logoImage || undefined,
      discription: description || undefined,
    };
  } catch (error) {
    console.error(`  ❌ 處理失敗:`, error);
    return null;
  }
}

/**
 * 主函數
 */
async function main() {
  const args = process.argv.slice(2);
  const outputArg = args.find(arg => arg.startsWith('--output='));
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const groupsArg = args.find(arg => arg.startsWith('--groups='));
  const saveLinksArg = args.find(arg => arg.startsWith('--save-links='));
  const startArg = args.find(arg => arg.startsWith('--start='));
  const endArg = args.find(arg => arg.startsWith('--end='));
  const offsetArg = args.find(arg => arg.startsWith('--offset='));
  
  const outputFile = outputArg 
    ? outputArg.split('=')[1] 
    : path.join(process.cwd(), 'kpop-groups.json');
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined;
  const groupsFile = groupsArg ? groupsArg.split('=')[1] : undefined;
  const saveLinksFile = saveLinksArg ? saveLinksArg.split('=')[1] : undefined;
  const start = startArg ? parseInt(startArg.split('=')[1]) : undefined;
  const end = endArg ? parseInt(endArg.split('=')[1]) : undefined;
  const offset = offsetArg ? parseInt(offsetArg.split('=')[1]) : undefined;

  console.log('🎵 Kprofiles.com KPOP 團體資料抓取工具\n');
  console.log(`📁 輸出檔案: ${outputFile}`);
  if (limit) {
    console.log(`📊 限制數量: ${limit} 個團體`);
  }
  if (groupsFile) {
    console.log(`📋 團體列表檔案: ${groupsFile}`);
  }
  if (saveLinksFile) {
    console.log(`💾 將保存連結列表至: ${saveLinksFile}`);
  }
  if (start !== undefined || end !== undefined) {
    console.log(`📍 範圍: 第 ${start ?? 0} 行 到 第 ${end ?? '最後'} 行`);
  }
  if (offset !== undefined) {
    console.log(`📍 偏移: 從第 ${offset} 行開始`);
  }
  console.log('');

  try {
    // 取得團體列表
    console.log('📋 步驟 1: 取得團體列表...\n');
    let groupUrls = await getGroupList(groupsFile);
    
    // 如果指定要保存連結列表
    if (saveLinksFile) {
      const linksPath = path.resolve(process.cwd(), saveLinksFile);
      const linksContent = groupUrls.join('\n');
      fs.writeFileSync(linksPath, linksContent, 'utf-8');
      console.log(`\n💾 已保存 ${groupUrls.length} 個連結至: ${linksPath}\n`);
    }
    
    // 處理範圍選擇
    if (start !== undefined || end !== undefined) {
      const startIdx = start ?? 0;
      const endIdx = end ?? groupUrls.length;
      groupUrls = groupUrls.slice(startIdx, endIdx);
      console.log(`📍 選取範圍: 第 ${startIdx} 行到第 ${endIdx} 行 (共 ${groupUrls.length} 個)\n`);
    } else if (offset !== undefined) {
      const startIdx = offset;
      const endIdx = limit ? startIdx + limit : groupUrls.length;
      groupUrls = groupUrls.slice(startIdx, endIdx);
      console.log(`📍 從第 ${startIdx} 行開始，選取 ${groupUrls.length} 個\n`);
    } else if (limit && groupUrls.length > limit) {
      // 如果只指定 limit，從頭開始
      groupUrls = groupUrls.slice(0, limit);
      console.log(`📍 從頭開始選取前 ${limit} 個\n`);
    }
    
    console.log(`✅ 將處理 ${groupUrls.length} 個團體\n`);

    // 提取每個團體的資料
    console.log('📥 步驟 2: 提取團體資料...\n');
    const kpopGroups: KpopGroupsData = {};

    for (let i = 0; i < groupUrls.length; i++) {
      const groupUrl = groupUrls[i];
      console.log(`[${i + 1}/${groupUrls.length}]`);

      const groupData = await extractGroupData(groupUrl);
      
      if (groupData) {
        kpopGroups[groupData.groupName.toUpperCase()] = {
          members: groupData.members,
          debut_date: groupData.debut_date,
          group_namekr: groupData.group_namekr,
          company: groupData.company,
          group_type: groupData.group_type,
          member_count: groupData.member_count,
          logo_image: groupData.logo_image,
          discription: groupData.discription,
        };
      }

      // 延遲以避免請求過快
      await delay(1000); // 每秒一個請求
    }

    // 儲存結果
    console.log('\n💾 步驟 3: 儲存結果...\n');
    const outputPath = path.resolve(process.cwd(), outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(kpopGroups, null, 2), 'utf-8');

    console.log(`✅ 完成！共提取 ${Object.keys(kpopGroups).length} 個團體的資料`);
    console.log(`📁 檔案已儲存至: ${outputPath}\n`);

    // 顯示統計資訊
    const totalMembers = Object.values(kpopGroups).reduce(
      (sum, group) => sum + group.members.length,
      0
    );
    console.log('📊 統計資訊:');
    console.log(`  - 團體數量: ${Object.keys(kpopGroups).length}`);
    console.log(`  - 總成員數: ${totalMembers}`);
    console.log(`  - 平均每團成員數: ${(totalMembers / Object.keys(kpopGroups).length).toFixed(1)}`);

  } catch (error) {
    console.error('❌ 發生錯誤:', error);
    process.exit(1);
  }
}

main();

