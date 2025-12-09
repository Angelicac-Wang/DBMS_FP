#!/usr/bin/env python3
"""
生成測試專案資料腳本
用於生成10000筆測試專案資料，可以先預覽再決定是否插入資料庫
"""

import os
import random
import time
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import json

try:
    from supabase import create_client, Client
    import psycopg2
    from psycopg2.extras import execute_values
except ImportError:
    print("請先安裝必要的套件：")
    print("pip install supabase psycopg2-binary python-dotenv")
    exit(1)

# ========== 配置 ==========
# 可以從環境變數讀取，或直接在這裡填入
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')

# 或使用PostgreSQL直連（如果Supabase API有限制）
# 可以在Supabase Dashboard -> Settings -> Database -> Connection string 找到
DATABASE_URL = os.getenv('DATABASE_URL', '')

# 歌曲ID列表
SONG_IDS = [
    180, 225, 274, 292, 312, 326, 338, 353, 360, 384,
    437, 458, 467, 493, 505, 512, 533, 558, 570, 574,
    582, 584, 586, 601, 608, 610, 611, 613, 628, 630,
    636, 642, 648, 652, 655, 688, 697, 708, 736, 742,
    750, 770, 784, 788, 797, 1032, 1033, 1035, 1039, 1041,
    1045, 1049, 1050, 1056, 1564, 1569, 1707, 1710, 1715, 1758,
    1769, 1776, 1786, 1790, 1802, 1809, 1815, 1819, 1869, 1884,
    1893, 1939, 1941, 1985, 2001, 2026, 2028, 2038, 2052, 2111,
    2188, 2193, 2199, 2215, 2227, 2233, 2240, 2246, 2247, 2256,
    2267, 2271, 2282, 2291, 2305, 2307, 2320, 2321, 2322, 2346,
    2352, 2355, 2370, 2374, 2386, 2387, 2406, 2444, 2445, 2454,
    2482, 2483, 2576, 2592, 2602, 2621, 2633, 2666, 2670, 2677,
    2678, 2679, 2685, 2686, 2687, 2688, 2719, 2733, 2735, 2742,
    2744, 2769, 2786, 2824, 2831, 2840, 2889, 2899, 2905, 2909,
    2913, 2915, 2924, 2929, 2930, 2938, 2949, 2950, 2957, 2960,
    2972, 3003, 3015, 3021
]

# 練習地點
PRACTICE_LOCATIONS = [
    '台北車站', '雙連', '中山', '板橋車站',
    '台中火車站', '台中市政府', '高雄文化中心'
]

# 描述選項
DESCRIPTIONS = [
    """不要玻璃心

身高160以上

需舞檢（可雙向）""",
    """需要自行大概了解自己的動作，到時候出來練習再雕舞

需要配合衣服

不要無緣無故消失""",
    """需舞檢 可雙向

第一次練習自行扒完舞""",
    """需要舞檢1~2分鐘影片

需要自備學舞能力

拍攝費需要平分

請假的部分可以接受1~2次，如果舞蹈速度跟得上進度ok的話就可以👌""",
    """需舞檢 請傳1分鐘以上個人舞蹈影片

需滿17歲以上

攝影費用需團員平均分攤，晚上拍攝的話會租借燈具""",
    """希望成員都要有責任心！不遲到、不隨意退出，如果退出要自行找人替補"""
]


def generate_project_id() -> int:
    """生成p_id：與網頁相同的方式 timestamp * 10000 + random(0-9999)"""
    timestamp = int(time.time() * 1000)  # 毫秒級時間戳
    random_part = random.randint(0, 9999)
    return timestamp * 10000 + random_part


