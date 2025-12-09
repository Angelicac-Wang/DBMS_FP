#!/usr/bin/env python3
"""
生成練習時間表資料腳本
為還沒有practice_schedule資料的專案生成練習時間表
"""

import os
import random
from datetime import datetime, timedelta
from typing import List, Dict
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

# 練習時間設定
PRACTICE_DURATIONS = [2.0, 2.5, 3.0]  # 小時
START_TIME_RANGE = (17, 22)  # 下午5點到晚上10點（22點是結束時間的上限）
PRACTICE_INTERVAL_RANGE = (3, 5)  # 間隔3-5天
PRACTICE_COUNT_RANGE = (3, 6)  # 3-6次練習
DATE_START = datetime(2025, 12, 1)  # 2025年12月
DATE_END = datetime(2026, 4, 30)  # 2026年4月


def get_all_projects_from_supabase(supabase: Client, table_name: str = 'project') -> List[int]:
    """從Supabase獲取所有專案ID（處理分頁）"""
    all_ids = []
    page_size = 1000
    offset = 0
    
    while True:
        try:
            response = supabase.table(table_name).select('p_id', count='exact').range(offset, offset + page_size - 1).execute()
            
            if not response.data:
                break
            
            batch_ids = [p['p_id'] for p in response.data]
            all_ids.extend(batch_ids)
            
            # 如果這批資料少於page_size，表示已經是最後一頁
            if len(batch_ids) < page_size:
                break
            
            offset += page_size
            
            if offset % 5000 == 0:
                print(f"    已獲取 {len(all_ids)} 個專案ID...")
        
        except Exception as e:
            print(f"    獲取專案ID時出錯（offset={offset}）: {e}")
            break
    
    return all_ids


def get_projects_without_schedules(supabase: Client = None, conn=None) -> List[int]:
    """獲取還沒有practice_schedule的專案ID列表"""
    project_ids = []
    
    if supabase:
        try:
            print("  正在獲取所有專案ID（可能需要一些時間）...")
            # 獲取所有專案ID（處理分頁）
            all_project_ids = get_all_projects_from_supabase(supabase, 'project')
            print(f"  ✓ 找到 {len(all_project_ids)} 個專案")
            
            print("  正在獲取已有練習時間表的專案ID...")
            # 獲取已有schedule的專案ID（處理分頁）
            projects_with_schedules_list = get_all_projects_from_supabase(supabase, 'practice_schedule')
            # 使用set去重（因為一個專案可能有多個schedule）
            projects_with_schedules = set(projects_with_schedules_list)
            print(f"  ✓ 其中 {len(projects_with_schedules)} 個已有練習時間表")
            
            # 找出沒有schedule的專案
            project_ids = [pid for pid in all_project_ids if pid not in projects_with_schedules]
            print(f"  ✓ 需要生成 {len(project_ids)} 個專案的練習時間表")
            
        except Exception as e:
            print(f"  使用Supabase API出錯: {e}")
            if conn:
                return get_projects_without_schedules_pg(conn)
            raise
    
    elif conn:
        return get_projects_without_schedules_pg(conn)
    
    return project_ids


def get_projects_without_schedules_pg(conn) -> List[int]:
    """使用PostgreSQL直連獲取沒有schedule的專案ID"""
    with conn.cursor() as cur:
        try:
            print("  正在獲取所有專案ID...")
            # 獲取所有專案ID
            cur.execute("SELECT p_id FROM project")
            all_project_ids = [row[0] for row in cur.fetchall()]
            print(f"  ✓ 找到 {len(all_project_ids)} 個專案")
            
            print("  正在獲取已有練習時間表的專案ID...")
            # 獲取已有schedule的專案ID
            cur.execute("SELECT DISTINCT p_id FROM practice_schedule")
            projects_with_schedules = set(row[0] for row in cur.fetchall())
            print(f"  ✓ 其中 {len(projects_with_schedules)} 個已有練習時間表")
            
            # 找出沒有schedule的專案
            project_ids = [pid for pid in all_project_ids if pid not in projects_with_schedules]
            print(f"  ✓ 需要生成 {len(project_ids)} 個專案的練習時間表")
            
        except Exception as e:
            print(f"  查詢資料庫出錯: {e}")
            # 嘗試大寫表名
            try:
                print("  嘗試使用大寫表名...")
                cur.execute('SELECT p_id FROM "PROJECT"')
                all_project_ids = [row[0] for row in cur.fetchall()]
                print(f"  ✓ 找到 {len(all_project_ids)} 個專案")
                
                cur.execute('SELECT DISTINCT p_id FROM "PRACTICE_SCHEDULE"')
                projects_with_schedules = set(row[0] for row in cur.fetchall())
                print(f"  ✓ 其中 {len(projects_with_schedules)} 個已有練習時間表")
                
                project_ids = [pid for pid in all_project_ids if pid not in projects_with_schedules]
                print(f"  ✓ 需要生成 {len(project_ids)} 個專案的練習時間表")
            except Exception as e2:
                print(f"  查詢失敗: {e2}")
                raise
    
    return project_ids


