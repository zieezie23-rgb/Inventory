/* Pengecekan PO Expired — logika inti (tanpa DOM, bisa dites di Node) */
(function (root) {
  'use strict';

  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var BLN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  var HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  var BLN_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  var DEFAULT_STD = { 1: 21, 2: 15, 3: 10, 4: 7, 5: 7, 6: 7, 7: 7 };

  /* ---------- util ---------- */
  function str(v) { return v == null ? '' : String(v).trim(); }
  function key(v) { return str(v).replace(/\.0+$/, '').replace(/^0+/, ''); }
  function toNum(v) {
    if (typeof v === 'number') return isFinite(v) ? v : null;
    if (typeof v === 'string') {
      var s = v.trim().replace(/,/g, '');
      if (s === '' || isNaN(Number(s))) return null;
      return Number(s);
    }
    return null;
  }
  function n0(v) { var n = toNum(v); return n == null ? 0 : n; }

  function serialToDate(n) {
    var d = new Date(Math.round((n - 25569) * 86400000));
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }
  function parseDate(v, mdy) {
    if (v == null || v === '') return null;
    if (v instanceof Date) return isNaN(v) ? null : new Date(v.getFullYear(), v.getMonth(), v.getDate());
    if (typeof v === 'number') return (v > 20000 && v < 100000) ? serialToDate(v) : null;
    var s = String(v).trim(), m;
    if ((m = /^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/.exec(s))) return new Date(+m[1], +m[2] - 1, +m[3]);
    if ((m = /^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})/.exec(s))) {
      var y = +m[3], a = +m[1], b = +m[2]; if (y < 100) y += 2000;
      /* mdy: format Amerika (bulan/tanggal/tahun) — dipakai kecuali angka pertama jelas bukan bulan (>12) */
      if (mdy && a <= 12) return new Date(y, a - 1, b);
      return new Date(y, b - 1, a);
    }
    if (/^\d{5}(\.\d+)?$/.test(s)) return serialToDate(Number(s));
    var t = Date.parse(s);
    if (!isNaN(t)) { var d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
    return null;
  }

  /* ---------- CSV ---------- */
  function detectDelim(text) {
    var nl = text.indexOf('\n'); var line = text.substring(0, nl < 0 ? Math.min(text.length, 5000) : nl);
    var best = ',', bc = -1;
    [',', ';', '\t', '|'].forEach(function (d) { var c = line.split(d).length; if (c > bc) { bc = c; best = d; } });
    return best;
  }
  function parseCSV(text, delim, cb) {
    var n = text.length;
    if (text.indexOf('"') < 0) {
      var start = 0;
      while (start < n) {
        var end = text.indexOf('\n', start); if (end < 0) end = n;
        var line = text.substring(start, end);
        if (line.charCodeAt(line.length - 1) === 13) line = line.slice(0, -1);
        start = end + 1;
        if (line === '') continue;
        cb(line.split(delim));
      }
      return;
    }
    var i = 0, rec = [], f = '', inQ = false, dc = delim.charCodeAt(0);
    while (i < n) {
      var ch = text.charCodeAt(i);
      if (inQ) {
        if (ch === 34) { if (text.charCodeAt(i + 1) === 34) { f += '"'; i += 2; continue; } inQ = false; i++; continue; }
        f += text[i]; i++; continue;
      }
      if (ch === 34) { inQ = true; i++; continue; }
      if (ch === dc) { rec.push(f); f = ''; i++; continue; }
      if (ch === 10 || ch === 13) {
        if (ch === 13 && text.charCodeAt(i + 1) === 10) i++;
        i++; rec.push(f); f = '';
        if (rec.length > 1 || rec[0] !== '') cb(rec);
        rec = []; continue;
      }
      f += text[i]; i++;
    }
    if (f !== '' || rec.length) { rec.push(f); cb(rec); }
  }

  /* ---------- parser bahan ---------- */
  function parsePOM(text) {
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    var delim = detectDelim(text);
    var head = null, idx = null, rows = [], maxDate = new Map();
    parseCSV(text, delim, function (rec) {
      if (!head) {
        head = rec.map(function (s) { return s.trim().toUpperCase(); });
        idx = { doc: head.indexOf('DOCNO'), supco: head.indexOf('SUPCO'), prd: head.indexOf('PRDCD'), qty: head.indexOf('QTY'), date: head.indexOf('PO_DATE'), umur: [] };
        head.forEach(function (h, j) { if (/^UMUR/.test(h)) { if (h === 'UMUR_PO') idx.umur.unshift(j); else idx.umur.push(j); } });
        var miss = [];
        if (idx.doc < 0) miss.push('DOCNO'); if (idx.supco < 0) miss.push('SUPCO'); if (idx.prd < 0) miss.push('PRDCD');
        if (idx.qty < 0) miss.push('QTY'); if (idx.date < 0) miss.push('PO_DATE'); if (!idx.umur.length) miss.push('UMUR_PO');
        if (miss.length) throw new Error('Kolom tidak ditemukan di POMGG.csv: ' + miss.join(', '));
        return;
      }
      var doc = str(rec[idx.doc]); if (!doc) return;
      var prd = str(rec[idx.prd]);
      var dt = parseDate(rec[idx.date], true);
      var ms = dt ? dt.getTime() : null;
      var umur = 0;   /* ada beberapa kolom UMUR*: pakai yang pertama berisi (UMUR_PO diutamakan) */
      for (var u = 0; u < idx.umur.length; u++) { var uv = rec[idx.umur[u]]; if (uv != null && String(uv).trim() !== '') { umur = n0(uv); break; } }
      var exp = null;
      if (dt) { var de = new Date(dt.getTime()); de.setDate(de.getDate() + (umur || 0)); exp = de.getTime(); }
      rows.push({ doc: doc, docU: doc.toUpperCase(), supco: str(rec[idx.supco]), prd: prd, qty: n0(rec[idx.qty]), date: exp });
      if (ms != null) { var k = key(prd); var o = maxDate.get(k); if (o == null || ms > o) maxDate.set(k, ms); }
    });
    if (!head) throw new Error('POMGG.csv kosong.');
    return { rows: rows, maxDate: maxDate, count: rows.length };
  }

  var MASTER_F = {
    prd: [1, 'PRDCD'], desc: [2, 'DESC2'], supco: [10, 'SUPCO'], snama: [11, 'SNAMA'], fk: [12, 'FK'], frac: [16, 'FRAC'],
    pkm: [19, 'PKM'], ptag: [21, 'PTAG'], avg: [25, 'AVG'], mean: [29, 'MEAN'], stk: [38, 'STKG113'], poout: [45, 'POG113'],
    keb: [53, 'KEB'], protect: [64, 'PROTECT'], lead: [66, 'LEAD'], seasonal: [59, 'SEASONAL']
  };
  function parseMaster(rows) {
    var h = -1, i;
    for (i = 0; i < Math.min(rows.length, 15); i++) { if (rows[i] && str(rows[i][0]).toUpperCase() === 'PRDCD') { h = i; break; } }
    if (h < 0) throw new Error('Header "PRDCD" tidak ditemukan di kolom A (baris 1-15) pada Master Stock.');
    var head = rows[h].map(function (x) { return str(x).toUpperCase(); });
    var idx = {}, warn = [];
    Object.keys(MASTER_F).forEach(function (k) {
      var pos = MASTER_F[k][0] - 1, name = MASTER_F[k][1], f = head.indexOf(name);
      if (f >= 0) idx[k] = f; else { idx[k] = pos; warn.push(name + ' (pakai kolom ke-' + (pos + 1) + ')'); }
    });
    var map = new Map(), supMap = new Map(), count = 0;
    for (i = h + 1; i < rows.length; i++) {
      var r = rows[i]; if (!r) continue;
      var p = str(r[idx.prd]); if (!/^\d{4,}$/.test(p)) continue;
      count++;
      var k = key(p);
      var sup = str(r[idx.supco]);
      if (sup) { var su = sup.toUpperCase(); if (!supMap.has(su)) supMap.set(su, str(r[idx.snama])); }
      if (map.has(k)) continue;
      var pt = r[idx.ptag];
      map.set(k, {
        desc: str(r[idx.desc]), supco: sup, fk: str(r[idx.fk]), frac: n0(r[idx.frac]), pkm: n0(r[idx.pkm]),
        ptag: (pt == null || pt === '') ? 0 : pt, avg: n0(r[idx.avg]), mean: n0(r[idx.mean]), stk: n0(r[idx.stk]),
        poout: n0(r[idx.poout]), keb: n0(r[idx.keb]), protect: str(r[idx.protect]).toUpperCase(), lead: n0(r[idx.lead]), seasonal: str(r[idx.seasonal]).toUpperCase(), seasonalDetail: str(r[idx.seasonal + 1])
      });
    }
    if (!count) throw new Error('Tidak ada baris produk (PRDCD) di Master Stock.');
    return { map: map, supMap: supMap, count: count, warn: warn };
  }

  function parseStockOut(rows) {
    var h = -1, ip = -1, ik = -1, i, j;
    for (i = 0; i < Math.min(rows.length, 15) && h < 0; i++) {
      var r = rows[i]; if (!r) continue;
      var up = r.map(function (x) { return str(x).toUpperCase(); });
      var a = up.indexOf('PRDCD'), b = up.indexOf('KL');
      if (a >= 0 && b >= 0) { h = i; ip = a; ik = b; }
    }
    if (h < 0) throw new Error('Header "Prdcd" dan "KL" tidak ditemukan di Stock Out.');
    var map = new Map();
    for (j = h + 1; j < rows.length; j++) {
      var rr = rows[j]; if (!rr) continue;
      var k = key(rr[ip]); if (!k || !/^\d+$/.test(k)) continue;
      if (!map.has(k)) map.set(k, n0(rr[ik]));
    }
    return { map: map, count: map.size };
  }

  function parsePromo(rows) {
    var h = -1, i;
    for (i = 0; i < Math.min(rows.length, 15); i++) { if (rows[i] && str(rows[i][0]).toUpperCase() === 'PLU') { h = i; break; } }
    if (h < 0) throw new Error('Header "PLU" tidak ditemukan di kolom A pada Promo.');
    var map = new Map();
    for (i = h + 1; i < rows.length; i++) {
      var r = rows[i]; if (!r) continue;
      var k = key(r[0]); if (!k || !/^\d+$/.test(k) || map.has(k)) continue;
      var mn = null, mx = null;
      for (var c = 4; c <= 7; c++) {
        var d = parseDate(r[c]); if (!d) continue;
        var t = d.getTime(); if (mn == null || t < mn) mn = t; if (mx == null || t > mx) mx = t;
      }
      var tg = r[2];
      map.set(k, { target: (tg == null || tg === '') ? 0 : tg, jenis: str(r[3]), awal: mn, akhir: mx });
    }
    return { map: map, count: map.size };
  }

  function parseSeasonal(rows) {
    var h = -1, i;
    for (i = 0; i < Math.min(rows.length, 15); i++) {
      if (rows[i] && str(rows[i][0]).toUpperCase() === 'PRDCD' && rows[i].some(function (x) { return str(x).toUpperCase() === 'TGT (IN QTY)'; })) { h = i; break; }
    }
    if (h < 0) throw new Error('Header "PRDCD" dan "TGT (IN QTY)" tidak ditemukan di sheet BASIC (baris 1-15).');
    var head = rows[h].map(function (x) { return str(x).toUpperCase(); });
    var NAMES = { desc: 'DESC', frac: 'FRAC', pola2: 'POLA2', tgt: 'TGT (IN QTY)', po: 'PO (IN QTY)', bpb: 'BPB (IN QTY)', poout: 'PO OUT (IN QTY)' };
    var idx = {}, miss = [];
    Object.keys(NAMES).forEach(function (k) { idx[k] = head.indexOf(NAMES[k]); if (idx[k] < 0) miss.push(NAMES[k]); });
    if (miss.length) throw new Error('Kolom tidak ditemukan di sheet BASIC: ' + miss.join(', '));
    var map = new Map();
    for (i = h + 1; i < rows.length; i++) {
      var r = rows[i]; if (!r) continue;
      var k = key(r[0]); if (!k || !/^\d+$/.test(k) || map.has(k)) continue;
      map.set(k, { desc: str(r[idx.desc]), frac: n0(r[idx.frac]), pola2: str(r[idx.pola2]), tgt: n0(r[idx.tgt]), po: n0(r[idx.po]), bpb: n0(r[idx.bpb]), poout: n0(r[idx.poout]) });
    }
    if (!map.size) throw new Error('Tidak ada baris produk di sheet BASIC.');
    return { map: map, count: map.size };
  }

  /* ---------- hitung ---------- */
  function dsi(a, L) { return (typeof a === 'number' && typeof L === 'number' && L !== 0) ? a / (L / 30) : ''; }
  function D(ms) { return ms == null ? '' : new Date(ms); }

  function buildRow(r, S, opts) {
    var k = key(r.prd);
    var m = S.master.map.get(k);
    var promo = S.promo.map.get(k);
    var sn = S.master.supMap.get(r.supco.toUpperCase());
    var o = {
      po: r.doc, tgl: D(r.date), supco: r.supco, snama: sn == null ? 0 : sn, prd: r.prd,
      desc: m ? m.desc : '', frac: m ? m.frac : '', ptag: m ? m.ptag : '', fk: m ? m.fk : '',
      avg: m ? m.avg : '', mean: m ? m.mean : '', qty: r.qty,
      pkm: m ? m.pkm : '', stk: m ? m.stk : '', poout: m ? m.poout : '', keb: m ? m.keb : '', lead: m ? m.lead : ''
    };
    o.dsiPo = dsi(r.qty, o.avg);
    var mx = S.pom.maxDate.get(k); o.maxTgl = mx == null ? '' : new Date(mx);
    o.over = (m ? Math.max(o.stk + o.poout + r.qty - o.pkm, 0) : '');
    o.dsiPkm = dsi(o.pkm, o.avg);
    o.dsiStk = dsi(o.stk, o.avg);
    o.avgPb = typeof o.avg === 'number' ? o.avg / 30 * 7 : '';
    o.promoAwal = promo ? D(promo.awal) : '';
    o.promoAkh = promo ? D(promo.akhir) : '';
    o.target = promo ? (toNum(promo.target) == null ? promo.target : toNum(promo.target)) : '';
    o.jenis = promo ? promo.jenis : '';
    o.ket = m ? (m.protect === 'PROTECT HO' ? 'CMO' : 'Reg') : '';
    var sea = S.seasonal && S.seasonal.map ? S.seasonal.map.get(k) : null;
    var masterSeasonal = m ? (m.seasonal + ' ' + m.seasonalDetail).toUpperCase() : '';
    o.basic = (sea && /\bBASIC\b/.test(masterSeasonal)) ? sea : null;

    var std = 0;
    if (opts.dsiStd) { var sv = (opts.std || DEFAULT_STD)[Number(o.fk)]; std = sv == null ? 0 : sv; }
    if (o.jenis !== '') o.kes = 'Promosi';
    else if (typeof o.poout === 'number' && typeof o.pkm === 'number' && o.poout < o.pkm) o.kes = 'PO Out Aktif kecil/ under PKM';
    else if (S.stockOut.map.get(k) === 1) o.kes = 'Stock Out';
    else if (typeof o.dsiStk === 'number' && o.dsiStk < std) o.kes = 'DSI under Standart';
    else if (opts.dsiStd && typeof o.dsiStk === 'number' && o.dsiStk > std) o.kes = 'DSI stock melebihi standart';
    else o.kes = '';
    return o;
  }

  function compute(inputs, S, opts) {
    opts = opts || {};
    var want = new Map();
    inputs.forEach(function (p) { var t = String(p).trim(), u = t.toUpperCase(); if (u && !want.has(u)) want.set(u, t); });
    var hit = new Set(), rows = [];
    var pr = S.pom.rows;
    for (var i = 0; i < pr.length; i++) {
      if (want.has(pr[i].docU)) { hit.add(pr[i].docU); rows.push(buildRow(pr[i], S, opts)); }
    }
    var notFound = [];
    want.forEach(function (orig, u) { if (!hit.has(u)) notFound.push(orig); });
    return { rows: rows, notFound: notFound, opts: opts };
  }

  /* ---------- kesimpulan teks ---------- */
  var KES_ORDER = ['Promosi', 'Stock Out', 'PO Out Aktif kecil/ under PKM', 'DSI under Standart', 'DSI stock melebihi standart'];

  function nfID(v, dec) {
    var r = Math.round(v * Math.pow(10, dec)) / Math.pow(10, dec), neg = r < 0;
    var p = Math.abs(r).toFixed(dec).split('.');
    var out = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (p[1] && Number(p[1]) ? ',' + p[1].replace(/0+$/, '') : '');
    return (neg ? '-' : '') + out;
  }
  function pct(a, b) { return b > 0 ? nfID(a / b * 100, 1) + '%' : '-'; }
  function fmtTglID(d) {
    if (!(d instanceof Date) || isNaN(d)) return '...';
    return String(d.getDate()).padStart(2, '0') + ' ' + BLN_ID[d.getMonth()] + ' ' + String(d.getFullYear()).slice(2);
  }

  function aligned(pairs) {
    var w = 0;
    pairs.forEach(function (p) { if (p[0].length > w) w = p[0].length; });
    return pairs.map(function (p) { return p[0] + new Array(w - p[0].length + 1).join(' ') + ' : ' + p[1]; }).join('\n');
  }

  function buildBasic(items) {
    var out = 'Selamat pagi pak @Jonathan C\n\nHari ini di DC BGR1 ada kedatangan item basic:\n';
    items.forEach(function (r) {
      var b = r.basic, f = b.frac || (typeof r.frac === 'number' ? r.frac : 0) || 1;
      function ctn(q) { return q / f; }
      var qtyPo = ctn(r.qty), tgt = ctn(b.tgt), bpb = ctn(b.bpb), pout = ctn(b.poout);
      var ttl = qtyPo + bpb + pout, kurang = tgt - ttl;
      out += '\n' +
        aligned([
          ['Supp', r.supco + (r.snama ? ' - ' + r.snama : '')],
          ['No po', r.po],
          ['Ket', 'PO EXP TGL ' + fmtTglID(r.tgl)]
        ]) + '\n\n' +
        aligned([
          ['Plu', r.prd],
          ['Desc', r.desc || b.desc]
        ]) + '\n\n' +
        aligned([
          ['Qty PO datang (exp) in ctn', nfID(qtyPo, 2)],
          ['Target in ctn', nfID(tgt, 2)],
          ['BPB in ctn', nfID(bpb, 2)],
          ['PO Out in ctn', nfID(pout, 2)],
          ['BPB vs Target', pct(b.bpb, b.tgt)],
          ['PO + BPB vs Target', pct(b.bpb + b.poout, b.tgt)],
          ['Ttl PO Exp + BPB + PO Out', nfID(ttl, 2)]
        ]) + '\n\n' +
        'jika diterima,\n' +
        aligned([
          ['Kekurang In ctn', kurang > 0 ? nfID(kurang, 2) : '0 (melebihi target ' + nfID(-kurang, 2) + ')'],
          ['BPB vs Target', pct(b.bpb + r.qty, b.tgt)]
        ]) + '\n';
    });
    return out + '\nMohon arahannya apakah bisa diterima atau ditolak?';
  }

  function buildStd(rows) {
    function has(v) { return rows.some(function (r) { return r.kes === v; }); }
    var reasons = KES_ORDER.filter(has);
    var out = (has('DSI stock melebihi standart') ? 'Izin ditolak' : 'Izin diterima') + ' Pak @IDM Pak Rian PR,';
    if (reasons.length) out += ' Item ' + reasons.join(', ');
    return out;
  }

  function buildSummary(res) {
    var rows = res.rows; if (!rows.length) return '';
    var basics = rows.filter(function (r) { return r.basic; }), others = rows.filter(function (r) { return !r.basic; });
    var parts = [];
    if (basics.length) parts.push(buildBasic(basics));
    if (others.length) parts.push(buildStd(others));
    return parts.join('\n\n');
  }

  /* ---------- kolom & format tampilan (meniru sheet CHECK C:AD + AF) ---------- */
  var COLS = [
    { k: 'po', h: 'NO PO EXPIRED', w: 13.4, a: 'c', t: 'txt' },
    { k: 'tgl', h: 'TGL PO EKSPIRED', w: 12, a: 'r', t: 'date' },
    { k: 'supco', h: 'SUPCO', w: 9.3, a: 'c', t: 'txt' },
    { k: 'snama', h: 'SNAMA', w: 40, a: 'l', t: 'txt' },
    { k: 'prd', h: 'PRDCD', w: 11.9, a: 'c', t: 'txt' },
    { k: 'desc', h: 'DESC', w: 52, a: 'l', t: 'txt' },
    { k: 'frac', h: 'FRAC', w: 5.9, a: 'r', t: 'int' },
    { k: 'ptag', h: 'PTAG', w: 6.3, a: 'r', t: 'int' },
    { k: 'fk', h: 'FK', w: 5.6, a: 'c', t: 'txt' },
    { k: 'avg', h: 'AVG SLS', w: 8.1, a: 'c', t: 'int' },
    { k: 'mean', h: 'Mean', w: 8.1, a: 'c', t: 'dec' },
    { k: 'qty', h: 'QTY PO EXP', w: 8.6, a: 'r', t: 'int' },
    { k: 'dsiPo', h: 'DSI PO EXP', w: 7.3, a: 'r', t: 'int' },
    { k: 'pkm', h: 'PKM DC', w: 8.3, a: 'r', t: 'int' },
    { k: 'stk', h: 'STOCK DC', w: 9.6, a: 'r', t: 'int' },
    { k: 'poout', h: 'QTY PO OUT', w: 8.9, a: 'r', t: 'int' },
    { k: 'maxTgl', h: 'MAX TGL PO OUT', w: 12.1, a: 'r', t: 'date' },
    { k: 'over', h: 'OVER PKM', w: 8.9, a: 'r', t: 'int' },
    { k: 'keb', h: 'KBTHN TOKO', w: 9.1, a: 'r', t: 'int' },
    { k: 'dsiPkm', h: 'DSI PKM', w: 7.7, a: 'r', t: 'dec' },
    { k: 'dsiStk', h: 'DSI STOCK', w: 8.4, a: 'r', t: 'dec' },
    { k: 'lead', h: 'LEAD TIME', w: 7.4, a: 'r', t: 'int' },
    { k: 'avgPb', h: 'AVG PB TOKO (7_HARI)', w: 10.7, a: 'r', t: 'dec' },
    { k: 'promoAwal', h: 'TGL AWAL', w: 11.7, a: 'r', t: 'date', g: 'promo' },
    { k: 'promoAkh', h: 'TGL AKH', w: 11.7, a: 'r', t: 'date', g: 'promo' },
    { k: 'target', h: 'TARGET', w: 13.7, a: 'r', t: 'int', g: 'promo' },
    { k: 'jenis', h: 'JENIS PROMO', w: 9.3, a: 'l', t: 'txt', g: 'promo' },
    { k: 'ket', h: 'KET', w: 7.5, a: 'c', t: 'txt' },
    { spacer: true, w: 1.3 },
    { k: 'kes', h: 'Kesimpulan', w: 30.1, a: 'l', t: 'txt' }
  ];
  COLS.forEach(function (c) { c.px = Math.round(c.w * 7 + 5); });

  function commas(s) { return s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function fmtDate(d) {
    if (!(d instanceof Date) || isNaN(d)) return '';
    return d.getDate() + '-' + MON[d.getMonth()] + '-' + String(d.getFullYear()).slice(2);
  }
  function fmtCell(c, v) {
    if (v === '' || v == null) return '';
    if (c.t === 'date') return fmtDate(v);
    if (c.t === 'int' || c.t === 'dec') {
      if (typeof v !== 'number') return String(v);
      var r = c.t === 'int' ? Math.round(v) : Math.round(v * 100) / 100;
      if (r === 0) return '-';
      var neg = r < 0, s = Math.abs(r).toFixed(c.t === 'int' ? 0 : 2).split('.');
      var o = commas(s[0]) + (s[1] ? '.' + s[1] : '');
      return neg ? '(' + o + ')' : o;
    }
    return String(v);
  }
  function fmtTodayID(d) {
    d = d || new Date();
    return HARI[d.getDay()] + ', ' + String(d.getDate()).padStart(2, '0') + ' ' + BLN[d.getMonth()] + ' ' + d.getFullYear();
  }

  var api = {
    key: key, toNum: toNum, parseDate: parseDate, parseCSV: parseCSV, detectDelim: detectDelim,
    parsePOM: parsePOM, parseMaster: parseMaster, parseStockOut: parseStockOut, parsePromo: parsePromo, parseSeasonal: parseSeasonal,
    compute: compute, buildSummary: buildSummary, COLS: COLS, fmtCell: fmtCell, fmtDate: fmtDate, fmtTodayID: fmtTodayID,
    DEFAULT_STD: DEFAULT_STD
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PoCore = api;
})(typeof window !== 'undefined' ? window : this);

;
/* Pengecekan PO Expired — antarmuka */
(function () {
  'use strict';
  var C = window.PoCore;
  var $ = function (id) { return document.getElementById(id); };

  /* Hanya Seasonal yang perlu dipilih manual. Data barang, POM G113, Stock Out, dan Promo dipasok langsung dari sumber Inventory. */
  var KINDS = [
    { id: 'seasonal', label: 'Laporan Seasonal', hint: 'Laporan Harian Seasonal*.xlsx (sheet BASIC)', accept: '.xlsx,.xlsb,.xls', test: /seasonal/i }
  ];
  var S = { master: null, pom: null, stockOut: null, promo: null, seasonal: null };
  var META = {};
  var lastRes = null;
  var PARSE_VER = 4;

  /* ---------- util UI ---------- */
  var toastTimer;
  function toast(msg) {
    var t = $('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }
  function tick() { return new Promise(function (r) { setTimeout(r, 30); }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hhmm(ts) { var d = new Date(ts); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function nf(n) { return Number(n).toLocaleString('id-ID'); }

  /* ---------- penyimpanan (IndexedDB) ---------- */
  var dbp = null;
  function db() {
    if (!dbp) dbp = new Promise(function (res, rej) {
      var rq = indexedDB.open('po-expired', 1);
      rq.onupgradeneeded = function () { rq.result.createObjectStore('kv'); };
      rq.onsuccess = function () { res(rq.result); };
      rq.onerror = function () { rej(rq.error); };
    });
    return dbp;
  }
  function idbGet(k) { return db().then(function (d) { return new Promise(function (res, rej) { var r = d.transaction('kv').objectStore('kv').get(k); r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; }); }); }
  function idbSet(k, v) { return db().then(function (d) { return new Promise(function (res, rej) { var t = d.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = res; t.onerror = function () { rej(t.error); }; }); }); }

  /* ---------- SheetJS (dimuat saat dibutuhkan) ---------- */
  var XLSX_URLS = ['https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'];
  var xlsxP = null;
  function ensureXLSX() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    if (xlsxP) return xlsxP;
    xlsxP = new Promise(function (res, rej) {
      var i = 0;
      (function next() {
        if (i >= XLSX_URLS.length) { xlsxP = null; return rej(new Error('Pustaka pembaca Excel gagal dimuat. Hubungkan ke internet sekali, lalu coba lagi.')); }
        var s = document.createElement('script'); s.src = XLSX_URLS[i++]; s.crossOrigin = 'anonymous';
        s.onload = function () { window.XLSX ? res(window.XLSX) : next(); };
        s.onerror = function () { s.remove(); next(); };
        document.head.appendChild(s);
      })();
    });
    return xlsxP;
  }

  var SHEET_TEST = {
    master: function (rows) { for (var i = 0; i < Math.min(rows.length, 15); i++) if (rows[i] && String(rows[i][0] == null ? '' : rows[i][0]).trim().toUpperCase() === 'PRDCD') return true; return false; },
    stockOut: function (rows) { for (var i = 0; i < Math.min(rows.length, 15); i++) { var u = (rows[i] || []).map(function (x) { return String(x == null ? '' : x).trim().toUpperCase(); }); if (u.indexOf('PRDCD') >= 0 && u.indexOf('KL') >= 0) return true; } return false; },
    promo: function (rows) { for (var i = 0; i < Math.min(rows.length, 15); i++) if (rows[i] && String(rows[i][0] == null ? '' : rows[i][0]).trim().toUpperCase() === 'PLU') return true; return false; }
  };
  var PARSERS = { master: C.parseMaster, stockOut: C.parseStockOut, promo: C.parsePromo, seasonal: C.parseSeasonal };

  /* file Seasonal besar (banyak sheet, sheet BASIC sangat lebar): baca hanya sheet BASIC dan batasi kolom */
  function readSeasonalRows(X, buf) {
    var names = X.read(buf, { type: 'array', bookSheets: true }).SheetNames;
    var nm = names.filter(function (n) { return /^basic$/i.test(String(n).trim()); })[0];
    if (!nm) throw new Error('Sheet "BASIC" tidak ditemukan di file Seasonal.');
    var wb = X.read(buf, { type: 'array', dense: true, sheets: nm, cellFormula: false, cellStyles: false, cellHTML: false, cellNF: false });
    var ws = wb.Sheets[nm];
    var rg = X.utils.decode_range(ws['!ref']); if (rg.e.c > 45) rg.e.c = 45;
    ws['!ref'] = X.utils.encode_range(rg);
    return X.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null });
  }

  function readWorkbookRows(X, buf, kind) {
    var wb = X.read(buf, { type: 'array', dense: true, cellFormula: false, cellStyles: false, cellHTML: false, cellNF: false });
    for (var i = 0; i < wb.SheetNames.length; i++) {
      var rows = X.utils.sheet_to_json(wb.Sheets[wb.SheetNames[i]], { header: 1, raw: true, defval: null });
      if (SHEET_TEST[kind](rows)) return rows;
    }
    throw new Error('Sheet yang berisi data ' + (KINDS.filter(function (k) { return k.id === kind; })[0].label) + ' tidak ditemukan di file ini.');
  }

  /* ---------- kartu bahan ---------- */
  function buildCards() {
    $('btnFold').onclick = function () { $('secBahan').classList.toggle('folded'); updateBahanFold(); };
    var box = $('bahan'); box.innerHTML = '';
    KINDS.forEach(function (k) {
      var d = document.createElement('div'); d.className = 'bh'; d.id = 'bh-' + k.id; d.title = k.hint;
      d.innerHTML = '<b>' + k.label + '</b>' +
        '<div class="st"><span class="dot"></span><span class="msg">Belum ada file</span><button type="button">Pilih file</button></div>' +
        '<input type="file" hidden accept="' + k.accept + '">';
      var inp = d.querySelector('input');
      d.querySelector('button').onclick = function () { inp.click(); };
      inp.onchange = function () { if (inp.files[0]) loadFile(k.id, inp.files[0]); inp.value = ''; };
      box.appendChild(d);
    });
  }
  function setCard(kind, state, msg) {
    var d = $('bh-' + kind);
    /* Bahan terintegrasi dari Inventory tidak memiliki kartu upload manual.
       Hanya Seasonal yang ditampilkan dan dipilih pengguna. */
    if (!d) return;
    var message = d.querySelector('.msg');
    if (!message) throw new Error('Elemen status kartu tidak ditemukan: ' + kind);
    d.className = 'bh ' + state;
    message.textContent = msg;
  }
  function cardOk(kind) {
    var m = META[kind]; if (!m) return;
    setCard(kind, 'ok', m.name + ' · ' + nf(m.count) + ' baris · ' + hhmm(m.at));
  }
  function updateBahanFold() {
    /* Kartu Seasonal selalu tetap terlihat agar pengguna bisa mengganti file kapan saja. */
    var sec = $('secBahan');
    sec.classList.remove('folded');
    var ready = !!S.seasonal;
    $('bahanSum').textContent = ready ? 'File Seasonal sudah dimuat' : 'Unggah file Seasonal';
    $('btnFold').hidden = true;
  }
  function refreshReady() {
    updateBahanFold();
    var ok = !!(S.master && S.pom);
    $('btnRun').disabled = !ok;
    var miss = [], note = [];
    if (!S.stockOut) { miss.push('Stock Out'); note.push('penilaian Stock Out tidak aktif'); }
    if (!S.promo) { miss.push('Promo'); note.push('kolom promo kosong'); }
    if (!S.seasonal) { miss.push('Seasonal'); note.push('teks khusus item Basic tidak aktif'); }
    var w = $('warn');
    if (ok && miss.length) { w.hidden = false; w.textContent = 'Bahan ' + miss.join(', ') + ' belum dimuat — hasil tetap bisa dihitung, tetapi ' + note.join(', ') + '.'; }
    else if (!ok) { w.hidden = false; w.textContent = 'Muat Master Stock dan POMGG dulu supaya No PO bisa dicek.'; }
    else w.hidden = true;
  }

  async function loadFile(kind, file) {
    setCard(kind, 'busy', 'Membaca ' + file.name + '…');
    await tick();
    try {
      var data;
      if (kind === 'pom') {
        var text = new TextDecoder('utf-8').decode(await file.arrayBuffer());
        data = C.parsePOM(text);
      } else {
        var X = await ensureXLSX();
        var buf = await file.arrayBuffer();
        await tick();
        data = PARSERS[kind](kind === 'seasonal' ? readSeasonalRows(X, buf) : readWorkbookRows(X, buf, kind));
      }
      S[kind] = data;
      META[kind] = { name: file.name, at: Date.now(), count: kind === 'master' || kind === 'pom' ? data.count : data.count };
      cardOk(kind);
      if (data.warn && data.warn.length) toast('Master: kolom ' + data.warn.join(', ') + ' tidak ditemukan di header');
      idbSet(kind, { meta: META[kind], data: data, pv: PARSE_VER }).catch(function () { });
    } catch (e) {
      console.error(e);
      setCard(kind, 'err', e.message || String(e));
      toast('Gagal membaca ' + file.name);
      refreshReady();
      return false;
    }
    refreshReady();
    return true;
  }

  function classify(file) {
    var n = file.name;
    for (var i = 0; i < KINDS.length; i++) if (KINDS[i].test.test(n)) return KINDS[i].id;
    if (/\.csv$/i.test(n)) return 'pom';
    return null;
  }
  async function loadMany(files) {
    var list = Array.prototype.slice.call(files);
    for (var i = 0; i < list.length; i++) {
      var k = classify(list[i]);
      if (!k) { toast('Nama file tidak dikenali: ' + list[i].name); continue; }
      await loadFile(k, list[i]);
    }
  }

  /* ---------- pengaturan ---------- */
  function loadOpts() {
    var o = {}; try { o = JSON.parse(localStorage.getItem('po_opts') || '{}'); } catch (e) { }
    $('optDsi').checked = o.dsiStd !== false;
    var box = $('stdBox'); box.innerHTML = '';
    for (var f = 1; f <= 7; f++) {
      var v = (o.std && o.std[f] != null) ? o.std[f] : C.DEFAULT_STD[f];
      var l = document.createElement('label'); l.innerHTML = 'FK ' + f + ' <input type="number" min="0" data-fk="' + f + '" value="' + v + '">';
      box.appendChild(l);
    }
  }
  function readOpts() {
    var std = {}; document.querySelectorAll('#stdBox input').forEach(function (i) { std[i.dataset.fk] = Number(i.value) || 0; });
    return { dsiStd: $('optDsi').checked, std: std };
  }
  function saveOpts() { try { localStorage.setItem('po_opts', JSON.stringify(readOpts())); } catch (e) { } }

  /* ---------- hasil ---------- */
  async function run() {
    var inputs = $('poInput').value.split(/[\s,;]+/).filter(Boolean);
    if (!inputs.length) { toast('Isi No PO dulu'); return; }
    var btn = $('btnRun');
    if (btn.disabled) return;
    btn.disabled = true;
    function progress(label, percent, done) { window.dispatchEvent(new CustomEvent('inventory-po-progress', {detail:{label:label,percent:percent,done:!!done,show:true}})); }
    try {
      progress('Memulai pemeriksaan PO EXPIRED…', 5, false);
      await tick();
      var SS = { master: S.master, pom: S.pom, stockOut: S.stockOut || { map: new Map() }, promo: S.promo || { map: new Map() }, seasonal: S.seasonal || { map: new Map() } };
      var o = readOpts(); saveOpts();
      progress('Menganalisis No PO dan mencocokkan data…', 25, false);
      await tick();
      lastRes = C.compute(inputs, SS, o);
      progress('Menyusun tabel dan ringkasan hasil…', 85, false);
      await tick();
      renderResult();
      progress('Pemeriksaan PO EXPIRED selesai', 100, true);
    } catch (e) {
      progress('Pemeriksaan PO EXPIRED gagal', 100, true);
      toast(e && e.message ? e.message : 'Gagal memproses PO EXPIRED');
    } finally { btn.disabled = false; }
  }

  function renderSummary() {
    if (!lastRes) return;
    var ta = $('kesimpulan'); ta.value = C.buildSummary(lastRes);
    ta.style.height = 'auto'; ta.style.height = Math.min(Math.max(ta.scrollHeight + 4, 60), 2400) + 'px';
  }

  function renderResult() {
    var r = lastRes, w = $('warn');
    $('secHasil').hidden = false;
    if (r.notFound.length) { w.hidden = false; w.textContent = 'Tidak ditemukan di POMGG: ' + r.notFound.join(', '); } else refreshReady();
    renderSummary();
    var pos = new Set(r.rows.map(function (x) { return x.po; })).size;
    $('stat').textContent = r.rows.length + ' item dari ' + pos + ' PO';
    $('btnJpg').disabled = !r.rows.length;
    $('btnCopy').disabled = !r.rows.length;
    if (!r.rows.length) { $('tableWrap').innerHTML = '<div class="empty">Tidak ada item untuk No PO tersebut.</div>'; return; }

    var cols = visCols(r.rows), h1 = '', h2 = '', i, c;
    var colg = '<colgroup>' + cols.map(function (c) { return '<col style="width:' + c.px + 'px">'; }).join('') + '</colgroup>';
    for (i = 0; i < cols.length; i++) {
      c = cols[i];
      if (c.spacer) { h1 += '<th class="sp" rowspan="2"></th>'; continue; }
      if (c.g === 'promo') {
        if (!cols[i - 1] || cols[i - 1].g !== 'promo') h1 += '<th class="grp" colspan="4">PROMOSI (TERDEKAT)</th>';
        h2 += '<th>' + esc(c.h) + '</th>';
      } else h1 += '<th rowspan="2">' + esc(c.h) + '</th>';
    }
    var body = r.rows.map(function (row) {
      return '<tr>' + cols.map(function (c) {
        if (c.spacer) return '<td class="sp"></td>';
        var t = C.fmtCell(c, row[c.k]);
        return '<td class="' + c.a + (c.k === 'kes' ? ' kes' : '') + '" title="' + esc(t) + '">' + esc(t) + '</td>';
      }).join('') + '</tr>';
    }).join('');
    var wdt = cols.reduce(function (a, c) { return a + c.px; }, 0);
    $('tableWrap').innerHTML = '<table class="sheet" style="width:' + wdt + 'px">' + colg + '<thead><tr>' + h1 + '</tr><tr class="r2">' + h2 + '</tr></thead><tbody>' + body + '</tbody></table>';
    var tr0 = document.querySelector('#tableWrap thead tr'), hh = tr0 ? tr0.getBoundingClientRect().height : 0;
    document.querySelectorAll('#tableWrap thead tr.r2 th').forEach(function (th) { th.style.top = Math.floor(hh) + 'px'; });
    $('secHasil').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* kolom Kesimpulan disembunyikan jika ada item basic (basic saja / campur) */
  function visCols(rows) {
    var hasBasic = rows.some(function (x) { return x.basic; });
    return hasBasic ? C.COLS.filter(function (c) { return !c.spacer && c.k !== 'kes'; }) : C.COLS;
  }

  /* ---------- salin ---------- */
  function copyText() {
    var ta = $('kesimpulan'), txt = ta.value;
    function fallback() { ta.focus(); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) { } toast(ok ? 'Teks disalin' : 'Gagal menyalin — blok teks lalu salin manual'); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(function () { toast('Teks disalin'); }, fallback); else fallback();
  }

  /* ---------- export JPEG (digambar langsung ke canvas) ---------- */
  function wrapLines(ctx, text, maxW) {
    var words = String(text).split(/\s+/), lines = [], cur = '';
    words.forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (cur && ctx.measureText(t).width > maxW) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur); return lines;
  }
  function exportJPEG() {
    if (!lastRes || !lastRes.rows.length) return;
    var rows = lastRes.rows, cols = visCols(rows);
    var rowH = 26, headH = 52, grpH = 24, titleH = 32, dateH = 24, pad = 14, FONT = 'Calibri, Carlito, "Segoe UI", Arial, sans-serif';
    var W = cols.reduce(function (a, c) { return a + c.px; }, 0) + pad * 2;
    var H = pad + titleH + dateH + grpH + headH + rows.length * rowH + pad;
    var sc = Math.min(2, Math.sqrt(16e6 / (W * H)), 16000 / Math.max(W, H)); sc = Math.max(sc, 0.4);
    var cv = document.createElement('canvas'); cv.width = Math.round(W * sc); cv.height = Math.round(H * sc);
    var ctx = cv.getContext('2d'); ctx.scale(sc, sc);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#000'; ctx.textBaseline = 'middle';
    ctx.font = 'bold 21px ' + FONT; ctx.textAlign = 'left'; ctx.fillText('PO EXPIRED DC BOGOR1', pad, pad + titleH / 2);
    ctx.font = 'bold 15px ' + FONT; ctx.fillText(C.fmtTodayID(new Date()), pad, pad + titleH + dateH / 2);
    var y0 = pad + titleH + dateH, yh = y0 + grpH;
    var xs = [], x = pad; cols.forEach(function (c) { xs.push(x); x += c.px; });

    function cell(x, y, w, h, fill) {
      if (fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
      ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, w, h);
    }
    // header
    var gi = cols.map(function (c, i) { return c.g === 'promo' ? i : -1; }).filter(function (i) { return i >= 0; });
    if (gi.length) {
      var gx = xs[gi[0]], gw = gi.reduce(function (a, i) { return a + cols[i].px; }, 0);
      cell(gx, y0, gw, grpH, '#C5D9F1');
      ctx.fillStyle = '#000'; ctx.font = 'bold 14px ' + FONT; ctx.textAlign = 'center'; ctx.fillText('PROMOSI (TERDEKAT)', gx + gw / 2, y0 + grpH / 2);
    }
    cols.forEach(function (c, i) {
      if (c.spacer) return;
      var isP = c.g === 'promo', hy = isP ? yh : y0, hh = isP ? headH : grpH + headH;
      cell(xs[i], hy, c.px, hh, '#C5D9F1');
      ctx.fillStyle = '#000'; ctx.font = 'bold 14px ' + FONT; ctx.textAlign = 'center';
      var ls = wrapLines(ctx, c.h, c.px - 8), lh = 16, ty = hy + hh / 2 - (ls.length - 1) * lh / 2;
      ls.forEach(function (l, n) { ctx.fillText(l, xs[i] + c.px / 2, ty + n * lh); });
    });
    // isi
    ctx.font = '14.5px ' + FONT;
    rows.forEach(function (row, ri) {
      var y = yh + headH + ri * rowH;
      cols.forEach(function (c, i) {
        if (c.spacer) return;
        cell(xs[i], y, c.px, rowH, null);
        var t = C.fmtCell(c, row[c.k]); if (!t) return;
        ctx.save(); ctx.beginPath(); ctx.rect(xs[i] + 1, y + 1, c.px - 1, rowH - 1); ctx.clip();
        ctx.fillStyle = '#000'; ctx.font = (c.k === 'kes' ? 'bold ' : '') + '14.5px ' + FONT;
        if (c.a === 'c') { ctx.textAlign = 'center'; ctx.fillText(t, xs[i] + c.px / 2, y + rowH / 2); }
        else if (c.a === 'r') { ctx.textAlign = 'right'; ctx.fillText(t, xs[i] + c.px - 5, y + rowH / 2); }
        else { ctx.textAlign = 'left'; ctx.fillText(t, xs[i] + 5, y + rowH / 2); }
        ctx.restore();
      });
    });
    cv.toBlob(function (b) {
      if (!b) { toast('Gagal membuat gambar — kurangi jumlah PO'); return; }
      var d = new Date(), p = function (n) { return String(n).padStart(2, '0'); };
      var a = document.createElement('a'); a.href = URL.createObjectURL(b);
      a.download = 'PO_Expired_' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '_' + p(d.getHours()) + p(d.getMinutes()) + '.jpg';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      toast('JPEG tersimpan');
    }, 'image/jpeg', 0.93);
  }

  /* ---------- init ---------- */
  async function restore() {
    for (var i = 0; i < KINDS.length; i++) {
      try {
        var rec = await idbGet(KINDS[i].id);
        /* data hasil baca versi parser lama (mis. tanggal salah) dibuang — file harus diunggah ulang */
        if (rec && rec.data && rec.pv === PARSE_VER) { S[KINDS[i].id] = rec.data; META[KINDS[i].id] = rec.meta; cardOk(KINDS[i].id); }
      } catch (e) { }
    }
    refreshReady();
  }

  /* Integrasi Inventory: seluruh bahan termasuk Seasonal diterima otomatis dari upload Inventory. */
  async function acceptInventoryPayload(payload) {
    if (payload.masterRows && payload.masterRows.length) { S.master = C.parseMaster(payload.masterRows); META.master={name:'Data barang dari sumber Inventory',at:Date.now(),count:S.master.count}; cardOk('master'); }
    if (payload.pomText) { S.pom = C.parsePOM(payload.pomText); META.pom={name:'POM G113 dari Inventory',at:Date.now(),count:S.pom.count}; cardOk('pom'); }
    if (payload.stockOutRows && payload.stockOutRows.length) { S.stockOut=C.parseStockOut(payload.stockOutRows); META.stockOut={name:'Stock Out dari Inventory',at:Date.now(),count:S.stockOut.count}; cardOk('stockOut'); }
    if (payload.promoRows && payload.promoRows.length) { S.promo=C.parsePromo(payload.promoRows); META.promo={name:'Promo dari sumber Inventory',at:Date.now(),count:S.promo.count}; cardOk('promo'); }
    if (payload.seasonalBytes) {
      var seasonalFile = new File([payload.seasonalBytes], payload.seasonalName || 'Seasonal.xlsx', {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      var loaded = await loadFile('seasonal', seasonalFile);
      if (!loaded) throw new Error('Laporan Seasonal gagal dibaca. Periksa file Seasonal di Daftar File.');
    }
    refreshReady();
  }
  window.addEventListener('inventory-po-payload',async function(e){
    var detail={ok:false};
    try { await acceptInventoryPayload(e.detail||{}); detail.ok=true; }
    catch(err) { detail.error=err&&err.message?err.message:String(err); console.error(err); toast('Data Inventory gagal dibaca: '+detail.error); }
    window.dispatchEvent(new CustomEvent('inventory-po-payload-ready',{detail:detail}));
  });

  function init() {
    $('subtitle').textContent = 'PO EXPIRED DC BOGOR1 · ' + C.fmtTodayID(new Date());
    buildCards(); loadOpts(); refreshReady();
    $('fileAll').onchange = function (e) { loadMany(e.target.files); e.target.value = ''; };
    $('btnRun').onclick = run;
    $('btnClear').onclick = function () { $('poInput').value = ''; $('poInput').focus(); };
    $('btnCopy').onclick = copyText;
    $('btnJpg').onclick = exportJPEG;
    $('optDsi').onchange = function () { saveOpts(); if (lastRes && $('poInput').value.trim()) run(); };
    $('stdBox').onchange = function () { saveOpts(); if ($('optDsi').checked && lastRes) run(); };
    $('poInput').addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') run(); });
    var bx = $('secBahan');
    ['dragenter', 'dragover'].forEach(function (n) { bx.addEventListener(n, function (e) { e.preventDefault(); $('bahan').classList.add('drag'); }); });
    ['dragleave', 'drop'].forEach(function (n) { bx.addEventListener(n, function (e) { e.preventDefault(); $('bahan').classList.remove('drag'); }); });
    bx.addEventListener('drop', function (e) { if (e.dataTransfer && e.dataTransfer.files.length) loadMany(e.dataTransfer.files); });

    /* Instalasi PWA dikelola oleh halaman utama Inventory, bukan modul PO Expired. */
    restore();
  }
  init();
})();

;

(function(){
  let installPrompt = null;
  const button = document.getElementById('installAppButton');
  if (!button) return;
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  function refreshInstallButton(){
    button.hidden = isStandalone();
    button.textContent = installPrompt ? 'Pasang Aplikasi' : 'Cara Pasang';
  }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); installPrompt = event; refreshInstallButton();
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null; refreshInstallButton();
    if (typeof window.toast === 'function') window.toast('Inventory berhasil dipasang. Buka dari layar utama.');
  });
  button.addEventListener('click', async () => {
    if (installPrompt) {
      installPrompt.prompt();
      try { await installPrompt.userChoice; } catch (_) {}
      installPrompt = null; refreshInstallButton();
      return;
    }
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const steps = isIOS
      ? 'Untuk memasang: ketuk tombol Bagikan di Safari, lalu pilih “Add to Home Screen / Tambahkan ke Layar Utama”.'
      : 'Untuk membuat pintasan: buka menu ⋮ browser Chrome, pilih “Tambahkan ke layar utama” atau “Install app / Pasang aplikasi”. Jika pilihan belum muncul, muat ulang halaman dan pastikan menggunakan HTTPS.';
    window.alert(steps);
  });
  refreshInstallButton();
})();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', {scope: './', updateViaCache: 'none'}).catch(err => console.warn('PWA service worker:', err));
  });
}

