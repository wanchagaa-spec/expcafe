#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""สร้างหน้า HTML ทั้ง 7 หน้าจากโครงร่วม — แก้ nav/footer ที่เดียว ครบทุกหน้า"""
import json, pathlib

ROOT = pathlib.Path(__file__).parent
SITE = "https://wanchagaa-spec.github.io/expcafe/"
D = json.loads((ROOT / "data" / "content.json").read_text(encoding="utf-8"))
S = D["site"]

NAV = [
    ("index.html",   "หน้าแรก"),
    ("about.html",   "เกี่ยวกับเรา"),
    ("menu.html",    "เมนู"),
    ("news.html",    "ข่าวสาร"),
    ("gallery.html", "แกลเลอรี"),
    ("faq.html",     "คำถามที่พบบ่อย"),
    ("contact.html", "ติดต่อเรา"),
]

SHELL = """<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{site}{file}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{shop}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{site}{file}">
<meta property="og:image" content="{site}img/og.jpg">
<meta property="og:locale" content="th_TH">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#3685ec">
<link rel="icon" href="img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css">
</head>
<body data-page="{page}">

<header class="nav">
  <div class="wrap">
    <a class="brand" href="index.html">
      <span class="mark" data-mark>E</span><span data-s="shopName">{shop}</span>
    </a>
    <button class="burger" aria-label="เปิดเมนู" aria-expanded="false">☰</button>
    <nav class="links">
{links}
    </nav>
  </div>
</header>

<main>
{body}
</main>

<footer>
  <div class="wrap">
    <div class="cols">
      <div>
        <div class="fb-brand" data-s="shopName">{shop}</div>
        <p style="font-size:15px;max-width:34ch" data-s="aboutShort"></p>
        <p style="margin-top:14px;font-size:15px" data-s="address"></p>
      </div>
      <div>
        <h4>เมนูลัด</h4>
{flinks}
      </div>
      <div>
        <h4>ติดต่อ</h4>
        <a data-s="phone" href="tel:{phone}"></a>
        <a href="{fb}" target="_blank" rel="noopener">เฟซบุ๊กของร้าน</a>
        <a href="{map}" target="_blank" rel="noopener">เปิดใน Google Maps</a>
      </div>
    </div>
    <div class="fine">
      <span>© 2569 <span data-s="shopName">{shop}</span></span>
      <span>แก้ไขเนื้อหาผ่าน Google Sheets</span>
    </div>
  </div>
</footer>

<script src="assets/app.js"></script>
</body>
</html>
"""

HERO = """
<section class="hero">
  <div class="wrap">
    <div>
      <div id="status" class="status"><span class="dot"></span><span>กำลังตรวจเวลาทำการ…</span></div>
      <h1 style="margin-top:18px" data-s="tagline">{tagline}</h1>
      <p class="lead" data-s="aboutShort"></p>
      <div class="cta">
        <a class="btn btn-p" href="menu.html">ดูเมนูและราคา</a>
        <a class="btn btn-s" href="contact.html">เส้นทางมาร้าน</a>
      </div>
      <div class="facts">
        <div class="fact"><b>เวลาทำการ</b><span>อังคาร–อาทิตย์ 07.00–22.00 น.</span></div>
        <div class="fact"><b>โทร</b><span data-s="phone"></span></div>
        <div class="fact"><b>ไลน์</b><span data-s="line"></span></div>
      </div>
    </div>
    <div class="hero-photo" id="heroPhoto"></div>
  </div>
</section>

<section class="mist">
  <div class="wrap">
    <div class="sec-head">
      <div class="eyebrow">เมนูแนะนำ</div>
      <h2>เริ่มจากแก้วที่คนสั่งบ่อยที่สุด</h2>
    </div>
    <div class="cards" id="featured"><div class="skel"></div></div>
    <div style="margin-top:26px"><a class="btn btn-s" href="menu.html">ดูเมนูทั้งหมด</a></div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head">
      <div class="eyebrow">ข่าวสารและกิจกรรม</div>
      <h2>เกิดอะไรขึ้นที่ร้านบ้าง</h2>
    </div>
    <div class="cards" id="latest"><div class="skel"></div></div>
    <div style="margin-top:26px"><a class="btn btn-s" href="news.html">ข่าวทั้งหมด</a></div>
  </div>
</section>
"""

ABOUT = """
<section>
  <div class="wrap">
    <div class="sec-head">
      <div class="eyebrow">เกี่ยวกับเรา</div>
      <h1 data-s="shopName"></h1>
      <p class="lead" data-s="aboutShort"></p>
    </div>
    <div class="two">
      <div id="aboutBody" style="font-size:16.5px;display:grid;gap:16px"></div>
      <div>
        <div class="hero-photo" style="aspect-ratio:3/4;margin-bottom:20px">
          <img src="img/12.jfif" alt="ภายในร้าน" onerror="this.parentNode.style.display='none'">
        </div>
        <h3 style="margin-bottom:10px">เวลาทำการ</h3>
        <table class="hours-tbl" id="hoursTable"></table>
      </div>
    </div>
  </div>
</section>
"""

