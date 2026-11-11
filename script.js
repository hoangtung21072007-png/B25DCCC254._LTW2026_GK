const KEY = 'gk_devices';
const ROOMS = ['Lab 1', 'Lab 2', 'Lab 3'];
const TYPES = ['Máy tính', 'Máy chiếu', 'Thiết bị mạng'];
const SAMPLE = [
  { id: 1, name: 'Máy tính Dell OptiPlex 7090', room: 'Lab 1', type: 'Máy tính', year: 2021, broken: false },
  { id: 2, name: 'Máy chiếu Epson EB-X51', room: 'Lab 1', type: 'Máy chiếu', year: 2019, broken: true },
  { id: 3, name: 'Switch Cisco 24 cổng', room: 'Lab 2', type: 'Thiết bị mạng', year: 2020, broken: false },
  { id: 4, name: 'Máy tính HP ProDesk 400', room: 'Lab 2', type: 'Máy tính', year: 2018, broken: true },
  { id: 5, name: 'Router TP-Link Archer', room: 'Lab 3', type: 'Thiết bị mạng', year: 2022, broken: false },
  { id: 6, name: 'Máy chiếu Sony VPL-DX221', room: 'Lab 3', type: 'Máy chiếu', year: 2023, broken: false },
];

// ---------- Dữ liệu ----------
const load = () => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { /* bỏ qua */ }
  return SAMPLE.map((d) => ({ ...d }));
};
let devices = load();
const save = () => {
  try { localStorage.setItem(KEY, JSON.stringify(devices)); } catch (e) { /* bỏ qua */ }
};
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const options = (list, selected) => list.map((o) => `<option value="${o}"${o === selected ? ' selected' : ''}>${o}</option>`).join('');

const app = document.getElementById('app');
let query = '';
let roomFilter = 'Tất cả';

// ---------- Trang chủ ----------
const renderHome = () => {
  const total = devices.length;
  const broken = devices.reduce((n, d) => (d.broken ? n + 1 : n), 0);
  const rate = total === 0 ? 0 : Math.round(((total - broken) / total) * 100);
  app.innerHTML = `
    <section class="hero">
      <h1>Thiết bị phòng Lab</h1>
      <p>Theo dõi tình trạng máy tính, máy chiếu và thiết bị mạng của khoa.</p>
    </section>
    <section class="stats">
      <div class="stat">Tổng số thiết bị:<b>${total}</b></div>
      <div class="stat bad">Số thiết bị đang hỏng:<b>${broken}</b></div>
      <div class="stat ok">Tỉ lệ đang hoạt động:<b>${rate}%</b></div>
    </section>`;
};

// ---------- Danh sách ----------
const rowHtml = ({ id, name, room, type, year, broken }) => `
  <tr class="${broken ? 'broken' : ''}">
    <td><a href="#/devices/${id}">${esc(name)}</a></td>
    <td>${esc(room)}</td><td>${esc(type)}</td><td>${year}</td>
    <td><span class="tag">${broken ? 'Đang hỏng' : 'Hoạt động'}</span></td>
    <td>
      <button class="warn" data-act="toggle" data-id="${id}">${broken ? 'Đã sửa' : 'Báo hỏng'}</button>
      <button class="danger" data-act="delete" data-id="${id}">Xóa</button>
    </td>
  </tr>`;

const updateTable = () => {
  const q = query.trim().toLowerCase();
  const list = devices.filter((d) => d.name.toLowerCase().includes(q) && (roomFilter === 'Tất cả' || d.room === roomFilter));
  document.getElementById('count').textContent = `Tìm thấy ${list.length} thiết bị`;
  document.getElementById('result').innerHTML = list.length === 0
    ? '<div class="empty">Không có dữ liệu</div>'
    : `<table>
        <thead><tr><th>Tên thiết bị</th><th>Phòng</th><th>Loại</th><th>Năm mua</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody>${list.map(rowHtml).join('')}</tbody>
      </table>`;
};

const handleQueryShift = (e) => { query = e.target.value; updateTable(); };