def generate_practice_schedules(project_id: int) -> List[Dict]:
    """為單個專案生成練習時間表"""
    schedules = []
    
    # 決定練習次數（3-6次）
    practice_count = random.randint(PRACTICE_COUNT_RANGE[0], PRACTICE_COUNT_RANGE[1])
    
    # 生成第一個練習日期（在指定範圍內）
    # 確保有足夠的空間容納所有練習（考慮間隔）
    max_interval = PRACTICE_INTERVAL_RANGE[1]
    days_needed = (practice_count - 1) * max_interval
    max_start_date = DATE_END - timedelta(days=days_needed)
    
    if max_start_date < DATE_START:
        max_start_date = DATE_START
    
    # 第一個練習日期
    days_from_start = random.randint(0, (max_start_date - DATE_START).days)
    current_date = DATE_START + timedelta(days=days_from_start)
    
    for i in range(practice_count):
        # 確保日期不超過結束日期
        if current_date > DATE_END:
            break
        
        # 隨機選擇練習時長（2、2.5或3小時）
        duration = random.choice(PRACTICE_DURATIONS)
        
        # 生成開始時間（下午5點到晚上10點，但要確保結束時間不超過22點）
        # 如果時長是3小時，開始時間最早是17:00，最晚是19:00（19:00+3小時=22:00）
        # 如果時長是2.5小時，開始時間最早是17:00，最晚是19:30（19:30+2.5小時=22:00）
        # 如果時長是2小時，開始時間最早是17:00，最晚是20:00（20:00+2小時=22:00）
        
        # 計算最晚開始時間（確保結束時間不超過22:00）
        if duration == 3.0:
            max_start_hour = 19
            max_start_minute = 0
        elif duration == 2.5:
            max_start_hour = 19
            max_start_minute = 30
        else:  # duration == 2.0
            max_start_hour = 20
            max_start_minute = 0
        
        # 生成開始時間
        if max_start_hour > START_TIME_RANGE[0]:
            start_hour = random.randint(START_TIME_RANGE[0], max_start_hour)
        else:
            start_hour = START_TIME_RANGE[0]
        
        # 決定分鐘
        if start_hour == max_start_hour:
            # 如果是最晚小時，使用對應的最晚分鐘
            start_minute = max_start_minute
        else:
            # 其他時間，70%機率整點，30%機率半點
            start_minute = 0 if random.random() < 0.7 else 30
        
        # 計算結束時間（使用timedelta確保正確計算）
        start_datetime = datetime.combine(current_date.date(), datetime.min.time().replace(hour=start_hour, minute=start_minute))
        end_datetime = start_datetime + timedelta(hours=duration)
        
        # 確保結束時間不超過22:00
        if end_datetime.hour > 22 or (end_datetime.hour == 22 and end_datetime.minute > 0):
            # 如果超過，調整開始時間
            end_datetime = datetime.combine(current_date.date(), datetime.min.time().replace(hour=22, minute=0))
            start_datetime = end_datetime - timedelta(hours=duration)
            start_hour = start_datetime.hour
            start_minute = start_datetime.minute
        
        schedule = {
            'p_id': project_id,
            'date': current_date.strftime('%Y-%m-%d'),  # XXXX-XX-XX格式
            'start_time': f"{start_hour:02d}:{start_minute:02d}:00",  # XX:XX:XX格式
            'end_time': f"{end_datetime.hour:02d}:{end_datetime.minute:02d}:00"  # XX:XX:XX格式
        }
        
        schedules.append(schedule)
        
        # 生成下一個練習日期（間隔3-5天）
        if i < practice_count - 1:
            interval_days = random.randint(PRACTICE_INTERVAL_RANGE[0], PRACTICE_INTERVAL_RANGE[1])
            current_date = current_date + timedelta(days=interval_days)
    
    return schedules