def fetch_from_database(supabase: Optional[Client], conn) -> Dict:
    """從資料庫獲取必要的資料"""
    data = {
        'users': [],
        'songs': [],
        'song_group_info': {}  # {song_id: {song_title, group_name, member_count}}
    }
    
    if supabase:
        # 使用Supabase API
        try:
            print("  正在獲取用戶資料...")
            # 嘗試不同的表名（可能是大寫或小寫）
            users_response = None
            for table_name in ['users', 'USERS', 'Users']:
                try:
                    # 過濾掉admin用戶（role != 'A'），只選擇一般用戶（role = 'U'）
                    users_response = supabase.table(table_name).select('u_id, role').eq('role', 'U').execute()
                    if users_response.data:
                        print(f"  ✓ 使用表名: {table_name}")
                        break
                except Exception as e:
                    # 如果eq不工作，先獲取所有用戶然後在Python中過濾
                    try:
                        users_response = supabase.table(table_name).select('u_id, role').execute()
                        if users_response.data:
                            # 過濾掉role='A'的用戶
                            users_response.data = [u for u in users_response.data if u.get('role') != 'A']
                            if users_response.data:
                                print(f"  ✓ 使用表名: {table_name}（已過濾admin）")
                                break
                    except:
                        continue
            
            if not users_response or not users_response.data:
                raise Exception("無法找到users表或沒有一般用戶（已過濾admin）")
            
            data['users'] = [row['u_id'] for row in users_response.data]
            print(f"  ✓ 找到 {len(data['users'])} 個用戶")
            
            print("  正在獲取歌曲和團體資訊...")
            # 獲取歌曲資訊（嘗試不同表名）
            songs_response = None
            for table_name in ['kpop_songs', 'KPOP_SONGS', 'Kpop_Songs']:
                try:
                    # 分批獲取歌曲（Supabase的in_可能有數量限制）
                    songs_response = supabase.table(table_name).select('song_id, title').in_('song_id', SONG_IDS[:100]).execute()
                    if songs_response.data:
                        print(f"  ✓ 使用表名: {table_name}")
                        # 如果有更多歌曲，繼續獲取
                        if len(SONG_IDS) > 100:
                            for i in range(100, len(SONG_IDS), 100):
                                batch = SONG_IDS[i:i+100]
                                batch_response = supabase.table(table_name).select('song_id, title').in_('song_id', batch).execute()
                                if batch_response.data:
                                    songs_response.data.extend(batch_response.data)
                        break
                except Exception as e:
                    continue
            
            if not songs_response or not songs_response.data:
                raise Exception("無法找到kpop_songs表或沒有匹配的歌曲")
            
            print(f"  ✓ 找到 {len(songs_response.data)} 首歌曲")
            
            # 獲取歌曲對應的團體資訊
            song_group_table = None
            kpop_groups_table = None
            
            for table_name in ['song_group', 'SONG_GROUP', 'Song_Group']:
                try:
                    test_response = supabase.table(table_name).select('song_id').limit(1).execute()
                    song_group_table = table_name
                    break
                except:
                    continue
            
            for table_name in ['kpop_groups', 'KPOP_GROUPS', 'Kpop_Groups']:
                try:
                    test_response = supabase.table(table_name).select('group_id').limit(1).execute()
                    kpop_groups_table = table_name
                    break
                except:
                    continue
            
            if not song_group_table or not kpop_groups_table:
                raise Exception("無法找到song_group或kpop_groups表")
            
            for song in songs_response.data:
                song_id = song['song_id']
                try:
                    # 獲取該歌曲對應的團體
                    sg_response = supabase.table(song_group_table).select('group_id').eq('song_id', song_id).limit(1).execute()
                    if sg_response.data:
                        group_id = sg_response.data[0]['group_id']
                        group_response = supabase.table(kpop_groups_table).select('group_name, member_count').eq('group_id', group_id).limit(1).execute()
                        if group_response.data:
                            group = group_response.data[0]
                            data['song_group_info'][song_id] = {
                                'song_title': song['title'],
                                'group_name': group['group_name'],
                                'member_count': group['member_count']
                            }
                except Exception as e:
                    # 如果某首歌曲出錯，跳過它
                    print(f"    警告：無法獲取歌曲 {song_id} 的團體資訊: {e}")
                    continue
            
            print(f"  ✓ 成功獲取 {len(data['song_group_info'])} 首歌曲的完整資訊")
            return data
            
        except Exception as e:
            print(f"  ✗ 使用Supabase API出錯: {e}")
            print(f"  錯誤詳情: {type(e).__name__}: {str(e)}")
            if conn:
                print("  嘗試使用PostgreSQL直連...")
                return fetch_from_database_pg(conn)
            else:
                raise Exception(f"Supabase API失敗且未配置PostgreSQL連接。錯誤: {e}")
    
    if conn:
        return fetch_from_database_pg(conn)
    
    raise Exception("無法連接到資料庫，請檢查配置（需要Supabase API或PostgreSQL連接）")
    

