/**
 * 從 Kprofiles.com 抓取指定團體的資料（改進版 Nationality 提取）
 * 
 * 使用方法：
 * npx tsx docs/data-scraping/fetch-specific-groups.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';

interface Member {
  stage_name: string;
  stage_name_kr: string;
  nationality?: string;
  debut_date?: string;
}

interface KpopGroup {
  members: Member[];
  debut_date?: string;
  group_namekr?: string;
  company?: string;
  group_type?: 'B' | 'G' | 'M';
  member_count?: number;
  logo_image?: string;
  discription?: string;
}

interface KpopGroupsData {
  [groupName: string]: KpopGroup;
}

// 指定的團體連結列表
const SPECIFIC_GROUP_URLS = [
  'https://kprofiles.com/dreamcatcher-members-profile/',
  'https://kprofiles.com/everglow-members-profile/',
  'https://kprofiles.com/fromis_9-members-profile/',
  'https://kprofiles.com/girls-generation-snsd-members-profile/',
  'https://kprofiles.com/hearts2hearts-members-profile/',
  'https://kprofiles.com/idle-profile-facts/',
  'https://kprofiles.com/itzy-members-profile-2/',
  'https://kprofiles.com/ive-members-profile-2/',
  'https://kprofiles.com/izna-members-profile/',
  'https://kprofiles.com/kiss-of-life-members-profile/',
  'https://kprofiles.com/le-sserafim-members-profile-and-facts/',
  'https://kprofiles.com/mamamoo-members-profile/',
  'https://kprofiles.com/newjeans-members-profile-facts/',
  'https://kprofiles.com/red-velvet-members-profile/',
  'https://kprofiles.com/stayc-members-profile/',
  'https://kprofiles.com/triples-members-profile-and-facts/',
  'https://kprofiles.com/twice-members-profile/',
  'https://kprofiles.com/viviz-members-profile/',
  'https://kprofiles.com/boynextdoor-members-profile/',
  'https://kprofiles.com/bts-bangtan-boys-members-profile/',
  'https://kprofiles.com/cortis-members-profile/',
  'https://kprofiles.com/exo-members-profile/',
  'https://kprofiles.com/ikon-members-profile/',
  'https://kprofiles.com/infinite-profile/',
  'https://kprofiles.com/kickflip-members-profile/',
  'https://kprofiles.com/monsta-x-members-profile/',
  'https://kprofiles.com/nct-members-profile/',
  'https://kprofiles.com/nct-127-members-profile/',
  'https://kprofiles.com/nct-dream-members-profile/',
  'https://kprofiles.com/nct-wish-members-profile/',
  'https://kprofiles.com/plave-members-profile/',
  'https://kprofiles.com/riize-members-profile-and-facts/',
  'https://kprofiles.com/seventeen-members-profile/',
  'https://kprofiles.com/bss-members-profile/',
  'https://kprofiles.com/sf9-members-profile/',
  'https://kprofiles.com/shinee-members-profile/',
  'https://kprofiles.com/stray-kids-members-profile/',
  'https://kprofiles.com/super-junior-profile/',
  'https://kprofiles.com/tws-members-profile/',
  'https://kprofiles.com/txt-member-profile-facts/',
  'https://kprofiles.com/verivery-members-profile/',
  'https://kprofiles.com/victon-members-profile/',
  'https://kprofiles.com/zerobaseone-members-profile/',
  'https://kprofiles.com/allday-project-members-profile/',
];

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
 * 從文字中提取國籍資訊
 */
