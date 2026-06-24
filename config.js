// 排行榜数据源配置。
// 默认读同站静态文件（由服务器评测脚本生成后推到 Pages 仓库 data/ 下）；
// 联调时可改为后端直连，如 "http://<backend-host>:8080/api/leaderboard.json"
// （注意：https 页面直连 http 后端会被浏览器混合内容策略拦截，生产读路径走静态文件）。
window.BOARD_CONFIG = {
  BOARD_DATA_URL: './data/leaderboard.json',
  REFRESH_SECONDS: 60,
};