def fetch_from_database_pg(conn) -> Dict:
    """使用PostgreSQL直連獲取資料"""
    data = {
        'users': [],
        'songs': [],
        'song_group_info': {}
    }
    
    with conn.cursor() as cur:
        # 獲取所有用戶（PostgreSQL表名可能需要小寫或引號），過濾掉admin用戶
        try:
            cur.execute("SELECT u_id FROM users WHERE role = 'U'")
            data['users'] = [row[0] for row in cur.fetchall()]
        except:
            try:
                cur.execute('SELECT u_id FROM "USERS" WHERE role = \'U\'')
                data['users'] = [row[0] for row in cur.fetchall()]
            except:
                # 如果WHERE不工作，先獲取所有然後過濾
                try:
                    cur.execute("SELECT u_id, role FROM users")
                except:
                    try:
                        cur.execute('SELECT u_id, role FROM "USERS"')
                    except Exception as e:
                        print(f"  錯誤：無法查詢用戶表: {e}")
                        raise
                all_users = cur.fetchall()
                data['users'] = [row[0] for row in all_users if len(row) > 1 and row[1] != 'A']
        
        # 獲取歌曲和團體資訊
        song_ids_str = ','.join(map(str, SONG_IDS))
        try:
            cur.execute(f"""
                SELECT DISTINCT ON (s.song_id)
                    s.song_id,
                    s.title,
                    g.group_name,
                    g.member_count
                FROM kpop_songs s
                INNER JOIN song_group sg ON s.song_id = sg.song_id
                INNER JOIN kpop_groups g ON sg.group_id = g.group_id
                WHERE s.song_id IN ({song_ids_str})
                ORDER BY s.song_id, RANDOM()
            """)
        except:
            # 嘗試大寫表名
            cur.execute(f"""
                SELECT DISTINCT ON (s.song_id)
                    s.song_id,
                    s.title,
                    g.group_name,
                    g.member_count
                FROM "KPOP_SONGS" s
                INNER JOIN "SONG_GROUP" sg ON s.song_id = sg.song_id
                INNER JOIN "KPOP_GROUPS" g ON sg.group_id = g.group_id
                WHERE s.song_id IN ({song_ids_str})
                ORDER BY s.song_id, RANDOM()
            """)
        
        for row in cur.fetchall():
            song_id, song_title, group_name, member_count = row
            data['song_group_info'][song_id] = {
                'song_title': song_title,
                'group_name': group_name,
                'member_count': member_count
            }
    
    return data


def generate_test_projects(count: int = 10000, db_data: Dict = None) -> List[Dict]:
    """生成測試專案資料"""
    projects = []
    existing_p_ids = set()
    
    print(f"開始生成 {count} 筆測試資料...")
    
    for i in range(count):
        # 生成唯一的p_id
        p_id = generate_project_id()
        attempts = 0
        while p_id in existing_p_ids and attempts < 100:
            p_id = generate_project_id()
            attempts += 1
        existing_p_ids.add(p_id)
        
        # 隨機選擇creator_id
        creator_id = random.choice(db_data['users']) if db_data['users'] else None
        
        # 隨機選擇song_id
        song_id = random.choice(SONG_IDS)
        
        # 獲取歌曲和團體資訊
        song_info = db_data['song_group_info'].get(song_id, {})
        song_title = song_info.get('song_title', 'Unknown Song')
        group_name = song_info.get('group_name', 'Unknown Group')
        member_count = song_info.get('member_count', 1)
        
        # 生成project_title
        project_title = f"{song_title} - {group_name}"
        
        # 生成target_cnt（1到member_count之間）
        target_cnt = random.randint(1, max(1, member_count))
        
        # 隨機選擇practice_location
        practice_location = random.choice(PRACTICE_LOCATIONS)
        
        # 生成create_at（過去一年內的隨機時間）
        # 使用UTC時間以確保與資料庫一致
        days_ago = random.randint(0, 365)
        hours_ago = random.randint(0, 23)
        minutes_ago = random.randint(0, 59)
        seconds_ago = random.randint(0, 59)
        create_at = datetime.utcnow() - timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago, seconds=seconds_ago)
        
        # 生成update_at（create_at之後0-30天）
        update_days = random.randint(0, 30)
        update_hours = random.randint(0, 23)
        update_at = create_at + timedelta(days=update_days, hours=update_hours)
        
        # 隨機選擇description
        description = random.choice(DESCRIPTIONS)
        
        project = {
            'p_id': p_id,
            'creator_id': creator_id,
            'song_id': song_id,
            'porject_title': project_title,
            'target_cnt': target_cnt,
            'practice_location': practice_location,
            'create_at': create_at.isoformat(),
            'update_at': update_at.isoformat(),
            'status': 'A',
            'description': description
        }
        
        projects.append(project)
        
        if (i + 1) % 1000 == 0:
            print(f"已生成 {i + 1}/{count} 筆資料...")
    
    print(f"完成！共生成 {len(projects)} 筆資料")
    return projects