;

/* v2.5.5: semua popup dapat digeser dengan menarik area judul. */
(function(){
  function enableDrag(panel, handle){
    if(!panel||!handle)return;
    handle.style.cursor='move'; handle.style.touchAction='pan-y';
    let active=false,sx=0,sy=0,left=0,top=0;
    handle.addEventListener('pointerdown',function(e){
      if(e.target.closest('button,input,select,textarea,a,summary'))return;
      const r=panel.getBoundingClientRect(); active=true;sx=e.clientX;sy=e.clientY;left=r.left;top=r.top;
      panel.style.position='fixed';panel.style.margin='0';panel.style.left=left+'px';panel.style.top=top+'px';panel.style.transform='none';
      try{handle.setPointerCapture(e.pointerId)}catch(_){} e.preventDefault();
    });
    handle.addEventListener('pointermove',function(e){if(!active)return;
      const r=panel.getBoundingClientRect(),maxL=innerWidth-r.width,maxT=innerHeight-r.height;
      panel.style.left=Math.max(0,Math.min(maxL,left+e.clientX-sx))+'px';
      panel.style.top=Math.max(0,Math.min(maxT,top+e.clientY-sy))+'px';
    });
    ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>handle.addEventListener(ev,()=>active=false));
  }
  document.querySelectorAll('dialog').forEach(d=>{
    const h=d.querySelector('.file-manage-heading, form>h2, .file-manage-heading, form>p:first-child');
    enableDrag(d,h||d.querySelector('form'));
    d.addEventListener('close',()=>{d.style.left='';d.style.top='';d.style.position='';d.style.margin='';d.style.transform='';});
  });
  const po=document.getElementById('poExpiredApp');enableDrag(po,po&&po.querySelector('.po-modal-head'));
})();

