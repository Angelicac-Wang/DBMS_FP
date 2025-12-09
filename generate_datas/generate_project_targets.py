#!/usr/bin/env python3
"""
生成專案目標位置資料腳本
為還沒有project_target的專案生成目標位置、申請和成員資料
"""

import os
import random
import time
from datetime import datetime
from typing import List, Dict, Set
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
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
DATABASE_URL = os.getenv('DATABASE_URL', '')

# 固定時間
APPLIED_TIME = '2025-12-08 00:00:00'
REVIEWED_TIME = '2025-12-08 12:00:00'
JOIN_DATE = '2025-12-08'


def generate_appli_id() -> int:
    """生成申請ID：與p_id相同的方式 timestamp * 10000 + random(0-9999)"""
    timestamp = int(time.time() * 1000)  # 毫秒級時間戳
    random_part = random.randint(0, 9999)
    return timestamp * 10000 + random_part


def get_all_projects_from_supabase(supabase: Client, table_name: str, columns: str = None) -> List[Dict]:
    """從Supabase獲取所有記錄（處理分頁）"""
    all_records = []
    page_size = 1000
    offset = 0
    
    # 如果沒有指定列，根據表名使用默認列
    if columns is None:
        if table_name == 'project':
            columns = 'p_id, song_id, target_cnt'
        elif table_name == 'project_target':
            columns = 'project_id'
        else:
            columns = '*'
    
    while True:
        try:
            response = supabase.table(table_name).select(columns).range(offset, offset + page_size - 1).execute()
            
            if not response.data:
                break
            
            all_records.extend(response.data)
            
            if len(response.data) < page_size:
                break
            
            offset += page_size
            
            if offset % 5000 == 0:
                print(f"    已獲取 {len(all_records)} 筆記錄...")
        
        except Exception as e:
            print(f"    獲取記錄時出錯（offset={offset}）: {e}")
            break
    
    return all_records


def get_projects_without_targets(supabase: Client = None, conn=None) -> List[Dict]:
    """獲取還沒有project_target的專案列表"""
    projects = []
    
    if supabase:
        try:
            print("  正在獲取所有專案...")
            all_projects = get_all_projects_from_supabase(supabase, 'project')
            print(f"  ✓ 找到 {len(all_projects)} 個專案")
            
            print("  正在獲取已有target的專案ID...")
            # 獲取已有target的專案ID（注意：project_target表中列名是project_id，不是p_id）
            projects_with_targets_list = get_all_projects_from_supabase(supabase, 'project_target', 'project_id')
            projects_with_targets = set(p['project_id'] for p in projects_with_targets_list)
            print(f"  ✓ 其中 {len(projects_with_targets)} 個已有目標位置")
            
            # 找出沒有target的專案
            projects = [p for p in all_projects if p['p_id'] not in projects_with_targets]
            print(f"  ✓ 需要生成 {len(projects)} 個專案的目標位置")
            
        except Exception as e:
            print(f"  使用Supabase API出錯: {e}")
            if conn:
                return get_projects_without_targets_pg(conn)
            raise
    
    elif conn:
        return get_projects_without_targets_pg(conn)
    
    return projects


def get_projects_without_targets_pg(conn) -> List[Dict]:
    """使用PostgreSQL直連獲取沒有target的專案"""
    with conn.cursor() as cur:
        try:
            print("  正在獲取所有專案...")
            cur.execute("SELECT p_id, song_id, target_cnt FROM project")
            all_projects = [{'p_id': row[0], 'song_id': row[1], 'target_cnt': row[2]} for row in cur.fetchall()]
            print(f"  ✓ 找到 {len(all_projects)} 個專案")
            
            print("  正在獲取已有target的專案ID...")
            cur.execute("SELECT DISTINCT project_id FROM project_target")
            projects_with_targets = set(row[0] for row in cur.fetchall())
            print(f"  ✓ 其中 {len(projects_with_targets)} 個已有目標位置")
            
            projects = [p for p in all_projects if p['p_id'] not in projects_with_targets]
            print(f"  ✓ 需要生成 {len(projects)} 個專案的目標位置")
            
        except Exception as e:
            print(f"  查詢資料庫出錯: {e}")
            try:
                cur.execute('SELECT p_id, song_id, target_cnt FROM "PROJECT"')
                all_projects = [{'p_id': row[0], 'song_id': row[1], 'target_cnt': row[2]} for row in cur.fetchall()]
                
                cur.execute('SELECT DISTINCT project_id FROM "PROJECT_TARGET"')
                projects_with_targets = set(row[0] for row in cur.fetchall())
                
                projects = [p for p in all_projects if p['p_id'] not in projects_with_targets]
            except:
                raise
    
    return projects


