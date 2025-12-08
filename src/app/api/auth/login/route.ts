import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { name, password } = await request.json();

    // 查詢使用者
    const result = await pool.query(
      'SELECT u_id, status, password, role FROM users WHERE name = $1',
      [name]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '用戶名稱或密碼錯誤' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    if (user.status === 'N') {
      return NextResponse.json(
        { error: '帳號已被停用' },
        { status: 403 }
      );
    }

    // 驗證密碼
    if (user.password !== password) {
      return NextResponse.json(
        { error: '用戶名稱或密碼錯誤' },
        { status: 401 }
      );
    }

    // 更新最後登入時間
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE u_id = $1',
      [user.u_id]
    );

    return NextResponse.json({
      u_id: user.u_id,
      role: user.role,
    });
  } catch (error: any) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { error: 'Failed to login: ' + error.message },
      { status: 500 }
    );
  }
}