;

/* v3.8.9 — Matrix Digital Rain: kolom vertikal berisi angka dan katakana dengan jejak cahaya. */
(function(){
  const canvas=document.getElementById('matrixRain');
  if(!canvas) return;
  const ctx=canvas.getContext('2d',{alpha:true});
  if(!ctx) return;
  const reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Angka dibuat dominan, diselingi katakana seperti tampilan kode Matrix.
  const chars='01234567890123456789アイウエオカキクケコサシスセソタチツテトナニヌネノ';
  let width=0,height=0,dpr=1,columns=0,streams=[],raf=0,last=0;
  const fontSize=15, interval=reduce?260:58, trail=12;
  function pick(){return chars.charAt(Math.random()*chars.length|0);}
  function resize(){
    const w=window.innerWidth,h=window.innerHeight;
    dpr=Math.min(window.devicePixelRatio||1,1.25);
    width=w;height=h;
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    canvas.style.width=w+'px';canvas.style.height=h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    columns=Math.ceil(w/fontSize);
    streams=Array.from({length:columns},()=>({
      y:Math.random()*-(h/fontSize),
      speed:0.65+Math.random()*0.75,
      chars:Array.from({length:trail},pick),
      active:Math.random()>.22
    }));
    ctx.clearRect(0,0,width,height);
  }
  function draw(t){
    raf=0;
    if(document.hidden) return;
    if(t-last<interval){raf=requestAnimationFrame(draw);return;}
    last=t;
    ctx.fillStyle='rgba(2,9,5,0.16)';
    ctx.fillRect(0,0,width,height);
    ctx.font=fontSize+'px monospace';
    ctx.textAlign='center';
    for(let i=0;i<columns;i++){
      const s=streams[i];
      if(!s.active){
        if(Math.random()>.994){s.active=true;s.y=-Math.random()*20;}
        continue;
      }
      const x=i*fontSize+fontSize/2;
      const head=Math.floor(s.y);
      for(let k=trail-1;k>=0;k--){
        const row=head-k, y=row*fontSize;
        if(y< -fontSize || y>height+fontSize) continue;
        if(Math.random()>.965) s.chars[k]=pick();
        const alpha=(1-k/trail)*0.62;
        ctx.fillStyle=k===0?'rgba(225,255,225,.98)':'rgba(40,235,105,'+alpha.toFixed(2)+')';
        ctx.fillText(s.chars[k],x,y);
      }
      s.y+=s.speed*(reduce?0.28:1);
      if(s.y*fontSize>height+trail*fontSize && Math.random()>.975){
        s.y=-Math.random()*trail;
        s.speed=0.65+Math.random()*0.75;
        s.active=Math.random()>.12;
      }
    }
    raf=requestAnimationFrame(draw);
  }
  function start(){if(!document.hidden&&!raf) raf=requestAnimationFrame(draw);}
  function stop(){if(raf) cancelAnimationFrame(raf);raf=0;}
  resize();
  start();
  window.addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();});
})();

