# 并发控制测试指南

## 测试场景

测试当用户 A 浏览项目列表时，用户 B 接受申请导致项目招募完成，用户 A 在未刷新页面的情况下点击操作时的并发控制。

## 测试步骤

### 方法 1：使用两个浏览器窗口（推荐）

1. **准备两个用户账号**
   - 用户 A：用于浏览项目
   - 用户 B：用于管理项目（项目创建者）

2. **打开两个浏览器窗口**
   - 窗口 1：正常浏览器窗口，登录用户 A
   - 窗口 2：无痕模式（或另一个浏览器），登录用户 B

3. **测试流程**

   **步骤 1：用户 A 浏览项目**
   - 在窗口 1 中，用户 A 登录
   - 导航到 `/projects` 页面
   - 找到一个有申请的项目（确保该项目还有空缺位置）
   - **不要刷新页面，保持这个页面打开**

   **步骤 2：用户 B 接受申请**
   - 在窗口 2 中，用户 B 登录
   - 导航到 `/project/manage/[project_id]`（该项目的管理页面）
   - 接受一个申请，使项目招募完成
   - 确认项目状态变为 "已招募完成"（status = 'F'）

   **步骤 3：用户 A 尝试操作**
   - 回到窗口 1（用户 A 的浏览页面，**未刷新**）
   - 尝试点击该项目的 "详细资讯" 按钮
     - ✅ 应该显示提示："该专案已招募完成"
     - ✅ 进入详情页后，应该看到 "该专案已招募完成" 的提示，而不是 "申请加入" 按钮
   
   - 尝试点击该项目的 "申请加入" 按钮（如果有显示）
     - ✅ 应该显示提示："该专案已招募完成"
     - ✅ 如果进入申请页面，应该看到黄色提示框，申请表单被禁用

### 方法 2：使用开发者工具模拟

1. **打开浏览器开发者工具**
   - 按 `F12` 或 `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)

2. **使用 Network 标签页**
   - 在 Network 标签页中，可以查看 API 请求
   - 当用户 B 接受申请后，可以看到项目状态更新

3. **手动修改 localStorage**
   - 可以在控制台中切换用户：
     ```javascript
     // 切换到用户 A
     localStorage.setItem('userId', '用户A的ID');
     localStorage.setItem('userName', '用户A的名字');
     
     // 切换到用户 B
     localStorage.setItem('userId', '用户B的ID');
     localStorage.setItem('userName', '用户B的名字');
     ```

## 测试检查点

### ✅ 后端检查
- [ ] 接受申请后，如果成员数达到目标人数，项目状态自动更新为 'F'
- [ ] 申请 API 检查项目状态，如果 status = 'F'，返回错误

### ✅ 前端检查
- [ ] 浏览项目页面：点击 "详细资讯" 时，如果 status = 'F'，显示提示
- [ ] 浏览项目页面：点击 "申请加入" 时，如果 status = 'F'，显示提示并阻止导航
- [ ] 项目详情页面：如果 status = 'F'，显示 "该专案已招募完成"，不显示申请按钮
- [ ] 申请加入页面：如果 status = 'F'，显示提示框，表单被禁用

## 快速测试脚本

### 使用 SQL 直接测试

```sql
-- 1. 找到一个有申请的项目
SELECT p.p_id, p.porject_title, p.target_cnt, p.status,
       COUNT(DISTINCT pm.member_id) FILTER (WHERE pm.status = 'Y') as current_members,
       COUNT(DISTINCT pt.target_seq) FILTER (WHERE pt.status = 'I') as missing_positions
FROM project p
LEFT JOIN project_members pm ON p.p_id = pm.p_id
LEFT JOIN project_target pt ON p.p_id = pt.project_id
WHERE p.status = 'A'
GROUP BY p.p_id, p.porject_title, p.target_cnt, p.status
HAVING COUNT(DISTINCT pm.member_id) FILTER (WHERE pm.status = 'Y') < p.target_cnt
LIMIT 1;

-- 2. 查看该项目的申请
SELECT appli_id, applicant_id, target_seq, status
FROM project_applications
WHERE p_id = [项目ID] AND status = 'W';

-- 3. 手动接受一个申请（模拟用户 B 的操作）
-- 这会触发项目状态更新逻辑
UPDATE project_applications
SET status = 'A', reviewed_time = NOW()
WHERE appli_id = [申请ID];

-- 然后执行管理 API 的逻辑来更新成员和检查状态
-- （或者直接调用 API）
```

## 注意事项

1. **不需要运行多个服务器实例**
   - Next.js 会自动处理并发请求
   - 使用两个浏览器窗口即可模拟两个用户

2. **端口占用问题**
   - 如果端口 3000 被占用，Next.js 会自动使用 3001
   - 如果需要在不同端口运行多个实例，可以使用：
     ```bash
     PORT=3002 npm run dev
     ```
   - 但对于测试并发控制，**不需要**这样做

3. **数据库事务**
   - 确保数据库连接池配置正确
   - 检查是否有死锁或长时间运行的查询

## 预期结果

当用户 A 在未刷新页面的情况下，尝试操作一个已被用户 B 标记为"招募完成"的项目时：

1. ✅ 点击 "详细资讯" → 显示提示，进入页面后看到状态提示
2. ✅ 点击 "申请加入" → 显示提示，阻止导航或显示禁用表单
3. ✅ 如果绕过前端检查，API 会返回错误："该专案已招募完成"

