#!/usr/bin/env python3
"""
為 status='F' 的目標位置生成申請和成員記錄
確保同一個專案中每個位置使用不同的用戶
"""

import os
import random
import time
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


def get_all_filled_targets(supabase: Client = None, conn=None) -> List[Dict]:
    """獲取所有status='F'的目標位置"""
    targets = []
    
    if supabase:
        try:
            print("  正在獲取所有status='F'的目標位置...")
            
            # 處理分頁
            page_size = 1000
            offset = 0
            
            while True:
                response = supabase.table('project_target').select('target_seq, project_id').eq('status', 'F').range(offset, offset + page_size - 1).execute()
                
                if not response.data:
                    break
                
                targets.extend(response.data)
                
                if len(response.data) < page_size:
                    break
                
                offset += page_size
                
                if offset % 5000 == 0:
                    print(f"    已獲取 {len(targets)} 筆記錄...")
            
            print(f"  ✓ 找到 {len(targets)} 個已填滿的目標位置")
        
        except Exception as e:
            print(f"  使用Supabase API出錯: {e}")
            if conn:
                return get_all_filled_targets_pg(conn)
            raise
    
    elif conn:
        return get_all_filled_targets_pg(conn)
    
    return targets


def get_all_filled_targets_pg(conn) -> List[Dict]:
    """使用PostgreSQL獲取所有status='F'的目標位置"""
    with conn.cursor() as cur:
        try:
            print("  正在獲取所有status='F'的目標位置...")
            cur.execute("SELECT target_seq, project_id FROM project_target WHERE status = 'F'")
            targets = [{'target_seq': row[0], 'project_id': row[1]} for row in cur.fetchall()]
            print(f"  ✓ 找到 {len(targets)} 個已填滿的目標位置")
        except Exception as e:
            print(f"  查詢出錯: {e}")
            try:
                cur.execute('SELECT target_seq, project_id FROM "PROJECT_TARGET" WHERE status = \'F\'')
                targets = [{'target_seq': row[0], 'project_id': row[1]} for row in cur.fetchall()]
            except:
                raise
    
    return targets


def get_non_admin_users(supabase: Client = None, conn=None) -> List[int]:
    """獲取所有非admin用戶ID（使用緩存，只查詢一次）"""
    user_ids = []
    
    if supabase:
        try:
            print("  正在獲取所有非admin用戶...")
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
            print(f"  ✓ 找到 {len(user_ids)} 個非admin用戶")
        
        except Exception as e:
            print(f"  獲取用戶時出錯: {e}")
    
    elif conn:
        with conn.cursor() as cur:
            try:
                cur.execute("SELECT u_id FROM users WHERE role = 'U'")
            except:
                cur.execute('SELECT u_id FROM "USERS" WHERE role = \'U\'')
            user_ids = [row[0] for row in cur.fetchall()]
            print(f"  ✓ 找到 {len(user_ids)} 個非admin用戶")
    
    return user_ids


def generate_application_and_member_data(targets: List[Dict], non_admin_users: List[int]) -> Dict:
    """為目標位置生成申請和成員資料"""
    applications = []
    members = []
    
    # 按專案分組，確保同一專案使用不同用戶
    targets_by_project = {}
    for target in targets:
        project_id = target['project_id']
        if project_id not in targets_by_project:
            targets_by_project[project_id] = []
        targets_by_project[project_id].append(target)
    
    print(f"\n開始為 {len(targets_by_project)} 個專案的 {len(targets)} 個位置生成資料...")
    
    # 用於追蹤已生成的appli_id，避免重複
    existing_appli_ids = set()
    
    for i, (project_id, project_targets) in enumerate(targets_by_project.items(), 1):
        # 為每個專案追蹤已使用的用戶（確保同一專案不同位置使用不同用戶）
        used_users_for_project = set()
        
        # 為該專案的每個目標位置生成資料
        for target in project_targets:
            target_seq = target['target_seq']
            
            # 隨機選擇一個非admin用戶（確保在該專案中不重複）
            available_users = [u for u in non_admin_users if u not in used_users_for_project]
            
            if not available_users:
                # 如果所有用戶都用過了，跳過這個位置
                print(f"  ⚠ 專案 {project_id} 位置 {target_seq}：沒有可用用戶，已跳過")
                continue
            
            user_id = random.choice(available_users)
            used_users_for_project.add(user_id)
            
            # 生成申請ID
            appli_id = generate_appli_id()
            attempts = 0
            while appli_id in existing_appli_ids and attempts < 100:
                appli_id = generate_appli_id()
                attempts += 1
            
            if attempts >= 100:
                print(f"  ⚠ 無法生成唯一appli_id，跳過專案 {project_id} 位置 {target_seq}")
                continue
            
            existing_appli_ids.add(appli_id)
            
            # 創建申請記錄
            application = {
                'appli_id': appli_id,
                'p_id': project_id,
                'target_seq': target_seq,
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
                'target_seq': target_seq,
                'status': 'Y'
            }
            members.append(member)
        
        if i % 1000 == 0 or i == len(targets_by_project):
            print(f"  已處理 {i}/{len(targets_by_project)} 個專案...")
    
    return {
        'applications': applications,
        'members': members
    }


