/* 상견례 소개 리플렛 만들기 — 질문 하나씩 → A4 3단 리플렛 (전부 이 브라우저 안에서 처리, 서버 전송 없음) */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const YEAR = new Date().getFullYear();
const LS = 'sgl_state_v1';

/* ---------- 상태 ---------- */
const DEF = () => ({
  step: 0,
  groom: { name: '', en: '', birth: '', mbti: '', pos: '', pts: ['', '', ''], look: '' },
  bride: { name: '', en: '', birth: '', mbti: '', pos: '', pts: ['', '', ''], look: '' },
  story: ['', '', '', ''],
  why: { g: '', b: '' },
  fam: { g: [], b: [] },
  sched: { meet: { date: '', time: '', place: '' }, wed: { date: '', time: '', place: '' } },
  faceMode: '',
  pick: {},
  p3: '',
  quiz: { sel: [0, 1, 3, 7, 9], custom: [], bonusOn: true, bonus: ['', ''] },
  coupon: true,
  kidStyle: 'char',
  slots: ['', '', ''],
  cover: '',
  coverMsg: '두 가족의 사랑 속에서\n행복하고 예쁘게 살아가겠습니다',
  together: '앞으로도 지금처럼 서로를 아끼며\n예쁘게 살겠습니다.',
  thanks: '',
});
let S = DEF();
const IMG = {};            // key → dataURL (IndexedDB에 보관)
try { const raw = localStorage.getItem(LS); if (raw) S = Object.assign(DEF(), JSON.parse(raw)); } catch (e) {}
let saveT;
const save = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) {} }, 300); };

/* IndexedDB (그림·사진) */
let DB = null;
const dbOpen = () => new Promise(res => {
  try {
    const r = indexedDB.open('sgl', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('img');
    r.onsuccess = () => { DB = r.result; res(); };
    r.onerror = () => res();
  } catch (e) { res(); }
});
const dbAll = () => new Promise(res => {
  if (!DB) return res();
  try {
    const tx = DB.transaction('img'); const st = tx.objectStore('img');
    const rq = st.openCursor();
    rq.onsuccess = () => { const c = rq.result; if (c) { IMG[c.key] = c.value; c.continue(); } else res(); };
    rq.onerror = () => res();
  } catch (e) { res(); }
});
const putImg = (k, v) => { IMG[k] = v; try { DB && DB.transaction('img', 'readwrite').objectStore('img').put(v, k); } catch (e) {} };
const delImg = k => { delete IMG[k]; try { DB && DB.transaction('img', 'readwrite').objectStore('img').delete(k); } catch (e) {} };
const clearImgs = () => { for (const k in IMG) delete IMG[k]; try { DB && DB.transaction('img', 'readwrite').objectStore('img').clear(); } catch (e) {} };

const getP = p => p.split('.').reduce((o, k) => o?.[k], S);
const setP = (p, v) => { const ks = p.split('.'); let o = S; ks.slice(0, -1).forEach(k => o = o[k]); o[ks.at(-1)] = v; save(); };

/* ---------- 공통 ---------- */
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2200); };
const ICON = {
  pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="7.5" cy="7.5" r="3.5"/><circle cx="16.5" cy="7.5" r="3.5"/><circle cx="7.5" cy="16.5" r="3.5"/><circle cx="16.5" cy="16.5" r="3.5"/></svg>',
  cam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  txt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M9 10h6M12 10v5"/></svg>',
  blank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-dasharray="3 2.5"><circle cx="12" cy="12" r="8.5"/></svg>',
  quiz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.6 2.3c-.8.4-1.2 1-1.2 1.8"/><path d="M12 16.5h.01"/></svg>',
  pics: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 16l5-5 4 4 2-2 5 5"/><circle cx="15.5" cy="8.5" r="1.5"/></svg>',
  baby: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M9 14.5c1.6 1.4 4.4 1.4 6 0"/><path d="M9.5 10h.01M14.5 10h.01"/><path d="M12 3.5c-1 1.5 0 2.5 1 2.5"/></svg>',
  none: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M8.5 15.5l7-7"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/></svg>',
  dl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/></svg>',
  ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v6H4V6h6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
  gift: '<svg viewBox="0 0 24 24" fill="none" stroke="#c7808d" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9" width="18" height="12" rx="1.5"/><path d="M3 13h18M12 9v12"/><path d="M12 9c-1.5-3-5-4-5.5-2S9 9 12 9zm0 0c1.5-3 5-4 5.5-2S15 9 12 9z"/></svg>',
  ring: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="19" cy="28" r="11"/><circle cx="29" cy="28" r="11"/><path d="M24 6l3 4h-6z" fill="currentColor"/></svg>',
};
const field = (label, inner, opt) => `<div class="field"><label>${label}${opt ? '<em>선택</em>' : ''}</label>${inner}</div>`;
const inp = (k, ph, type = 'text', extra = '') => `<input class="inp" data-k="${k}" type="${type}" placeholder="${esc(ph)}" value="${esc(getP(k))}" ${extra}>`;
const area = (k, ph, rows = 3, max = 0) => `<textarea class="inp" data-k="${k}" rows="${rows}" placeholder="${esc(ph)}" ${max ? `data-max="${max}"` : ''}>${esc(getP(k))}</textarea>${max ? `<div class="counter" data-for="${k}"></div>` : ''}`;
const opt = (grp, val, ic, title, sub, tag) => `<button class="opt ${getP(grp) === val ? 'on' : ''}" data-opt="${grp}" data-val="${val}"><span class="ic">${ic}</span><span><b>${title}${tag ? `<i class="tag">${tag}</i>` : ''}</b><span>${sub}</span></span></button>`;

const gName = () => S.groom.name || '신랑';
const bName = () => S.bride.name || '신부';
const short = n => { n = (n || '').trim(); return n.length >= 3 ? n.slice(1) : n; };
const isPet = m => m.rel === '반려동물';
const MALE = ['아버지', '할아버지', '형', '오빠', '남동생', '삼촌', '외삼촌', '형부', '매형', '새언니의 남편'];
const FEMALE = ['어머니', '할머니', '누나', '언니', '여동생', '이모', '고모', '새언니', '형수', '올케'];
const sexOf = rel => MALE.includes(rel) ? '남성' : FEMALE.includes(rel) ? '여성' : '';
const ageWord = y => { y = +y; if (!y) return ''; const a = YEAR - y; if (a < 10) return '아이'; const d = Math.floor(a / 10) * 10; const r = a % 10; return `${d}대 ${r <= 3 ? '초반' : r <= 6 ? '중반' : '후반'}`; };
const OUTFIT = [
  [/의사|한의사|치과/, '흰 가운'], [/간호/, '단정한 간호복'], [/약사/, '흰 가운'], [/교사|선생|교수|강사/, '단정한 니트 카디건에 셔츠'],
  [/셰프|요리|조리/, '셰프복'], [/경찰/, '단정한 셔츠와 넥타이'], [/군인|장교/, '단정한 셔츠'], [/디자이너|작가|예술/, '세련된 니트'],
  [/개발|엔지니어|IT|연구/, '깔끔한 셔츠에 니트'], [/주부/, '부드러운 니트 카디건'], [/학생/, '캐주얼한 맨투맨'],
  [/퇴직|은퇴/, '편안한 카디건'], [/농|어업/, '편안한 셔츠'], [/자영업|사장|대표|사업/, '단정한 재킷에 셔츠'],
  [/공무원|공기업|회사|과장|대리|부장|차장|사원|팀장|은행|금융/, '단정한 정장에 셔츠'], [/합창|성악|음악/, '단정한 블라우스'],
];
const outfitOf = job => { for (const [r, o] of OUTFIT) if (r.test(job || '')) return o; return '단정한 셔츠나 니트'; };

/* ---------- 날짜 ---------- */
const WD = ['일', '월', '화', '수', '목', '금', '토'];
const fmtDay = (d, t) => {
  if (!d) return '';
  const [y, m, dd] = d.split('-').map(Number); const w = WD[new Date(y, m - 1, dd).getDay()];
  let s = `${y}년 ${m}월 ${dd}일 ${w}요일`;
  if (t) { const [h, mi] = t.split(':').map(Number); s += ` ${h < 12 ? '오전' : '오후'} ${h % 12 || 12}시${mi ? ` ${mi}분` : ''}`; }
  return s;
};
const fmtBirth = d => d ? d.split('-').join('. ') : '';
const fmtDot = d => d ? d.split('-').join(' . ') : '';

/* ---------- 퀴즈 ---------- */
const QBANK = [
  '두 사람은 어떻게 처음 만났을까요?', '먼저 연락한 사람은 누구일까요?', '처음 만난 날 함께 먹은 음식은?',
  '함께한 지 몇 년째일까요?', '결혼 이야기를 먼저 꺼낸 사람은?', '둘이 처음 함께 간 여행지는?',
  '다투면 먼저 사과하는 사람은?', '신랑이 요즘 가장 빠져 있는 취미는?', '신부가 제일 좋아하는 음식은?',
  '신부가 꼽은 신랑의 가장 큰 매력은?', '신랑이 꼽은 신부의 가장 큰 매력은?', '프러포즈는 어디에서 했을까요?', '신혼여행지는 어디일까요?',
];
const quizList = () => [...S.quiz.sel.map(i => QBANK[i]), ...S.quiz.custom.filter(Boolean)];
const bonusDefault = () => [`예비 사위가 · 장인어른이 즐겨 보시는 TV는?`, `예비 며느리가 · 시어머님의 취미 두 가지는?`];
const COUPONS = [
  ['FAMILY TRIP', '가족 여행<br>모시기권', '가고 싶으신 곳을 말씀만 해 주세요.<br>저희가 계획부터 운전까지 모실게요.'],
  ['DINNER', '맛있는 식사<br>대접권', '드시고 싶은 메뉴로 한 끼 모실게요.'],
  ['MASSAGE', '어깨 안마<br>30분권', '언제든 불러 주세요.'],
  ['PHOTO', '가족사진<br>촬영권', '예쁜 사진 남겨 드릴게요.'],
  ['FLOWER', '꽃다발<br>배달권', '원하시는 날 꽃을 들고 찾아갈게요.'],
  ['DRIVER', '하루 운전기사<br>모시기권', '어디든 모셔다 드릴게요.'],
  ['ANYTHING', '소원<br>들어드리기권', '무엇이든 한 가지, 말씀만 하세요.'],
];

/* ---------- 그림 처리 (브라우저 안에서) ---------- */
const readFile = f => new Promise((res, rej) => { const u = URL.createObjectURL(f); const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = u; });
const scaled = (im, max) => { const r = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)); const c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * r); c.height = Math.round(im.naturalHeight * r); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); return c; };
const photoURL = async f => scaled(await readFile(f), 1400).toDataURL('image/jpeg', 0.88);

