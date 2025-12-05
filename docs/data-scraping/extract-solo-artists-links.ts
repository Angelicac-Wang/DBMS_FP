#!/usr/bin/env node
/**
 * 專門提取 Solo Artists 的 profile 連結
 * 從 Female Soloists 和 Male Soloists 列表頁面提取所有連結
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
 * 從單一頁面提取所有 solo artist profile 連結
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
      ];
      
      const shouldExclude = excludeKeywords.some(keyword => 
        profileUrl.toLowerCase().includes(keyword)
      );
      
      if (shouldExclude) {
        return;
      }
      
      // Solo 藝人的 profile 格式（必須包含 -profile，且不包含 members）
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
    });
    
    return Array.from(profileUrls);
  } catch (error) {
    console.log(`  ⚠️  無法從 ${url} 提取連結: ${error}`);
    return [];
  }
}

/**
 * 提取所有 Solo Artists 的 profile 連結
 */
async function getAllSoloArtistLinks(): Promise<string[]> {
  const categoryUrls = [
    'https://kprofiles.com/kpop-solo-singers/', // Female Soloists
    'https://kprofiles.com/kpop-male-solo-singers/', // Male Soloists
  ];
  
  const allUrls = new Set<string>();
  
  for (const url of categoryUrls) {
    const categoryName = url.includes('male') ? 'Male Soloists' : 'Female Soloists';
    console.log(`📋 處理 ${categoryName}...`);
    
    const links = await extractProfileLinksFromPage(url);
    console.log(`  ✅ 找到 ${links.length} 個 profile 連結`);
    
    links.forEach(link => allUrls.add(link));
    
    // 添加延遲以避免過於頻繁的請求
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return Array.from(allUrls);
}

/**
 * 主函數
 */
async function main() {
  const outputFile = 'solo-artists-link.txt';
  
  console.log('🎵 開始提取 Solo Artists 連結...\n');
  
  const allLinks = await getAllSoloArtistLinks();
  
  console.log(`\n✅ 總共找到 ${allLinks.length} 個 Solo Artist profile 連結`);
  
  // 保存到檔案
  fs.writeFileSync(outputFile, allLinks.join('\n') + '\n', 'utf-8');
  console.log(`💾 已保存 ${allLinks.length} 個連結至: ${outputFile}`);
}

// 執行主函數
main().catch(console.error);




