# 物品过期提醒应用

## 项目描述

这是一个基于 Next.js 的物品过期提醒应用，帮助用户管理物品的过期时间。应用提供了物品添加、编辑、搜索、分类管理等功能，并支持多种主题切换。

## 特性

- 物品管理：添加、编辑、删除物品
- 过期提醒：自动检测即将过期和已过期的物品
- 搜索功能：支持按名称、分类、备注搜索
- 分类管理：支持自定义分类
- 主题切换：支持浅色/深色模式，以及多种颜色主题
- 响应式设计：适配各种设备尺寸

## 使用方法

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/expiry-reminder.git
cd expiry-reminder
```

### 2. 安装依赖

使用 npm 安装项目依赖：

```bash
npm install
```

### 3. 启动开发服务器

在开发模式下启动应用：

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 4. 构建生产版本

要构建生产版本，请运行：

```bash
npm run build
```

然后使用以下命令启动生产服务器：

```bash
npm start
```

### 5. 使用 Docker

如果你希望使用 Docker 来运行该项目，可以使用以下命令：

```bash
# 开发环境
docker-compose up app-dev

# 生产环境
docker-compose up app
```

这将启动应用并在 [http://localhost:3000](http://localhost:3000) 上提供服务。

## 技术栈

- Next.js 15
- React 18
- Tailwind CSS
- shadcn/ui
- next-themes
- date-fns
- React Hook Form
- Zod

## 贡献

欢迎任何形式的贡献！请提交问题或拉取请求。

## 许可证

该项目使用 MIT 许可证。有关详细信息，请查看 [LICENSE](LICENSE) 文件。