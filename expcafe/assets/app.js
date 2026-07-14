/* exp cafe' — ตัวขับเคลื่อนเว็บทั้งไซต์
   ข้อมูลทั้งหมดมาจาก Google Sheets ผ่าน Apps Script
   ถ้าดึงไม่ได้ จะถอยไปใช้ data/content.json ที่ติดมากับเว็บ เว็บจึงไม่มีวันขาว */

const CONFIG = {
  /* วาง URL ของ Web app (ลงท้าย /exec) ตรงนี้หลัง Deploy */
  endpoint: "https://script.google.com/macros/s/AKfycbwNt5roS6NvL777xJlgYbLC3lgOjFthj55ODnAlwTv0eeTSJXiip6q3K-oX0Wis8o8QKA/exec",
  imgBase: "img/",
  fallback: "data/content.json",
  cacheMinutes: 10
};

const DAYS = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"];
const CK = "expcafe_data_v1";

/* ---------- ดึงข้อมูล ---------- */
async function getData(){
  const hit = read();
  if (hit) { paint(hit, false); }

  try {
    const url = CONFIG.endpoint
      ? CONFIG.endpoint + (CONFIG.endpoint.includes("?") ? "&" : "?") + "t=" + Date.now()
      : CONFIG.fallback;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (!data || !data.site) throw new Error("รูปแบบข้อมูลไม่ถูกต้อง");
    try {
      localStorage.setItem(CK, JSON.stringify({ at: Date.now(), data }));
    } catch(e){}
    paint(data, false);
  } catch(err){
    console.warn("ดึงข้อมูลสดไม่สำเร็จ:", err.message);
    if (hit) banner("กำลังแสดงข้อมูลที่บันทึกไว้ล่าสุด");
    else {
      try {
        const res = await fetch(CONFIG.fallback);
        paint(await res.json(), true);
      } catch(e2){ banner("โหลดข้อมูลไม่สำเร็จ กรุณาลองรีเฟรชหน้านี้"); }
    }
  }
}

function read(){
  try {
    const c = JSON.parse(localStorage.getItem(CK) || "null");
    if (!c) return null;
    if (Date.now() - c.at > CONFIG.cacheMinutes * 60000) return c.data; /* เก่าแต่ยังใช้โชว์ก่อนได้ */
    return c.data;
  } catch(e){ return null; }
}

function banner(msg){
  if (document.querySelector(".offline")) return;
  const d = document.createElement("div");
  d.className = "offline";
  d.textContent = msg;
  document.body.prepend(d);
}

/* ---------- ตัวช่วย ---------- */
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g,
  c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const img = f => f ? CONFIG.imgBase + encodeURIComponent(f) : "";
const ph  = 'onerror="this.style.visibility=\'hidden\'"';

function thaiDate(iso){
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return esc(iso);
  return d.toLocaleDateString("th-TH", { day:"numeric", month:"long", year:"numeric" });
}

/* แปลง "07.00-22.00" → {open:420, close:1320} · "ปิด" → null */
function parseHours(txt){
  if (!txt) return null;
  const m = String(txt).replace(/\s/g, "").match(/(\d{1,2})[.:](\d{2})\s*[-–—]\s*(\d{1,2})[.:](\d{2})/);
  if (!m) return null;
  return { open: +m[1]*60 + +m[2], close: +m[3]*60 + +m[4], text: txt };
}

/* ---------- ป้ายเปิด–ปิด ---------- */
function status(hours){
  const box = $("#status");
  if (!box || !hours) return;
  const now  = new Date();
  const mins = now.getHours()*60 + now.getMinutes();
  const today = hours[DAYS[now.getDay()]];
  const h = parseHours(today);

  let cls = "closed", label = "ปิดอยู่", sub = "";

  if (h && mins >= h.open && mins < h.close){
    cls = "open";
    label = "เปิดอยู่ตอนนี้";
    const left = h.close - mins;
    sub = left <= 60 ? "อีก " + left + " นาทีปิด" : "ถึง " + fmt(h.close);
  } else {
    /* หาวันเปิดถัดไป */
    for (let i = 0; i < 8; i++){
      const d = new Date(now.getTime() + i*86400000);
      const nh = parseHours(hours[DAYS[d.getDay()]]);
      if (!nh) continue;
      if (i === 0 && mins < nh.open){ sub = "เปิด " + fmt(nh.open) + " วันนี้"; break; }
      if (i === 0) continue;
      sub = "เปิดอีกครั้ง " + (i === 1 ? "พรุ่งนี้" : "วัน" + DAYS[d.getDay()]) + " " + fmt(nh.open);
      break;
    }
  }
  box.className = "status " + cls;
  box.innerHTML = '<span class="dot"></span><span>' + label + '</span>' +
                  (sub ? '<span class="sub">· ' + esc(sub) + '</span>' : "");
}
const fmt = m => String(Math.floor(m/60)).padStart(2,"0") + "." + String(m%60).padStart(2,"0") + " น.";