def get_group_idols_for_song(supabase: Client, song_id: int) -> List[int]:
    """獲取歌曲對應團體的成員ID列表"""
    try:
        # 1. 通過song_id找到group_id
        song_group_response = supabase.table('song_group').select('group_id').eq('song_id', song_id).execute()
        
        if not song_group_response.data:
            return []
        
        group_ids = [sg['group_id'] for sg in song_group_response.data]
        
        # 2. 通過group_id找到所有idol_id
        all_idols = []
        for group_id in group_ids:
            group_idol_response = supabase.table('group_idol').select('idol_id').eq('group_id', group_id).execute()
            if group_idol_response.data:
                all_idols.extend([gi['idol_id'] for gi in group_idol_response.data])
        
        # 去重
        return list(set(all_idols))
    
    except Exception as e:
        print(f"    獲取歌曲 {song_id} 的成員時出錯: {e}")
        return []


def get_group_idols_for_song_pg(conn, song_id: int) -> List[int]:
    """使用PostgreSQL獲取歌曲對應團體的成員ID列表"""
    with conn.cursor() as cur:
        try:
            # 1. 通過song_id找到group_id
            cur.execute("SELECT group_id FROM song_group WHERE song_id = %s", (song_id,))
            group_ids = [row[0] for row in cur.fetchall()]
            
            if not group_ids:
                return []
            
            # 2. 通過group_id找到所有idol_id
            all_idols = []
            for group_id in group_ids:
                cur.execute("SELECT idol_id FROM group_idol WHERE group_id = %s", (group_id,))
                idols = [row[0] for row in cur.fetchall()]
                all_idols.extend(idols)
            
            return list(set(all_idols))
        
        except Exception as e:
            print(f"    獲取歌曲 {song_id} 的成員時出錯: {e}")
            return []


def get_non_admin_users(supabase: Client = None, conn=None) -> List[int]:
    """獲取所有非admin用戶ID"""
    user_ids = []
    
    if supabase:
        try:
            # 處理分頁
            all_users = []
            page_size = 1000
            offset = 0
            
            while True:
                response = supabase.table('users').select('u_id, role').eq('role', 'U').range(offset, offset + page_size - 1).execute()
                if not response.data:
                    break
                all_users.extend(response.data)
                if len(response.data) < page_size:
                    break
                offset += page_size
            
            user_ids = [u['u_id'] for u in all_users]
        
        except Exception as e:
            print(f"  獲取用戶時出錯: {e}")
    
    elif conn:
        with conn.cursor() as cur:
            try:
                cur.execute("SELECT u_id FROM users WHERE role = 'U'")
            except:
                cur.execute('SELECT u_id FROM "USERS" WHERE role = \'U\'')
            user_ids = [row[0] for row in cur.fetchall()]
    
    return user_ids


