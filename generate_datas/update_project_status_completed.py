#!/usr/bin/env python3
"""
檢查並更新專案狀態
如果專案的project_members中status='Y'的人數等於target_cnt，將專案status改為'F'
"""

import os
from typing import List, Dict
import json

try:
    from supabase import create_client, Client
    import psycopg2
except ImportError:
    print("請先安裝必要的套件：")
    print("pip install supabase psycopg2-binary python-dotenv")
    exit(1)

# ========== 配置 ==========
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
DATABASE_URL = os.getenv('DATABASE_URL', '')


def get_all_projects_with_counts(supabase: Client = None, conn=None) -> List[Dict]:
    """獲取所有專案及其成員數量"""
    projects = []
    
    if supabase:
        try:
            print("  正在獲取所有專案...")
            
            # 獲取所有專案（處理分頁）
            all_projects = []
            page_size = 1000
            offset = 0
            
            while True:
                response = supabase.table('project').select('p_id, target_cnt, status').range(offset, offset + page_size - 1).execute()
                
                if not response.data:
                    break
                
                all_projects.extend(response.data)
                
                if len(response.data) < page_size:
                    break
                
                offset += page_size
                
                if offset % 5000 == 0:
                    print(f"    已獲取 {len(all_projects)} 個專案...")
            
            print(f"  ✓ 找到 {len(all_projects)} 個專案")
            
            # 獲取每個專案的成員數量（status='Y'）
            print("  正在統計每個專案的成員數量...")
            
            # 批量獲取所有成員記錄
            all_members = []
            offset = 0
            
            while True:
                response = supabase.table('project_members').select('p_id, status').eq('status', 'Y').range(offset, offset + page_size - 1).execute()
                
                if not response.data:
                    break
                
                all_members.extend(response.data)
                
                if len(response.data) < page_size:
                    break
                
                offset += page_size
            
            # 統計每個專案的成員數量
            member_count_by_project = {}
            for member in all_members:
                p_id = member['p_id']
                member_count_by_project[p_id] = member_count_by_project.get(p_id, 0) + 1
            
            # 合併專案資訊和成員數量
            for project in all_projects:
                p_id = project['p_id']
                member_count = member_count_by_project.get(p_id, 0)
                projects.append({
                    'p_id': p_id,
                    'target_cnt': project['target_cnt'],
                    'member_count': member_count,
                    'status': project['status']
                })
            
            print(f"  ✓ 完成統計")
        
        except Exception as e:
            print(f"  使用Supabase API出錯: {e}")
            if conn:
                return get_all_projects_with_counts_pg(conn)
            raise
    
    elif conn:
        return get_all_projects_with_counts_pg(conn)
    
    return projects


def get_all_projects_with_counts_pg(conn) -> List[Dict]:
    """使用PostgreSQL獲取所有專案及其成員數量"""
    with conn.cursor() as cur:
        try:
            print("  正在獲取所有專案及其成員數量...")
            
            # 使用SQL JOIN一次性獲取所有數據（更高效）
            query = """
                SELECT 
                    p.p_id,
                    p.target_cnt,
                    p.status,
                    COUNT(pm.member_id) FILTER (WHERE pm.status = 'Y') AS member_count
                FROM project p
                LEFT JOIN project_members pm ON p.p_id = pm.p_id
                GROUP BY p.p_id, p.target_cnt, p.status
            """
            
            try:
                cur.execute(query)
            except:
                # 嘗試大寫表名
                query = """
                    SELECT 
                        p.p_id,
                        p.target_cnt,
                        p.status,
                        COUNT(pm.member_id) FILTER (WHERE pm.status = 'Y') AS member_count
                    FROM "PROJECT" p
                    LEFT JOIN "PROJECT_MEMBERS" pm ON p.p_id = pm.p_id
                    GROUP BY p.p_id, p.target_cnt, p.status
                """
                cur.execute(query)
            
            projects = []
            for row in cur.fetchall():
                projects.append({
                    'p_id': row[0],
                    'target_cnt': row[1],
                    'status': row[2],
                    'member_count': row[3] or 0
                })
            
            print(f"  ✓ 找到 {len(projects)} 個專案")
        
        except Exception as e:
            print(f"  查詢出錯: {e}")
            raise
    
    return projects


def find_projects_to_update(projects: List[Dict]) -> List[Dict]:
    """找出需要更新狀態的專案"""
    to_update = []
    
    for project in projects:
        p_id = project['p_id']
        target_cnt = project['target_cnt']
        member_count = project['member_count']
        current_status = project['status']
        
        # 如果成員數量等於目標數量，且狀態不是'F'，需要更新
        if member_count == target_cnt and current_status != 'F':
            to_update.append({
                'p_id': p_id,
                'target_cnt': target_cnt,
                'member_count': member_count,
                'old_status': current_status,
                'new_status': 'F'
            })
    
    return to_update


