# humphreyde.github.io

Tron2 具身操作挑战赛官网（GitHub 用户站点）。零构建：原生 HTML / CSS / JS，根目录内容直接发布到 <https://humphreyde.github.io/>。

## 结构

```
.
├── index.html          # 主页面：概览 + 第一阶段 Q1-Q4 + 第二阶段 L1-L4 + 评分 + 提交 + 排行榜
├── style.css           # 设计系统（暗色控制台；仿真=青色 / 真机=金橙）
├── config.js           # 榜单数据源配置（URL + 刷新间隔）
├── board.js            # 排行榜渲染 + 倒计时 + 双榜切换
├── data/
│   └── leaderboard.json  # 榜单数据（服务器评测脚本生成后覆盖此文件）
└── .nojekyll           # 禁用 Jekyll，保证 data/ 等目录原样发布
```

## 本地预览

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

> 必须用 HTTP server，不能 `file://` 双击 —— `board.js` 用 `fetch()` 读 JSON，`file://` 会被 CORS 拦截。

## 更新排行榜

前端默认每 60s 拉取 `data/leaderboard.json`。更新成绩只需用评测脚本生成新 JSON 覆盖该文件并推送：

```bash
cp <生成的>.json data/leaderboard.json
git add data/leaderboard.json
git commit -m "data(board): update leaderboard"
git push    # 推到 master，约 1 分钟后线上生效
```

数据契约见 `board.js` 底部注释。关键字段：

- `sim[]`：第一阶段，含 `q1/q2/q3` 各题分、`main_score`（Q1-Q3 /80，排名依据）、可选 `q4_sim`。
- `real[]`：第二阶段，含 `l1/l2/l3/l4` 各题分、`total`（/100，排名依据）。
- `rank` 由评测脚本算好写入，前端只渲染不排序；各题分可为 `null`。
- `deadline`：第一阶段截止（ISO8601），用于 Hero 倒计时。

## 部署

用户站点仓库，根目录即发布源，**无需 GitHub Actions**。在仓库 Settings → Pages 确认 Source 为 **Deploy from a branch**、分支 `master`、目录 `/ (root)` 即可。push 后约 1 分钟生效。

## 待补充

- 配图：Tron2 机器人渲染图、各任务截图、示例 rollout 视频（放 `assets/`，在 `index.html` 引用）。
- 页脚规则文档链接当前为 LimX/RoboTwin 占位 URL，待规则文档发布后替换。
- `deadline`、Top N 的 N 值等参数待主办方确认后填入。