function transparentize(c) {
  const ctx = c.getContext('2d'); const W = c.width, H = c.height;
  const id = ctx.getImageData(0, 0, W, H); const d = id.data;
  const light = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) { const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2]; light[i] = Math.min(r, g, b) >= 225 ? 1 : 0; }
  // 아래쪽이 잘린 옷 사이로 배경 지우기가 새지 않게 막는다
  let yb = -1;
  for (let y = H - 1; y >= 0 && yb < 0; y--) for (let x = 0; x < W; x++) if (!light[y * W + x]) { yb = y; break; }
  if (yb >= 0) {
    let x0 = W, x1 = -1;
    for (let y = Math.max(0, yb - 12); y <= yb; y++) for (let x = 0; x < W; x++) if (!light[y * W + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; }
    for (let y = Math.max(0, yb - 4); y <= Math.min(H - 1, yb + 1); y++) for (let x = x0; x <= x1; x++) light[y * W + x] = 0;
  }
  const seen = new Uint8Array(W * H); const st = [];
  const push = (x, y) => { const i = y * W + x; if (light[i] && !seen[i]) { seen[i] = 1; st.push(i); } };
  for (let x = 0; x < W; x += 2) push(x, 0);
  for (let y = 0; y < H; y += 2) { push(0, y); push(W - 1, y); }
  while (st.length) { const i = st.pop(); const x = i % W, y = (i / W) | 0; if (x > 0) push(x - 1, y); if (x < W - 1) push(x + 1, y); if (y > 0) push(x, y - 1); if (y < H - 1) push(x, y + 1); }
  for (let i = 0; i < W * H; i++) if (seen[i]) d[i * 4 + 3] = 0;
  ctx.putImageData(id, 0, 0); return c;
}
const fit = (c, max) => { if (Math.max(c.width, c.height) <= max) return c; const r = max / Math.max(c.width, c.height); const o = document.createElement('canvas'); o.width = Math.round(c.width * r); o.height = Math.round(c.height * r); o.getContext('2d').drawImage(c, 0, 0, o.width, o.height); return o; };

async function splitPeople(file, n) {
  const src = scaled(await readFile(file), 1600); const W = src.width, H = src.height;
  const d = src.getContext('2d').getImageData(0, 0, W, H).data;
  const ink = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) ink[i] = Math.min(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]) < 225 ? 1 : 0;
  if (n === 0) {
    let x0 = W, x1 = 0, y0 = H, y1 = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (ink[y * W + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    const p = 12; x0 = Math.max(0, x0 - p); y0 = Math.max(0, y0 - p); x1 = Math.min(W, x1 + p); y1 = Math.min(H, y1 + p);
    const c = document.createElement('canvas'); c.width = x1 - x0; c.height = y1 - y0;
    c.getContext('2d').drawImage(src, -x0, -y0);
    return [fit(transparentize(c), 1400).toDataURL('image/png')];
  }
  const th = Math.max(3, H * 0.003);
  const col = new Array(W).fill(0);
  for (let x = 0; x < W; x++) { let s = 0; for (let y = 0; y < H; y++) s += ink[y * W + x]; col[x] = s > th; }
  let segs = []; let s0 = -1;
  for (let x = 0; x < W; x++) { if (col[x] && s0 < 0) s0 = x; if (!col[x] && s0 >= 0) { segs.push([s0, x]); s0 = -1; } }
  if (s0 >= 0) segs.push([s0, W]);
  segs = segs.filter(s => s[1] - s[0] > W * 0.01);
  while (segs.length > n) {
    let bi = 0, bg = 1e9; for (let i = 0; i < segs.length - 1; i++) { const g = segs[i + 1][0] - segs[i][1]; if (g < bg) { bg = g; bi = i; } }
    segs[bi] = [segs[bi][0], segs[bi + 1][1]]; segs.splice(bi + 1, 1);
  }
  if (segs.length < n) { // 붙어 있으면 균등 분할
    const a = segs.length ? segs[0][0] : 0, b = segs.length ? segs.at(-1)[1] : W; const w = (b - a) / n;
    segs = Array.from({ length: n }, (_, i) => [Math.round(a + w * i), Math.round(a + w * (i + 1))]);
  }
  return segs.map(([x0, x1]) => {
    let y0 = H, y1 = 0;
    for (let y = 0; y < H; y++) for (let x = x0; x < x1; x++) if (ink[y * W + x]) { if (y < y0) y0 = y; if (y > y1) y1 = y; break; }
    const w = x1 - x0, h = y1 - y0; const side = Math.round(Math.max(w, h) * 1.08); const cx = (x0 + x1) / 2;
    const bx = Math.round(cx - side / 2), by = Math.round(y1 - side + side * 0.02);
    const c = document.createElement('canvas'); c.width = c.height = side; const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, side, side);
    g.save(); g.beginPath(); g.rect(x0 - bx, 0, w, side); g.clip(); g.drawImage(src, -bx, -by); g.restore();
    return fit(transparentize(c), 720).toDataURL('image/png');
  });
}

/* ---------- 캐릭터 프롬프트 ---------- */
const STYLE_LOCK = `첨부한 첫 번째 그림(그림체 기준)과 똑같은 그림체로 그려 줘. 굵은 검정 손그림 외곽선, 평면 채색, 흰자 없는 작은 점눈 두 개, 분홍 볼터치, 귀엽고 단정한 웹툰 느낌. 실사 느낌은 빼고, 사진 속 인물의 헤어스타일·머리색·얼굴형·안경 같은 인상만 참고해 줘.`;
const LAYOUT = n => `${n}명을 왼쪽부터 순서대로 나란히, 각자 따로 잘라 쓸 수 있게 사람 사이 간격을 넉넉히 두고 가슴 위 상반신 정면, 부드러운 미소로 그려 줘. 배경은 완전한 흰색 단색, 글자·소품·그림자 없음. 가로 3:2.`;
const descPerson = (i, p) => {
  const bits = [];
  bits.push(`${['①', '②', '③', '④'][i]} ${p.rel}${p.sex ? `(${p.sex}` : ''}${p.age ? `${p.sex ? ', ' : '('}${p.age}` : ''}${p.sex || p.age ? ')' : ''}`);
  if (p.job) bits.push(`직업은 ${p.job}`);
  if (p.look) bits.push(`특징: ${p.look}`);
  bits.push(`복장은 ${p.outfit}`);
  return bits.join(', ') + '.';
};
function charGroups() {
  const G = [];
  const couple = [
    { key: 'face:groom', label: gName(), rel: '신랑', sex: '남성', age: ageWord(S.groom.birth?.slice(0, 4)), look: S.groom.look, outfit: '네이비 니트에 흰 셔츠 깃' },
    { key: 'face:bride', label: bName(), rel: '신부', sex: '여성', age: ageWord(S.bride.birth?.slice(0, 4)), look: S.bride.look, outfit: '아이보리 블라우스' },
  ];
  G.push({ id: 'couple', title: '우리 둘', people: couple });
  for (const side of ['g', 'b']) {
    const ms = S.fam[side].filter(m => !isPet(m)).map(m => ({ key: 'face:' + m.id, label: m.name || m.rel, rel: m.rel, sex: sexOf(m.rel), age: ageWord(m.year), job: m.job, look: m.look, outfit: outfitOf(m.job) }));
    for (let i = 0; i < ms.length; i += 3) G.push({ id: side + 'f' + i, title: `${side === 'g' ? '신랑' : '신부'} 가족${ms.length > 3 ? ` ${i / 3 + 1}` : ''}`, people: ms.slice(i, i + 3) });
  }
  const pets = [...S.fam.g, ...S.fam.b].filter(isPet);
  pets.forEach(m => G.push({ id: 'pet' + m.id, title: `반려동물 ${m.name || ''}`, pet: true, people: [{ key: 'face:' + m.id, label: m.name || '반려동물', breed: m.job, look: m.look }] }));
  return G;
}
function promptFor(g, first) {
  if (g.pet) {
    const p = g.people[0];
    return `${first ? STYLE_LOCK + '\n\n' : '같은 그림체 그대로.\n'}첨부 사진 속 반려동물 '${p.label}'을(를) 그려 줘.${p.breed ? ` ${p.breed}.` : ''}${p.look ? ` 특징: ${p.look}.` : ''} 털색과 모양은 사진을 따라 줘. 정면을 보고 앉은 귀여운 모습, 머리와 가슴 위주로 화면 가운데 크게. 배경 완전한 흰색 단색, 글자·그림자 없음. 정사각형 1:1.`;
  }
  const head = first ? STYLE_LOCK + '\n\n' : '좋아! 같은 그림체·선 굵기·점눈·흰 배경 그대로.\n';
  const who = g.id === 'couple'
    ? `이번 그림은 결혼을 앞둔 커플이야. 첨부 사진 순서대로:`
    : `다음은 ${g.title}이야. 첨부 사진 순서대로:`;
  return `${head}${who}\n${g.people.map((p, i) => descPerson(i, p)).join('\n')}\n${LAYOUT(g.people.length)}`;
}
const coverPrompt = () => `같은 그림체 그대로, 맨 처음 그린 커플이 결혼식 복장으로 나란히 서서 손을 잡고 수줍게 웃는 전신 그림. 신랑은 검정 턱시도에 나비넥타이, 신부는 단정한 흰 웨딩드레스에 짧은 베일과 작은 부케. 머리 모양은 처음 그림과 똑같이. 두 사람 뒤로 연노랑·연분홍 작은 꽃이 달린 둥근 아치를 은은하게. 배경 완전한 흰색 단색, 글자·그림자 없음. 세로 4:5.`;
const coverPromptSolo = () => `${STYLE_LOCK}\n\n첨부한 커플 사진 속 두 사람(왼쪽 신랑, 오른쪽 신부)이 결혼식 복장으로 나란히 서서 손을 잡고 수줍게 웃는 전신 그림. 신랑은 검정 턱시도에 나비넥타이, 신부는 흰 웨딩드레스에 짧은 베일과 작은 부케. 두 사람 뒤로 연노랑·연분홍 작은 꽃이 달린 둥근 아치를 은은하게. 배경 완전한 흰색 단색, 글자·그림자 없음. 세로 4:5.`;
const kidPrompt = () => S.kidStyle === 'real'
  ? `첨부한 사진은 결혼을 앞둔 우리 커플이야(왼쪽 남자, 오른쪽 여자). 상견례 소개 리플렛의 '재미로 보는 2세 얼굴' 칸에 넣으려고 해. 두 사람의 얼굴 특징을 반반 섞어 닮은 5살쯤 한국인 아이 두 명을 실사 사진처럼 만들어 줘: 왼쪽 아들, 오른쪽 딸. 가로 3:2 한 장을 정확히 반으로 나눈 두 칸짜리 증명사진 느낌, 각각 정면 어깨 위 상반신, 같은 크기, 부드러운 자연광, 따뜻한 연한 베이지 단색 배경. 옷에 로고·글자 없음, 테두리 없음.`
  : `${S.faceMode === 'char' ? '같은 그림체 그대로. 맨 처음 그린 커플의 아이들을 그려 줘.' : STYLE_LOCK + '\n\n첨부한 커플 사진 속 두 사람(왼쪽 신랑, 오른쪽 신부)의 아이들을 그려 줘.'} 둘 다 5살쯤, 아빠·엄마를 반반 닮게. 왼쪽 아들(줄무늬 티셔츠), 오른쪽 딸(카라 원피스). 따로 잘라 쓸 수 있게 간격을 넉넉히, 가슴 위 상반신 정면, 웃는 얼굴. 배경 완전한 흰색 단색, 글자 없음. 가로 3:2.`;

/* ---------- 인스타·네이버·카카오 앱 안 브라우저 ---------- */
const UA = navigator.userAgent || '';
const IN_APP = /Instagram|FBAN|FBAV|NAVER\(inapp|KAKAOTALK|Line\/|DaumApps|everytimeApp|Threads/i.test(UA);
const IS_ANDROID = /Android/i.test(UA);
const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(UA) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(UA));
const HERE = location.href.split('#')[0];
// 카카오톡(iOS·안드로이드)은 외부 브라우저로 바로 넘길 수 있다
if (/KAKAOTALK/i.test(UA) && !sessionStorage.getItem('sgl_ext')) { try { sessionStorage.setItem('sgl_ext', '1'); } catch (e) {} location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(HERE); }
function inAppNotice(done) {
  if (!IN_APP) return '';
  const app = /Instagram/i.test(UA) ? '인스타그램' : /NAVER/i.test(UA) ? '네이버' : /KAKAOTALK/i.test(UA) ? '카카오톡' : /Threads/i.test(UA) ? '스레드' : '앱';
  const how = IS_ANDROID ? '아래 버튼을 누르면 크롬에서 열려요.' : `오른쪽 위 <b>⋯</b> 버튼 → <b>‘외부 브라우저로 열기’</b> 또는 <b>‘Safari로 열기’</b>를 눌러 주세요.`;
  return `<div class="inapp"><b>${done ? 'PDF 저장은 ' : ''}${app} 앱 안에서는 ${done ? '안 될 수 있어요' : 'PDF 저장이 안 될 수 있어요'}</b>
    <p>${done ? '지금까지 만든 내용은 이 앱 안에만 저장돼 있어요. ‘작업 파일 저장’ 후 Safari·크롬에서 불러오거나, ' : '시작하기 전에 '}${how}</p>
    <div class="acts">${IS_ANDROID ? `<a class="btn2 dark" href="intent://${HERE.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end">크롬으로 열기</a>` : ''}<button class="btn2" data-copylink>링크 복사</button></div></div>`;
}
function bindInApp() { $$('[data-copylink]').forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(HERE.split('?')[0]); } catch (e) {} toast('링크를 복사했어요. Safari나 크롬 주소창에 붙여 넣어 주세요'); }); }
async function shareLink() {
  const url = HERE.split('?')[0] + '?from=share';
  const data = { title: '상견례 소개 리플렛 만들기', text: '질문에 답하면 상견례 소개 리플렛이 완성돼요 (무료)', url };
  try { if (navigator.share) { await navigator.share(data); return; } } catch (e) { return; }
  try { await navigator.clipboard.writeText(url); toast('링크를 복사했어요'); } catch (e) { toast(url); }
}

