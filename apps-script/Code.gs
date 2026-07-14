/**
 * exp cafe' — หลังบ้านเว็บไซต์
 * อ่านข้อมูลจากชีต แล้วส่งออกเป็น JSON ให้หน้าเว็บดึงไปแสดง
 *
 * วิธีใช้
 *  1. เปิดชีต > ส่วนขยาย > Apps Script > วางไฟล์นี้
 *  2. ใส่ SHEET_ID ให้ตรงกับชีตของงานนี้
 *  3. รันฟังก์ชัน setupSheet() หนึ่งครั้ง เพื่อสร้างแผ่นงานและหัวคอลัมน์
 *  4. Deploy > New deployment > Web app
 *       Execute as: Me   ·   Who has access: Anyone
 *  5. คัดลอก URL ที่ลงท้าย /exec ไปใส่ CONFIG.endpoint ใน assets/app.js
 *
 * แก้ข้อมูลในชีตแล้วเว็บอัปเดตเองภายใน 5 นาที (แคช) กด flushCache() ถ้าอยากให้ทันที
 */

var SHEET_ID = "วาง_ID_ของชีตตรงนี้";   // ดูจาก URL: /spreadsheets/d/<ID>/edit
var CACHE_SEC = 300;                     // แคช 5 นาที ลดภาระชีตตอนคนเข้าพร้อมกัน

var TABS = {
  site:    ["key", "value"],
  hours:   ["day", "open"],
  menu:    ["category", "name", "desc", "price", "image", "tag", "show"],
  news:    ["date", "title", "body", "image", "show"],
  gallery: ["image", "caption", "show"],
  faq:     ["question", "answer", "show"]
};

/* ---------- จุดที่เว็บเรียกเข้ามา ---------- */
function doGet(e) {
  try {
    var cache = CacheService.getScriptCache();
    var hit = cache.get("payload");
    if (hit && !(e && e.parameter && e.parameter.fresh)) return json(JSON.parse(hit));

    var data = build();
    cache.put("payload", JSON.stringify(data), CACHE_SEC);
    return json(data);
  } catch (err) {
    return json({ error: String(err), site: {}, hours: {}, menu: [], news: [], gallery: [], faq: [] });
  }
}

function build() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var out = { site: {}, hours: {}, menu: [], news: [], gallery: [], faq: [] };

  // site และ hours เป็นตารางคีย์–ค่า
  rowsOf(ss, "site").forEach(function (r) { if (r.key) out.site[clean(r.key)] = clean(r.value); });
  rowsOf(ss, "hours").forEach(function (r) { if (r.day) out.hours[clean(r.day)] = clean(r.open); });

  // ที่เหลือเป็นรายการ — ข้ามแถวที่ show เป็น FALSE
  ["menu", "news", "gallery", "faq"].forEach(function (t) {
    out[t] = rowsOf(ss, t).filter(visible).map(function (r) {
      var o = {};
      TABS[t].forEach(function (c) { if (c !== "show") o[c] = clean(r[c]); });
      return o;
    }).filter(function (o) {
      return Object.keys(o).some(function (k) { return o[k] !== ""; });
    });
  });

  out._updatedAt = new Date().toISOString();
  return out;
}

function rowsOf(ss, name) {
  var sh = ss.getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  var v = sh.getDataRange().getDisplayValues();
  var head = v[0].map(function (h) { return String(h).trim(); });
  return v.slice(1).map(function (row) {
    var o = {};
    head.forEach(function (h, i) { o[h] = row[i]; });
    return o;
  });
}

function visible(r) {
  var s = String(r.show == null ? "" : r.show).trim().toUpperCase();
  return s !== "FALSE" && s !== "ไม่" && s !== "0" && s !== "ซ่อน";
}

/**
 * กันสูตรฝังในเซลล์ไม่ให้หลุดไปหน้าเว็บ และตัดช่องว่างหัวท้าย
 * ห้ามถอดฟังก์ชันนี้ออก
 */
function clean(v) {
  var s = String(v == null ? "" : v).trim();
  if (/^[=+\-@]/.test(s) && s.length > 1 && !/^-?\d/.test(s)) s = "'" + s;
  return s;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ---------- เครื่องมือ ---------- */

/** รันครั้งเดียวตอนตั้งค่า — สร้างแผ่นงานพร้อมหัวคอลัมน์และตรึงแถวแรก */
function setupSheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  Object.keys(TABS).forEach(function (name) {
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, TABS[name].length).setValues([TABS[name]])
        .setFontWeight("bold").setBackground("#eaf2fe");
      sh.setFrozenRows(1);
    }
  });
  SpreadsheetApp.getUi().alert("สร้างแผ่นงานครบแล้ว: " + Object.keys(TABS).join(", "));
}

/** ล้างแคช ใช้เมื่อแก้ชีตแล้วอยากให้เว็บเห็นทันที */
function flushCache() {
  CacheService.getScriptCache().remove("payload");
}

/** เมนูในชีต ให้ลูกค้ากดล้างแคชเองได้โดยไม่ต้องเข้า Apps Script */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("เว็บไซต์ร้าน")
    .addItem("อัปเดตเว็บทันที", "flushCache")
    .addToUi();
}