def insert_schedules(schedules: List[Dict], supabase: Client = None, conn=None):
    """將練習時間表插入資料庫"""
    if not schedules:
        print("沒有需要插入的資料")
        return
    
    print(f"\n準備插入 {len(schedules)} 筆練習時間表資料...")
    
    if supabase:
        # 檢測表名
        table_name = None
        for name in ['practice_schedule', 'PRACTICE_SCHEDULE', 'Practice_Schedule']:
            try:
                test_response = supabase.table(name).select('p_id').limit(1).execute()
                table_name = name
                print(f"  ✓ 使用表名: {table_name}")
                break
            except:
                continue
        
        if not table_name:
            print("  ✗ 錯誤：無法找到practice_schedule表")
            return
        
        # 批次插入（每批500筆）
        batch_size = 500
        total_inserted = 0
        
        for i in range(0, len(schedules), batch_size):
            batch = schedules[i:i+batch_size]
            try:
                response = supabase.table(table_name).insert(batch).execute()
                total_inserted += len(batch)
                print(f"  ✓ 已插入 {total_inserted}/{len(schedules)} 筆資料...")
            except Exception as e:
                print(f"  ✗ 插入第 {i+1}-{i+len(batch)} 筆時出錯: {e}")
                # 嘗試逐筆插入
                for j, schedule in enumerate(batch):
                    try:
                        supabase.table(table_name).insert(schedule).execute()
                        total_inserted += 1
                    except Exception as e2:
                        print(f"    第 {i+j+1} 筆資料插入失敗: {e2}")
        
        print(f"\n完成！共成功插入 {total_inserted}/{len(schedules)} 筆資料")
    
    elif conn:
        with conn.cursor() as cur:
            try:
                insert_sql = """
                    INSERT INTO practice_schedule (
                        p_id, date, start_time, end_time
                    ) VALUES %s
                """
            except:
                insert_sql = """
                    INSERT INTO "PRACTICE_SCHEDULE" (
                        p_id, date, start_time, end_time
                    ) VALUES %s
                """
            
            values = [
                (s['p_id'], s['date'], s['start_time'], s['end_time'])
                for s in schedules
            ]
            
            try:
                execute_values(cur, insert_sql, values)
                conn.commit()
                print(f"\n完成！共成功插入 {len(schedules)} 筆資料")
            except Exception as e:
                print(f"插入出錯: {e}")
                conn.rollback()


def preview_schedules(schedules: List[Dict], count: int = 5):
    """預覽生成的練習時間表"""
    if not schedules:
        return
    
    # 按專案分組
    by_project = {}
    for schedule in schedules:
        pid = schedule['p_id']
        if pid not in by_project:
            by_project[pid] = []
        by_project[pid].append(schedule)
    
    print(f"\n{'='*80}")
    print(f"預覽生成的練習時間表（前 {min(count, len(by_project))} 個專案）：")
    print(f"{'='*80}\n")
    
    for i, (pid, project_schedules) in enumerate(list(by_project.items())[:count], 1):
        print(f"專案 {pid} - {len(project_schedules)} 次練習：")
        for sched in sorted(project_schedules, key=lambda x: x['date']):
            print(f"  {sched['date']} {sched['start_time']} ~ {sched['end_time']}")
        print()


def main():
    """主函數"""
    print("="*80)
    print("練習時間表資料生成器")
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
    
    # 獲取需要生成schedule的專案ID
    print("\n正在查詢需要生成練習時間表的專案...")
    try:
        project_ids = get_projects_without_schedules(supabase, conn)
    except Exception as e:
        print(f"\n✗ 錯誤：無法查詢專案資料")
        print(f"  錯誤訊息: {e}")
        return
    
    if not project_ids:
        print("\n所有專案都已有練習時間表，無需生成")
        return
    
    # 生成練習時間表
    print(f"\n開始為 {len(project_ids)} 個專案生成練習時間表...")
    all_schedules = []
    
    for i, project_id in enumerate(project_ids, 1):
        schedules = generate_practice_schedules(project_id)
        all_schedules.extend(schedules)
        
        if i % 100 == 0:
            print(f"  已處理 {i}/{len(project_ids)} 個專案...")
    
    print(f"\n完成！共生成 {len(all_schedules)} 筆練習時間表資料")
    
    # 預覽資料
    preview_schedules(all_schedules, count=10)
    
    # 顯示統計
    print("\n資料統計：")
    by_project = {}
    for schedule in all_schedules:
        pid = schedule['p_id']
        by_project[pid] = by_project.get(pid, 0) + 1
    
    practice_counts = list(by_project.values())
    print(f"  總專案數: {len(by_project)}")
    print(f"  總練習次數: {len(all_schedules)}")
    print(f"  平均每個專案練習次數: {sum(practice_counts) / len(practice_counts):.2f}")
    print(f"  最少練習次數: {min(practice_counts)}")
    print(f"  最多練習次數: {max(practice_counts)}")
    
    # 儲存為JSON
    json_filename = 'practice_schedules.json'
    with open(json_filename, 'w', encoding='utf-8') as f:
        json.dump(all_schedules, f, ensure_ascii=False, indent=2)
    print(f"\n資料已儲存為 {json_filename}")
    
    # 詢問是否插入資料庫
    print("\n" + "="*80)
    response = input("是否要將資料插入資料庫？(y/n): ").strip().lower()
    
    if response == 'y':
        insert_schedules(all_schedules, supabase, conn)
        print("\n完成！")
    else:
        print("\n資料已儲存為JSON，未插入資料庫")
    
    if conn:
        conn.close()


if __name__ == '__main__':
    main()