;

/* v3.8.9 — kunci aplikasi dengan timeout 15 menit; data upload tetap di memori halaman. */
(function(){
  const lock = document.getElementById('loginLock');
  const form = document.getElementById('loginForm');
  const field = document.getElementById('loginPassword');
  const error = document.getElementById('loginError');
  if (!lock || !form || !field || !error) return;
  const PASSWORD = 'zie';
  const IDLE_LIMIT = 15 * 60 * 1000;
  let unlocked = false;
  let idleTimer = null;
  let lastActivity = 0;
  function showLock(message){
    unlocked = false;
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = null;
    lock.hidden = false;
    document.body.classList.add('is-login-locked');
    field.value = '';
    error.textContent = message || '';
    window.setTimeout(() => field.focus(), 30);
  }
  function armTimer(){
    if (!unlocked) return;
    if (idleTimer) clearTimeout(idleTimer);
    const remaining = Math.max(0, IDLE_LIMIT - (Date.now() - lastActivity));
    idleTimer = setTimeout(() => {
      if (Date.now() - lastActivity >= IDLE_LIMIT) showLock('Sesi terkunci karena tidak ada aktivitas selama 15 menit.');
      else armTimer();
    }, remaining);
  }
  function activity(){
    if (!unlocked) return;
    lastActivity = Date.now();
    armTimer();
  }
  form.addEventListener('submit', function(event){
    event.preventDefault();
    if (field.value !== PASSWORD) {
      error.textContent = 'Password tidak sesuai. Silakan coba lagi.';
      field.select();
      return;
    }
    unlocked = true;
    lock.hidden = true;
    document.body.classList.remove('is-login-locked');
    error.textContent = '';
    field.value = '';
    lastActivity = Date.now();
    armTimer();
  });
  ['pointerdown','keydown','touchstart','click','wheel','mousemove'].forEach(type => {
    document.addEventListener(type, activity, {passive:true});
  });
  document.addEventListener('visibilitychange', function(){
    if (!document.hidden && unlocked) {
      if (Date.now() - lastActivity >= IDLE_LIMIT) showLock('Sesi terkunci karena tidak ada aktivitas selama 15 menit.');
      else armTimer();
    }
  });
  document.addEventListener('keydown', function(event){
    if (!unlocked && event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); }
  }, true);
  showLock('');
})();

