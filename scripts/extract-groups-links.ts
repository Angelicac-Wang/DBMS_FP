#!/usr/bin/env node
/**
 * 專門提取 Girl Groups 和 Boy Groups 的 profile 連結
 * 包括 Active 和 Disbanded 的團體
 */

import * as https from 'https';
import * as fs from 'fs';
import * as cheerio from 'cheerio';

/**
 * 從 URL 獲取 HTML 內容
 */
async function fetchHTML(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * 從單一頁面提取所有 group profile 連結
 */
async function extractProfileLinksFromPage(url: string): Promise<string[]> {
  try {
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const profileUrls = new Set<string>();
    
    // 從整個 article 標籤提取連結（排除導航選單、header、footer）
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
        'solo-singers',
        'male-solo-singers',
        'female-solo-singers',
      ];
      
      const shouldExclude = excludeKeywords.some(keyword => 
        profileUrl.toLowerCase().includes(keyword)
      );
      
      if (shouldExclude) {
        return;
      }
      
      // 團體的 profile 格式多樣化
      // 只要包含 "-profile" 且不在排除列表中，就認為是團體 profile
      const hasProfile = profileUrl.includes('-profile') || 
                        profileUrl.includes('-profile-facts') || 
                        profileUrl.includes('-profile-and-facts');
      
      // 排除列表頁面和特定類型的 profile
      const isExcluded = 
        profileUrl.includes('groups-profiles') ||
        profileUrl.includes('duets-profiles') ||
        profileUrl.includes('co-ed-groups-profiles') ||
        profileUrl.includes('actor-profile') ||
        profileUrl.includes('actress-profile') ||
        profileUrl.includes('singers-profile');
      
      if (hasProfile && !isExcluded) {
        profileUrls.add(profileUrl);
      }
    });
    
    return Array.from(profileUrls);
  } catch (error) {
    console.log(`  ⚠️  無法從 ${url} 提取連結: ${error}`);
    return [];
  }
}

/**
 * 提取所有 Girl Groups 和 Boy Groups 的 profile 連結
 */
async function getAllGroupLinks(): Promise<{ girlGroups: string[], boyGroups: string[] }> {
  const categoryUrls = [
    // Girl Groups
    { name: 'Active Girl Groups', url: 'https://kprofiles.com/k-pop-girl-groups/', type: 'girl' as const },
    { name: 'Disbanded Girl Groups', url: 'https://kprofiles.com/disbanded-kpop-groups-list/', type: 'girl' as const },
    { name: 'Recently Added Girl Groups', url: 'https://kprofiles.com/kpop-girl-groups/', type: 'girl' as const },
    // Boy Groups
    { name: 'Active Boy Groups', url: 'https://kprofiles.com/k-pop-boy-groups/', type: 'boy' as const },
    { name: 'Disbanded Boy Groups', url: 'https://kprofiles.com/disbanded-kpop-boy-groups/', type: 'boy' as const },
    { name: 'Recently Added Boy Groups', url: 'https://kprofiles.com/kpop-boy-groups/', type: 'boy' as const },
  ];
  
  const girlGroupUrls = new Set<string>();
  const boyGroupUrls = new Set<string>();
  
  for (const category of categoryUrls) {
    console.log(`📋 處理 ${category.name}...`);
    
    const links = await extractProfileLinksFromPage(category.url);
    console.log(`  ✅ 找到 ${links.length} 個 profile 連結`);
    
    if (category.type === 'girl') {
      links.forEach(link => girlGroupUrls.add(link));
    } else {
      links.forEach(link => boyGroupUrls.add(link));
    }
    
    // 添加延遲以避免過於頻繁的請求
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return {
    girlGroups: Array.from(girlGroupUrls),
    boyGroups: Array.from(boyGroupUrls),
  };
}

/**
 * 主函數
 */
async function main() {
  const girlGroupsFile = 'girl-groups-link.txt';
  const boyGroupsFile = 'boy-groups-link.txt';
  
  console.log('🎵 開始提取 Girl Groups 和 Boy Groups 連結...\n');
  
  const { girlGroups, boyGroups } = await getAllGroupLinks();
  
  console.log(`\n✅ 總共找到 ${girlGroups.length} 個 Girl Group profile 連結`);
  console.log(`✅ 總共找到 ${boyGroups.length} 個 Boy Group profile 連結`);
  
  // 保存到檔案
  fs.writeFileSync(girlGroupsFile, girlGroups.join('\n') + '\n', 'utf-8');
  console.log(`💾 已保存 ${girlGroups.length} 個 Girl Group 連結至: ${girlGroupsFile}`);
  
  fs.writeFileSync(boyGroupsFile, boyGroups.join('\n') + '\n', 'utf-8');
  console.log(`💾 已保存 ${boyGroups.length} 個 Boy Group 連結至: ${boyGroupsFile}`);
  
  // 檢查是否達到預期數量
  if (girlGroups.length < 1200) {
    console.log(`\n⚠️  警告: Girl Groups 連結數量 (${girlGroups.length}) 少於預期的 1200 筆`);
  } else {
    console.log(`\n✅ Girl Groups 連結數量 (${girlGroups.length}) 達到預期目標！`);
  }
  
  if (boyGroups.length < 1200) {
    console.log(`⚠️  警告: Boy Groups 連結數量 (${boyGroups.length}) 少於預期的 1200 筆`);
  } else {
    console.log(`✅ Boy Groups 連結數量 (${boyGroups.length}) 達到預期目標！`);
  }
}

// 執行主函數
main().catch(console.error);