/* ---------- 미리 그린 캐릭터 ---------- */
const LIB = {
  dad: ['dad1', 'dad2', 'dad3', 'dad4'], mom: ['mom1', 'mom2', 'mom3', 'mom4'],
  man: ['man1', 'man2', 'man3', 'man4'], woman: ['woman1', 'woman2', 'woman3', 'woman4'],
  grandpa: ['grandpa1', 'grandpa2'], grandma: ['grandma1', 'grandma2'],
  pet: ['pet_poodle', 'pet_maltese', 'pet_jindo', 'pet_cheese', 'pet_tabby'],
};
const LIBNAME = { dad: '아버지', mom: '어머니', man: '젊은 남성', woman: '젊은 여성', grandpa: '할아버지', grandma: '할머니', pet: '반려동물' };
const charSrc = id => `img/chars/${id || 'man1'}.webp`;
const catOf = rel => {
  if (rel === '아버지') return 'dad'; if (rel === '어머니') return 'mom';
  if (rel === '할아버지') return 'grandpa'; if (rel === '할머니') return 'grandma'; if (rel === '반려동물') return 'pet';
  if (rel === '신랑') return 'man'; if (rel === '신부') return 'woman';
  return sexOf(rel) === '여성' ? 'woman' : 'man';
};
function people() {
  const P = [
    { key: 'face:groom', rel: '신랑', title: `신랑 ${gName()}`, sub: '', bg: 'var(--groom)' },
    { key: 'face:bride', rel: '신부', title: `신부 ${bName()}`, sub: '', bg: 'var(--bride)' },
  ];
  for (const side of ['g', 'b']) S.fam[side].forEach(m => P.push({ key: 'face:' + m.id, rel: m.rel, breed: m.job, title: `${m.rel} ${m.name}`, sub: `${side === 'g' ? '신랑' : '신부'} 가족`, bg: isPet(m) ? '#fdf3cc' : side === 'g' ? 'var(--groom)' : 'var(--bride)' }));
  return P;
}
function ensurePicks() {
  S.pick = S.pick || {};
  const used = new Set(Object.values(S.pick));
  for (const p of people()) {
    if (S.pick[p.key]) continue;
    const list = LIB[catOf(p.rel)];
    let id = list.find(x => !used.has(x)) || list[0];
    if (p.rel === '반려동물') {
      const k = p.breed || '';
      id = /푸들/.test(k) ? 'pet_poodle' : /말티|비숑|흰/.test(k) ? 'pet_maltese' : /진돗|시바|백구|누렁|강아지|개/.test(k) ? 'pet_jindo'
        : /고등어|회색|줄무늬/.test(k) ? 'pet_tabby' : /고양이|냥|치즈|코숏|코리안/.test(k) ? 'pet_cheese' : id;
    }
    S.pick[p.key] = id; used.add(id);
  }
  save();
}
function pickSheet(key) {
  const p = people().find(x => x.key === key); const cat = catOf(p.rel);
  const bg = document.createElement('div'); bg.className = 'sheetbg';
  const grid = ids => `<div class="pgrid">${ids.map(id => `<button class="${S.pick[key] === id ? 'on' : ''}" data-id="${id}" style="background:${p.bg}"><img src="${charSrc(id)}" alt=""></button>`).join('')}</div>`;
  bg.innerHTML = `<div class="sheet-m"><h2>${esc(p.title)}</h2>
    <p class="pglab">${LIBNAME[cat]}</p>${grid(LIB[cat])}
    <p class="pglab">다른 캐릭터</p>${grid(Object.keys(LIB).filter(k => k !== cat).flatMap(k => LIB[k]))}</div>`;
  $$('[data-id]', bg).forEach(b => b.onclick = () => { S.pick[key] = b.dataset.id; save(); bg.remove(); go(S.step); });
  bg.onclick = e => { if (e.target === bg) bg.remove(); };
  document.body.appendChild(bg);
}