const renderList = () => {
  app.innerHTML = `
    <h1>Danh sách thiết bị</h1>
    <div class="card">
      <div class="filters">
        <label for="search">Tìm kiếm</label>
        <input id="search" type="text" placeholder="Nhập tên thiết bị..." value="${esc(query)}" />
        <label for="roomFilter">Phòng</label>
        <select id="roomFilter">${options(['Tất cả', ...ROOMS], roomFilter)}</select>
      </div>
      <p class="count" id="count"></p>
      <div class="table-wrap" id="result"></div>
    </div>`;
  document.getElementById('search').addEventListener('input', handleQueryShift);
  document.getElementById('roomFilter').addEventListener('change', (e) => { roomFilter = e.target.value; updateTable(); });
  document.getElementById('result').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.act === 'delete') devices = devices.filter((d) => d.id !== id);
    else devices = devices.map((d) => (d.id === id ? { ...d, broken: !d.broken } : d));
    save();
    updateTable();
  });
  updateTable();
};

// ---------- Thêm mới ----------
const renderAdd = () => {
  app.innerHTML = `
    <h1>Thêm thiết bị</h1>
    <div class="card">
      <form id="addForm">
        <label for="name">Tên thiết bị</label>
        <input id="name" type="text" />
        <label for="room">Phòng</label>
        <select id="room">${options(ROOMS, ROOMS[0])}</select>
        <label for="type">Loại</label>
        <select id="type">${options(TYPES, TYPES[0])}</select>
        <label for="year">Năm mua</label>
        <input id="year" type="number" />
        <button type="submit">Thêm</button>
      </form>
      <p class="error" id="msg"></p>
    </div>`;
  document.getElementById('addForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const room = document.getElementById('room').value;
    const type = document.getElementById('type').value;
    const yearText = document.getElementById('year').value;
    const msg = document.getElementById('msg');
    if (!name || !room || !type || yearText === '') { msg.textContent = 'Vui lòng nhập đầy đủ thông tin'; return; }
    const year = Number(yearText);
    if (!Number.isInteger(year) || year < 2010 || year > 2026) { msg.textContent = 'Năm mua phải từ 2010 đến 2026'; return; }
    const id = devices.reduce((m, d) => Math.max(m, d.id), 0) + 1;
    devices = [...devices, { id, name, room, type, year, broken: false }];
    save();
    location.replace('#/devices'); // thay thế lịch sử: Back không quay lại form
  });
};

// ---------- Chi tiết ----------
const renderDetail = (idText) => {
  const d = devices.find((x) => x.id === Number(idText));
  if (!d) { app.innerHTML = '<div class="card"><p>Không tìm thấy thiết bị</p></div>'; return; }
  app.innerHTML = `
    <h1>Chi tiết thiết bị</h1>
    <div class="card detail">
      <p>Tên thiết bị: ${esc(d.name)}</p>
      <p>Phòng: ${esc(d.room)}</p>
      <p>Loại: ${esc(d.type)}</p>
      <p>Năm mua: ${d.year}</p>
      <p>Trạng thái: ${d.broken ? 'Đang hỏng' : 'Hoạt động'}</p>
      <button class="ghost" id="backBtn">Quay lại</button>
    </div>`;
  document.getElementById('backBtn').addEventListener('click', () => history.back());
};

// ---------- Router (hash) ----------
const render = () => {
  const path = location.hash.replace(/^#/, '') || '/';
  let active = '';
  if (path === '/') { active = 'home'; renderHome(); }
  else if (path === '/devices') { active = 'list'; renderList(); }
  else if (path === '/devices/new') { active = 'new'; renderAdd(); }
  else if (path.startsWith('/devices/')) { renderDetail(path.slice(9)); }
  else { app.innerHTML = '<div class="card"><p>Không tìm thấy trang</p></div>'; }
  document.querySelectorAll('#nav a').forEach((a) => a.classList.toggle('active', a.dataset.route === active));
};
window.addEventListener('hashchange', render);

// ---------- Trạng thái mạng ----------
const banner = document.getElementById('banner');
let hideTimer;
const showBar = (cls, text) => { banner.innerHTML = `<div class="bar ${cls}">${text}</div>`; };
window.addEventListener('offline', () => { clearTimeout(hideTimer); showBar('off', 'Mất kết nối mạng'); });
window.addEventListener('online', () => {
  showBar('on', 'Đã kết nối lại');
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => { banner.innerHTML = ''; }, 3000);
});
if (!navigator.onLine) showBar('off', 'Mất kết nối mạng');

render();