MENU = """
<section>
  <div class="wrap">
    <div class="sec-head">
      <div class="eyebrow">เมนู</div>
      <h1>เมนูและราคา</h1>
      <p class="lead">ราคารวมภาษีแล้ว · เปลี่ยนแปลงได้ตามฤดูกาลของเมล็ด</p>
    </div>
    <div class="cats" id="cats"></div>
    <div id="menuList"><div class="skel"></div></div>
  </div>
</section>
"""

NEWS = """
<section>
  <div class="wrap">
    <div class="sec-head">
      <div class="eyebrow">ข่าวสาร / กิจกรรม</div>
      <h1>ข่าวจากร้าน</h1>
      <p class="lead">โปรโมชั่น เมนูใหม่ และกิจกรรมที่กำลังจะเกิดขึ้น</p>
    </div>
    <div class="cards" id="newsList"><div class="skel"></div></div>
  </div>
</section>
"""

GALLERY = """
<section>
  <div class="wrap">
    <div class="sec-head">
      <div class="eyebrow">แกลเลอรี</div>
      <h1>บรรยากาศในร้าน</h1>
      <p class="lead">แตะที่ภาพเพื่อดูขนาดเต็ม</p>
    </div>
    <div class="grid-img" id="galleryGrid"><div class="skel"></div></div>
  </div>
</section>
<div class="lb" id="lightbox" role="dialog" aria-label="ภาพขยาย"><img src="" alt=""></div>
"""

FAQ = """
<section>
  <div class="wrap">
    <div class="sec-head">
      <div class="eyebrow">คำถามที่พบบ่อย</div>
      <h1>เรื่องที่ลูกค้าถามบ่อย</h1>
      <p class="lead">ไม่เจอคำตอบที่ต้องการ ทักเฟซบุ๊กหรือโทรหาเราได้เลย</p>
    </div>
    <div class="faq-list" id="faqList"><div class="skel"></div></div>
  </div>
</section>
"""

CONTACT = """
<section>
  <div class="wrap">
    <div class="sec-head">
      <div class="eyebrow">ติดต่อเรา</div>
      <h1>แวะมาหาเรา</h1>
      <div id="status" class="status" style="margin-top:14px">
        <span class="dot"></span><span>กำลังตรวจเวลาทำการ…</span>
      </div>
    </div>
    <div class="two">
      <div>
        <div class="info">
          <div class="r"><span class="k">ที่อยู่</span><span class="v" data-s="address"></span></div>
          <div class="r"><span class="k">โทร</span><a class="v" data-s="phone" href="tel:{phone}"></a></div>
          <div class="r"><span class="k">ไลน์</span><span class="v" data-s="line"></span></div>
          <div class="r"><span class="k">เฟซบุ๊ก</span><a class="v" href="{fb}" target="_blank" rel="noopener">เปิดเพจร้าน</a></div>
        </div>
        <h3 style="margin:26px 0 10px">เวลาทำการ</h3>
        <table class="hours-tbl" id="hoursTable"></table>
        <a class="btn btn-p" style="margin-top:22px" href="{map}" target="_blank" rel="noopener">
          นำทางด้วย Google Maps
        </a>
      </div>
      <div class="map" id="map"></div>
    </div>
  </div>
</section>
"""

PAGES = {
    "index.html":   ("home",    "{shop} · คาเฟ่มินิมอลสำหรับอ่านหนังสือและบอร์ดเกม", HERO),
    "about.html":   ("about",   "เกี่ยวกับเรา · {shop}", ABOUT),
    "menu.html":    ("menu",    "เมนูและราคา · {shop}", MENU),
    "news.html":    ("news",    "ข่าวสารและกิจกรรม · {shop}", NEWS),
    "gallery.html": ("gallery", "แกลเลอรีภาพ · {shop}", GALLERY),
    "faq.html":     ("faq",     "คำถามที่พบบ่อย · {shop}", FAQ),
    "contact.html": ("contact", "ติดต่อเรา และแผนที่ · {shop}", CONTACT),
}

shop = S["shopName"]
desc = S.get("seoDesc") or S["aboutShort"]
fb   = S["facebook"]
mp   = S["mapUrl"]
phone = S["phone"]
tagline = S["tagline"]

for f, (page, title, body) in PAGES.items():
    links = "\n".join(
        '      <a href="%s"%s>%s</a>' % (h, ' aria-current="page"' if h == f else "", t)
        for h, t in NAV)
    flinks = "\n".join('        <a href="%s">%s</a>' % (h, t) for h, t in NAV[1:])
    html = SHELL.format(
        title=title.format(shop=shop), desc=desc, site=SITE, file=f, shop=shop,
        page=page, links=links, flinks=flinks, phone=phone, fb=fb, map=mp,
        body=body.format(tagline=tagline, phone=phone, fb=fb, map=mp))
    (ROOT / f).write_text(html, encoding="utf-8")
    print("สร้าง", f)

# sitemap + robots
urls = "\n".join(
    "  <url><loc>%s%s</loc><changefreq>%s</changefreq></url>" %
    (SITE, f, "weekly" if f in ("index.html", "news.html") else "monthly")
    for f in PAGES)
(ROOT / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n%s\n</urlset>\n' % urls,
    encoding="utf-8")
(ROOT / "robots.txt").write_text(
    "User-agent: *\nAllow: /\n\nSitemap: %ssitemap.xml\n" % SITE, encoding="utf-8")
print("สร้าง sitemap.xml, robots.txt")