/* ---------- 키트 카드 ---------- */
function kitCard(id, step, title, sub, prompt, keys, labels, n) {
  const done = keys.every(k => IMG[k]);
  return `<div class="kit" data-kit="${id}">
    <div class="st">${step}</div>
    <h3>${title}${done ? `<span class="done-badge">${ICON.check.replace('stroke-width="3"', 'stroke-width="3" width="14" height="14"')}완료</span>` : ''}</h3>
    <p>${sub}</p>
    <pre>${esc(prompt)}</pre>
    <div class="acts">
      <button class="btn2 dark" data-copy="${id}">${ICON.copy}문장 복사</button>
      <label class="btn2">${ICON.up}받은 그림 올리기<input type="file" accept="image/*" hidden data-upkit="${id}" data-n="${n}"></label>
    </div>
    ${keys.some(k => IMG[k]) ? `<div class="res">${keys.map((k, i) => IMG[k] ? `<figure><img src="${IMG[k]}"><figcaption>${esc(labels[i])}</figcaption>${keys.length > 1 ? `<select data-swap="${id}" data-i="${i}">${labels.map((l, j) => `<option value="${j}" ${j === i ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>` : ''}</figure>` : '').join('')}</div>${keys.length > 1 ? '<p class="small" style="margin-top:6px">순서가 바뀌었으면 이름 아래에서 맞는 사람을 골라 주세요.</p>' : ''}` : ''}
  </div>`;
}
const KITS = {}; // id → {prompt, keys, labels, n}
function regKit(id, prompt, keys, labels, n) { KITS[id] = { prompt, keys, labels, n }; }
const GPT_URL = 'https://chatgpt.com/';
const startGuide = () => `<div class="guide"><b>이렇게 하면 돼요</b><ol>
  <li>아래 <b>그림체 기준 그림</b>을 저장해요.</li>
  <li><a href="${GPT_URL}" target="_blank" rel="noopener"><b>ChatGPT</b></a>를 새 대화로 열고, 첫 메시지에 <b>기준 그림 + 사진</b>을 함께 첨부해요.</li>
  <li>여기서 <b>문장 복사</b> → 붙여넣기 → 보내기.</li>
  <li>그림이 나오면 길게 눌러 저장하고, <b>받은 그림 올리기</b>를 눌러요. 사람별로 자동으로 잘라 넣어 드려요.</li>
</ol><p class="small" style="margin-top:8px">다음 그림부터는 <b>같은 대화</b>에서 이어서 보내야 그림체가 유지돼요. 무료 계정은 하루 생성 횟수가 정해져 있어 막히면 다음 날 이어서 해도 돼요. 가족 사진은 내 ChatGPT에만 올라가요. 가족분들께 미리 말씀드려 주세요.</p>
  <div class="acts" style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap"><a class="btn2" href="img/style_sheet.png" download="이지로그_그림체_기준.png">${ICON.dl}그림체 기준 그림 저장</a><a class="btn2" href="${GPT_URL}" target="_blank" rel="noopener">${ICON.ext}ChatGPT 열기</a></div></div>
  <p class="small" style="margin:-6px 2px 14px">얼굴이 안 닮았으면 같은 대화에 “구도·복장 그대로 두고 얼굴만 사진처럼 다시”라고 보내 보세요. 그림체가 달라지면 기준 그림을 다시 첨부하면 돼요.</p>`;

/* ---------- 단계 ---------- */
const STEPS = [
  { id: 'intro', noBar: true, cta: '시작하기', render: () => `
    <div class="anim">
      <p class="eyebrow">이지로그 · 무료</p>
      <h1 class="q">상견례 소개 리플렛,<br>질문에 답하면 완성돼요</h1>
      <p class="hint">양가 부모님께 두 사람과 두 가족을 소개하는 A4 3단 리플렛이에요. 10분이면 만들고, 집에서 다이소 A4 펠트지(180g)에 양면으로 뽑으면 끝.</p>
      ${inAppNotice()}
      <div class="sample"><img src="img/sample_2.webp" alt="완성 예시 안쪽면"><img src="img/sample_1.webp" alt="완성 예시 바깥면"><span>완성 예시</span></div>
      <ul class="points">
        <li><i>1</i><span>두 사람 소개와 만남 이야기, 결혼을 결심한 이유</span></li>
        <li><i>2</i><span>양가 가족 소개 (반려동물도 함께)</span></li>
        <li><i>3</i><span>얼굴은 이지로그 캐릭터를 고르거나 사진·이름으로</span></li>
        <li><i>4</i><span>상견례 퀴즈와 효도 쿠폰으로 분위기까지</span></li>
      </ul>
      ${S.groom.name || S.bride.name ? `<div class="resume"><span>만들던 리플렛이 있어요.</span><button id="resume">이어서 하기</button></div>` : ''}
      <p class="small">입력한 내용과 사진은 서버로 보내지 않고 이 기기에만 저장돼요.</p>
    </div>` , after: () => { bindInApp(); $('#resume')?.addEventListener('click', () => { const s = S.step > 1 ? S.step : 1; go(s); }); }, next: () => { if (S.step <= 0) S.step = 0; } },

  { id: 'names', valid: () => S.groom.name.trim() && S.bride.name.trim(), render: () => `
    <h1 class="q">두 분의 이름을<br>알려 주세요</h1><p class="hint">리플렛 곳곳에 들어가요.</p>
    ${field('신랑 이름', inp('groom.name', '이몽룡', 'text', 'autocomplete="off"'))}
    ${field('신부 이름', inp('bride.name', '성춘향', 'text', 'autocomplete="off"'))}
    <div class="row2">${field('신랑 영문 이름', inp('groom.en', 'MONGRYONG'), 1)}${field('신부 영문 이름', inp('bride.en', 'CHUNHYANG'), 1)}</div>
    <p class="small">영문 이름은 표지에 크게 들어가요. 비워 두면 한글 이름으로 꾸며요.</p>` },

  ...['groom', 'bride'].map(who => ({ id: who, render: () => {
    const nm = who === 'groom' ? gName() : bName(); const ex = who === 'groom'
      ? ['글공부도 풍류도 좋아하는 선비', '한번 정한 마음은 끝까지 지키는 사람', '취미: 시 짓기, 산책']
      : ['곧고 당찬 성격', '어머니를 꼭 닮은 효녀', '취미: 그네 타기'];
    return `<p class="eyebrow">${who === 'groom' ? '신랑' : '신부'} 소개</p><h1 class="q">${esc(nm)} 님은<br>어떤 사람인가요?</h1><p class="hint">짧은 한 줄씩 세 가지면 충분해요.</p>
      <div class="row2">${field('생년월일', inp(who + '.birth', '', 'date'), 1)}${field('MBTI', inp(who + '.mbti', 'ENFP', 'text', 'maxlength="4" style="text-transform:uppercase"'), 1)}</div>
      ${field('가족 안에서', inp(who + '.pos', who === 'groom' ? '외아들' : '외동딸'), 1)}
      ${[0, 1, 2].map(i => field(`소개 ${i + 1}`, inp(`${who}.pts.${i}`, ex[i], 'text', 'maxlength="26"'))).join('')}`;
  } })),

  { id: 'story', render: () => `<p class="eyebrow">만남 이야기</p><h1 class="q">두 분은 어떻게<br>만나셨나요?</h1><p class="hint">처음부터 지금까지, 한 줄씩 짧게 적어 주세요.</p>
    ${['처음 만남', '그다음', '연인이 된 계기', '지금'].map((l, i) => field(l, inp(`story.${i}`, ['단옷날 광한루 그네터에서 처음 만났어요', '방자를 통해 서로 마음을 전했어요', '먼 길을 돌아 다시 만나 확신이 들었어요', '이제 두 집안이 한 가족이 되려 합니다'][i], 'text', 'maxlength="30"'), i > 1)).join('')}` },

  { id: 'whyg', render: () => `<p class="eyebrow">결혼을 결심한 이유 1/2</p><h1 class="q">${esc(gName())} 님이<br>${esc(bName())} 님과 결혼을 결심한 이유는?</h1><p class="hint">말풍선으로 들어가요. 3~5줄이면 보기 좋아요. 줄바꿈도 그대로 들어가요.</p>
    ${area('why.g', '어떤 일이 있어도 마음을 지키는\n곧은 모습을 보며\n평생을 함께하고 싶다는\n생각이 들었습니다.', 5, 110)}` },
  { id: 'whyb', render: () => `<p class="eyebrow">결혼을 결심한 이유 2/2</p><h1 class="q">${esc(bName())} 님이<br>${esc(gName())} 님과 결혼을 결심한 이유는?</h1><p class="hint">말풍선으로 들어가요. 3~5줄이면 보기 좋아요.</p>
    ${area('why.b', '먼 길을 돌아서도 약속을 지켜 준 사람이라\n이 사람과라면 평생 믿고 기댈 수 있겠다는\n확신이 들었습니다.', 5, 110)}` },

  ...['g', 'b'].map(side => ({ id: 'fam' + side, render: () => {
    const who = side === 'g' ? '신랑' : '신부'; const list = S.fam[side];
    return `<p class="eyebrow">${who} 가족</p><h1 class="q">${esc(side === 'g' ? gName() : bName())} 님의 가족을<br>소개해 주세요</h1><p class="hint">부모님부터 차례로 추가해요. 반려동물은 번외로 맨 아래에 들어가요.</p>
      <div class="mlist">${list.map(m => `<div class="mcard"><span class="av" style="background:${isPet(m) ? '#fdf3cc' : side === 'g' ? 'var(--groom)' : 'var(--bride)'}">${esc(short(m.name) || m.rel.slice(0, 2))}</span><span class="tx"><b>${esc(m.rel)} ${esc(m.name)}</b><span>${esc([m.year && m.year + '년생', m.job].filter(Boolean).join(' · ') || m.desc || '정보 추가')}</span></span><button class="ed" data-edit="${m.id}" data-side="${side}">수정</button></div>`).join('')}</div>
      <button class="add" data-add="${side}">+ 가족 추가</button>
      ${list.length > 5 ? '<p class="small" style="margin-top:10px">한쪽에 5명이 넘으면 글씨가 조금 작아질 수 있어요.</p>' : ''}`;
  } })),

  { id: 'sched', render: () => `<p class="eyebrow">함께하는 날</p><h1 class="q">상견례와 결혼식은<br>언제인가요?</h1><p class="hint">정해진 것만 적어도 돼요.</p>
    <div class="row2">${field('상견례 날짜', inp('sched.meet.date', '', 'date'))}${field('시간', inp('sched.meet.time', '', 'time'), 1)}</div>
    ${field('상견례 장소', inp('sched.meet.place', '광한루 한정식'), 1)}
    <div class="row2">${field('결혼식 날짜', inp('sched.wed.date', '', 'date'), 1)}${field('시간', inp('sched.wed.time', '', 'time'), 1)}</div>
    ${field('결혼식 장소', inp('sched.wed.place', '예식장 이름'), 1)}` },

  { id: 'facemode', valid: () => !!S.faceMode, render: () => `<p class="eyebrow">얼굴 칸</p><h1 class="q">가족 얼굴은<br>어떻게 넣을까요?</h1><p class="hint">리플렛의 동그라미 칸에 들어가요.</p>
    <div class="opts">
      ${opt('faceMode', 'pick', ICON.grid, '캐릭터 고르기', '미리 그려 둔 이지로그 캐릭터 중에서 한 분씩 골라요', '추천')}
      ${opt('faceMode', 'char', ICON.pen, '우리 가족 닮은 캐릭터', '가족 사진으로 ChatGPT에서 직접 그려요. 붙여넣을 문장을 만들어 드려요')}
      ${opt('faceMode', 'photo', ICON.cam, '사진 그대로', '가족 사진을 동그랗게 넣어요')}
      ${opt('faceMode', 'ini', ICON.txt, '이름만', '색 동그라미에 이름 두 글자가 들어가요')}
      ${opt('faceMode', 'blank', ICON.blank, '빈칸으로 두기', '인쇄 후 사진을 직접 붙여요')}
    </div>` },

  { id: 'pick', show: () => S.faceMode === 'pick', render: () => {
    ensurePicks();
    const rows = people().map(p => `<div class="mcard"><span class="av" style="width:56px;height:56px;background:${p.bg}"><img src="${charSrc(S.pick[p.key])}" style="width:100%;height:100%;border-radius:50%"></span><span class="tx"><b>${esc(p.title)}</b><span>${esc(p.sub)}</span></span><button class="ed" data-pick="${p.key}">바꾸기</button></div>`).join('');
    return `<p class="eyebrow">캐릭터 고르기</p><h1 class="q">한 분씩 어울리는<br>캐릭터를 골라 주세요</h1><p class="hint">비슷한 분위기로 미리 골라 뒀어요. 바꾸기를 누르면 다른 캐릭터를 볼 수 있어요.</p><div class="mlist">${rows}</div>`;
  } },

  { id: 'chars', show: () => S.faceMode === 'char', render: () => {
    const G = charGroups(); let html = `<p class="eyebrow">캐릭터 만들기</p><h1 class="q">ChatGPT로 가족 캐릭터를<br>그려 볼게요</h1><p class="hint">그룹마다 사진을 순서대로 첨부하고 문장을 붙여 넣으면 돼요. 다 못 해도 다음으로 넘어갈 수 있어요. 비어 있는 칸은 이름으로 채워져요.</p>${startGuide()}`;
    G.forEach((g, gi) => {
      const keys = g.people.map(p => p.key); const labels = g.people.map(p => p.label); const pr = promptFor(g, gi === 0);
      regKit(g.id, pr, keys, labels, g.pet ? 0 : keys.length);
      const att = g.pet ? `${g.people[0].label} 사진 1장` : g.people.map(p => p.label).join(' → ') + ' 사진';
      html += kitCard(g.id, `${gi + 1}번째 그림${gi === 0 ? ' · 첫 메시지' : ''}`, g.title, gi === 0 ? `<b>그림체 기준 그림</b> + ${att}을 함께 첨부하세요.` : `${att}을 순서대로 첨부하세요.`, pr, keys, labels, g.pet ? 0 : keys.length);
    });
    return html;
  } },

  { id: 'photos', show: () => S.faceMode === 'photo', render: () => {
    const P = [{ key: 'face:groom', label: gName() }, { key: 'face:bride', label: bName() }, ...S.fam.g.map(m => ({ key: 'face:' + m.id, label: m.name || m.rel })), ...S.fam.b.map(m => ({ key: 'face:' + m.id, label: m.name || m.rel }))];
    return `<p class="eyebrow">사진 넣기</p><h1 class="q">가족 사진을<br>하나씩 넣어 주세요</h1><p class="hint">얼굴이 가운데 오는 사진이 좋아요. 사진은 이 기기 안에서만 쓰여요.</p>
      <div class="ups">${P.map(p => `<div class="up"><label><span class="circ ${IMG[p.key] ? 'has' : ''}">${IMG[p.key] ? `<img src="${IMG[p.key]}">` : ICON.cam}</span><span>${esc(p.label)}</span><input type="file" accept="image/*" data-photo="${p.key}"></label></div>`).join('')}</div>`;
  } },

  { id: 'p3', valid: () => !!S.p3, render: () => `<p class="eyebrow">마지막 칸</p><h1 class="q">리플렛 안쪽 오른쪽 칸에<br>무엇을 넣을까요?</h1><p class="hint">펼쳤을 때 가장 먼저 눈에 들어오는 칸이에요.</p>
    <div class="opts">
      ${opt('p3', 'quiz', ICON.quiz, '저희 퀴즈', '질문만 적어 두고 정답은 두 사람이 발표해요. 맞힌 분께 효도 쿠폰을', '추천')}
      ${opt('p3', 'photos', ICON.pics, '우리 사진 3장', '연애 사진을 넣거나, 인쇄 후 직접 붙여요')}
      ${opt('p3', 'kids', ICON.baby, '재미로 보는 2세 얼굴', 'ChatGPT로 아들·딸 얼굴을 직접 뽑아요')}
    </div>` },

  { id: 'quiz', show: () => S.p3 === 'quiz', render: () => {
    const q = S.quiz; if (!q.bonus[0] && !q.bonus[1]) q.bonus = bonusDefault();
    return `<p class="eyebrow">저희 퀴즈</p><h1 class="q">질문을 골라 주세요</h1><p class="hint">5개가 보기 좋아요. 정답은 리플렛에 넣지 않아요. 두 분이 직접 알려 드리세요.</p>
      ${QBANK.map((t, i) => `<button class="qitem ${q.sel.includes(i) ? 'on' : ''}" data-q="${i}"><span class="ck">${ICON.check}</span><span>${esc(t)}</span></button>`).join('')}
      ${field('직접 쓴 질문', q.custom.map((c, i) => `<input class="inp" style="margin-bottom:8px" data-k="quiz.custom.${i}" value="${esc(c)}" placeholder="질문을 적어 주세요">`).join('') + `<button class="add" id="qadd" style="height:48px">+ 질문 직접 쓰기</button>`, 1)}
      <div class="field"><label>보너스 문제 · 이번엔 두 분이 맞혀요</label>
        <div class="chips" style="margin-bottom:10px"><button class="chip ${q.bonusOn ? 'on' : ''}" data-bon="1">넣을게요</button><button class="chip ${!q.bonusOn ? 'on' : ''}" data-bon="0">빼 주세요</button></div>
        ${q.bonusOn ? inp('quiz.bonus.0', bonusDefault()[0]) + '<div style="height:8px"></div>' + inp('quiz.bonus.1', bonusDefault()[1]) : ''}</div>
      <div class="field"><label>선물용 효도 쿠폰 (A4 1장 추가)</label>
        <div class="chips"><button class="chip ${S.coupon ? 'on' : ''}" data-cp="1">함께 만들기</button><button class="chip ${!S.coupon ? 'on' : ''}" data-cp="0">필요 없어요</button></div>
        <p class="small" style="margin-top:8px">1등 한 분께 큰 쿠폰, 나머지 모든 분께 참가상을 드리면 한쪽만 상을 받는 어색함이 없어요.</p></div>`;
  } },

  { id: 'slots', show: () => S.p3 === 'photos', render: () => `<p class="eyebrow">우리 사진</p><h1 class="q">넣고 싶은 사진이<br>있나요?</h1><p class="hint">비워 두면 인쇄 후 직접 붙이는 빈칸이 돼요. 아래 한 줄은 사진 설명이에요.</p>
    ${[0, 1, 2].map(i => `<div class="field"><label>사진 ${i + 1}</label><div style="display:flex;gap:10px;align-items:center"><label class="btn2" style="flex:none">${IMG['slot:' + i] ? `<img src="${IMG['slot:' + i]}" style="width:28px;height:28px;object-fit:cover;border-radius:6px">바꾸기` : ICON.up + '사진 넣기'}<input type="file" accept="image/*" hidden data-photo="slot:${i}"></label>${inp('slots.' + i, ['처음 함께 간 여행', '우리의 100일', '프러포즈 날'][i], 'text', 'maxlength="22"')}</div></div>`).join('')}` },

  { id: 'kids', show: () => S.p3 === 'kids', render: () => {
    regKit('kids', kidPrompt(), ['kid:boy', 'kid:girl'], ['아들', '딸'], 2);
    return `<p class="eyebrow">재미로 보는 2세 얼굴</p><h1 class="q">아들·딸 얼굴을<br>뽑아 볼까요?</h1><p class="hint">맨 위에 들어갈 두 분 사진도 한 장 넣어 주세요.</p>
      <div class="field"><label>지금의 저희 사진</label><label class="btn2">${IMG.us ? `<img src="${IMG.us}" style="width:28px;height:28px;object-fit:cover;border-radius:6px">바꾸기` : ICON.up + '커플 사진 넣기'}<input type="file" accept="image/*" hidden data-photo="us"></label></div>
      <div class="field"><label>아이 그림 스타일</label><div class="chips"><button class="chip ${S.kidStyle === 'char' ? 'on' : ''}" data-ks="char">캐릭터 그림</button><button class="chip ${S.kidStyle === 'real' ? 'on' : ''}" data-ks="real">실사 사진</button></div></div>
      ${S.faceMode !== 'char' ? startGuide() : '<p class="small" style="margin:-4px 2px 12px">캐릭터를 그리던 ChatGPT 대화에 이어서 보내 주세요.</p>'}
      ${kitCard('kids', S.faceMode === 'char' && S.kidStyle === 'char' ? '이어서 보내기' : '첫 메시지', '아들 · 딸', S.kidStyle === 'real' || S.faceMode !== 'char' ? `${S.kidStyle === 'char' ? '<b>그림체 기준 그림</b> + ' : ''}두 분이 함께 나온 사진을 첨부하세요.` : '첨부 없이 문장만 보내면 돼요.', kidPrompt(), ['kid:boy', 'kid:girl'], ['아들', '딸'], 2)}
      ${S.kidStyle === 'real' ? '<p class="small">실사는 결과가 거절되거나 덜 닮게 나올 수 있어요. 재미로만 봐 주세요.</p>' : ''}`;
  } },

  { id: 'cover', valid: () => !!S.cover, render: () => {
    let extra = '';
    if (S.cover === 'char') {
      const pr = S.faceMode === 'char' ? coverPrompt() : coverPromptSolo(); regKit('cover', pr, ['cover'], ['표지'], 0);
      extra = (S.faceMode !== 'char' ? startGuide() : '') + kitCard('cover', S.faceMode === 'char' ? '같은 대화에 이어서' : '첫 메시지', '웨딩 캐릭터', S.faceMode === 'char' ? '첨부 없이 문장만 보내면 돼요.' : '<b>그림체 기준 그림</b> + 두 분이 함께 나온 사진을 첨부하세요.', pr, ['cover'], ['표지'], 0);
    } else if (S.cover === 'photo') {
      extra = `<div class="field" style="margin-top:16px"><label>표지 사진</label><label class="btn2">${IMG.coverPhoto ? `<img src="${IMG.coverPhoto}" style="width:28px;height:28px;object-fit:cover;border-radius:6px">바꾸기` : ICON.up + '사진 넣기'}<input type="file" accept="image/*" hidden data-photo="coverPhoto"></label></div>`;
    }
    return `<p class="eyebrow">표지</p><h1 class="q">표지는 어떻게<br>꾸밀까요?</h1><p class="hint">접었을 때 맨 앞에 보이는 면이에요.</p>
      <div class="opts">${opt('cover', 'char', ICON.pen, '웨딩 캐릭터 그림', 'ChatGPT로 두 분의 웨딩 캐릭터를 그려요', '추천')}${opt('cover', 'photo', ICON.cam, '우리 사진', '웨딩·커플 사진을 넣어요')}${opt('cover', 'text', ICON.txt, '글자만', '이름과 반지 장식으로 깔끔하게')}</div>${extra}
      <div style="height:18px"></div>${field('표지 문구', area('coverMsg', '두 가족의 사랑 속에서\n행복하고 예쁘게 살아가겠습니다', 2))}`;
  } },

  { id: 'thanks', render: () => { if (!S.thanks) S.thanks = defThanks(); return `<p class="eyebrow">인사말</p><h1 class="q">부모님께 드리는<br>인사말을 확인해 주세요</h1><p class="hint">그대로 써도 되고, 두 분 말투로 고쳐도 좋아요.</p>
    ${field('감사 인사', area('thanks', '', 9, 260))}${field('결심 이유 아래 한마디', area('together', '', 2))}`; } },

  { id: 'done', noBar: true, cta: 'PDF로 저장하기', render: () => `<p class="eyebrow">완성</p><h1 class="q">리플렛이 완성됐어요</h1><p class="hint">1쪽이 바깥면, 2쪽이 안쪽면이에요. 고칠 곳이 있으면 왼쪽 위 화살표로 돌아가면 돼요.</p>
    ${inAppNotice(true)}
    <div class="preview" id="pv"><p class="pgl">미리보기를 만드는 중이에요…</p></div>
    <div class="bigbtns"><button class="ghost kakao" id="sharepdf">카톡으로 PDF 보내기</button>${IS_MOBILE ? '' : '<button class="ghost" id="mobilepdf">이미지 PDF로 저장</button>'}<button class="ghost" id="share">결혼 준비하는 친구에게 알려주기</button><button class="ghost" id="export">작업 파일 저장 · 다른 기기에서 이어서 하기</button><button class="ghost" id="restart">처음부터 새로 만들기</button></div>
    ${IS_MOBILE ? `<div class="guide"><b>휴대폰에서 바로 인쇄하려면</b>위의 <b>PDF로 저장하기</b>로 받은 파일을 열고 ${/iPhone|iPad|iPod|Macintosh/.test(UA) ? '<b>공유 버튼 → 프린트</b>' : '<b>오른쪽 위 ⋮ → 인쇄</b>'}를 누르면 와이파이 프린터로 보낼 수 있어요. 집에 PC가 있다면 PDF를 PC로 옮겨 뽑는 게 가장 편해요.</div>` : ''}
    <div class="pguide"><img src="img/print_guide.png?v=2" alt="상견례 리플렛 집에서 뽑는 법: 1 다이소 A4 펠트지(180g) 준비 2 A4 가로·실제 크기 100%·양면 짧은 쪽 넘기기·두꺼운 종이 3 일반 종이로 시험 인쇄 4 오른쪽 칸 먼저 접고 왼쪽 칸 덮기">
      <button class="btn2 dark" id="saveguide">${ICON.dl}인쇄 방법 이미지로 저장</button></div>
    <div class="follow"><b>이지로그와 함께 만들었어요</b>저희 결혼 준비 이야기는 인스타그램 <a href="https://www.instagram.com/2asy_log/" target="_blank" rel="noopener">@2asy_log</a>에서 연재 중이에요. 리플렛 만든 후기도 들려 주세요!</div>` ,
    after: async () => { await renderLeaflet(); buildPreview(); $('#mobilepdf') && ($('#mobilepdf').onclick = mobilePDF); $('#printpdf') && ($('#printpdf').onclick = () => window.print()); $('#share').onclick = shareLink; $('#sharepdf').onclick = sharePDF; $('#saveguide').onclick = saveGuide;
      PDF_JOB = null; if (IS_MOBILE && !IN_APP) buildPDF().then(() => { const b = $('#sharepdf'); if (b) { b.dataset.ready = '1'; } }).catch(() => {}); $('#export').onclick = exportFile; $('#restart').onclick = restart; bindInApp(); },
    next: () => { IS_MOBILE ? mobilePDF() : window.print(); return false; } },
];
// '몽룡이가' / '춘향이가' / '민호가' — 받침 없으면 '가'
const josa = n => { const c = short(n).slice(-1).charCodeAt(0); return c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 ? '이가' : '가'; };
const paras = t => String(t || '').split(/\n\s*\n/).map(x => `<p>${esc(x.trim())}</p>`).join('');
function defThanks() { return `친구처럼 편안했던 사람과\n앞으로의 모든 날을 함께하고 싶어\n오늘 이 자리에 모이게 되었습니다.\n\n서로 다른 길을 걸어온 저희가\n이제 한 가족이 되어 새로운 시작을 하려 합니다.\n\n지금까지 한결같은 사랑으로 키워주시고\n응원해 주신 부모님께 진심으로 감사드립니다.\n\n서로에게 가장 편안하고 든든한 사람이 되어\n웃음과 온기가 가득한 가정을 꾸려가겠습니다.`; }

/* ---------- 내비게이션 ---------- */
const visible = () => STEPS.map((s, i) => [s, i]).filter(([s]) => !s.show || s.show());
function go(i) {
  const st = STEPS[i]; if (!st) return;
  if (st.show && !st.show()) { return go(i + 1); }
  S.step = i; save();
  // 선택에 따라 단계 수가 바뀌어도 진행 막대는 앞으로만 가도록 전체 단계 기준으로 계산
  $('#prog').style.width = (i === 0 ? 0 : Math.min(100, (i / (STEPS.length - 1)) * 100)) + '%';
  $('#cnt').textContent = '';
  $('#back').hidden = i === 0;
  $('#screen').innerHTML = `<div class="anim">${st.render()}</div>`;
  $('#next').textContent = st.cta || (st.id === 'thanks' ? '완성하기' : '다음');
  bind(); refreshValid();
  window.scrollTo(0, 0);
  st.after && st.after();
}
function nextStep() {
  const st = STEPS[S.step];
  if (st.valid && !st.valid()) return;
  if (st.next && st.next() === false) return;
  let j = S.step + 1; while (STEPS[j] && STEPS[j].show && !STEPS[j].show()) j++;
  go(j);
}
function prevStep() { let j = S.step - 1; while (j > 0 && STEPS[j].show && !STEPS[j].show()) j--; go(Math.max(0, j)); }
function refreshValid() { const st = STEPS[S.step]; $('#next').disabled = !!(st.valid && !st.valid()); }
$('#next').onclick = nextStep; $('#back').onclick = prevStep;

/* ---------- 입력 바인딩 ---------- */
function bind() {
  $$('#screen [data-k]').forEach(el => {
    const upd = () => {
      let v = el.value; if (el.dataset.k.endsWith('.mbti')) v = v.toUpperCase();
      const ks = el.dataset.k.split('.'); if (/^\d+$/.test(ks.at(-1))) { const arr = getP(ks.slice(0, -1).join('.')); arr[+ks.at(-1)] = v; save(); } else setP(el.dataset.k, v);
      const c = $(`[data-for="${el.dataset.k}"]`); if (c) { const m = +el.dataset.max; c.textContent = `${v.length} / ${m}자`; c.classList.toggle('over', v.length > m); }
      refreshValid();
    };
    el.addEventListener('input', upd); upd();
    if (el.tagName === 'INPUT') el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); const all = $$('#screen input.inp'); const n = all[all.indexOf(el) + 1]; n ? n.focus() : nextStep(); } });
  });
  $$('#screen [data-opt]').forEach(b => b.onclick = () => { setP(b.dataset.opt, b.dataset.val); go(S.step); });
  $$('#screen [data-add]').forEach(b => b.onclick = () => memberSheet(b.dataset.add));
  $$('#screen [data-pick]').forEach(b => b.onclick = () => pickSheet(b.dataset.pick));
  $$('#screen [data-edit]').forEach(b => b.onclick = () => memberSheet(b.dataset.side, b.dataset.edit));
  $$('#screen [data-q]').forEach(b => b.onclick = () => { const i = +b.dataset.q; const s = S.quiz.sel; s.includes(i) ? s.splice(s.indexOf(i), 1) : s.push(i); s.sort((a, c) => a - c); save(); b.classList.toggle('on'); if (quizList().length > 6) toast('6개가 넘으면 글씨가 작아질 수 있어요'); });
  $('#qadd') && ($('#qadd').onclick = () => { S.quiz.custom.push(''); save(); go(S.step); setTimeout(() => $$('#screen [data-k^="quiz.custom"]').at(-1)?.focus(), 50); });
  $$('#screen [data-bon]').forEach(b => b.onclick = () => { S.quiz.bonusOn = b.dataset.bon === '1'; save(); go(S.step); });
  $$('#screen [data-cp]').forEach(b => b.onclick = () => { S.coupon = b.dataset.cp === '1'; save(); go(S.step); });
  $$('#screen [data-ks]').forEach(b => b.onclick = () => { S.kidStyle = b.dataset.ks; save(); go(S.step); });
  $$('#screen [data-copy]').forEach(b => b.onclick = async () => { const t = KITS[b.dataset.copy].prompt; try { await navigator.clipboard.writeText(t); } catch (e) { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); } toast('복사했어요. ChatGPT에 붙여 넣어 주세요'); });
  $$('#screen [data-upkit]').forEach(inpEl => inpEl.onchange = async () => {
    const f = inpEl.files[0]; if (!f) return; const k = KITS[inpEl.dataset.upkit]; toast('그림을 자르는 중이에요…');
    try { const outs = await splitPeople(f, k.n); (k.n === 0 ? [outs[0]] : outs).forEach((u, i) => k.keys[i] && putImg(k.keys[i], u)); toast('넣었어요!'); } catch (e) { toast('그림을 읽지 못했어요. 다른 파일로 해 주세요'); }
    go(S.step);
  });
  $$('#screen [data-swap]').forEach(sel => sel.onchange = () => { const k = KITS[sel.dataset.swap]; const a = +sel.dataset.i, b = +sel.value; const A = IMG[k.keys[a]], B = IMG[k.keys[b]]; A ? putImg(k.keys[b], A) : delImg(k.keys[b]); B ? putImg(k.keys[a], B) : delImg(k.keys[a]); go(S.step); });
  $$('#screen [data-photo]').forEach(inpEl => inpEl.onchange = async () => { const f = inpEl.files[0]; if (!f) return; try { putImg(inpEl.dataset.photo, await photoURL(f)); } catch (e) { toast('사진을 읽지 못했어요'); } go(S.step); });
}

/* 가족 편집 시트 */
function memberSheet(side, id) {
  const list = S.fam[side]; const m = id ? list.find(x => x.id === id) : { id: 'm' + Date.now().toString(36), rel: '', name: '', year: '', job: '', desc: '', look: '' };
  const RELS = side === 'g' ? ['아버지', '어머니', '형', '누나', '남동생', '여동생', '할아버지', '할머니', '반려동물'] : ['아버지', '어머니', '오빠', '언니', '남동생', '여동생', '할아버지', '할머니', '반려동물'];
  const custom = m.rel && !RELS.includes(m.rel);
  const bg = document.createElement('div'); bg.className = 'sheetbg';
  const draw = () => {
    const pet = m.rel === '반려동물';
    bg.innerHTML = `<div class="sheet-m"><h2>${id ? '가족 정보 수정' : '가족 추가'}</h2>
      <div class="field"><label>관계</label><div class="chips">${RELS.map(r => `<button class="chip ${m.rel === r ? 'on' : ''}" data-r="${r}">${r}</button>`).join('')}<button class="chip ${custom || m._c ? 'on' : ''}" data-r="__">직접 입력</button></div>${custom || m._c ? `<input class="inp" style="margin-top:8px" id="mrelc" value="${esc(custom ? m.rel : '')}" placeholder="예: 새언니, 매형">` : ''}</div>
      ${field(pet ? '이름' : '이름', `<input class="inp" id="mname" value="${esc(m.name)}" placeholder="${pet ? '바둑이' : '이한림'}">`)}
      ${pet ? field('종류', `<input class="inp" id="mjob" value="${esc(m.job)}" placeholder="토이푸들">`, 1) : `<div class="row2">${field('출생 연도', `<input class="inp" id="myear" inputmode="numeric" maxlength="4" value="${esc(m.year)}" placeholder="1965">`, 1)}${field('직업', `<input class="inp" id="mjob" value="${esc(m.job)}" placeholder="공무원">`, 1)}</div>`}
      ${field('한두 줄 소개', `<textarea class="inp" id="mdesc" rows="2" placeholder="${pet ? '가족의 귀염둥이 반려견이에요.' : '말수는 적지만 속정이 깊으신 분.\n늘 가족을 먼저 챙기세요.'}">${esc(m.desc)}</textarea><div class="counter" id="mcnt"></div>`, 1)}
      ${S.faceMode === 'char' ? field('그림용 특징', `<input class="inp" id="mlook" value="${esc(m.look)}" placeholder="${pet ? '갈색 곱슬 털' : '짧은 흰머리, 안경'}">`, 1) : ''}
      <div class="btns">${id ? '<button class="del">삭제</button>' : ''}<button class="save">${id ? '저장' : '추가'}</button></div></div>`;
    const cnt = () => { const v = $('#mdesc', bg).value; $('#mcnt', bg).textContent = `${v.length} / 46자 (두 줄 권장)`; $('#mcnt', bg).classList.toggle('over', v.length > 46); };
    $('#mdesc', bg).addEventListener('input', cnt); cnt();
    $$('[data-r]', bg).forEach(b => b.onclick = () => { collect(); if (b.dataset.r === '__') { m._c = true; m.rel = ''; } else { m._c = false; m.rel = b.dataset.r; } draw(); });
    $('.save', bg).onclick = () => { collect(); if (!m.rel) return toast('관계를 골라 주세요'); delete m._c; if (!id) list.push(m); list.sort((a, b) => isPet(a) - isPet(b)); save(); bg.remove(); go(S.step); };
    $('.del', bg) && ($('.del', bg).onclick = () => { list.splice(list.indexOf(m), 1); delImg('face:' + m.id); save(); bg.remove(); go(S.step); });
  };
  const collect = () => { const v = s => $(s, bg)?.value?.trim() ?? ''; if ($('#mrelc', bg)) m.rel = v('#mrelc'); m.name = v('#mname'); m.year = v('#myear'); m.job = v('#mjob'); m.desc = $('#mdesc', bg)?.value ?? ''; m.look = v('#mlook') || m.look || ''; };
  bg.onclick = e => { if (e.target === bg) bg.remove(); };
  draw(); document.body.appendChild(bg);
}

/* ---------- 리플렛 조립 ---------- */
function face(key, cls, name) {
  if (S.faceMode === 'pick') return `<div class="face ${cls}"><img src="${charSrc((S.pick || {})[key])}"></div>`;
  const img = IMG[key];
  if ((S.faceMode === 'char' || S.faceMode === 'photo') && img) return `<div class="face ${cls}"><img src="${img}"></div>`;
  if (S.faceMode === 'blank') return `<div class="face ${cls} dash"><span class="ini">사진</span></div>`;
  return `<div class="face ${cls}"><span class="ini">${esc(short(name))}</span></div>`;
}
function famHTML(side) {
  const list = S.fam[side]; const cls = side === 'g' ? '' : 'b'; const who = side === 'g' ? '신랑' : '신부';
  return list.map(m => {
    if (isPet(m)) return `<div class="fam pet">${face('face:' + m.id, 'p', m.name)}<div class="t"><b><em>번외</em>${who}네 막내 ${esc(m.name)}${m.job ? `<span>${esc(m.job)}</span>` : ''}</b><p>${esc(m.desc)}</p></div></div>`;
    const sub = [m.year && m.year + '년생', m.job].filter(Boolean).join(' · ');
    return `<div class="fam">${face('face:' + m.id, cls, m.name || m.rel)}<div class="t"><b>${esc(m.rel)} ${esc(m.name)}${sub ? `<span>${esc(sub)}</span>` : ''}</b><p>${esc(m.desc)}</p></div></div>`;
  }).join('');
}
function meHTML(who) {
  const p = S[who]; const g = who === 'groom'; const nm = g ? gName() : bName();
  const mb = p.mbti ? `<span class="mb ${g ? '' : 'b'}">${esc(p.mbti)}</span>` : '';
  const sub = [fmtBirth(p.birth), p.pos].filter(Boolean).join(' · ');
  return `<div class="me ${g ? '' : 'rev'}">${face('face:' + who, g ? '' : 'b', nm)}<div class="who" style="${g ? '' : 'text-align:right'}">
    <div class="nm">${g ? `${g ? '신랑' : '신부'} ${esc(nm)} ${mb}` : `${mb} 신부 ${esc(nm)}`}</div>${sub ? `<div class="nm"><small>${esc(sub)}</small></div>` : ''}
    <ul class="pt" style="text-align:left">${p.pts.filter(Boolean).map(t => `<li>${esc(t)}</li>`).join('')}</ul></div></div>`;
}
function p3HTML() {
  if (S.p3 === 'quiz') {
    const qs = quizList(); const bon = S.quiz.bonusOn ? S.quiz.bonus.filter(Boolean) : [];
    return `<div class="panel w97 quiz"><div class="pi"><div class="tape">재미로 풀어보는<br>저희 퀴즈</div><div class="p3sub">${ICON.gift}맞히신 분께 작은 선물을 드려요</div>
      <ol>${qs.map((q, i) => `<li><b>Q${i + 1}</b><span>${esc(q)}</span></li>`).join('')}</ol>
      ${bon.length ? `<div class="bonus"><h4>보너스 <em>이번엔 저희가 맞혀요</em></h4>${bon.map(b => `<p>${esc(b)}</p>`).join('')}</div>` : ''}
      <div class="note">정답은 신랑·신부가 알려드려요</div></div></div>`;
  }
  if (S.p3 === 'photos') {
    const any = S.slots.some(Boolean) || [0, 1, 2].some(i => IMG['slot:' + i]);
    return `<div class="panel w97 blank"><div class="pi"><div class="tape">저희의<br>소중한 순간들</div>
      ${[0, 1, 2].map(i => `<div class="slot2 ${IMG['slot:' + i] ? 'has' : ''}">${IMG['slot:' + i] ? `<img src="${IMG['slot:' + i]}">` : '사진을 붙여 주세요'}</div><div class="cap">${esc(S.slots[i])}</div>`).join('')}
      ${any ? '' : '<div class="note">인쇄 후 사진을 붙이고 한 줄씩 적어 주세요</div>'}</div></div>`;
  }
  if (S.p3 === 'kids') {
    return `<div class="panel w97 kids"><div class="pi"><div class="tape">재미로 보는<br>2세 얼굴 미리보기</div>
      ${IMG.us ? `<div class="us2"><img src="${IMG.us}"><span>지금의 저희</span></div>` : ''}
      <h3>신랑 · 신부 반반 닮으면?</h3>
      <div class="kpair"><figure>${IMG['kid:boy'] ? `<img src="${IMG['kid:boy']}">` : '<img alt="">'}<figcaption>아들</figcaption></figure><figure>${IMG['kid:girl'] ? `<img src="${IMG['kid:girl']}">` : '<img alt="">'}<figcaption>딸</figcaption></figure></div>
      <div class="note">* 재미로만 봐 주세요${S.kidStyle === 'real' || S.faceMode === 'char' ? ' · AI로 만든 그림이에요' : ''}</div></div></div>`;
  }
  return '';
}
function coverHTML() {
  const en = S.groom.en && S.bride.en; const long = (S.groom.en + S.bride.en).length > 12;
  const names = en
    ? `<div class="en ${long ? 'long' : ''}">${esc(S.groom.en.toUpperCase())}</div><div class="amp">and</div><div class="en ${long ? 'long' : ''}">${esc(S.bride.en.toUpperCase())}</div><div class="ko">${esc(gName())} · ${esc(bName())}</div>`
    : `<div class="ko big">${esc(gName())}</div><div class="amp">and</div><div class="ko big">${esc(bName())}</div>`;
  let art = '';
  if (S.cover === 'char' && IMG.cover) art = `<div class="art"><img src="${IMG.cover}"></div>`;
  else if (S.cover === 'photo' && IMG.coverPhoto) art = `<div class="art ph"><img src="${IMG.coverPhoto}"></div>`;
  else art = `<div class="art">${ICON.ring.replace('<svg', '<svg class="orn"')}</div>`;
  return `<div class="panel w100 cover"><div class="pi"><div style="margin-top:7mm">${names}</div>${art}<div><div class="msg">${esc(S.coverMsg)}</div>${S.sched.wed.date ? `<div class="date">${esc(fmtDot(S.sched.wed.date))}</div>` : ''}</div></div></div>`;
}
function togetherHTML() {
  let a = IMG['face:groom'], b = IMG['face:bride'];
  if (S.faceMode === 'pick') { ensurePicks(); a = charSrc(S.pick['face:groom']); b = charSrc(S.pick['face:bride']); }
  let pic = '';
  if ((S.faceMode === 'char' || S.faceMode === 'pick') && a && b) pic = `<div class="pairimg"><img src="${a}"><img src="${b}"></div>`;
  else if (S.faceMode === 'photo' && a && b) pic = `<div class="pairimg ph"><img src="${a}"><img src="${b}"></div>`;
  return `<div class="together">${pic}<p>${esc(S.together)}</p></div>`;
}
function leafletHTML() {
  if (S.faceMode === 'pick') ensurePicks(); // 고르기 단계를 건너뛰어도 관계에 맞는 캐릭터가 들어가게
  const m = S.sched.meet, w = S.sched.wed;
  const slot = (tag, cls, d) => `<div class="slot"><div class="tag ${cls}">${tag}</div><div class="d"><b>${esc(fmtDay(d.date, d.time))}</b>${d.place ? `<br>${esc(d.place)}` : ''}</div></div>`;
  const gfam = S.fam.g.filter(x => !isPet(x)), bfam = S.fam.b.filter(x => !isPet(x));
  const onefam = gfam.length + bfam.length ? `<div class="onefam"><h4>이제 한 가족이 됩니다</h4>
    <div class="row g">${gfam.map(x => face('face:' + x.id, '', x.name || x.rel)).join('')}${face('face:groom', 'self', gName())}</div><div class="knot">♥</div>
    <div class="row b">${face('face:bride', 'b self', bName())}${bfam.map(x => face('face:' + x.id, 'b', x.name || x.rel)).join('')}</div></div>` : '';
  const out = `<section class="sheet">
    <div class="panel w97"><div class="pi"><div class="tape">신랑의 가족을 소개합니다</div>${famHTML('g') || '<div class="famgap"></div>'}<div class="tape r famgap">신부의 가족을 소개합니다</div>${famHTML('b')}</div></div>
    <div class="panel w100"><div class="pi" style="align-items:center"><div class="tape">함께하는 날</div>${m.date ? slot('상견례', '', m) : ''}${w.date ? slot('결혼식', 'w', w) : ''}${onefam}<div class="tape r">가족으로 맞아주셔서<br>감사합니다</div><div class="thanks">${paras(S.thanks || defThanks())}</div><div class="sign">${esc(gName())} <span style="color:#e48a99">♥</span> ${esc(bName())} 올림</div><div class="made">이지로그와 함께 만들었어요 · instagram @2asy_log</div></div></div>
    ${coverHTML()}<i class="fold" style="left:97mm"></i><i class="fold" style="left:197mm"></i></section>`;
  const story = S.story.filter(Boolean);
  const inside = `<section class="sheet">
    <div class="panel w100"><div class="pi"><div class="tape">저희를 소개합니다</div>${meHTML('groom')}${meHTML('bride')}${story.length ? `<div class="story"><h4>저희는 이렇게 만났어요</h4><ul class="tl">${story.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}</div></div>
    <div class="panel w100"><div class="pi"><div class="tape r">결혼을 결심한 이유</div>
      <div class="why"><h3>신랑 <span style="font-family:'Noto Sans KR';color:#433c35">→</span> 신부</h3><div class="quote g ${S.why.g ? '' : 'hand'}">${S.why.g ? esc(S.why.g) : '<i></i><i></i><i></i><i></i>'}</div><div class="spk">${face('face:groom', '', gName())}${esc(short(gName()))}${josa(gName())}</div></div>
      <div class="why"><h3 class="r">신부 <span style="font-family:'Noto Sans KR';color:#433c35">→</span> 신랑</h3><div class="quote b ${S.why.b ? '' : 'hand'}">${S.why.b ? esc(S.why.b) : '<i></i><i></i><i></i><i></i>'}</div><div class="spk r">${esc(short(bName()))}${josa(bName())}${face('face:bride', 'b', bName())}</div></div>
      ${togetherHTML()}</div></div>
    ${p3HTML()}<i class="fold" style="left:100mm"></i><i class="fold" style="left:200mm"></i></section>`;
  const coupon = S.p3 === 'quiz' && S.coupon ? `<section class="sheet csheet"><div class="chead"><div class="tape">퀴즈 선물 · 효도 쿠폰</div><p>점선을 따라 잘라서 드려요</p></div><div class="grid">${COUPONS.map((c, i) => `<div class="c ${i ? '' : 'big'}"><span class="tg">${i ? '참가상' : '1등 상'}</span><span class="k">${c[0]}</span><h3>${c[1]}</h3><p>${c[2]}</p><div class="f"><span>발행 · ${esc(short(gName()))} ${esc(short(bName()))}</span><span>${i ? '평생' : '유효기간 · 평생'}</span></div></div>`).join('')}</div></section>` : '';
  return `<div class="L">${out}${inside}${coupon}</div>`;
}
const waitImgs = r => Promise.all($$('img', r).map(im => im.complete ? 0 : new Promise(res => { im.onload = im.onerror = res; })));
async function renderLeaflet() {
  const P = $('#print'); P.innerHTML = leafletHTML();
  try { await document.fonts.ready; } catch (e) {}
  await waitImgs(P);
  fitPanels(P);
  // 한글 웹폰트 조각이 늦게 붙는 경우가 있어 한 번 더 맞춘다
  await new Promise(r => setTimeout(r, 600)); try { await document.fonts.ready; } catch (e) {}
  fitPanels(P);
}
function fitPanels(P) {
  // 넘치는 칸은 글씨를 조금씩 줄여 한 칸 안에 맞춘다
  $$('.pi', P).forEach(pi => {
    let k = 1;
    const apply = () => { pi.style.width = (100 / k) + '%'; pi.style.height = (100 / k) + '%'; pi.style.transform = k < 1 ? `scale(${k})` : ''; };
    apply();
    while (pi.scrollHeight > pi.clientHeight + 1 && k > 0.7) { k -= 0.02; apply(); }
  });
}
function buildPreview() {
  const pv = $('#pv'); if (!pv) return; pv.innerHTML = '';
  const sheets = $$('#print .sheet'); const labels = ['1쪽 · 바깥면 (가족 소개 · 일정 · 표지)', '2쪽 · 안쪽면', '3쪽 · 효도 쿠폰 (따로 뽑아요)'];
  const w = pv.clientWidth - 24; const s = w / 1122.52;
  sheets.forEach((sh, i) => {
    const lab = document.createElement('p'); lab.className = 'pgl'; lab.textContent = labels[i]; pv.appendChild(lab);
    const pg = document.createElement('div'); pg.className = 'pg'; pg.style.height = (793.7 * s) + 'px';
    const sc = document.createElement('div'); sc.className = 'L scaler'; sc.style.transform = `scale(${s})`; sc.style.width = '297mm';
    sc.appendChild(sh.cloneNode(true)); pg.appendChild(sc); pv.appendChild(pg);
  });
}

/* ---------- 저장·불러오기 ---------- */
const loadScript = src => new Promise((res, rej) => { if ($(`script[src="${src}"]`)) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
// 완성 화면에 들어오면 뒤에서 미리 PDF를 만들어 둔다 → 공유 버튼을 누르는 즉시 카톡 등으로 넘길 수 있게
let PDF_JOB = null;
const pdfName = () => `상견례_리플렛_${short(gName())}_${short(bName())}.pdf`;
function buildPDF() {
  if (PDF_JOB) return PDF_JOB;
  PDF_JOB = (async () => {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    const P = $('#print'); P.style.left = '0'; P.style.zIndex = '-1';
    try {
      const pdf = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
      const sheets = $$('#print .sheet');
      for (let i = 0; i < sheets.length; i++) {
        const c = await window.html2canvas(sheets[i], { scale: 3, backgroundColor: null, useCORS: true });
        if (i) pdf.addPage('a4', 'landscape');
        pdf.addImage(c, 'PNG', 0, 0, 297, 210, undefined, 'FAST');
      }
      return new File([pdf.output('blob')], pdfName(), { type: 'application/pdf' });
    } finally { P.style.left = '-9999px'; }
  })();
  PDF_JOB.catch(() => { PDF_JOB = null; });
  return PDF_JOB;
}
const saveBlob = f => { const a = document.createElement('a'); a.href = URL.createObjectURL(f); a.download = f.name; document.body.appendChild(a); a.click(); a.remove(); };
async function mobilePDF() {
  toast('PDF를 만드는 중이에요…');
  try { saveBlob(await buildPDF()); toast('PDF를 저장했어요'); } catch (e) { toast('저장하지 못했어요. 다른 브라우저에서 다시 시도해 주세요'); }
}
// 휴대폰은 공유 시트의 '이미지 저장'으로 사진첩에, PC는 파일로 내려받기
async function saveGuide() {
  try {
    const blob = await fetch("img/print_guide.png?v=2").then(r => r.blob());
    const f = new File([blob], '상견례_리플렛_인쇄방법.png', { type: 'image/png' });
    if (IS_MOBILE && navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f] }); return; }
    saveBlob(f); toast('인쇄 방법 이미지를 저장했어요');
  } catch (e) { if (e && e.name !== 'AbortError') toast('이미지를 길게 눌러 저장해 주세요'); }
}
async function sharePDF() {
  const btn = $('#sharepdf');
  try {
    if (!btn.dataset.ready) { btn.textContent = 'PDF 준비 중이에요…'; await buildPDF(); btn.dataset.ready = '1'; btn.textContent = '카톡으로 PDF 보내기 (준비 완료, 눌러 주세요)'; return; }
    const f = await buildPDF();
    if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: '상견례 소개 리플렛' }); return; }
    saveBlob(f); toast('이 브라우저는 바로 보내기가 안 돼요. 저장한 PDF를 카톡에서 첨부해 주세요');
  } catch (e) { if (e && e.name !== 'AbortError') toast('보내지 못했어요. PDF를 저장한 뒤 카톡에서 첨부해 주세요'); }
}
function exportFile() {
  const blob = new Blob([JSON.stringify({ v: 1, S, IMG })], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `상견례_리플렛_작업파일.json`; a.click();
  toast('PC에서 이 페이지를 열고 맨 처음 화면에서 작업 파일을 불러오세요');
}
function importFile() {
  const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json';
  i.onchange = async () => { try { const d = JSON.parse(await i.files[0].text()); S = Object.assign(DEF(), d.S); save(); clearImgs(); for (const k in d.IMG) putImg(k, d.IMG[k]); toast('불러왔어요'); go(STEPS.findIndex(s => s.id === 'done')); } catch (e) { toast('파일을 읽지 못했어요'); } };
  i.click();
}
function restart() { if (!confirmSheet()) return; }
function confirmSheet() {
  const bg = document.createElement('div'); bg.className = 'sheetbg';
  bg.innerHTML = `<div class="sheet-m"><h2>처음부터 새로 만들까요?</h2><p class="hint" style="margin-bottom:16px">입력한 내용과 그림이 이 기기에서 모두 지워져요.</p><div class="btns"><button class="del" id="cno" style="color:var(--ink)">취소</button><button class="save" id="cyes">새로 만들기</button></div></div>`;
  document.body.appendChild(bg);
  $('#cno', bg).onclick = () => bg.remove(); bg.onclick = e => { if (e.target === bg) bg.remove(); };
  $('#cyes', bg).onclick = () => { S = DEF(); clearImgs(); try { localStorage.removeItem(LS); } catch (e) {} bg.remove(); go(0); };
}

/* 첫 화면에 작업 파일 불러오기 */
const introAfter = STEPS[0].after;
STEPS[0].after = () => { introAfter(); const p = document.createElement('p'); p.className = 'small'; p.style.marginTop = '10px'; p.innerHTML = 'PC에서 이어서 하나요? <button style="text-decoration:underline;font-size:inherit;color:inherit" id="imp">작업 파일 불러오기</button>'; $('#screen .anim').appendChild(p); $('#imp').onclick = importFile; };

window.addEventListener('beforeprint', () => { if (!$('#print .sheet')) renderLeaflet(); });
(async () => { await dbOpen(); await dbAll(); go(S.step && STEPS[S.step] ? 0 : 0); })();
window.__sgl = { S: () => S, IMG, go, renderLeaflet, putImg, STEPS, buildPDF };
})();