def preview_projects(projects: List[Dict], count: int = 10):
    """預覽生成的資料"""
    print(f"\n{'='*80}")
    print(f"預覽前 {min(count, len(projects))} 筆資料：")
    print(f"{'='*80}\n")
    
    for i, proj in enumerate(projects[:count], 1):
        print(f"專案 {i}:")
        print(f"  p_id: {proj['p_id']}")
        print(f"  creator_id: {proj['creator_id']}")
        print(f"  song_id: {proj['song_id']}")
        print(f"  標題: {proj['porject_title']}")
        print(f"  目標人數: {proj['target_cnt']}")
        print(f"  練習地點: {proj['practice_location']}")
        print(f"  創建時間: {proj['create_at']}")
        print(f"  狀態: {proj['status']}")
        print()


def save_to_json(projects: List[Dict], filename: str = 'test_projects.json'):
    """將資料儲存為JSON檔案"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(projects, f, ensure_ascii=False, indent=2)
    print(f"資料已儲存到 {filename}")


def insert_to_database(projects: List[Dict], supabase: Optional[Client], conn):
    """將資料插入資料庫"""
    print(f"\n準備插入 {len(projects)} 筆資料到資料庫...")
    
    if supabase:
        # 使用Supabase API（批次插入，每批1000筆）
        # 先檢測正確的表名
        project_table_name = None
        for table_name in ['project', 'PROJECT', 'Project']:
            try:
                # 嘗試查詢一條記錄來測試表名
                test_response = supabase.table(table_name).select('p_id').limit(1).execute()
                project_table_name = table_name
                print(f"  ✓ 使用表名: {project_table_name}")
                break
            except:
                continue
        
        if not project_table_name:
            print("  ✗ 錯誤：無法找到project表")
            print("  請檢查表名是否正確")
            return
        
        batch_size = 1000
        total_inserted = 0
        for i in range(0, len(projects), batch_size):
            batch = projects[i:i+batch_size]
            try:
                response = supabase.table(project_table_name).insert(batch).execute()
                total_inserted += len(batch)
                print(f"  ✓ 已插入 {total_inserted}/{len(projects)} 筆資料...")
            except Exception as e:
                print(f"  ✗ 插入第 {i+1}-{i+len(batch)} 筆時出錯: {e}")
                print(f"    錯誤詳情: {str(e)}")
                # 嘗試逐筆插入以找出問題資料
                if len(batch) > 1:
                    print(f"    嘗試逐筆插入...")
                    for j, proj in enumerate(batch):
                        try:
                            supabase.table(project_table_name).insert(proj).execute()
                            total_inserted += 1
                        except Exception as e2:
                            print(f"      第 {i+j+1} 筆資料插入失敗: {e2}")
                            print(f"      問題資料: p_id={proj.get('p_id')}, creator_id={proj.get('creator_id')}")
        
        print(f"\n完成！共成功插入 {total_inserted}/{len(projects)} 筆資料")
    
    elif conn:
        # 使用PostgreSQL直連
        with conn.cursor() as cur:
            try:
                insert_sql = """
                    INSERT INTO project (
                        p_id, creator_id, song_id, porject_title, target_cnt,
                        practice_location, create_at, update_at, status, description
                    ) VALUES %s
                """
            except:
                # 嘗試大寫表名
                insert_sql = """
                    INSERT INTO "PROJECT" (
                        p_id, creator_id, song_id, porject_title, target_cnt,
                        practice_location, create_at, update_at, status, description
                    ) VALUES %s
                """
            
            values = [
                (
                    p['p_id'], p['creator_id'], p['song_id'], p['porject_title'],
                    p['target_cnt'], p['practice_location'], p['create_at'],
                    p['update_at'], p['status'], p['description']
                )
                for p in projects
            ]
            
            execute_values(cur, insert_sql, values)
            conn.commit()
            print(f"成功插入 {len(projects)} 筆資料到資料庫！")
    else:
        print("錯誤：無法連接到資料庫")


def main():
    """主函數"""
    print("="*80)
    print("測試專案資料生成器")
    print("="*80)
    
    # 連接資料庫
    supabase = None
    conn = None
    
    if SUPABASE_URL and SUPABASE_KEY:
        try:
            supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
            print("✓ 已連接到Supabase")
        except Exception as e:
            print(f"連接Supabase失敗: {e}")
    
    if DATABASE_URL and not supabase:
        try:
            conn = psycopg2.connect(DATABASE_URL)
            print("✓ 已連接到PostgreSQL")
        except Exception as e:
            print(f"連接PostgreSQL失敗: {e}")
    
    if not supabase and not conn:
        print("\n錯誤：無法連接到資料庫")
        print("請設置環境變數 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY")
        print("或設置 DATABASE_URL（PostgreSQL連接字串）")
        return
    
    # 獲取資料庫資料
    print("\n正在從資料庫獲取必要資料...")
    try:
        db_data = fetch_from_database(supabase, conn)
    except Exception as e:
        print(f"\n✗ 錯誤：無法從資料庫獲取資料")
        print(f"  錯誤訊息: {e}")
        print("\n請檢查：")
        print("  1. 資料庫連接是否正確")
        print("  2. 表名是否正確（可能需要小寫）")
        print("  3. 是否有足夠的權限讀取資料")
        return
    
    if not db_data['users']:
        print("\n✗ 錯誤：資料庫中沒有找到用戶資料")
        print("  請確保users表中至少有1個用戶")
        return
    
    if not db_data['song_group_info']:
        print("\n⚠ 警告：資料庫中沒有找到歌曲團體資訊")
        print("  生成的專案可能無法正確顯示歌曲和團體名稱")
        response = input("  是否繼續？(y/n): ").strip().lower()
        if response != 'y':
            return
    
    print(f"\n✓ 找到 {len(db_data['users'])} 個用戶")
    print(f"✓ 找到 {len(db_data['song_group_info'])} 首歌曲的資訊")
    
    # 生成測試資料
    print("\n開始生成測試資料...")
    projects = generate_test_projects(count=10000, db_data=db_data)
    
    # 預覽資料
    preview_projects(projects, count=10)
    
    # 顯示統計
    print("\n資料統計：")
    print(f"  總專案數: {len(projects)}")
    print(f"  唯一creator_id數: {len(set(p['creator_id'] for p in projects))}")
    print(f"  唯一song_id數: {len(set(p['song_id'] for p in projects))}")
    print(f"  唯一地點數: {len(set(p['practice_location'] for p in projects))}")
    
    # 儲存為JSON
    save_to_json(projects)
    
    # 詢問是否插入資料庫
    print("\n" + "="*80)
    response = input("是否要將資料插入資料庫？(y/n): ").strip().lower()
    
    if response == 'y':
        insert_to_database(projects, supabase, conn)
        print("\n完成！")
    else:
        print("\n資料已儲存為JSON，未插入資料庫")
    
    if conn:
        conn.close()


if __name__ == '__main__':
    main()

