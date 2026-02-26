# AI Chat 更新服务器

这是AI Chat程序的更新服务器实现，基于Cloudflare Workers构建，提供版本检查和更新分发服务。

## 功能特性

- **版本检查**：提供API接口让客户端检查最新版本
- **更新分发**：提供最新版本的下载链接
- **轻量级**：基于Cloudflare Workers，无需传统服务器
- **高可用**：利用Cloudflare全球CDN加速（中国减速器）

## 技术架构

- **平台**：Cloudflare Workers
- **语言**：JavaScript
- **配置**：wrangler.toml
- **存储**：使用Cloudflare Workers KV或直接指向外部下载链接

## 快速开始

### 前提条件
- Cloudflare账号
- Wrangler CLI工具

### 安装和部署

1. **安装Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **登录Cloudflare**
   ```bash
   wrangler login
   ```

3. **配置项目**
   修改 `wrangler.toml` 文件：
   ```toml
   name = "ai-chat-update-server"
   main = "worker.js"
   compatibility_date = "2024-01-01"

   [vars]
   APP_NAME = "AI Chat Update Server"
   APP_VERSION = "1.0.0"

   [triggers]
   crons = []

   [build]
   command = ""

   [dev]
   local = true
   port = 8787

   [observability]
   enabled = false
   head_sampling_rate = 1

   [observability.logs]
   enabled = true
   head_sampling_rate = 1
   persist = true
   invocation_logs = true

   [observability.traces]
   enabled = false
   persist = true
   head_sampling_rate = 1

   ```

4. **部署到Cloudflare Workers**
   ```bash
   wrangler deploy
   ```

## API接口

### 版本检查

**URL**: `/api/version`

**方法**: `GET`

**参数**:
- `current_version` (可选): 当前客户端版本号

**响应**:
```json
{
  "current_version": "1.7.0",
  "current_build": "17",
  "latest_version": "1.7.0",
  "latest_build": "17",
  "download_url": "https://example.com/download/latest",
  "release_notes": "修复了一些bug，提升了性能"
}
```

### 更新信息

**URL**: `/api/update_info`

**方法**: `GET`

**响应**:
```json
{
  "version": "1.7.0",
  "build": "17",
  "date": "2023-12-27",
  "changes": [
    "修复了聊天历史搜索功能",
    "优化了性能监控系统",
    "添加了定时消息发送功能"
  ],
  "download_url": "https://example.com/download/aigui_v1.7.0.exe",
  "size": "12345678"
}
```

## 配置说明

### worker.js 配置

修改 `worker.js` 文件中的版本信息和下载链接：

```javascript
// 当前版本信息
const VERSION_INFO = {
  version: "1.7.0",
  build: "17",
  download_url: "https://example.com/download/aigui_v1.7.0.exe",
  release_notes: "修复了一些bug，提升了性能"
};
```

### Cloudflare Workers KV (可选)

如果需要使用KV存储版本信息，可以创建KV命名空间并更新wrangler.toml：

```toml
[[kv_namespaces]]
binding = "VERSION_KV"
id = "your-kv-namespace-id"
```

然后在worker.js中使用KV存储：

```javascript
// 从KV获取版本信息
const versionInfo = await VERSION_KV.get("latest_version", { type: "json" });
```

## 客户端集成

客户端通过以下方式检查更新：

```python
# 示例代码：检查更新
def check_for_updates():
    response = requests.get("https://your-worker-url/api/version")
    if response.status_code == 200:
        version_info = response.json()
        # 比较版本号
        if version_info["latest_build"] > CURRENT_BUILD:
            # 有新版本可用
            show_update_dialog(version_info)
```

## 部署管理

### 查看日志
```bash
wrangler tail
```

### 本地开发
```bash
wrangler dev
```

## 版本控制策略

建议采用以下版本号格式：
- **主版本号**：重大功能更新或架构变更
- **次版本号**：新功能添加或较大改进
- **构建号**：修复bug或小的改进

例如：`1.7.0` (版本) / `17` (构建号)

## 安全建议

- 建议使用HTTPS保护API通信
- 考虑添加API密钥验证防止滥用
- 定期更新Cloudflare Workers运行时版本

## 故障排除

### 常见问题

1. **客户端无法连接更新服务器**
   - 检查worker.js中的路由配置
   - 确认Cloudflare Workers已正确部署
   - 检查DNS和防火墙设置

2. **版本检查返回错误**
   - 检查API响应格式是否正确
   - 确认版本号比较逻辑正确

## 许可证

GNU General Public License v3.0

## 联系方式

如有问题或建议，请通过以下方式联系：
- QQ群：1005431425
- GitHub：https://github.com/xiaohuihuib/AI-Chat-Update-Server