def build_song_idols_cache(supabase: Client = None, conn=None, song_ids: Set[int] = None) -> Dict[int, List[int]]:
    """批量構建歌曲到成員ID的緩存字典"""
    cache = {}
    
    if supabase:
        try:
            print("  正在批量獲取歌曲-團體-成員對應關係...")
            
            # 1. 批量獲取所有song_group對應關係
            all_song_groups = []
            
            if song_ids:
                # 如果有指定的song_ids，分批查詢（Supabase的in_限制約100個）
                song_ids_list = list(song_ids)
                for i in range(0, len(song_ids_list), 100):
                    batch = song_ids_list[i:i+100]
                    page_size = 1000
                    offset = 0
                    
                    while True:
                        try:
                            response = supabase.table('song_group').select('song_id, group_id').in_('song_id', batch).range(offset, offset + page_size - 1).execute()
                            if not response.data:
                                break
                            all_song_groups.extend(response.data)
                            if len(response.data) < page_size:
                                break
                            offset += page_size
                        except Exception as e:
                            print(f"    查詢song_group時出錯（batch {i//100+1}）: {e}")
                            break
            else:
                # 如果沒有指定song_ids，獲取所有
                page_size = 1000
                offset = 0
                while True:
                    try:
                        response = supabase.table('song_group').select('song_id, group_id').range(offset, offset + page_size - 1).execute()
                        if not response.data:
                            break
                        all_song_groups.extend(response.data)
                        if len(response.data) < page_size:
                            break
                        offset += page_size
                    except Exception as e:
                        print(f"    查詢song_group時出錯: {e}")
                        break
            
            # 2. 建立song_id -> group_ids映射
            song_to_groups = {}
            for sg in all_song_groups:
                song_id = sg['song_id']
                group_id = sg['group_id']
                if song_id not in song_to_groups:
                    song_to_groups[song_id] = []
                song_to_groups[song_id].append(group_id)
            
            # 3. 獲取所有涉及的group_id
            all_group_ids = set()
            for groups in song_to_groups.values():
                all_group_ids.update(groups)
            
            # 4. 批量獲取所有group_idol對應關係
            print(f"  正在獲取 {len(all_group_ids)} 個團體的成員資訊...")
            group_to_idols = {}
            
            # 分批查詢（因為in_可能有數量限制，約100個）
            group_ids_list = list(all_group_ids)
            batch_count = (len(group_ids_list) + 99) // 100  # 向上取整
            
            for i in range(0, len(group_ids_list), 100):
                batch = group_ids_list[i:i+100]
                page_size = 1000
                offset = 0
                batch_num = i // 100 + 1
                
                while True:
                    try:
                        response = supabase.table('group_idol').select('group_id, idol_id').in_('group_id', batch).range(offset, offset + page_size - 1).execute()
                        if not response.data:
                            break
                        
                        for gi in response.data:
                            group_id = gi['group_id']
                            idol_id = gi['idol_id']
                            if group_id not in group_to_idols:
                                group_to_idols[group_id] = []
                            group_to_idols[group_id].append(idol_id)
                        
                        if len(response.data) < page_size:
                            break
                        offset += page_size
                    except Exception as e:
                        print(f"    查詢group_idol時出錯（batch {batch_num}/{batch_count}）: {e}")
                        break
                
                if batch_num % 10 == 0:
                    print(f"    已處理 {batch_num}/{batch_count} 個團體批次...")
            
            # 5. 建立最終的song_id -> idol_ids緩存
            for song_id, group_ids in song_to_groups.items():
                all_idols = []
                for group_id in group_ids:
                    if group_id in group_to_idols:
                        all_idols.extend(group_to_idols[group_id])
                cache[song_id] = list(set(all_idols))  # 去重
            
            print(f"  ✓ 已建立 {len(cache)} 首歌曲的成員緩存")
        
        except Exception as e:
            print(f"  構建緩存時出錯: {e}")
    
    elif conn:
        with conn.cursor() as cur:
            try:
                print("  正在批量獲取歌曲-團體-成員對應關係...")
                
                # 使用SQL JOIN一次性獲取所有數據
                if song_ids:
                    song_ids_str = ','.join(map(str, song_ids))
                    query = f"""
                        SELECT DISTINCT sg.song_id, gi.idol_id
                        FROM song_group sg
                        INNER JOIN group_idol gi ON sg.group_id = gi.group_id
                        WHERE sg.song_id IN ({song_ids_str})
                    """
                else:
                    query = """
                        SELECT DISTINCT sg.song_id, gi.idol_id
                        FROM song_group sg
                        INNER JOIN group_idol gi ON sg.group_id = gi.group_id
                    """
                
                cur.execute(query)
                results = cur.fetchall()
                
                for song_id, idol_id in results:
                    if song_id not in cache:
                        cache[song_id] = []
                    cache[song_id].append(idol_id)
                
                # 去重
                for song_id in cache:
                    cache[song_id] = list(set(cache[song_id]))
                
                print(f"  ✓ 已建立 {len(cache)} 首歌曲的成員緩存")
            
            except Exception as e:
                print(f"  構建緩存時出錯: {e}")
    
    return cache