/* ---------- เรนเดอร์ ---------- */
function paint(d, isFallback){
  const s = d.site || {}, hours = d.hours || {};

  /* ชื่อร้านทุกที่ */
  $$("[data-s]").forEach(el => {
    const v = s[el.dataset.s];
    if (!v) return;
    if (el.tagName === "A" && /^https?:|^tel:/.test(v)) el.href = v;
    else el.textContent = v;
  });
  $$("[data-mark]").forEach(el => {
    el.textContent = (s.shopName || "C").trim().charAt(0).toUpperCase();
  });

  status(hours);
  setInterval(() => status(hours), 60000);

  const page = document.body.dataset.page;
  ({ home:home, menu:menu, news:news, gallery:gallery, faq:faq, contact:contact,
     about:about }[page] || (() => {}))(d, s, hours);

  jsonLd(s, hours);
  if (isFallback) console.info("แสดงจากไฟล์สำรอง data/content.json");
}

function home(d, s, hours){
  const feat = (d.menu || []).filter(m => m.tag).slice(0, 3);
  const box = $("#featured");
  if (box) box.innerHTML = feat.length
    ? feat.map(m => card(img(m.image), m.name, m.desc, m.price ? "฿" + m.price : "")).join("")
    : '<p class="empty">ยังไม่มีเมนูแนะนำ</p>';

  const n = (d.news || []).slice(0, 3);
  const nb = $("#latest");
  if (nb) nb.innerHTML = n.length
    ? n.map(x => card(img(x.image), x.title, x.body, thaiDate(x.date))).join("")
    : '<p class="empty">ยังไม่มีข่าวสาร</p>';

  const hp = $("#heroPhoto");
  const first = (d.gallery || [])[0];
  if (hp && first) hp.innerHTML = '<img src="' + img(first.image) + '" alt="บรรยากาศร้าน" ' + ph + '>';
}

function card(src, title, body, meta){
  return '<article class="card">' +
    (src ? '<img src="' + src + '" alt="' + esc(title) + '" loading="lazy" ' + ph + '>' : "") +
    '<div class="body">' + (meta ? '<div class="date">' + esc(meta) + "</div>" : "") +
    "<h3>" + esc(title) + "</h3>" + (body ? "<p>" + esc(body) + "</p>" : "") +
    "</div></article>";
}

function menu(d){
  const list = (d.menu || []).filter(m => m.name);
  const cats = [...new Set(list.map(m => m.category || "อื่น ๆ"))];
  const cbox = $("#cats"), box = $("#menuList");
  if (!box) return;
  if (!list.length){ box.innerHTML = '<p class="empty">ยังไม่มีเมนู</p>'; return; }

  if (cbox) cbox.innerHTML = ['ทั้งหมด', ...cats]
    .map((c, i) => '<button class="cat' + (i === 0 ? " on" : "") + '" data-c="' +
                   esc(c) + '">' + esc(c) + "</button>").join("");

  const draw = pick => {
    box.innerHTML = cats.filter(c => pick === "ทั้งหมด" || c === pick).map(c =>
      '<div class="menu-group"><h3>' + esc(c) + "</h3>" +
      list.filter(m => (m.category || "อื่น ๆ") === c).map(m =>
        '<div class="item">' +
        (m.image ? '<img class="thumb" src="' + img(m.image) + '" alt="' + esc(m.name) +
                   '" loading="lazy" ' + ph + ">" : "") +
        '<div class="mid"><div class="top"><span class="nm">' + esc(m.name) + "</span>" +
        (m.tag ? '<span class="pill">' + esc(m.tag) + "</span>" : "") +
        '<span class="leader"></span>' +
        '<span class="price">' + (+m.price > 0 ? esc(m.price) + " <small>บาท</small>" : "—") + "</span>" +
        "</div>" + (m.desc ? '<div class="desc">' + esc(m.desc) + "</div>" : "") +
        "</div></div>").join("") + "</div>").join("");
  };
  draw("ทั้งหมด");

  if (cbox) cbox.onclick = e => {
    const b = e.target.closest(".cat");
    if (!b) return;
    $$(".cat").forEach(x => x.classList.remove("on"));
    b.classList.add("on");
    draw(b.dataset.c);
  };
}

