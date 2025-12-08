import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { name, email, password, birthdate, gender, region, phone } =
      await request.json();

    // 檢查用戶名稱是否已存在
    const nameCheck = await pool.query(
      'SELECT u_id FROM users WHERE name = $1',
      [name]
    );

    if (nameCheck.rows.length > 0) {
      return NextResponse.json(
        { error: '此用戶名稱已被使用，請選擇其他名稱' },
        { status: 400 }
      );
    }

    // 檢查 email 是否已存在
    if (email) {
      const emailCheck = await pool.query(
        'SELECT u_id FROM users WHERE email = $1',
        [email]
      );

      if (emailCheck.rows.length > 0) {
        return NextResponse.json(
          { error: '此 Email 已被使用，請使用其他 Email' },
          { status: 400 }
        );
      }
    }

    // 生成新的用戶 ID
    const generateUserId = () => {
      return Math.floor(1000 + Math.random() * 9000);
    };

    let newUserId = generateUserId();
    let attempts = 0;

    while (attempts < 10) {
      const checkResult = await pool.query(
        'SELECT u_id FROM users WHERE u_id = $1',
        [newUserId]
      );

      if (checkResult.rows.length === 0) break;
      newUserId = generateUserId();
      attempts++;
    }

    if (attempts >= 10) {
      return NextResponse.json(
        { error: '系統繁忙，請稍後再試' },
        { status: 500 }
      );
    }

    // 插入新用戶
    await pool.query(
      `INSERT INTO users (
        u_id, name, email, password, birthdate, gender, region, phone,
        create_at, last_login, status, role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), 'A', 'U')`,
      [newUserId, name, email || null, password, birthdate || null, gender || null, region || null, phone || null]
    );

    return NextResponse.json({ u_id: newUserId, role: 'U' });
  } catch (error: any) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register: ' + error.message },
      { status: 500 }
    );
  }
}