def generate_target_data(projects: List[Dict], supabase: Client = None, conn=None) -> Dict:
    """生成目標位置、申請和成員資料"""
    targets = []
    applications = []
    members = []
    non_admin_users = get_non_admin_users(supabase, conn)
    
    if not non_admin_users:
        print("  ⚠ 警告：沒有找到非admin用戶，無法為F狀態的位置創建申請和成員")
    
    # 先構建緩存（批量獲取所有需要的數據）
    unique_song_ids = set(p.get('song_id') for p in projects if p.get('song_id'))
    print(f"\n正在構建歌曲成員緩存（{len(unique_song_ids)} 首不同歌曲）...")
    song_idols_cache = build_song_idols_cache(supabase, conn, unique_song_ids)
    
    # 用於追蹤已生成的appli_id，避免重複
    existing_appli_ids = set()
    
    print(f"\n開始為 {len(projects)} 個專案生成目標位置資料...")
    
    for i, project in enumerate(projects, 1):
        project_id = project['p_id']
        song_id = project.get('song_id')
        target_cnt = project.get('target_cnt', 0)
        
        if not song_id:
            continue
        
        if target_cnt <= 0:
            continue
        
        # 從緩存獲取該歌曲對應的團體成員
        idol_ids = song_idols_cache.get(song_id, [])
        
        if not idol_ids:
            if (i % 1000 == 0) or (i == len(projects)):
                print(f"  已處理 {i}/{len(projects)} 個專案...")
            continue
        
        # 如果成員數量少於target_cnt，使用所有成員
        selected_idols = random.sample(idol_ids, min(target_cnt, len(idol_ids)))
        
        # 為每個專案追蹤已使用的用戶（避免同一用戶在同一個專案中出現多次）
        used_users_for_project = set()
        
        # 為每個選中的idol創建target
        for seq, idol_id in enumerate(selected_idols, start=1):
            # 隨機選擇status（F或I）
            status = random.choice(['F', 'I'])
            
            target = {
                'target_seq': seq,
                'project_id': project_id,
                'idol_id': idol_id,
                'status': status
            }
            targets.append(target)
            
            # 如果status是F，創建申請和成員記錄
            if status == 'F' and non_admin_users:
                # 隨機選擇一個非admin用戶（確保在該專案中不重複）
                available_users = [u for u in non_admin_users if u not in used_users_for_project]
                if not available_users:
                    # 如果所有用戶都用過了，跳過這個位置（不創建申請和成員）
                    continue
                
                user_id = random.choice(available_users)
                used_users_for_project.add(user_id)
                
                # 生成申請ID（使用集合快速檢查重複）
                appli_id = generate_appli_id()
                attempts = 0
                while appli_id in existing_appli_ids and attempts < 100:
                    appli_id = generate_appli_id()
                    attempts += 1
                existing_appli_ids.add(appli_id)
                
                # 創建申請記錄
                application = {
                    'appli_id': appli_id,
                    'p_id': project_id,
                    'target_seq': seq,
                    'applicant_id': user_id,
                    'applied_time': APPLIED_TIME,
                    'reviewed_time': REVIEWED_TIME,
                    'status': 'A'
                }
                applications.append(application)
                
                # 創建成員記錄
                member = {
                    'p_id': project_id,
                    'member_id': user_id,
                    'join_date': JOIN_DATE,
                    'target_seq': seq,
                    'status': 'Y'
                }
                members.append(member)
        
        if i % 1000 == 0 or i == len(projects):
            print(f"  已處理 {i}/{len(projects)} 個專案...")
    
    return {
        'targets': targets,
        'applications': applications,
        'members': members
    }