function news(d){
  const box = $("#newsList");
  if (!box) return;
  const list = (d.news || []).filter(n => n.title)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  box.innerHTML = list.length
    ? list.map(n => card(img(n.image), n.title, n.body, thaiDate(n.date))).join("")
    : '<p class="empty">ยังไม่มีข่าวสารในตอนนี้ ติดตามได้ที่เฟซบุ๊กของร้าน</p>';
}

function gallery(d){
  const box = $("#galleryGrid");
  if (!box) return;
  const list = (d.gallery || []).filter(g => g.image);
  if (!list.length){ box.innerHTML = '<p class="empty">ยังไม่มีภาพ</p>'; return; }
  box.innerHTML = list.map(g =>
    '<figure class="gitem"><img src="' + img(g.image) + '" alt="' +
    esc(g.caption || "บรรยากาศร้าน") + '" loading="lazy" ' + ph + ">" +
    (g.caption ? "<figcaption>" + esc(g.caption) + "</figcaption>" : "") + "</figure>").join("");

  const lb = $("#lightbox");
  box.onclick = e => {
    const im = e.target.closest(".gitem img");
    if (!im || !lb) return;
    lb.querySelector("img").src = im.src;
    lb.classList.add("on");
  };
  if (lb) lb.onclick = () => lb.classList.remove("on");
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && lb) lb.classList.remove("on");
  });
}

function faq(d){
  const box = $("#faqList");
  if (!box) return;
  const list = (d.faq || []).filter(f => f.question);
  box.innerHTML = list.length
    ? list.map(f => "<details><summary>" + esc(f.question) + "</summary>" +
        '<div class="ans">' + esc(f.answer) + "</div></details>").join("")
    : '<p class="empty">ยังไม่มีคำถาม</p>';
}

function contact(d, s, hours){
  const t = $("#hoursTable");
  if (t){
    const today = DAYS[new Date().getDay()];
    t.innerHTML = ["จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์","อาทิตย์"].map(day => {
      const v = hours[day] || "ปิด";
      const closed = !parseHours(v);
      return "<tr" + (day === today ? ' class="today"' : "") + "><td>" + day + "</td><td" +
        (closed ? ' class="cl"' : "") + ">" + esc(closed ? "ปิด" : v) + "</td></tr>";
    }).join("");
  }
  const m = $("#map");
  if (m && s.address){
    m.innerHTML = '<iframe title="แผนที่ร้าน" loading="lazy" referrerpolicy="no-referrer-when-downgrade"' +
      ' src="https://www.google.com/maps?q=' + encodeURIComponent(s.address) +
      '&output=embed&hl=th"></iframe>';
  }
}

function about(d, s, hours){
  const box = $("#aboutBody");
  if (box && s.aboutLong){
    box.innerHTML = s.aboutLong.split(/\n+/).filter(Boolean)
      .map(p => "<p>" + esc(p) + "</p>").join("");
  }
  contact(d, s, hours);
}

/* ---------- ข้อมูลให้ Google เข้าใจว่านี่คือร้านกาแฟ ---------- */
function jsonLd(s, hours){
  const map = { "จันทร์":"Mo","อังคาร":"Tu","พุธ":"We","พฤหัสบดี":"Th",
                "ศุกร์":"Fr","เสาร์":"Sa","อาทิตย์":"Su" };
  const spec = Object.entries(hours || {}).map(([d, v]) => {
    const h = parseHours(v);
    if (!h) return null;
    return { "@type":"OpeningHoursSpecification", dayOfWeek: map[d],
      opens: fmt(h.open).replace(".", ":").replace(" น.", ""),
      closes: fmt(h.close).replace(".", ":").replace(" น.", "") };
  }).filter(Boolean);

  const el = document.createElement("script");
  el.type = "application/ld+json";
  el.textContent = JSON.stringify({
    "@context":"https://schema.org", "@type":"CafeOrCoffeeShop",
    name: s.shopName, description: s.seoDesc || s.aboutShort,
    telephone: s.phone, address: s.address, url: location.origin + location.pathname,
    sameAs: [s.facebook, s.social].filter(Boolean),
    openingHoursSpecification: spec
  });
  document.head.appendChild(el);
}

/* ---------- เมนูมือถือ ---------- */
const bg = $(".burger");
if (bg) bg.onclick = () => {
  const l = $(".links");
  const open = l.classList.toggle("open");
  bg.setAttribute("aria-expanded", open);
};

getData();
