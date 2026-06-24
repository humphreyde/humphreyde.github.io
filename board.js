// Tron2 具身操作挑战赛 — 双阶段排行榜渲染。
// 第一阶段（仿真）按 Q1-Q3 主赛分排名；第二阶段（真机）按 L1-L4 总分排名。
// 数据契约见本文件底部注释与 data/leaderboard.json。
(function () {
  'use strict';

  var cfg = window.BOARD_CONFIG || {};
  var URL = cfg.BOARD_DATA_URL || './data/leaderboard.json';
  var REFRESH = (cfg.REFRESH_SECONDS || 60) * 1000;

  var currentTab = 'sim';
  var lastData = null;
  var countdownTimer = null;

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  // 单题小分单元格（满分已知，显示得分 + 占比微弱提示）
  function qcell(score, full) {
    if (score === null || score === undefined) {
      return '<td class="qcell"><span class="qd">—</span></td>';
    }
    return '<td class="qcell">' + score.toFixed(1) +
      '<span class="qd"> /' + full + '</span></td>';
  }

  // 主分单元格：数值 + 进度条（按满分归一化）
  function totalCell(score, full, cls) {
    if (score === null || score === undefined) {
      return '<td><span class="dimcell">未上场</span></td>';
    }
    var w = Math.max(2, Math.min(100, (score / full) * 100));
    return '<td><div class="swrap">' +
      '<span class="snum">' + score.toFixed(1) + '</span>' +
      '<span class="ssub">/' + full + '</span>' +
      '<span class="sbar"><i style="width:' + w + '%"></i></span></div></td>';
  }

  function rankCls(rank) {
    return rank <= 3 ? ' top' + rank : '';
  }

  // 第一阶段行：Q1 Q2 Q3 + 主赛分(Q1-Q3 /80)
  function simRow(r) {
    return '<tr class="brow' + rankCls(r.rank) + '">' +
      '<td class="c-rank">' + r.rank + '</td>' +
      '<td class="c-team">' + esc(r.team) + '</td>' +
      qcell(r.q1, 20) + qcell(r.q2, 25) + qcell(r.q3, 35) +
      totalCell(r.main_score, 80) +
      '</tr>';
  }

  // 第二阶段行：L1 L2 L3 L4 + 总分(/100)
  function realRow(r) {
    return '<tr class="brow' + rankCls(r.rank) + '">' +
      '<td class="c-rank">' + r.rank + '</td>' +
      '<td class="c-team">' + esc(r.team) + '</td>' +
      qcell(r.l1, 20) + qcell(r.l2, 25) + qcell(r.l3, 30) + qcell(r.l4, 25) +
      totalCell(r.total, 100) +
      '</tr>';
  }

  function renderBoard() {
    var data = lastData;
    var simTable = document.getElementById('board-sim');
    var realTable = document.getElementById('board-real');
    var empty = document.getElementById('board-empty');
    var hint = document.getElementById('board-hint');

    var showSim = currentTab === 'sim';
    simTable.hidden = !showSim;
    realTable.hidden = showSim;

    if (!data) return;

    var rows = showSim ? (data.sim || []) : (data.real || []);
    var tbody = (showSim ? simTable : realTable).querySelector('tbody');
    var rowFn = showSim ? simRow : realRow;

    if (!rows.length) {
      tbody.innerHTML = '';
      (showSim ? simTable : realTable).hidden = true;
      empty.hidden = false;
      empty.textContent = showSim ? '第一阶段暂无成绩' : '第二阶段尚未开始或暂无成绩';
    } else {
      tbody.innerHTML = rows.map(rowFn).join('');
      empty.hidden = true;
    }

    if (hint) {
      hint.textContent = showSim
        ? '按 Q1-Q3 主赛分（/80）排名，筛选 Top N'
        : '按 L1-L4 总分（/100）独立排名';
    }
  }

  function renderMeta(data) {
    var updated = document.getElementById('updated');
    if (updated) updated.textContent = '更新于 ' + (data.generated_at || '—');
    renderCountdown(data.deadline);
  }

  function renderCountdown(deadline) {
    var el = document.getElementById('countdown');
    if (!el) return;
    if (!deadline) { el.textContent = '待公布'; return; }
    var end = new Date(deadline).getTime();
    function tick() {
      var ms = end - Date.now();
      if (ms <= 0) {
        el.textContent = '已截止 · 榜单冻结为最终成绩';
        el.classList.add('over');
        if (countdownTimer) clearInterval(countdownTimer);
        return;
      }
      var s = Math.floor(ms / 1000);
      var d = Math.floor(s / 86400);
      var pad = function (n) { return String(n).padStart(2, '0'); };
      el.textContent = d + ' 天 ' + pad(Math.floor(s % 86400 / 3600)) +
        ':' + pad(Math.floor(s % 3600 / 60)) + ':' + pad(s % 60);
    }
    if (countdownTimer) clearInterval(countdownTimer);
    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  function load() {
    fetch(URL, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        lastData = data;
        renderMeta(data);
        renderBoard();
      })
      .catch(function (e) {
        var updated = document.getElementById('updated');
        if (updated) updated.textContent = '榜单数据加载失败（' + e.message + '）';
        var empty = document.getElementById('board-empty');
        if (empty) { empty.hidden = false; empty.textContent = '榜单数据暂不可用'; }
      });
  }

  function initTabs() {
    var tabs = document.querySelectorAll('.board-tab');
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.classList.remove('active'); });
        t.classList.add('active');
        currentTab = t.getAttribute('data-tab');
        renderBoard();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTabs();
    load();
    setInterval(load, REFRESH);
  });
})();

/* ───────── 数据契约 data/leaderboard.json ─────────
{
  "generated_at": "2026-06-23 12:00:00",   // 榜单生成时间（展示用）
  "deadline": "2026-07-15T16:00:00Z",       // 第一阶段提交截止（ISO8601，倒计时用）
  "sim": [                                   // 第一阶段，已按 main_score 降序、附 rank
    {
      "rank": 1, "team": "队伍名",
      "q1": 18.0, "q2": 22.5, "q3": 30.0,    // 各题得分，可为 null（未评测）
      "main_score": 70.5,                     // Q1-Q3 主赛分 /80，用于排名
      "q4_sim": 12.0                          // 可选：Q4 仿真分，展示用
    }
  ],
  "real": [                                  // 第二阶段，已按 total 降序、附 rank
    {
      "rank": 1, "team": "队伍名",
      "l1": 16.0, "l2": 20.0, "l3": 24.0, "l4": 18.0,  // 各题得分，可为 null
      "total": 78.0                           // L1-L4 总分 /100，用于排名
    }
  ]
}
排名与 rank 字段由服务器评测脚本计算后写入，前端只负责渲染。
*/