def update_project_statuses(projects_to_update: List[Dict], supabase: Client = None, conn=None):
    """更新專案狀態為'F'"""
    if not projects_to_update:
        print("\n沒有需要更新的專案")
        return
    
    print(f"\n準備更新 {len(projects_to_update)} 個專案的狀態...")
    
    if supabase:
        # 檢測表名
        table_name = None
        for name in ['project', 'PROJECT', 'Project']:
            try:
                supabase.table(name).select('p_id').limit(1).execute()
                table_name = name
                break
            except:
                continue
        
        if not table_name:
            print("  ✗ 錯誤：無法找到project表")
            return
        
        # 批量更新（Supabase可能需要逐筆更新）
        updated = 0
        failed = 0
        
        for i, project in enumerate(projects_to_update, 1):
            try:
                response = supabase.table(table_name).update({'status': 'F'}).eq('p_id', project['p_id']).execute()
                updated += 1
                
                if i % 100 == 0:
                    print(f"  已更新 {updated}/{len(projects_to_update)} 個專案...")
            
            except Exception as e:
                failed += 1
                if failed <= 5:
                    print(f"  ✗ 更新專案 {project['p_id']} 時出錯: {e}")
        
        print(f"\n完成！成功更新 {updated} 個專案，失敗 {failed} 個")
    
    elif conn:
        with conn.cursor() as cur:
            try:
                # 批量更新（更高效）
                p_ids = [p['p_id'] for p in projects_to_update]
                
                # 構建IN子句（分批處理，避免SQL語句過長）
                batch_size = 1000
                total_updated = 0
                
                for i in range(0, len(p_ids), batch_size):
                    batch = p_ids[i:i+batch_size]
                    placeholders = ','.join(['%s'] * len(batch))
                    
                    try:
                        update_sql = f"UPDATE project SET status = 'F' WHERE p_id IN ({placeholders})"
                    except:
                        update_sql = f'UPDATE "PROJECT" SET status = \'F\' WHERE p_id IN ({placeholders})'
                    
                    cur.execute(update_sql, batch)
                    total_updated += cur.rowcount
                    
                    if (i // batch_size + 1) % 10 == 0:
                        print(f"  已更新 {total_updated} 個專案...")
                
                conn.commit()
                print(f"\n完成！成功更新 {total_updated} 個專案")
            
            except Exception as e:
                print(f"更新出錯: {e}")
                conn.rollback()


def main():
    """主函數"""
    print("="*80)
    print("檢查並更新專案狀態")
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
    
    # 獲取所有專案及其成員數量
    print("\n正在查詢專案資料...")
    try:
        projects = get_all_projects_with_counts(supabase, conn)
    except Exception as e:
        print(f"\n✗ 錯誤：無法查詢專案資料")
        print(f"  錯誤訊息: {e}")
        return
    
    if not projects:
        print("\n沒有找到專案資料")
        return
    
    # 找出需要更新的專案
    print("\n正在分析專案狀態...")
    projects_to_update = find_projects_to_update(projects)
    
    # 顯示統計
    print(f"\n統計結果：")
    total_projects = len(projects)
    completed_projects = len([p for p in projects if p['member_count'] == p['target_cnt']])
    already_f = len([p for p in projects if p['member_count'] == p['target_cnt'] and p['status'] == 'F'])
    need_update = len(projects_to_update)
    
    print(f"  總專案數: {total_projects}")
    print(f"  已完成專案（成員數=目標數）: {completed_projects}")
    print(f"  已完成且狀態已為'F': {already_f}")
    print(f"  已完成但狀態不是'F'（需更新）: {need_update}")
    
    if projects_to_update:
        print(f"\n前10個需要更新的專案：")
        for p in projects_to_update[:10]:
            print(f"  專案 {p['p_id']}: 目標 {p['target_cnt']} 人，現有 {p['member_count']} 人，狀態 {p['old_status']} → F")
    
    if not projects_to_update:
        print("\n所有已完成專案的狀態都正確，無需更新")
        return
    
    # 儲存結果
    result = {
        'total_projects': total_projects,
        'completed_projects': completed_projects,
        'already_f': already_f,
        'need_update': need_update,
        'projects_to_update': projects_to_update
    }
    
    json_filename = 'project_status_update_result.json'
    with open(json_filename, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"\n結果已儲存為 {json_filename}")
    
    # 詢問是否更新
    print("\n" + "="*80)
    response = input(f"是否要將 {need_update} 個專案的狀態更新為'F'？(y/n): ").strip().lower()
    
    if response == 'y':
        update_project_statuses(projects_to_update, supabase, conn)
        print("\n完成！")
    else:
        print("\n已取消更新操作")


if __name__ == '__main__':
    main()



