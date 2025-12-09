# 数据库备份说明

## 备份文件

- **文件名**: `database_backup.sql`
- **数据库**: `kpop_dance_db`
- **格式**: PostgreSQL SQL dump

## 如何恢复备份

### 方法 1: 使用 psql 命令行

```bash
# 删除现有数据库（如果存在）
dropdb -U yu kpop_dance_db

# 创建新数据库
createdb -U yu kpop_dance_db

# 恢复备份
psql -U yu -d kpop_dance_db < database_backup.sql
```

### 方法 2: 使用 psql 交互式

```bash
psql -U yu -d kpop_dance_db
```

然后在 psql 中执行：
```sql
\i database_backup.sql
```

## 备份内容

此备份包含：
- 所有表结构（CREATE TABLE）
- 所有数据（INSERT）
- 索引和约束
- 序列（SERIAL）的当前值

## 注意事项

1. **恢复前请备份现有数据**：恢复操作会覆盖现有数据库
2. **确保数据库用户有权限**：需要 `yu` 用户有创建数据库的权限
3. **检查连接信息**：确保 `.env.local` 中的数据库配置正确

## 创建新备份

如果需要创建新的备份，运行：

```bash
pg_dump -U yu -d kpop_dance_db --clean --if-exists --no-owner --no-acl -F p > database_backup.sql
```

参数说明：
- `--clean`: 包含 DROP 语句
- `--if-exists`: 使用 IF EXISTS（更安全）
- `--no-owner`: 不包含所有者信息
- `--no-acl`: 不包含权限信息
- `-F p`: 纯文本格式（SQL）