def insert_data(data: Dict, supabase: Client = None, conn=None):
    """將資料插入資料庫"""
    targets = data['targets']
    applications = data['applications']
    members = data['members']
    
    print(f"\n準備插入資料：")
    print(f"  - {len(targets)} 筆目標位置")
    print(f"  - {len(applications)} 筆申請記錄")
    print(f"  - {len(members)} 筆成員記錄")
    
    if supabase:
        # 檢測表名
        target_table = None
        appli_table = None
        member_table = None
        
        for name in ['project_target', 'PROJECT_TARGET', 'Project_Target']:
            try:
                supabase.table(name).select('project_id').limit(1).execute()
                target_table = name
                break
            except:
                continue
        
        for name in ['project_applications', 'PROJECT_APPLICATIONS', 'Project_Applications']:
            try:
                supabase.table(name).select('appli_id').limit(1).execute()
                appli_table = name
                break
            except:
                continue
        
        for name in ['project_members', 'PROJECT_MEMBERS', 'Project_Members']:
            try:
                supabase.table(name).select('p_id').limit(1).execute()
                member_table = name
                break
            except:
                continue
        
        if not target_table:
            print("  ✗ 錯誤：無法找到project_target表")
            return
        
        # 插入目標位置
        if targets:
            print(f"\n正在插入目標位置...")
            batch_size = 500
            total_inserted = 0
            for i in range(0, len(targets), batch_size):
                batch = targets[i:i+batch_size]
                try:
                    supabase.table(target_table).insert(batch).execute()
                    total_inserted += len(batch)
                    print(f"  ✓ 已插入 {total_inserted}/{len(targets)} 筆目標位置...")
                except Exception as e:
                    print(f"  ✗ 插入目標位置時出錯: {e}")
                    # 逐筆插入
                    for target in batch:
                        try:
                            supabase.table(target_table).insert(target).execute()
                            total_inserted += 1
                        except:
                            pass
        
        # 插入申請記錄
        if applications and appli_table:
            print(f"\n正在插入申請記錄...")
            batch_size = 500
            total_inserted = 0
            for i in range(0, len(applications), batch_size):
                batch = applications[i:i+batch_size]
                try:
                    supabase.table(appli_table).insert(batch).execute()
                    total_inserted += len(batch)
                    print(f"  ✓ 已插入 {total_inserted}/{len(applications)} 筆申請記錄...")
                except Exception as e:
                    print(f"  ✗ 插入申請記錄時出錯: {e}")
        
        # 插入成員記錄
        if members and member_table:
            print(f"\n正在插入成員記錄...")
            batch_size = 500
            total_inserted = 0
            failed_count = 0
            
            # 先檢查並過濾重複的成員記錄（基於 (p_id, member_id)）
            unique_members = {}
            for member in members:
                key = (member['p_id'], member['member_id'])
                if key not in unique_members:
                    unique_members[key] = member
            
            members = list(unique_members.values())
            print(f"  過濾後剩餘 {len(members)} 筆唯一成員記錄（已去重）")
            
            for i in range(0, len(members), batch_size):
                batch = members[i:i+batch_size]
                try:
                    supabase.table(member_table).insert(batch).execute()
                    total_inserted += len(batch)
                    print(f"  ✓ 已插入 {total_inserted}/{len(members)} 筆成員記錄...")
                except Exception as e:
                    # 如果批次插入失敗，嘗試逐筆插入
                    print(f"  ⚠ 批次插入失敗，改為逐筆插入...")
                    for member in batch:
                        try:
                            supabase.table(member_table).insert(member).execute()
                            total_inserted += 1
                        except Exception as e2:
                            failed_count += 1
                            # 只顯示前5個錯誤，避免輸出過多
                            if failed_count <= 5:
                                print(f"    第 {i+batch.index(member)+1} 筆記錄插入失敗: {e2}")
                    
                    if failed_count > 5:
                        print(f"    ... 還有 {failed_count - 5} 筆記錄插入失敗")
            
            if failed_count > 0:
                print(f"\n  ⚠ 警告：共有 {failed_count} 筆成員記錄插入失敗（可能是重複鍵）")
            print(f"  ✓ 成功插入 {total_inserted}/{len(members)} 筆成員記錄")
    
    elif conn:
        with conn.cursor() as cur:
            try:
                # 插入目標位置
                if targets:
                    print(f"\n正在插入目標位置...")
                    insert_sql = "INSERT INTO project_target (target_seq, project_id, idol_id, status) VALUES %s"
                    values = [(t['target_seq'], t['project_id'], t['idol_id'], t['status']) for t in targets]
                    execute_values(cur, insert_sql, values)
                    print(f"  ✓ 已插入 {len(targets)} 筆目標位置")
                
                # 插入申請記錄
                if applications:
                    print(f"\n正在插入申請記錄...")
                    insert_sql = "INSERT INTO project_applications (appli_id, p_id, target_seq, applicant_id, applied_time, reviewed_time, status) VALUES %s"
                    values = [(a['appli_id'], a['p_id'], a['target_seq'], a['applicant_id'], a['applied_time'], a['reviewed_time'], a['status']) for a in applications]
                    execute_values(cur, insert_sql, values)
                    print(f"  ✓ 已插入 {len(applications)} 筆申請記錄")
                
                # 插入成員記錄
                if members:
                    print(f"\n正在插入成員記錄...")
                    insert_sql = "INSERT INTO project_members (p_id, member_id, join_date, target_seq, status) VALUES %s"
                    values = [(m['p_id'], m['member_id'], m['join_date'], m['target_seq'], m['status']) for m in members]
                    execute_values(cur, insert_sql, values)
                    print(f"  ✓ 已插入 {len(members)} 筆成員記錄")
                
                conn.commit()
                print(f"\n完成！")
            
            except Exception as e:
                print(f"插入出錯: {e}")
                conn.rollback()