;

(()=>{
 'use strict';
 const MANIFEST='./assets/fonts/fonts.json?v=4.9.6', STORAGE_KEY='inventory.selectedFont.v1', SIZE_KEY='inventory.fontScale.v1';
 const dialog=document.getElementById('fontSettingsDialog'), opener=document.getElementById('openFontSettings'), closer=document.getElementById('closeFontSettings'), list=document.getElementById('fontChoiceList'), status=document.getElementById('fontSettingsStatus'), sizeInput=document.getElementById('fontSizeChoice'), sizeValue=document.getElementById('fontSizeValue');
 if(!dialog||!opener||!list)return;
 let fontList=[], chosenFile='', applying=false;
 const loadedFaces=new Map();
 const familyFor=item=>'InventoryFont_'+fontList.indexOf(item);
 const say=t=>{if(status){status.classList.remove('font-loading');status.textContent=t}};
 function loading(t){if(status){status.classList.add('font-loading');status.textContent=t}}
 function setBusy(value){applying=value;list.querySelectorAll('button').forEach(button=>button.disabled=value)}
 async function loadFace(item){
   const url=new URL(item.file,document.baseURI).href;
   if(loadedFaces.has(url))return loadedFaces.get(url);
   const face=new FontFace(familyFor(item),`url("${url}")`,{style:'normal',weight:'100 900'});
   const loaded=await face.load();document.fonts.add(loaded);loadedFaces.set(url,loaded);return loaded;
 }
 function renderChoices(){
   list.innerHTML='';
   fontList.forEach(item=>{
     const button=document.createElement('button');button.type='button';button.className='font-choice-item';button.setAttribute('role','option');button.setAttribute('aria-pressed',String(item.file===chosenFile));
     const name=document.createElement('span');name.className='font-choice-name';name.textContent=item.name;name.style.setProperty('font-family',`"${familyFor(item)}",sans-serif`,'important');
     button.append(name);button.addEventListener('click',()=>applyFont(item,true));list.appendChild(button);
   });
 }
 async function applyFont(item,save=true){
   if(!item||applying)return false;
   const previous=chosenFile;setBusy(true);loading('Memuat dan menerapkan font '+item.name+'…');
   try{
     await loadFace(item);
     const family=`"${familyFor(item)}",sans-serif`;
     document.documentElement.style.setProperty('--inventory-font-family',family);
     await document.fonts.load(`16px "${familyFor(item)}"`);
     await document.fonts.ready;
     await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
     if(!document.fonts.check(`16px "${familyFor(item)}"`))throw new Error('Font belum aktif');
     chosenFile=item.file;
     if(save){try{localStorage.setItem(STORAGE_KEY,item.file)}catch(_){}}
     renderChoices();say('✓ Font berhasil diganti ke '+item.name);return true;
   }catch(err){
     const old=fontList.find(x=>x.file===previous);
     if(old){try{await loadFace(old);document.documentElement.style.setProperty('--inventory-font-family',`"${familyFor(old)}",sans-serif`)}catch(_){}}
     chosenFile=previous;renderChoices();say('✕ Font gagal diganti. Periksa file font atau coba lagi.');return false;
   }finally{setBusy(false)}
 }
 const baseFontSizes=new WeakMap();
 const ignoredFontScaleTags=new Set(['SCRIPT','STYLE','LINK','META','SVG','PATH','CANVAS']);
 function scaleTextElements(scale){
   const root=document.body;if(!root)return;
   const nodes=root.querySelectorAll('*');
   nodes.forEach(el=>{
     if(ignoredFontScaleTags.has(el.tagName)||el===sizeInput)return;
     let base=baseFontSizes.get(el);
     if(!base){
       const computed=parseFloat(getComputedStyle(el).fontSize);
       if(!Number.isFinite(computed)||computed<=0)return;
       base=computed;baseFontSizes.set(el,base);
     }
     el.style.setProperty('font-size',(base*scale)+'px','important');
   });
 }
 function setScale(value,save=true){
   const parsed=Number(value);const n=Math.max(50,Math.min(200,Number.isFinite(parsed)&&parsed>0?parsed:100));
   const scale=n/100;document.documentElement.style.setProperty('--inventory-font-scale',String(scale));
   scaleTextElements(scale);
   sizeInput.value=String(n);sizeValue.value=n+'%';sizeValue.textContent=n+'%';
   if(save){try{localStorage.setItem(SIZE_KEY,String(n))}catch(_){}}
 }
 async function loadList(){
   try{
     const response=await fetch(MANIFEST,{cache:'no-store'});if(!response.ok)throw new Error('manifest');
     const data=await response.json();fontList=Array.isArray(data.fonts)?data.fonts:[];if(!fontList.length)throw new Error('empty');
     let saved='';try{saved=localStorage.getItem(STORAGE_KEY)||''}catch(_){}
     const selected=fontList.find(x=>x.file===saved)||fontList.find(x=>x.default)||fontList[0];chosenFile=selected.file;renderChoices();await applyFont(selected,false);
   }catch(e){list.textContent='Daftar font tidak dapat dibaca.';say('Daftar font belum tersedia. Periksa assets/fonts/fonts.json.');}
 }
 document.getElementById('resetFontChoice').addEventListener('click',async()=>{const item=fontList.find(x=>x.default)||fontList[0];if(item)await applyFont(item,true)});
 sizeInput.addEventListener('input',()=>setScale(sizeInput.value));
 sizeInput.addEventListener('change',()=>setScale(sizeInput.value));
 opener.addEventListener('click',()=>{dialog.showModal();loadList()});closer.addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 let savedSize=100;try{savedSize=Number(localStorage.getItem(SIZE_KEY)||100)}catch(_){}setScale(savedSize,false);
 loadList();
})();