def insert_data(data: Dict, supabase: Client = None, conn=None):
    """將資料插入資料庫"""
    applications = data['applications']
    members = data['members']
    
    print(f"\n準備插入資料：")
    print(f"  - {len(applications)} 筆申請記錄")
    print(f"  - {len(members)} 筆成員記錄")
    
    if supabase:
        # 檢測表名
        appli_table = None
        member_table = None
        
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
        
        if not appli_table or not member_table:
            print("  ✗ 錯誤：無法找到相關表")
            return
        
        # 插入申請記錄
        if applications:
            print(f"\n正在插入申請記錄...")
            batch_size = 500
            total_inserted = 0
            failed_count = 0
            
            for i in range(0, len(applications), batch_size):
                batch = applications[i:i+batch_size]
                try:
                    supabase.table(appli_table).insert(batch).execute()
                    total_inserted += len(batch)
                    print(f"  ✓ 已插入 {total_inserted}/{len(applications)} 筆申請記錄...")
                except Exception as e:
                    print(f"  ⚠ 批次插入失敗，改為逐筆插入...")
                    for app in batch:
                        try:
                            supabase.table(appli_table).insert(app).execute()
                            total_inserted += 1
                        except Exception as e2:
                            failed_count += 1
                            if failed_count <= 5:
                                print(f"    插入失敗: {e2}")
            
            if failed_count > 0:
                print(f"  ⚠ 共有 {failed_count} 筆申請記錄插入失敗")
            print(f"  ✓ 成功插入 {total_inserted}/{len(applications)} 筆申請記錄")
        
        # 插入成員記錄
        if members:
            print(f"\n正在插入成員記錄...")
            batch_size = 500
            total_inserted = 0
            failed_count = 0
            
            # 過濾重複（基於 (p_id, member_id)）
            unique_members = {}
            for member in members:
                key = (member['p_id'], member['member_id'])
                if key not in unique_members:
                    unique_members[key] = member
            
            members = list(unique_members.values())
            print(f"  過濾後剩餘 {len(members)} 筆唯一成員記錄")
            
            for i in range(0, len(members), batch_size):
                batch = members[i:i+batch_size]
                try:
                    supabase.table(member_table).insert(batch).execute()
                    total_inserted += len(batch)
                    print(f"  ✓ 已插入 {total_inserted}/{len(members)} 筆成員記錄...")
                except Exception as e:
                    print(f"  ⚠ 批次插入失敗，改為逐筆插入...")
                    for member in batch:
                        try:
                            supabase.table(member_table).insert(member).execute()
                            total_inserted += 1
                        except Exception as e2:
                            failed_count += 1
                            if failed_count <= 5:
                                print(f"    插入失敗: {e2}")
            
            if failed_count > 0:
                print(f"  ⚠ 共有 {failed_count} 筆成員記錄插入失敗")
            print(f"  ✓ 成功插入 {total_inserted}/{len(members)} 筆成員記錄")
    
    elif conn:
        with conn.cursor() as cur:
            try:
                # 插入申請記錄
                if applications:
                    print(f"\n正在插入申請記錄...")
                    insert_sql = """
                        INSERT INTO project_applications 
                        (appli_id, p_id, target_seq, applicant_id, applied_time, reviewed_time, status) 
                        VALUES %s
                    """
                    values = [
                        (a['appli_id'], a['p_id'], a['target_seq'], a['applicant_id'], 
                         a['applied_time'], a['reviewed_time'], a['status'])
                        for a in applications
                    ]
                    execute_values(cur, insert_sql, values)
                    print(f"  ✓ 已插入 {len(applications)} 筆申請記錄")
                
                # 插入成員記錄
                if members:
                    print(f"\n正在插入成員記錄...")
                    # 過濾重複
                    unique_members = {}
                    for member in members:
                        key = (member['p_id'], member['member_id'])
                        if key not in unique_members:
                            unique_members[key] = member
                    
                    members = list(unique_members.values())
                    print(f"  過濾後剩餘 {len(members)} 筆唯一成員記錄")
                    
                    insert_sql = """
                        INSERT INTO project_members 
                        (p_id, member_id, join_date, target_seq, status) 
                        VALUES %s
                    """
                    values = [
                        (m['p_id'], m['member_id'], m['join_date'], m['target_seq'], m['status'])
                        for m in members
                    ]
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
    print("為已填滿目標位置生成申請和成員記錄")
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
    
    # 獲取所有status='F'的目標位置
    print("\n正在查詢所有status='F'的目標位置...")
    try:
        targets = get_all_filled_targets(supabase, conn)
    except Exception as e:
        print(f"\n✗ 錯誤：無法查詢目標位置資料")
        print(f"  錯誤訊息: {e}")
        return
    
    if not targets:
        print("\n沒有找到status='F'的目標位置")
        return
    
    # 獲取非admin用戶（只查詢一次，使用緩存）
    print("\n正在獲取非admin用戶...")
    non_admin_users = get_non_admin_users(supabase, conn)
    
    if not non_admin_users:
        print("\n✗ 錯誤：沒有找到非admin用戶")
        return
    
    # 生成申請和成員資料
    data = generate_application_and_member_data(targets, non_admin_users)
    
    # 顯示統計
    print(f"\n資料統計：")
    print(f"  申請記錄: {len(data['applications'])} 筆")
    print(f"  成員記錄: {len(data['members'])} 筆")
    
    # 預覽
    if data['applications']:
        print(f"\n預覽前5筆申請記錄：")
        for app in data['applications'][:5]:
            print(f"  專案 {app['p_id']}, 位置 {app['target_seq']}, 申請者 {app['applicant_id']}")
    
    # 儲存為JSON
    json_filename = 'filled_targets_applications_data.json'
    with open(json_filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"\n資料已儲存為 {json_filename}")
    
    # 詢問是否插入資料庫
    print("\n" + "="*80)
    response = input("是否要將資料插入資料庫？(y/n): ").strip().lower()
    
    if response == 'y':
        insert_data(data, supabase, conn)
        print("\n完成！")
    else:
        print("\n資料已儲存為JSON，未插入資料庫")
    
    if conn:
        conn.close()


if __name__ == '__main__':
    main()