def main():
    """主函數"""
    print("="*80)
    print("專案目標位置資料生成器")
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
        return
    
    # 獲取需要生成target的專案
    print("\n正在查詢需要生成目標位置的專案...")
    try:
        projects = get_projects_without_targets(supabase, conn)
    except Exception as e:
        print(f"\n✗ 錯誤：無法查詢專案資料")
        print(f"  錯誤訊息: {e}")
        return
    
    if not projects:
        print("\n所有專案都已有目標位置，無需生成")
        return
    
    # 生成資料
    data = generate_target_data(projects, supabase, conn)
    
    # 顯示統計
    print(f"\n資料統計：")
    print(f"  目標位置: {len(data['targets'])} 筆")
    print(f"  申請記錄: {len(data['applications'])} 筆")
    print(f"  成員記錄: {len(data['members'])} 筆")
    
    # 預覽
    if data['targets']:
        print(f"\n預覽前5筆目標位置：")
        for target in data['targets'][:5]:
            print(f"  專案 {target['project_id']}, 位置 {target['target_seq']}, 偶像 {target['idol_id']}, 狀態 {target['status']}")
    
    # 儲存為JSON
    json_filename = 'project_targets_data.json'
    with open(json_filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"\n資料已儲存為 {json_filename}")
    
    # 詢問是否插入資料庫
    print("\n" + "="*80)
    response = input("是否要將資料插入資料庫？(y/n): ").strip().lower()
    
    if response == 'y':
        insert_data(data, supabase, conn)
    else:
        print("\n資料已儲存為JSON，未插入資料庫")
    
    if conn:
        conn.close()


if __name__ == '__main__':
    main()