function extractNationality(text: string): string | null {
  // 優先匹配 "Nationality:" 或 "Nationality" 後面的內容
  const nationalityPattern = /Nationality[:\s]+([^\n<,]+)/i;
  const nationalityMatch = text.match(nationalityPattern);
  if (nationalityMatch && nationalityMatch[1]) {
    let nationality = nationalityMatch[1].trim();
    // 清理可能的 HTML 標籤
    nationality = nationality.replace(/<[^>]+>/g, '').trim();
    
    // 標準化國籍名稱
    const nationalityMap: { [key: string]: string } = {
      'south korea': 'South Korea',
      'korea': 'South Korea',
      'korean': 'South Korea',
      'united states': 'United States',
      'usa': 'United States',
      'us': 'United States',
      'america': 'United States',
      'american': 'United States',
      'japan': 'Japan',
      'japanese': 'Japan',
      'china': 'China',
      'chinese': 'China',
      'taiwan': 'Taiwan',
      'taiwanese': 'Taiwan',
      'thailand': 'Thailand',
      'thai': 'Thailand',
      'philippines': 'Philippines',
      'filipino': 'Philippines',
      'indonesia': 'Indonesia',
      'indonesian': 'Indonesia',
      'vietnam': 'Vietnam',
      'vietnamese': 'Vietnam',
      'australia': 'Australia',
      'australian': 'Australia',
      'canada': 'Canada',
      'canadian': 'Canada',
      'new zealand': 'New Zealand',
    };
    
    const lowerNationality = nationality.toLowerCase();
    if (nationalityMap[lowerNationality]) {
      return nationalityMap[lowerNationality];
    }
    
    // 如果沒有匹配到標準名稱，返回原始值（首字母大寫）
    return nationality.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }
  
  // 如果沒有找到 "Nationality:"，嘗試從 "born in" 中提取
  const bornInPatterns = [
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
  
  for (const { pattern, nationality } of bornInPatterns) {
    if (pattern.test(text)) {
      return nationality;
    }
  }
  
  return null;
}

/**
 * 從成員介紹區塊提取國籍（改進版）
 * 從 Stage Name, Birth Name 之後，Faces 之前提取 Nationality
 */
function extractMemberNationality($: cheerio.CheerioAPI, memberStageName: string, memberBlockText: string, memberBlockHtml: string): string | null {
  // 方法 1: 在成員區塊中尋找 "Nationality:" 欄位
  // 通常在 Stage Name, Birth Name 之後，Faces 之前
  const nationalityPattern = /Nationality[:\s]+([^\n<,]+)/i;
  const nationalityMatch = memberBlockText.match(nationalityPattern);
  
  if (nationalityMatch && nationalityMatch[1]) {
    // 驗證這個 Nationality 是屬於當前成員的
    // 檢查 Nationality 前面是否有該成員的 Stage Name
    const beforeNationality = memberBlockText.substring(0, memberBlockText.indexOf(nationalityMatch[0]));
    
    // 確保在 Nationality 之前有該成員的 Stage Name
    if (beforeNationality.includes(`Stage Name`) || beforeNationality.includes(memberStageName)) {
      const nationality = nationalityMatch[1].trim().replace(/<[^>]+>/g, '').trim();
      if (nationality) {
        return extractNationality(`Nationality: ${nationality}`);
      }
    }
  }
  
  // 方法 2: 從 HTML 中尋找結構化的 Nationality 欄位
  // 通常格式是: <strong>Nationality:</strong> 或 <strong>Nationality</strong>
  const $temp = cheerio.load(memberBlockHtml);
  const $nationality = $temp('strong').filter((_, el) => {
    const text = $temp(el).text().toLowerCase();
    return text.includes('nationality');
  });
  
  if ($nationality.length > 0) {
    // 取得 Nationality 標籤後面的內容
    let nationalityText = '';
    
    // 嘗試從同一個段落中取得
    const $parent = $nationality.first().parent();
    const parentText = $parent.text();
    const parentMatch = parentText.match(/Nationality[:\s]+([^\n<,]+)/i);
    
    if (parentMatch && parentMatch[1]) {
      nationalityText = parentMatch[1].trim();
    } else {
      // 嘗試從下一個節點取得
      const $next = $nationality.first().next();
      if ($next.length > 0) {
        nationalityText = $next.text().trim();
      } else {
        // 嘗試從父元素的下一個兄弟元素取得
        const $nextSibling = $parent.next();
        if ($nextSibling.length > 0) {
          nationalityText = $nextSibling.text().trim();
        }
      }
    }
    
    if (nationalityText) {
      return extractNationality(`Nationality: ${nationalityText}`);
    }
  }
  
  // 方法 3: 在成員區塊中尋找包含 "born in" 的文字
  if (memberBlockText.toLowerCase().includes('born in')) {
    return extractNationality(memberBlockText);
  }
  
  return null;
}

/**
 * 從團體頁面提取成員資訊（改進版）
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
    const h1 = $('h1').first().text().trim();
    if (h1) {
      groupName = h1
        .replace(/\s*Profile.*$/i, '')
        .replace(/\s*-\s*Kprofiles.*$/i, '')
        .trim();
    }
    
    if (!groupName) {
      const title = $('title').text().trim();
      if (title) {
        groupName = title
          .replace(/\s*Profile.*$/i, '')
          .replace(/\s*-\s*Kprofiles.*$/i, '')
          .trim();
      }
    }
    
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

    // 尋找所有包含 "Stage Name:" 的段落，並為每個成員建立區塊
    $('p').each((_, p) => {
      const $p = $(p);
      const text = $p.text();
      const html = $p.html() || '';
      
      // 尋找包含 "Stage Name:" 的段落
      if (text.includes('Stage Name:') || text.includes('Stage Name')) {
        // 提取 Stage Name 的內容
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
            
            // 建立成員區塊：從當前段落開始，到下一個 "Stage Name:" 或 "Faces:" 為止
            let memberBlockText = text;
            let memberBlockHtml = html;
            let $currentP = $p.next('p');
            let blockCount = 0;
            
            // 收集成員區塊的所有段落（直到遇到下一個成員或 Faces）
            while ($currentP.length > 0 && blockCount < 15) {
              const currentText = $currentP.text();
              const currentHtml = $currentP.html() || '';
              
              // 如果遇到下一個成員的 Stage Name，停止
              if (currentText.includes('Stage Name:') && !currentText.includes(stageName)) {
                break;
              }
              
              // 如果遇到 Faces，停止（Faces 通常在成員介紹之後）
              if (currentText.includes('Faces:') || currentText.includes('Face:')) {
                break;
              }
              
              memberBlockText += ' ' + currentText;
              memberBlockHtml += ' ' + currentHtml;
              $currentP = $currentP.next('p');
              blockCount++;
            }
            
            // 從成員區塊中提取國籍
            const nationality = extractMemberNationality($, stageName, memberBlockText, memberBlockHtml);
            
            members.push({
              stage_name: stageName,
              stage_name_kr: stageNameKr,
              nationality: nationality || undefined,
              debut_date: groupDebutDate || undefined,
            });
          }
        }
      }
    });

    // 去重複成員
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
    
    // 提取團體資訊
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
 * 從團體頁面提取出道日期
 */
function extractGroupDebutDate($: cheerio.CheerioAPI): string | null {
  $('p').each((_, p) => {
    const $p = $(p);
    const text = $p.text();
    
    if (text.toLowerCase().includes('debuted') || 
        text.toLowerCase().includes('debut') ||
        text.toLowerCase().includes('debuted on')) {
      
      const datePatterns = [
        /([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/g,
        /(\d{4}-\d{2}-\d{2})/g,
        /(\d{1,2}\/\d{1,2}\/\d{4})/g,
      ];
      
      for (const pattern of datePatterns) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
          try {
            const dateStr = match[1];
            let date: Date;
            
            const monthDayYearMatch = dateStr.match(/([A-Z][a-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
            if (monthDayYearMatch) {
              const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                                  'july', 'august', 'september', 'october', 'november', 'december'];
              const monthName = monthDayYearMatch[1].toLowerCase();
              const monthIndex = monthNames.indexOf(monthName);
              const day = parseInt(monthDayYearMatch[2], 10);
              const year = parseInt(monthDayYearMatch[3], 10);
              
              if (monthIndex >= 0 && day >= 1 && day <= 31 && year >= 1990 && year <= 2030) {
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
  
  return null;
}

/**
 * 提取團體韓文名稱
 */
function extractGroupNameKr($: cheerio.CheerioAPI): string | null {
  const pageText = $('body').text();
  const koreanPattern = /\(([\uAC00-\uD7A3\s]+)\)/;
  const match = pageText.match(koreanPattern);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  return null;
}

/**
 * 提取經紀公司名稱
 */
function extractCompany($: cheerio.CheerioAPI): string | null {
  const pageText = $('body').text();
  const pageHtml = $('body').html() || '';
  
  const companyPatterns = [
    /under\s+<strong>([^<]+(?:Entertainment|Labels|Records|Music|Company|Studio))<\/strong>/i,
    /under\s+<strong>([^<]+)<\/strong>\s+and/i,
    /under\s+([A-Z][a-zA-Z\s&]+(?:Entertainment|Labels|Records|Music|Company|Studio))/i,
    /from\s+([A-Z][a-zA-Z\s&]+(?:Entertainment|Labels|Records|Music|Company|Studio))/i,
    /under\s+([A-Z][a-zA-Z\s&]+?)\s+and\s+[A-Z][a-zA-Z\s&]+(?:Labels|Entertainment|Records)/i,
  ];
  
  for (const pattern of companyPatterns) {
    const match = pageHtml.match(pattern) || pageText.match(pattern);
    if (match && match[1]) {
      let company = match[1].trim();
      company = company.replace(/<[^>]+>/g, '').trim();
      company = company.replace(/\s+/g, ' ').trim();
      
      if (company && company.length <= 20) {
        return company;
      } else if (company && company.length > 20) {
        const parts = company.split(/\s+/);
        if (parts.length > 1) {
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
  $('p').each((_, p) => {
    const $p = $(p);
    const text = $p.text();
    
    if (text.includes('Official Logo') || text.includes('Logo:')) {
      const $img = $p.find('img').first();
      if ($img.length > 0) {
        let src = $img.attr('src');
        if (src) {
          if (src.startsWith('//')) {
            src = 'https:' + src;
          } else if (src.startsWith('/')) {
            src = 'https://kprofiles.com' + src;
          }
          if (!src.includes('herald_logo') && !src.includes('site-logo')) {
            return src;
          }
        }
      }
    }
  });
  
  return null;
}

/**
 * 提取團體描述
 */
function extractDescription($: cheerio.CheerioAPI): string | null {
  $('p').each((_, p) => {
    const $p = $(p);
    const text = $p.text().trim();
    const html = $p.html() || '';
    
    if (text.includes('Members Profile')) {
      let cleanText = text.replace(/^.*?Members Profile[^:]*:\s*/i, '');
      
      if (cleanText.length < 30) {
        cleanText = html
          .replace(/<strong>.*?Members Profile[^<]*<\/strong>/i, '')
          .replace(/<img[^>]*>/gi, '')
          .replace(/<a[^>]*>.*?<\/a>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      } else {
        cleanText = cleanText
          .replace(/<img[^>]*>/gi, '')
          .replace(/<a[^>]*>.*?<\/a>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
      
      cleanText = cleanText.replace(/\[.*?\]/g, '');
      
      if (cleanText.length < 30) {
        return null;
      }
      
      if (cleanText.length <= 500) {
        return cleanText;
      } else {
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
 * 主函數
 */
async function main() {
  console.log('🎵 Kprofiles.com 指定團體資料抓取工具（改進版 Nationality 提取）\n');
  
  const outputFile = path.join(process.cwd(), 'docs/data-scraping', 'specific-groups.json');
  console.log(`📁 輸出檔案: ${outputFile}\n`);
  console.log(`📋 將處理 ${SPECIFIC_GROUP_URLS.length} 個團體\n`);

  try {
    const kpopGroups: KpopGroupsData = {};

    for (let i = 0; i < SPECIFIC_GROUP_URLS.length; i++) {
      const groupUrl = SPECIFIC_GROUP_URLS[i];
      console.log(`[${i + 1}/${SPECIFIC_GROUP_URLS.length}]`);

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
      await delay(1000);
    }

    // 儲存結果
    console.log('\n💾 儲存結果...\n');
    const outputPath = path.resolve(process.cwd(), outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(kpopGroups, null, 2), 'utf-8');

    console.log(`✅ 完成！共提取 ${Object.keys(kpopGroups).length} 個團體的資料`);
    console.log(`📁 檔案已儲存至: ${outputPath}\n`);

    // 顯示統計資訊
    const totalMembers = Object.values(kpopGroups).reduce(
      (sum, group) => sum + group.members.length,
      0
    );
    const membersWithNationality = Object.values(kpopGroups).reduce(
      (sum, group) => sum + group.members.filter(m => m.nationality).length,
      0
    );
    
    console.log('📊 統計資訊:');
    console.log(`  - 團體數量: ${Object.keys(kpopGroups).length}`);
    console.log(`  - 總成員數: ${totalMembers}`);
    console.log(`  - 有國籍資訊的成員: ${membersWithNationality} (${((membersWithNationality / totalMembers) * 100).toFixed(1)}%)`);
    console.log(`  - 平均每團成員數: ${(totalMembers / Object.keys(kpopGroups).length).toFixed(1)}`);

  } catch (error) {
    console.error('❌ 發生錯誤:', error);
    process.exit(1);
  }
}

main();

