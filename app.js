'use strict';
const ROLES=[
 ['prod','PRODMAST — Master barang','PRODMAST'],['stm113','Stok G113 (STM)','STM'],['stm294','Stok G294 (STM)','STM'],['stm295','Stok G295 (STM)','STM'],
 ['hrgbeli','HRGBELI — Harga beli','HRGBELI'],['supmast','SUPMAST — Supplier','SUPMAST'],['hpg','HPG — MEAN / biaya','HPG'],['protect','PROTECT — Proteksi','PROTECT'],['datawhs','DATAWHS — Gudang / station','DATAWHS'],
 ['par113','PAR G113 — Penjualan','PAR'],['par294','PAR G294 — Penjualan','PAR'],['par295','PAR G295 — Penjualan','PAR'],['seas','SEAS — Seasonal','SEAS'],['itempar','ITEMPAR — Keterangan (opsional)','ITEMPAR'],['itemdepo','ITEMDEPO — Item depo','ITEMDEPO'],['itemwhk','ITEMWHK — Item WHK','ITEMWHK'],
 ['pom113','POM G113 — PO / BPB','POM'],['pom294','POM G294 — PO / BPB','POM'],['pom295','POM G295 — PO / BPB','POM'],['pou113','POU G113 — PO outstanding','POU'],['pou294','POU G294 — PO outstanding','POU'],['pou295','POU G295 — PO outstanding','POU'],['keb','KEB — KEB / toko','KEB'],['nataru','NATARU','NATARU'],['promo','PROMO','PROMO'],['history','LaporanHistoryTag — TGL_AKHIR','HISTORY'],['stockout','LaporanStokOutDCINew — STOCK_OUT Y','STOCKOUT'],['stockoutbook','Stock Out DC — file terakhir (.xlsx)','STOCKOUTBOOK'],['slsupplierbook','SL Supplier — file terakhir (.xlsx)','SLSUPPLIERBOOK'],['rekapsupplierbook','Rekap Supplier — file terakhir (.xlsx)','REKAPSUPPLIERBOOK'],['lrbpbsupplier','LRBPB_SUPPLIER — transaksi BPB supplier','LRBPBSUPPLIER'],['brd','File BRD — semua file yang diunggah','BRD']
];
const H1=['PRDCD','DESC2','PLANOGRAM','','','','','','ALAMAT','SUPCO','SNAMA','FK','DIV','KLPT','CAT_COD','FRAC','ACOST','LCOST','PKM','RP','PTAG','SLS1','SLS2','SLS3','AVG','AVG G294','AVG G295','MINOR','MEAN','STKG294','','','DSI 294','STKG295','','','DSI 295','STKG113','','','DSISTK','DSIPKM','POG294','POG295','POG113','STK02','','','STK03','','','STATUS','KEB','TOKO','STOCK OUT TOKO','','','KET','SEASONAL','','SPD','KAT','TGL RUBAH PTAG','PROTECT','ITEM DEPO','LEAD','SL SUPPLIER','','','LAST BPB','','ITEM NATARU','PROMOSI','','','','ITEM WHK'];
const H2=['','','ZONA','ST','LT','RAK','BAR','CELL','','','','','','','','','','','','','','','','','','','','','','PCS','CTN','RP','','PCS','CTN','RP','','PCS','CTN','RP','','','','','','PCS','CTN','RP','PCS','CTN','RP','','','','G113','G294','G295','','JENIS','RINCIAN','','','','','','','G113','G294','G295','TGL','PCS','','TGL AWAL','TGL AKHIR','QTY TGT','JENIS_PROMO',''];const $=id=>document.getElementById(id);let files=[],parsed=new Map(),lastCsv='',lastLog='',lastResult=null,lastExportName='';const UPLOAD_GROUP_KEYS=['daily','bahan','lwa','update'];const collapsedUploadGroups=new Set(UPLOAD_GROUP_KEYS);
const fmtBytes=n=>n<1024?`${n} B`:n<1048576?`${(n/1024).toFixed(1)} KB`:`${(n/1048576).toFixed(2)} MB`;
function norm(s){return String(s??'').replace(/^\uFEFF/,'').trim().toUpperCase().replace(/[ .\-/]+/g,'_').replace(/[^A-Z0-9_]/g,'').replace(/_+/g,'_')}
function parseCSV(text){
 text=String(text||'').replace(/^\uFEFF/,'');
 const rows=[];let row=[],field='',quoted=false;
 const pushRow=()=>{row.push(field.replace(/\r$/,''));if(row.some(v=>v!==''))rows.push(row);row=[];field=''};
 // A quote only opens a quoted field at its beginning, and only when a valid
 // closing quote exists. This prevents stray quotes from swallowing later rows.
 const hasClosingQuote=(start)=>{for(let j=start+1;j<text.length;j++){if(text[j]!=='"')continue;if(text[j+1]==='"'){j++;continue}const n=text[j+1];if(n===','||n==='\n'||n==='\r'||n===undefined)return true}return false};
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){
   if(c==='"'&&text[i+1]==='"'){field+='"';i++;continue}
   if(c==='"'){const n=text[i+1];if(n===','||n==='\n'||n==='\r'||n===undefined){quoted=false;continue}field+='"';continue}
   field+=c;continue;
  }
  if(c==='"'&&field===''){if(hasClosingQuote(i)){quoted=true;continue}else{field+='"';continue}}
  if(c===','){row.push(field);field='';continue}
  if(c==='\n'){pushRow();continue}
  field+=c;
 }
 if(field!==''||row.length){row.push(field.replace(/\r$/,''));if(row.some(v=>v!==''))rows.push(row)}
 return rows;
}
function rowsToObjects(text,role){let rows=parseCSV(text);if(!rows.length)return [];if(role==='keb'){/* KEB is a formatted report, not a tidy table: PLU/PRDCD in column B, KEB quantity in K, store count in Q. Ignore title/header rows and aggregate later by PRDCD. */return rows.map(r=>({PRDCD:String(r[1]??'').trim(),KEB_QTY:String(r[10]??'').trim(),TOKO_QTY:String(r[16]??'').trim()})).filter(o=>/^\d+$/.test(o.PRDCD)&&o.PRDCD.length>=5&&(o.KEB_QTY!==''||o.TOKO_QTY!==''))}let first=rows[0].map(norm);let hasHeader=first.some(x=>['PRDCD','PLU','RECID','GUDANG','TGL_AKHIR','SUPCO','NOREC','NAMA'].includes(x));if(['itemdepo','itemwhk'].includes(role)&&!hasHeader){return rows.map(r=>({PRDCD:String(r[0]||'').trim(),KETERANGAN:String(r[1]||'Y').trim()})).filter(r=>r.PRDCD)}if(!hasHeader){return rows.map(r=>({PRDCD:String(r[0]||'').trim(),KETERANGAN:String(r[1]||'').trim()})).filter(r=>r.PRDCD)}const headers=first;return rows.slice(1).map(r=>{let o={};headers.forEach((h,i)=>{if(h)o[h]=String(r[i]??'').trim()});return o}).filter(o=>Object.keys(o).length)}
function value(o,...keys){for(const k of keys){const nk=norm(k);if(o&&Object.prototype.hasOwnProperty.call(o,nk)&&o[nk]!==''&&o[nk]!=null)return o[nk]}return ''}
function num(v){if(typeof v==='number')return Number.isFinite(v)?v:0;let s=String(v??'').trim();if(!s)return 0;s=s.replace(/\s/g,'');if(s.includes(',')&&!s.includes('.'))s=s.replace(',','.');else s=s.replace(/,/g,'');let n=Number(s);return Number.isFinite(n)?n:0}
function text(v){return String(v??'').trim()}
function key(v){return text(v).replace(/^0+(?=\d)/,'')}
function dateVal(v){let s=text(v);if(!s)return null;let m=s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);if(m){let a=+m[1],b=+m[2],y=+m[3];let d;if(a>12)d=new Date(y,b-1,a);else d=new Date(y,a-1,b);return isNaN(d)?null:d}m=s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);if(m){let d=new Date(+m[1],+m[2]-1,+m[3]);return isNaN(d)?null:d}let n=Number(s);if(n>30000&&n<80000){let d=new Date(Date.UTC(1899,11,30)+n*86400000);return new Date(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())}let d=new Date(s);return isNaN(d)?null:new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function dateStr(v){const d=v instanceof Date?v:dateVal(v);if(!d)return '';return `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`}
function latestDate(a,b){const da=dateVal(a),db=dateVal(b);if(!da)return b||'';if(!db)return a||'';return db>da?b:a}
function warehouseFromPath(file){const path=String(file.webkitRelativePath||file.relativePath||'').replace(/\\/g,'/');const m=path.match(/(?:^|\/)(G113|G294|G295)(?:\/|$)/i);return m?m[1].toUpperCase():''}
function roleGuess(file){const n=norm(file.name);const rel=norm(file.webkitRelativePath||file.relativePath||'');const wh=warehouseFromPath(file)||(rel.match(/(?:^|_)(G113|G294|G295)(?:_|$)/)||n.match(/(?:^|_)(G113|G294|G295)(?:_|$)/)||[])[1]||'';if(/\.XLSX$/i.test(file.name)&&(n.includes('REKAP_SUPPLIER')||n.includes('REKAPSUPPLIER')))return 'rekapsupplierbook';if(/\.XLSX$/i.test(file.name)&&(n.includes('SL_SUPPLIER')||n.includes('SERVICE_LEVEL_SUPPLIER')))return 'slsupplierbook';if(n.includes('LRBPB_SUPPLIER')||n.includes('LRBPBSUPPLIER'))return 'lrbpbsupplier';if(/\.BRD$/i.test(file.name))return 'brd';if(/\.XLSX$/i.test(file.name)&&n.includes('STOCK_OUT_DC')||/\.XLSX$/i.test(file.name)&&n.includes('STOCK_OUT'))return 'stockoutbook';if(/\.XLSX$/i.test(file.name)&&n.includes('STOCKOUTDC'))return 'stockoutbook';if(n.includes('LAPORANSTOKOUTDCI')||n.includes('STOCKOUTDCINEW'))return 'stockout';if(n.includes('HISTORYTAG')||n.includes('LAPORANHISTORY')||n.includes('TGL_AKHIR'))return 'history';if(n.includes('PRODMAST'))return 'prod';if(n.includes('STM')||n.includes('STOCK')){if(wh==='G294')return 'stm294';if(wh==='G295')return 'stm295';if(wh==='G113')return 'stm113';return 'stm113'}if(n.includes('HRGBELI'))return 'hrgbeli';if(n.includes('SUPMAST'))return 'supmast';if(n.startsWith('HPG'))return 'hpg';if(n.includes('PROTECT'))return 'protect';if(n.includes('DATAWHS'))return 'datawhs';if(n.includes('ITEMDEPO'))return 'itemdepo';if(n.includes('ITEMWHK'))return 'itemwhk';if(n.includes('ITEMPAR'))return 'itempar';if(n.includes('PAR')){if(wh==='G294')return 'par294';if(wh==='G295')return 'par295';return 'par113'}if(n.includes('SEAS'))return 'seas';if(n.includes('POM')){if(wh==='G294')return 'pom294';if(wh==='G295')return 'pom295';return 'pom113'}if(n.includes('POU')){if(wh==='G113')return 'pou113';if(wh==='G295')return 'pou295';return 'pou294'}if(n.includes('KEB'))return 'keb';if(n.includes('NATARU'))return 'nataru';if(n.includes('PROMO'))return 'promo';return ''}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function fileGroup(f){const n=norm(f.name);if(['stockoutbook','slsupplierbook','rekapsupplierbook','seas'].includes(f.guess)||/STOCK_OUT_DC|SERVICE_LEVEL_SUPPLIER|REKAP_SUPPLIER/.test(n))return 'update';if(/LRBPB_SUPPLIER|LAPORANSTOCKOUTDCINEW|LAPORANSTOKOUTDCINEW|LAPORANHISTORYTAG/.test(n)||['lrbpbsupplier','stockout','history'].includes(f.guess))return 'lwa';if(/ITEM_DEPO|ITEMDEPO|ITEM_WH(K|K)|ITEMWHK|\bKEB\b|NATARU|PROMO|DATA_WHS|DATAWHS/.test(n)||['itemdepo','itemwhk','keb','nataru','promo','datawhs'].includes(f.guess))return 'bahan';const gm=n.match(/G(\d{3})/);if(gm&&gm[1]!=='113')return 'depo';return 'daily'}
const ROLE_GROUP={
 prod:'daily',stm113:'daily',hrgbeli:'daily',supmast:'daily',hpg:'daily',protect:'daily',par113:'daily',pom113:'daily',
 stm294:'daily',stm295:'daily',par294:'daily',par295:'daily',pom294:'daily',pom295:'daily',pou113:'daily',pou294:'daily',pou295:'daily',
 datawhs:'bahan',itempar:'bahan',itemdepo:'bahan',itemwhk:'bahan',keb:'bahan',nataru:'bahan',promo:'bahan',
 history:'lwa',stockout:'lwa',lrbpbsupplier:'lwa',seas:'update',stockoutbook:'update',slsupplierbook:'update',rekapsupplierbook:'update',brd:'daily'
};
const OPTIONAL_ROLES=new Set(['itempar','brd']);
function renderFiles(){
 const dialog=$('fileManageDialog');
 if(!dialog)return;
 const action=dialog.dataset.action||'allFiles';
 const required=action==='allFiles'?ROLES.map(r=>r[0]):(PROCESS_CHECKS[action]||[]);
 $('fileManageTitle').textContent=action==='allFiles'?'Daftar File Inventory':`File yang diperlukan — ${PROCESS_TITLES[action]||''}`;
 const renderRole=role=>{
  const item=ROLES.find(r=>r[0]===role);
  const matches=files.filter(f=>f.guess===role);
  const label=item?item[1].split(' — ')[0]:role;
  return matches.length?matches.map(f=>`<div class="file-row file-ready"><span class="file-name" title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</span><span class="file-status status-ready">Tersedia</span><button class="remove-file" data-remove="${f.id}" type="button" aria-label="Hapus ${escapeHtml(f.name)}">×</button></div>`).join(''):`<div class="file-row file-missing"><span class="file-name">${escapeHtml(label)}</span><span class="file-status">Belum ada</span></div>`;
 };
 const groupNames={daily:'Tarikan Harian',bahan:'Bahan',lwa:'Tarikan LWA',update:'File Update'};
 if(action==='masterBtn'||action==='allFiles'){
  const groups=['daily','bahan','lwa','update'];
  $('fileManageList').innerHTML=groups.map(group=>{
   const roles=required.filter(role=>(ROLE_GROUP[role]||'daily')===group);
   if(!roles.length)return '';
   const section=(title,list)=>list.length?`<div class="warehouse-upload"><div class="warehouse-heading">${title}</div><div class="upload-group-rows">${list.map(renderRole).join('')}</div></div>`:'';
   let body='';
   if(group==='daily'){
    const whRoles={G113:roles.filter(r=>/113$/.test(r)||!/(294|295)$/.test(r)),G294:roles.filter(r=>/294$/.test(r)),G295:roles.filter(r=>/295$/.test(r))};
    body=`<div class="daily-warehouse-grid">${section('G113',whRoles.G113)}${section('G294',whRoles.G294)}${section('G295',whRoles.G295)}</div>`;
   }else body=`<div class="upload-group-rows">${roles.map(renderRole).join('')}</div>`;
   return `<details class="upload-group" data-upload-group="${group}"><summary class="upload-group-heading"><strong>${groupNames[group]}</strong><span class="upload-group-count">${roles.filter(hasRole).length}/${roles.length}</span><i class="upload-group-toggle" aria-hidden="true">＋</i></summary><div class="upload-group-body">${body}</div></details>`;
  }).join('');
 }else{
  $('fileManageList').innerHTML=`<div class="upload-group-rows">${required.map(renderRole).join('')}</div>`||'<div class="empty-state">Tidak ada file sumber yang diperlukan.</div>';
 }
 const ready=required.filter(hasRole).length;
 $('fileManageCount').textContent=`${ready}/${required.length} file tersedia`;
 $('fileManageList').querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{const id=Number(b.dataset.remove);files=files.filter(f=>f.id!==id);parsed.delete(id);renderFiles()});
}

function parseLrbpbSupplier(content){
 const rows=parseCSV(content);if(!rows.length)return [];
 const headers=rows[0].map(norm);
 return rows.slice(1).map(r=>{const o={};headers.forEach((h,i)=>{if(h)o[h]=String(r[i]??'').trim()});return o})
  .filter(o=>/^\d{8}$/.test(text(value(o,'PLU')).trim()));
}
function detectRole(file,content){const byName=roleGuess(file);if(byName)return byName;const rows=parseCSV(content);const header=(rows[0]||[]).map(norm);const all=header.join('|');if(header.includes('TBL_DC_KODE')||header.some(h=>h.includes('DC_KODE')))return 'brd';if(header.includes('PLU')&&header.includes('STOCK_OUT'))return 'stockout';if(header.includes('TGL_AKHIR')||all.includes('HISTORYTAG'))return 'history';if(['PRDCD','DESC2','DIV','CAT_COD'].every(x=>header.includes(x)))return 'prod';if(header.includes('SUPCO')&&header.includes('SNAMA'))return 'supmast';if(header.includes('GUDANG')&&header.includes('PRDCD')){const vals=rows.slice(1,30).flat().map(x=>String(x).toUpperCase());if(vals.some(x=>x.includes('G294')))return 'stm294';if(vals.some(x=>x.includes('G295')))return 'stm295';if(vals.some(x=>x.includes('G113')))return 'stm113'}if(header.includes('PRDCD')&&header.includes('ACOST'))return 'hrgbeli';if(header.includes('PRDCD')&&header.includes('PTAG'))return 'prod';if(header.includes('PRDCD')&&header.includes('NOREC'))return 'par113';return ''}
async function addFiles(list){for(const file of list){const detected=roleGuess(file);const isSeasonalBook=/\.xlsx$/i.test(file.name)&&detected==='seas';const isUpdateBook=/\.xlsx$/i.test(file.name)&&['stockoutbook','slsupplierbook','rekapsupplierbook'].includes(detected);const isBook=isSeasonalBook||isUpdateBook;const isBrd=/\.brd$/i.test(file.name)||detected==='brd';if(!isBook&&!isBrd&&!/\.(csv|txt)$/i.test(file.name)){setStatus(`File ${file.name} dilewati. Gunakan CSV/TXT/BRD, XLSX Seasonal, atau XLSX file update.`,true);continue}const id=Date.now()+Math.floor(Math.random()*100000);try{const obj={id,name:file.name,relativePath:file.webkitRelativePath||file.relativePath||file.name,size:file.size,content:isBook?'':await file.text(),bytes:isBook?await file.arrayBuffer():null,guess:isBook?detected:(isBrd?'brd':'')};if(!isBook&&!isBrd)obj.guess=detectRole(obj,obj.content);if(['stockoutbook','slsupplierbook','rekapsupplierbook','seas'].includes(obj.guess))files=files.filter(f=>f.guess!==obj.guess);files.push(obj);parsed.set(id,null)}catch(e){setStatus(`Tidak bisa membaca ${file.name}`,true)}}UPLOAD_GROUP_KEYS.forEach(group=>collapsedUploadGroups.add(group));renderFiles()}
function setStatus(s,error=false,processing=false){const e=$('status');e.textContent=s;e.className='status'+(error?' error':' ok')+(processing?' processing':'')}
const PROCESS_BUTTONS=['masterBtn','stockOutBtn','slSupplierBtn','rekapSupplierBtn','brdBtn'];
function beginProcess(id){if(PROCESS_BUTTONS.some(x=>$(x).disabled))return false;PROCESS_BUTTONS.forEach(x=>{const b=$(x);b.disabled=true;b.classList.toggle('is-running',x===id);});return true}
function endProcess(){PROCESS_BUTTONS.forEach(x=>{const b=$(x);b.disabled=false;b.classList.remove('is-running')})}
function setExportStatus(s,error=false,processing=false){const e=$('exportStatus');e.textContent=s;e.className='status export-status'+(error?' error':' ok')+(processing?' processing':'')}
const sourceChosen={};
function getSource(role){
 let matches=files.filter(x=>x.guess===role);
 if(!matches.length&&['stm294','stm295'].includes(role)){
  /* A single combined STM export can contain G113, G294 and G295. */
  matches=files.filter(x=>x.guess==='stm113')
 }
 if(!matches.length)return [];
 const parsedRows=f=>{if(!parsed.has(f.id)||parsed.get(f.id)===null){const folderWh=warehouseFromPath(f);const rows=role==='lrbpbsupplier'?parseLrbpbSupplier(f.content):rowsToObjects(f.content,role);for(const row of rows)if(folderWh)row.__WAREHOUSE=folderWh;parsed.set(f.id,rows)}return parsed.get(f.id)||[]};
 let f=matches[0];
 /* Prefer the STM file that actually contains the most populated physical locations.
    This avoids a blank/older STM file masking a later valid STM file merely because it was uploaded first. */
 if(role==='stm113'&&matches.length>1){
  let bestScore=-1;
  for(const candidate of matches){
   const rows=parsedRows(candidate);
   let loc01=0,locRows=0,warehouseRows=0;
   for(const o of rows){
    if(text(value(o,'GUDANG','WARE_HOUSE')).toUpperCase()!=='G113')continue;
    warehouseRows++;
    if(text(value(o,'LOKASI')).padStart(2,'0')==='01'&&['LT','RAK','BAR','CELL'].some(k=>text(value(o,k))!=='')){loc01++;locRows++}
   }
   const score=loc01*1000000+warehouseRows;
   if(score>bestScore){bestScore=score;f=candidate}
  }
 }
 sourceChosen[role]=f.name;
 return parsedRows(f)
}
function sourceByKey(role,field='PRDCD'){const m=new Map();for(const o of getSource(role)){const k=key(value(o,field,field==='PRDCD'?'PLU':'PRDCD'));if(k&&!m.has(k))m.set(k,o)}return m}
function allRows(role){return getSource(role)}
function filterWarehouse(rows,wh){return rows.filter(o=>{const folderWh=text(value(o,'__WAREHOUSE')).toUpperCase();if(folderWh)return folderWh===wh;const g=text(value(o,'GUDANG','WARE_HOUSE')).toUpperCase();return !g||g===wh})}
function firstMap(rows,field='PRDCD'){const m=new Map();rows.forEach(o=>{const k=key(value(o,field,'PLU'));if(k&&!m.has(k))m.set(k,o)});return m}
// STM location data can contain valid stock rows with blank LT/RAK/BAR/CELL. Prefer a row with actual location fields for each PRDCD, rather than letting a blank row mask a populated one.
function stmLocationMap(rows){const m=new Map();for(const o of rows){const k=key(value(o,'PRDCD','PLU'));if(!k)continue;const hasLoc=['LT','RAK','BAR','CELL'].some(f=>text(value(o,f))!=='');const old=m.get(k);const oldHasLoc=old&&['LT','RAK','BAR','CELL'].some(f=>text(value(old,f))!=='');if(!old||(hasLoc&&!oldHasLoc))m.set(k,o)}return m}
function sumBy(rows,field,qualify=()=>true){const m=new Map();for(const o of rows){if(!qualify(o))continue;const k=key(value(o,'PRDCD','PLU'));if(k)m.set(k,(m.get(k)||0)+num(value(o,field)))}return m}
function zone(lt){const x=text(lt).toUpperCase();const groups={'01':'BO BP BQ BR','02':'BS BT BU BV','03':'BW BX BY BZ CA CB CC CD','04':'CE CF CG CH','05':'CI CJ CK CL CM CN','06':'CO CP CQ CR CS CT','07':'CU CV CW CX','08':'CY CZ DA DB','09':'AB AC','10':'AD AE','11':'AF AG AH AI','12':'AJ AK AL AM','13':'AN AO AP AQ','14':'AZ BA BB BC BD BE','15':'BF BG BH BI BJ BK','16':'DT','17':'DJ','18':'BM','19':'BN','20':'AV AW','21':'AX AY'};for(const [z,ls] of Object.entries(groups))if(ls.split(' ').includes(x))return z;return x==='99'?'':''}
function round(v,n=0){const p=10**n;return Math.round((v+Number.EPSILON)*p)/p}
function processData(processDate=new Date()){const log=[],warnings=[];const prod=allRows('prod');if(!prod.length)throw Error('File PRODMAST belum dipilih atau tidak terbaca. Ini sumber utama daftar barang.');const isHeader=p=>text(value(p,'PRDCD')).trim().toUpperCase()==='PRDCD';const isExcludedDiv=p=>['F','T','G'].some(prefix=>text(value(p,'DIV')).trim().toUpperCase().startsWith(prefix));const isExcludedCat=p=>text(value(p,'CAT_COD')).trim().startsWith('8');const validProd=prod.filter(p=>{const prd=key(value(p,'PRDCD'));return !!prd&&!isHeader(p)&&!isExcludedDiv(p)&&!isExcludedCat(p)});const items=validProd.map(p=>({k:key(value(p,'PRDCD')),p}));const noPrd=prod.filter(p=>!key(value(p,'PRDCD'))).length,headerRows=prod.filter(isHeader).length,divRows=prod.filter(isExcludedDiv).length,catRows=prod.filter(isExcludedCat).length;log.push(`PRODMAST: ${prod.length} baris data hasil parser dibaca; ${items.length} baris dipakai. Dikecualikan: PRDCD kosong ${noPrd}, baris header ${headerRows}, DIV berawalan F/T/G ${divRows}, CAT_COD berawalan 8 ${catRows}. Duplikat PRDCD tidak dihapus otomatis.`);
 const stm={};for(const wh of ['113','294','295']){const role='stm'+wh;let rows=allRows(role);if(!rows.length&&wh==='113')rows=[];const expected='G'+wh;rows=filterWarehouse(rows,expected);const locRows={'01':rows.filter(o=>text(value(o,'LOKASI')).padStart(2,'0')==='01'),'02':rows.filter(o=>text(value(o,'LOKASI')).padStart(2,'0')==='02'),'03':rows.filter(o=>text(value(o,'LOKASI')).padStart(2,'0')==='03')};stm[wh]={loc1:stmLocationMap(locRows['01']),loc2:stmLocationMap(locRows['02']),loc3:stmLocationMap(locRows['03'])};const locFilled=Object.values(stm[wh]).reduce((n,m)=>n+[...m.values()].filter(o=>['LT','RAK','BAR','CELL'].some(f=>text(value(o,f))!=='')).length,0);log.push(`STM ${expected}: sumber ${sourceChosen[role]||'(tidak terdeteksi)'}; ${rows.length} baris sesuai gudang; lokasi 01/02/03 = ${locRows['01'].length}/${locRows['02'].length}/${locRows['03'].length}; barang dengan LT/RAK/BAR/CELL terisi = ${locFilled}.`);if(wh==='113'&&locFilled===0&&rows.some(o=>['LT','RAK','BAR','CELL'].some(f=>text(value(o,f))!=='')))throw Error('Data lokasi STM G113 gagal dipetakan. Proses dihentikan agar tidak menghasilkan MASTER STOCK dengan lokasi kosong.')}
 const hr=firstMap(allRows('hrgbeli')),sup=firstMap(allRows('supmast'),'SUPCO'),hpg=firstMap(allRows('hpg')),whs=firstMap(allRows('datawhs')),seas=firstMap(allRows('seas')),itemdepo=firstMap(allRows('itemdepo')),itemwhk=firstMap(allRows('itemwhk')),nataru=firstMap(allRows('nataru')),promo=firstMap(allRows('promo')),itempar=firstMap(allRows('itempar'));
 const protectSet=new Set(allRows('protect').map(o=>key(value(o,'PLU','PRDCD'))).filter(Boolean));const par={};for(const wh of ['113','294','295'])par[wh]=firstMap(allRows('par'+wh));
 const hist=new Map();if(true){for(const o of allRows('history')){const k=key(value(o,'PLU','PRDCD'));if(k)hist.set(k,latestDate(hist.get(k),value(o,'TGL_AKHIR')))}}
 const kebRows=allRows('keb');const kebQtyMap=sumBy(kebRows,'KEB_QTY'),kebTokoMap=sumBy(kebRows,'TOKO_QTY');const pomRows={},pouRows={};for(const wh of ['113','294','295'])pomRows[wh]=filterWarehouse(allRows('pom'+wh),'G'+wh);for(const wh of ['294','295'])pouRows[wh]=filterWarehouse(allRows('pou'+wh),'G'+wh);
 const poSum={};const processDay=new Date(processDate);processDay.setHours(0,0,0,0);const slRangeStart=new Date(processDay);slRangeStart.setDate(slRangeStart.getDate()-14);for(const wh of ['113','294','295']){poSum[wh]=new Map();for(const o of pomRows[wh]){const k=key(value(o,'PRDCD'));if(!k)continue;const rec=text(value(o,'RECID')).toUpperCase();const poDate=dateVal(value(o,'PO_DATE'));const eligible=rec!=='1'&&poDate&&poDate>=slRangeStart&&poDate<processDay;if(eligible){const cur=poSum[wh].get(k)||{po:0,bpb:0,lastDate:'',lastQty:0};cur.po+=num(value(o,'QTY'));cur.bpb+=num(value(o,'BPB_QTY'));poSum[wh].set(k,cur)}}for(const o of pomRows[wh]){if(text(value(o,'RECID')).toUpperCase()!=='R')continue;const k=key(value(o,'PRDCD'));if(!k)continue;const cur=poSum[wh].get(k)||{po:0,bpb:0,lastDate:'',lastQty:0};const d=dateVal(value(o,'BPB_DATE'));const old=dateVal(cur.lastDate);if(d&&(!old||d>old)){cur.lastDate=value(o,'BPB_DATE');cur.lastQty=num(value(o,'BPB_QTY'))}poSum[wh].set(k,cur)}}
 const pouSum={};for(const wh of ['294','295'])pouSum[wh]=sumBy(pouRows[wh],'QTY');
 const promoStartMap=new Map();for(const o of allRows('promo')){const k=key(value(o,'PRDCD'));if(k&&!promoStartMap.has(k))promoStartMap.set(k,o)}
 const data=[];for(const {k,p} of items){const r=Array(77).fill('');const set=(i,v)=>r[i]=v===undefined||v===null?'':v;const qty=(o,...ks)=>num(value(o,...ks));const st113=stm['113'].loc1.get(k)||{},st294=stm['294'].loc1.get(k)||{},st295=stm['295'].loc1.get(k)||{};const st02=stm['113'].loc2.get(k)||{},st03=stm['113'].loc3.get(k)||{};const h=hr.get(k)||{},sp=sup.get(key(value(h,'SUPCO')))||{},hp=hpg.get(k)||{},dw=whs.get(k)||{},pg=par['113'].get(k)||{},p294=par['294'].get(k)||{},p295=par['295'].get(k)||{},sea=seas.get(k)||{},po113=poSum['113'].get(k)||{po:0,bpb:0,lastDate:''},po294=poSum['294'].get(k)||{po:0,bpb:0,lastDate:''},po295=poSum['295'].get(k)||{po:0,bpb:0,lastDate:''};
 const frac=qty(p,'FRAC'),acost=qty(p,'ACOST'),lcost=qty(p,'LCOST'),pkm=qty(st113,'MAX','QTY_MAX'),q113=qty(st113,'QTY'),q294=qty(st294,'QTY'),q295=qty(st295,'QTY'),q02=qty(st02,'QTY'),q03=qty(st03,'QTY');const avg113=qty(pg,'QTYAVG','SLSAVG'),avg294=qty(p294,'QTYAVG','SLSAVG'),avg295=qty(p295,'QTYAVG','SLSAVG');const spd=avg113/30;
 set(0,k);set(1,value(p,'DESC2','DESC'));set(2,zone(value(st113,'LT')));set(3,value(dw,'STATION')||value(dw,'ST'));set(4,value(st113,'LT'));set(5,value(st113,'RAK'));set(6,value(st113,'BAR'));set(7,value(st113,'CELL'));set(8,[value(st113,'LT'),value(st113,'RAK'),value(st113,'BAR'),value(st113,'CELL')].map(text).join('-').replace(/^-+|-+$/g,''));set(9,value(h,'SUPCO')||value(p,'SUPCO'));set(10,value(sp,'SNAMA'));set(11,value(h,'BARU'));set(12,value(p,'DIV'));set(13,value(st113,'KLPT')||value(h,'KLPT'));set(14,value(p,'CAT_COD'));set(15,frac);set(16,acost);set(17,lcost);set(18,pkm);set(19,round(pkm*acost,2));set(20,value(p,'PTAG'));set(21,value(pg,'QTY_1','QTY1'));set(22,value(pg,'QTY_2','QTY2'));set(23,value(pg,'QTY_3','QTY3'));set(24,avg113);set(25,avg294);set(26,avg295);set(27,value(dw,'MINOR_TOKO','MINOR'));set(28,value(hp,'MEAN'));set(29,q294);set(30,frac>0?round(q294/frac):0);set(31,round(q294*acost,2));set(32,avg294>0?round(q294/(avg294/31),2):0);set(33,q295);set(34,frac>0?round(q295/frac):0);set(35,round(q295*acost,2));set(36,avg295>0?round(q295/(avg295/31),2):0);set(37,q113);set(38,frac>0?round(q113/frac):0);set(39,round(q113*acost,2));set(40,q113>0&&spd>0?round(q113/spd,2):0);set(41,pkm>0&&avg113>0?round(pkm/(avg113/31),2):0);set(42,pouSum['294'].get(k)||0);set(43,pouSum['295'].get(k)||0);set(44,poSum['113'].get(k)?.po||0);set(45,q02);set(46,frac>0?round(q02/frac):0);set(47,round(q02*acost,2));set(48,q03);set(49,frac>0?round(q03/frac):0);set(50,round(q03*acost,2));set(51,value(h,'KDSB'));set(52,kebQtyMap.get(k)||0);set(53,kebTokoMap.get(k)||0);set(54,0);set(55,0);set(56,0);
 let ket=value(itempar.get(k)||{},'KETERANGAN');set(57,ket==='PARETO'?'PARETO':'0');let jenis=value(sea,'JENIS');set(58,['TERKAIT','BASIC'].includes(jenis)?jenis:'0');set(59,jenis==='0'?'0':(value(sea,'RINCIAN')||'0'));set(60,spd);set(61,(value(p,'KONS')==='Y'?'BKL':value(p,'KONS')==='N'?'0':(value(p,'KONS')||'0')));set(62,hist.get(k)||'');set(63,protectSet.has(k)?'PROTECT HO':'NON PROTECT HO');set(64,itemdepo.has(k)?'Y':'');set(65,value(sp,'LEAD'));set(66,po113.po>0?round(po113.bpb/po113.po,4):'NO PO');set(67,po294.po>0?round(po294.bpb/po294.po,4):'NO PO');set(68,po295.po>0?round(po295.bpb/po295.po,4):'NO PO');set(69,dateStr(po113.lastDate));set(70,po113.lastQty||0);set(71,value(nataru.get(k)||{},'KETERANGAN'));const pro=promoStartMap.get(k)||{};set(72,dateStr(value(pro,'TGL_AWAL')));set(73,dateStr(value(pro,'TGL_AKH','TGL_AKHIR')));set(74,value(pro,'QTY','QTY_TGT'));set(75,value(pro,'JNS_PRO','JENIS_PRO'));set(76,itemwhk.has(k)?'Y':'');
 const numericCols=[15,16,17,18,19,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,52,54,55,56,60,65,66,67,68,70,74];
 for(const ci of numericCols){const v=r[ci];if(typeof v==='string'&&v.trim()!==''&&v.trim()!=='NO PO'){const n=num(v);if(Number.isFinite(n))r[ci]=n}}
 data.push(r)}
 // Verification gate: a valid location present in STM location 01 must never disappear from the output row.
 const locationMismatch=data.filter(r=>{const src=stm['113'].loc1.get(key(r[0]));if(!src)return false;const sourceHasLoc=['LT','RAK','BAR','CELL'].some(f=>text(value(src,f))!=='');const outputHasLoc=r.slice(4,8).some(v=>text(v)!=='');return sourceHasLoc&&!outputHasLoc});
 if(locationMismatch.length){const examples=locationMismatch.slice(0,10).map(r=>key(r[0])).join(', ');throw Error(`Verifikasi lokasi STM gagal: ${locationMismatch.length} barang memiliki lokasi pada STM tetapi kolom LT/RAK/BAR/CELL kosong di output. Contoh PRDCD: ${examples}. Ekspor dibatalkan.`)}
 const outputLocCount=data.filter(r=>r.slice(4,8).some(v=>text(v)!=='')).length;
 log.push(`Verifikasi lokasi output: ${outputLocCount} barang memiliki minimal satu nilai LT/RAK/BAR/CELL; tidak ada lokasi valid dari STM yang hilang pada output.`);
 const regressionSource=stm['113'].loc1.get('10000021');const regressionOutput=data.find(r=>key(r[0])==='10000021');
 if(regressionSource&&regressionOutput){const expected=['LT','RAK','BAR','CELL'].map(f=>text(value(regressionSource,f)));const actual=regressionOutput.slice(4,8).map(text);if(expected.some((v,i)=>v!==actual[i]))throw Error(`Verifikasi PRDCD 10000021 gagal. STM=${expected.join('/')}, output=${actual.join('/')}. Ekspor dibatalkan.`);log.push(`Uji acuan PRDCD 10000021 LULUS: LT=${actual[0]}, RAK=${actual[1]}, BAR=${actual[2]}, CELL=${actual[3]}, ALAMAT=${text(regressionOutput[8])}.`)}else{log.push('Uji acuan PRDCD 10000021 dilewati karena barang tidak ada pada sumber yang dipilih.')}
 const title=new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'long',year:'numeric'}).format(processDate).toUpperCase();const rows=[[`MASTER STOCK ${title}`,...Array(76).fill('')],Array(77).fill(''),H1,H2,Array(77).fill(''),...data];
 if(!getSource('stm113').length)warnings.push('Sumber stok G113 belum dipilih; kolom stok G113, STK02, STK03, alamat, dan PKM akan bernilai kosong/nol.');for(const role of ['stm294','stm295','par113','par294','par295','pom113','pom294','pom295','pou113','pou294','pou295','history'])if(!getSource(role).length)warnings.push(`Sumber ${ROLES.find(x=>x[0]===role)[1]} belum dipilih; kolom terkait dapat kosong atau nol.`);if(!allRows('stockout').length)warnings.push('LaporanStokOutDCINew belum diunggah; file Stock Out DC tidak dapat dibuat.');if(!allRows('keb').length)warnings.push('KEB tidak memiliki baris data PLU yang valid pada kolom B; kolom KEB/TOKO akan bernilai 0.');else log.push(`KEB: ${allRows('keb').length} baris data dibaca; KEB dijumlahkan dari kolom K per PRDCD dan TOKO dari kolom Q per PRDCD.`);if(!allRows('itempar').length)warnings.push('ITEMPAR tidak tersedia; KET akan diisi 0 kecuali ada sumber ITEMPAR.');
 log.push(`Output: ${data.length} barang; 77 kolom; 5 baris header/judul sebelum data.`);log.push('TGL RUBAH PTAG diambil dari tanggal TGL_AKHIR terbaru per PRDCD.');log.push('ST_G113/ST_G294/ST_G295 tidak ditampilkan sebagai kolom tersendiri dalam layout Master Stock.');const locationKeys=new Set([...stm['113'].loc1].filter(([k,o])=>['LT','RAK','BAR','CELL'].some(f=>text(value(o,f))!=='')).map(([k])=>k));
 const itemKeys=new Set(items.map(x=>x.k));
 const expectedLoc=[...locationKeys].filter(k=>itemKeys.has(k));
 const outputLoc=new Map(data.map(r=>[key(r[0]),r]));
 const missingLoc=expectedLoc.filter(k=>{const r=outputLoc.get(k);return r&&![r[4],r[5],r[6],r[7]].some(v=>text(v)!=='')});
 if(missingLoc.length)throw Error(`Validasi lokasi STM gagal: ${missingLoc.length} PRDCD memiliki lokasi di STM tetapi kosong pada hasil. Contoh: ${missingLoc.slice(0,10).join(', ')}. Ekspor dibatalkan.`);
 log.push(`Validasi lokasi STM: ${expectedLoc.length} PRDCD yang cocok dengan PRODMAST; ${expectedLoc.length-missingLoc.length} berhasil dipetakan; gagal ${missingLoc.length}.`);
 return {data,rows,title,processDate:processDate.toISOString(),warnings,log}}
function csvCell(v){let s=v===null||v===undefined?'':String(v);if(/[",\r\n]/.test(s))return '"'+s.replace(/"/g,'""')+'"';return s}
function download(name,content,type='text/csv;charset=utf-8'){const blob=new Blob(['\uFEFF',content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
async function runMasterStock(){if(!beginProcess('masterBtn'))return;setStatus('Memeriksa sumber dan memproses MASTER STOCK…',false,true);try{if(!allRows('prod').length)throw Error('File PRODMAST belum tersedia atau tidak terbaca. File ini wajib untuk membentuk daftar barang.');await new Promise(r=>setTimeout(r,20));const result=processData(new Date());lastResult=result;lastExportName=`MASTER STOCK ${result.title}.xlsx`;setStatus(`MASTER STOCK selesai diproses: ${result.data.length.toLocaleString('id-ID')} item. Menyiapkan unduhan…`,false,true);const blob=await makeXlsx(result);downloadBlob(lastExportName,blob);setStatus('MASTER STOCK berhasil dibuat.',false)}catch(e){setStatus(e.message||'Terjadi kesalahan saat membuat MASTER STOCK.',true)}finally{endProcess()}}
async function runStockOut(){if(!beginProcess('stockOutBtn'))return;setStatus('Memeriksa sumber dan memproses STOCK OUT…',false,true);try{if(!allRows('stockout').length)throw Error('File LaporanStokOutDCINew belum tersedia atau tidak terbaca.');if(!files.some(f=>f.guess==='stockoutbook'&&f.bytes))throw Error('File Stock Out DC.xlsx terakhir belum diunggah.');const out=await makeStockOutXlsx(new Date());downloadBlob(out.filename,out.blob);setStatus('STOCK OUT berhasil diperbarui.',false)}catch(e){setStatus(e.message||'Terjadi kesalahan saat membuat STOCK OUT.',true)}finally{endProcess()}}
function xmlEsc(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;')}
function colName(n){let s='';while(n>0){let r=(n-1)%26;s=String.fromCharCode(65+r)+s;n=Math.floor((n-1)/26)}return s}
function cellXml(ref,v,style){const st=style?` s="${style}"`:'';if(v===null||v===undefined||v==='')return `<c r="${ref}"${st}/>`;if(typeof v==='number'&&Number.isFinite(v))return `<c r="${ref}"${st} t="n"><v>${v}</v></c>`;return `<c r="${ref}"${st} t="inlineStr"><is><t xml:space="preserve">${xmlEsc(v)}</t></is></c>`}
async function makeXlsx(result){if(!window.JSZip)throw Error('Komponen ekspor Excel belum termuat. Muat ulang aplikasi lalu coba lagi.');const [tplResp,styleResp]=await Promise.all([fetch('./templates/xlsx-template.json'),fetch('./templates/template-styles.xml')]);if(!tplResp.ok||!styleResp.ok)throw Error('Template format Excel tidak dapat dibaca. Pastikan aplikasi dibuka melalui alamat HTTPS/localhost.');const tpl=await tplResp.json(),styles=await styleResp.text();const zip=new JSZip();const allRows=result.rows;const totalRows=allRows.length;const sheet=[];sheet.push('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetPr><pageSetUpPr fitToPage="false"/></sheetPr><dimension ref="A1:BY'+totalRows+'"/><sheetViews><sheetView showGridLines="false" zoomScale="85" zoomScaleNormal="85" workbookViewId="0"><pane xSplit="2" ySplit="5" topLeftCell="C6" activePane="bottomRight" state="frozen"/><selection pane="topLeft" activeCell="A1" sqref="A1"/><selection pane="topRight" activeCell="C1" sqref="C1"/><selection pane="bottomLeft" activeCell="A6" sqref="A6"/><selection pane="bottomRight" activeCell="C6" sqref="C6"/></sheetView></sheetViews><sheetFormatPr defaultColWidth="8.6796875" defaultRowHeight="15"/>');sheet.push('<cols>'+tpl.colWidths.map(c=>`<col min="${c.min}" max="${c.max}" width="${c.width}" style="${c.style||0}" customWidth="1"/>`).join('')+'</cols><sheetData>');
for(let ri=0;ri<allRows.length;ri++){const row=allRows[ri]||[];const rn=ri+1;let stylesForRow=rn===1?tpl.row1:rn===2?tpl.row2:rn===3?tpl.row3:rn===4?tpl.row4:rn===5?tpl.row5:tpl.data;let cells='';for(let ci=0;ci<77;ci++){let v=row[ci]??'';let st=stylesForRow[ci]||0;if(rn>=6&&ci>=66&&ci<=68)st=17;if(rn===1&&ci>0){if(ci===62||ci===76)cells+=cellXml(`${colName(ci+1)}${rn}`,'',0);continue}cells+=cellXml(`${colName(ci+1)}${rn}`,v,st)}const ht=tpl.rowHeights[String(rn)]||'15';sheet.push(`<row r="${rn}" ht="${ht}" customHeight="1">${cells}</row>`)}sheet.push('</sheetData><mergeCells count="'+tpl.merges.length+'">'+tpl.merges.map(m=>`<mergeCell ref="${m}"/>`).join('')+'</mergeCells><pageMargins left="0.25" right="0.25" top="0.5" bottom="0.5" header="0.2" footer="0.2"/><pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>');
zip.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>');
zip.file('_rels/.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>');
zip.file('xl/workbook.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets><sheet name="mststk" sheetId="1" r:id="rId1"/></sheets><calcPr calcId="191029"/></workbook>');zip.file('xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');zip.file('xl/worksheets/sheet1.xml',sheet.join(''));zip.file('xl/styles.xml',styles);zip.file('docProps/core.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>MASTER STOCK ${xmlEsc(result.title)}</dc:title><dc:creator>MSTSTK Builder</dc:creator><dc:date>${new Date(result.processDate).toISOString()}</dc:date></cp:coreProperties>`);zip.file('docProps/app.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>MSTSTK Builder</Application></Properties>');return await zip.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',compression:'DEFLATE',compressionOptions:{level:3}})}
async function makeStockOutXlsx(processDate){
 const src=getSource('stockout');if(!src.length)throw Error('Upload LaporanStokOutDCINew terlebih dahulu untuk membuat Stock Out DC.');
 const wanted=new Set(src.filter(o=>text(value(o,'STOCK_OUT','STOCKOUT')).toUpperCase()==='Y').map(o=>key(value(o,'PLU','PRDCD'))).filter(Boolean));
 if(!wanted.size)throw Error('Tidak ada PRDCD dengan STOCK_OUT = Y pada LaporanStokOutDCINew.');
 const book=files.find(f=>f.guess==='stockoutbook');if(!book?.bytes)throw Error('Upload file Stock Out DC.xlsx terakhir terlebih dahulu untuk melanjutkan sheet berikutnya.');
 const zip=await JSZip.loadAsync(book.bytes);
 const wb=await zip.file('xl/workbook.xml').async('string');const rel=await zip.file('xl/_rels/workbook.xml.rels').async('string');const sharedXml=zip.file('xl/sharedStrings.xml')?await zip.file('xl/sharedStrings.xml').async('string'):'';
 const shared=[...sharedXml.matchAll(/<si(?:\s[^>]*)?>([\s\S]*?)<\/si>/g)].map(m=>[...m[1].matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map(t=>t[1].replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'")).join(''));
 const day=new Date(processDate);day.setHours(0,0,0,0);day.setDate(day.getDate()-1);const sheetName=String(day.getDate()).padStart(2,'0');const periodKey=`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}`;
 const sheetDefs=[...wb.matchAll(/<sheet\b[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"[^>]*\/>/g)];const relMap=new Map([...rel.matchAll(/<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="worksheets\/sheet(\d+)\.xml"[^>]*\/>/g)].map(m=>[m[1],Number(m[2])]));const dated=sheetDefs.map(m=>({name:m[1],num:relMap.get(m[2])})).filter(x=>/^\d{1,2}$/.test(x.name)&&x.num);const targetNum=day.getDate();const prior=dated.slice().sort((a,b)=>Number(b.name)-Number(a.name))[0];if(!prior)throw Error('Tidak menemukan sheet tanggal pada file Stock Out DC yang diunggah.');if(dated.some(x=>Number(x.name)===targetNum))throw Error(`Sheet tanggal ${sheetName} sudah ada di file sumber. Gunakan file periode terakhir yang belum memiliki sheet tanggal ${sheetName}.`);const lastSheet=prior.num;const newSheetNum=Math.max(...[...rel.matchAll(/Target="worksheets\/sheet(\d+)\.xml"/g)].map(m=>+m[1]))+1;let xml=await zip.file(`xl/worksheets/sheet${lastSheet}.xml`).async('string');
 let kept=0,missing=0;const found=new Set();
 // Ambil format per kolom secara konsisten dari baris data pertama (baris 5).
 const baseStyles={};
 const firstDataRow=xml.match(/<row\b[^>]*r="5"[^>]*>[\s\S]*?<\/row>/);
 if(firstDataRow)for(const c of firstDataRow[0].matchAll(/<c\b([^>]*\br="([A-Z]+)5"[^>]*)>/g)){const sm=c[1].match(/\bs="(\d+)"/);if(sm)baseStyles[c[2]]=sm[1];}
 const headerRow=xml.match(/<row\b[^>]*r="4"[^>]*>[\s\S]*?<\/row>/);
 if(headerRow)for(const c of headerRow[0].matchAll(/<c\b([^>]*\br="([A-Z]+)4"[^>]*)>/g)){const sm=c[1].match(/\bs="(\d+)"/);if(sm&&baseStyles[c[2]]===undefined)baseStyles[c[2]]=sm[1];}
 const applyBaseStyles=(row,newRn)=>{
  let shifted=row.replace(/(<row\b[^>]*\br=)"\d+"/,`$1"${newRn}"`).replace(/(\br="[A-Z]+)\d+(")/g,`$1${newRn}$2`);
  shifted=shifted.replace(/<c\b([^>]*\br="([A-Z]+)\d+"[^>]*)>/g,(tag,attrs,col)=>{
   if(baseStyles[col]===undefined)return tag;
   const selfClosing=/\/\s*$/.test(attrs);
   let clean=attrs.replace(/\s+s="\d+"/g,'').replace(/\/\s*$/,'').trimEnd();
   return selfClosing ? `<c${clean} s="${baseStyles[col]}"/>` : `<c${clean} s="${baseStyles[col]}">`;
  });
  // Pastikan setiap baris hasil memiliki seluruh sel/format kolom tabel sampai kolom terakhir,
  // termasuk saat jumlah item lebih banyak daripada sheet tanggal sebelumnya.
  for(const [col,style] of Object.entries(baseStyles)){
   if(!new RegExp(`<c\\b[^>]*\\br="${col}${newRn}"`).test(shifted))
    shifted=shifted.replace('</row>',`<c r="${col}${newRn}" s="${style}"/></row>`);
  }
  return shifted.replace(/<row\b([^>]*)>/, (tag,attrs)=>`<row${attrs.replace(/\s+spans="[^"]*"/,'')} spans="1:17">`);
 };
 xml=xml.replace(/<sheetData>([\s\S]*?)<\/sheetData>/,(_,body)=>{let rows=[...body.matchAll(/<row\b[^>]*r="(\d+)"[^>]*>[\s\S]*?<\/row>/g)];const out=[];for(const m of rows){const rn=+m[1],row=m[0];if(rn<=4){out.push(row);continue;}const cm=row.match(/<c\b[^>]*r="C\d+"[^>]*>([\s\S]*?)<\/c>/);if(!cm)continue;const vm=cm[1].match(/<v>([\s\S]*?)<\/v>/);if(!vm)continue;let prd=vm[1];const cell=row.match(/<c\b[^>]*r="C\d+"[^>]*([^>]*)>/);if(/t="s"/.test(cell?.[0]||''))prd=shared[Number(prd)]||prd;prd=String(prd).replace(/^0+(?=\d)/,'');if(wanted.has(prd)){const newRn=5+kept;out.push(applyBaseStyles(row,newRn));kept++;found.add(prd)}}return '<sheetData>'+out.join('')+'</sheetData>'});
 const serial=Math.round((Date.UTC(day.getFullYear(),day.getMonth(),day.getDate())-Date.UTC(1899,11,30))/86400000);
 xml=xml.replace(/<c\b([^>]*r="B2"[^>]*)>([\s\S]*?)<\/c>/,(_,attrs,inner)=>`<c${attrs.replace(/\s+t="[^"]*"/g,'')}><v>${serial}</v></c>`);
 xml=xml.replace(/<dimension ref="[^"]+"\/>/,`<dimension ref="A1:Q${4+kept}"/>`);xml=xml.replace(/<autoFilter ref="[^"]+"\/>/,`<autoFilter ref="A4:Q${4+kept}"/>`);zip.file(`xl/worksheets/sheet${newSheetNum}.xml`,xml);
 const ridNums=[...rel.matchAll(/Id="rId(\d+)"/g)].map(m=>+m[1]);const newRid='rId'+(Math.max(...ridNums)+1);zip.file('xl/_rels/workbook.xml.rels',rel.replace('</Relationships>',`<Relationship Id="${newRid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${newSheetNum}.xml"/></Relationships>`));
 zip.file('xl/workbook.xml',wb.replace('</sheets>',`<sheet name="${sheetName}" sheetId="${Math.max(...sheetDefs.map(m=>+m[1].match(/^\d+$/)?.[0]||0))+1}" r:id="${newRid}"/></sheets>`));
 const ct=await zip.file('[Content_Types].xml').async('string');zip.file('[Content_Types].xml',ct.replace('</Types>',`<Override PartName="/xl/worksheets/sheet${newSheetNum}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`));
 missing=[...wanted].filter(k=>!found.has(k)).length;const monthYear=day.toLocaleDateString('id-ID',{month:'long',year:'numeric'});const outputPeriod=periodKey;return {blob:await zip.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',compression:'DEFLATE',compressionOptions:{level:3}}),sheetName,kept,missing,wanted:wanted.size,filename:`Stock Out DC ${monthYear}.xlsx`,period:outputPeriod};
}

function colLetters(n){let s='';while(n>0){let r=(n-1)%26;s=String.fromCharCode(65+r)+s;n=Math.floor((n-1)/26)}return s}
function xmlDecode(s){return String(s||'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'")}
function xmlEncode(s){return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;')}
function readCellText(cell,shared){if(!cell)return '';if(/\bt="inlineStr"/.test(cell))return [...cell.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map(m=>xmlDecode(m[1])).join('');const v=cell.match(/<v>([\s\S]*?)<\/v>/);if(!v)return '';const raw=xmlDecode(v[1]);if(/\bt="s"/.test(cell))return shared[Number(raw)]||'';return raw}
function setXmlCell(rowXml,ref,val,style){const col=ref.replace(/\d/g,'');const re=new RegExp(`<c\\b([^>]*\\br="${ref}"[^>]*)(?:>([\\s\\S]*?)<\\/c>|\\s*\\/>)`);const m=rowXml.match(re);let attrs=m?m[1]:` r="${ref}"`;attrs=attrs.replace(/\/\s*$/,'');if(style!==undefined&&!/\bs="\d+"/.test(attrs))attrs+=` s="${style}"`;attrs=attrs.replace(/\s+t="[^"]*"/g,'');let body;if(typeof val==='number'&&Number.isFinite(val))body=`<v>${val}</v>`;else body=`<is><t xml:space="preserve">${xmlEncode(val)}</t></is>`;const cell=`<c${attrs}${typeof val==='number'?'':' t="inlineStr"'}>${body}</c>`;if(m)return rowXml.replace(re,cell);const rowEnd=rowXml.lastIndexOf('</row>');return rowEnd>=0?rowXml.slice(0,rowEnd)+cell+rowXml.slice(rowEnd):rowXml}
async function makeSlSupplierXlsx(processDate){
 const book=files.find(f=>f.guess==='slsupplierbook'&&f.bytes);if(!book)throw Error('Upload file SL Supplier ke DC.xlsx terakhir terlebih dahulu.');
 if(!allRows('prod').length||!allRows('stm113').length)throw Error('File PRODMAST dan STM G113 harus tersedia agar daftar PLU mengikuti MASTER STOCK.');
 if(!allRows('pom113').length)throw Error('File POM G113 belum tersedia. Unggah file POM G113 yang sama seperti MASTER STOCK.');
 const result=processData(processDate);const wanted=result.data;const day=new Date(processDate);day.setHours(0,0,0,0);day.setDate(day.getDate()-1);
 // Hitung H-1 secara langsung dari sumber POM G113. Jangan bergantung pada kolom SL MASTER STOCK agar hasil supplier selalu memakai transaksi dan rentang tanggal yang tepat.
 const processDay=new Date(processDate);processDay.setHours(0,0,0,0);const rangeStart=new Date(processDay);rangeStart.setDate(rangeStart.getDate()-14);const slByPrd=new Map();
 for(const o of filterWarehouse(allRows('pom113'),'G113')){const prd=key(value(o,'PRDCD','PLU'));if(!prd)continue;const rec=text(value(o,'RECID')).toUpperCase();if(rec==='1')continue;const poDate=dateVal(value(o,'PO_DATE'));if(!poDate||poDate<rangeStart||poDate>=processDay)continue;const cur=slByPrd.get(prd)||{po:0,bpb:0,rows:0};cur.po+=num(value(o,'QTY'));cur.bpb+=num(value(o,'BPB_QTY'));cur.rows++;slByPrd.set(prd,cur)}
 const monthNames=['JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI','JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'];const sheetName=monthNames[day.getMonth()];
 const zip=await JSZip.loadAsync(book.bytes);const wb=await zip.file('xl/workbook.xml').async('string');const rel=await zip.file('xl/_rels/workbook.xml.rels').async('string');const sharedXml=zip.file('xl/sharedStrings.xml')?await zip.file('xl/sharedStrings.xml').async('string'):'';
 const shared=[...sharedXml.matchAll(/<si(?:\s[^>]*)?>([\s\S]*?)<\/si>/g)].map(m=>[...m[1].matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map(t=>xmlDecode(t[1])).join(''));
 const sheetDefs=[...wb.matchAll(/<sheet\b[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"[^>]*\/?\s*>/g)];const relMap=new Map([...rel.matchAll(/<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"[^>]*\/?\s*>/g)].map(m=>[m[1],m[2]]));const def=sheetDefs.find(m=>m[1].toUpperCase()===sheetName);if(!def)throw Error(`Sheet ${sheetName} tidak ditemukan pada workbook SL Supplier. Tidak dibuatkan sheet baru.`);const target=relMap.get(def[2]);if(!target)throw Error(`Relasi sheet ${sheetName} tidak ditemukan.`);const path='xl/'+target.replace(/^\//,'').replace(/^xl\//,'');let xml=await zip.file(path).async('string');
 const dayCol=7+day.getDate(); // H=8 for day 1
 const dayRef=colLetters(dayCol);
 const oldRows=[...xml.matchAll(/<row\b[^>]*r="(\d+)"[^>]*>[\s\S]*?<\/row>/g)];const oldByPrd=new Map();let template='';let templateStyles={};
 for(const m of oldRows){const rn=+m[1];if(rn===4)template=m[0];if(rn<4)continue;const a=m[0].match(/<c\b[^>]*r="A\d+"[^>]*>[\s\S]*?<\/c>/);const prd=key(readCellText(a?.[0],shared));if(prd)oldByPrd.set(prd,m[0]);}
 if(!template)template=oldRows.find(m=>+m[1]>=4)?.[0]||'';if(!template)throw Error('Tidak menemukan baris contoh data pada sheet SL Supplier.');
 for(const c of template.matchAll(/<c\b([^>]*\br="([A-Z]+)\d+"[^>]*)>/g)){const st=c[1].match(/\bs="(\d+)"/);if(st)templateStyles[c[2]]=st[1]}
 const updates=[];let noPo=0;for(let i=0;i<wanted.length;i++){const r=wanted[i],prd=key(r[0]);const existed=oldByPrd.has(prd);let row=oldByPrd.get(prd)||template;const rn=i+4;row=row.replace(/(<row\b[^>]*\br=")\d+("[^>]*>)/,`$1${rn}$2`).replace(/(\br="[A-Z]+)\d+("?)/g,`$1${rn}$2`);
  if(!existed){for(let d=1;d<=31;d++)row=setXmlCell(row,`${colLetters(7+d)}${rn}`,'',templateStyles[colLetters(7+d)]);}
  for(let d=day.getDate()+1;d<=31;d++)row=setXmlCell(row,`${colLetters(7+d)}${rn}`,'',templateStyles[colLetters(7+d)]);
  const values={A:r[0],B:r[1],C:r[12],D:r[15],E:r[11],F:r[16],G:r[18],AM:r[9],AN:r[10]};
  for(const [col,val] of Object.entries(values))row=setXmlCell(row,`${col}${rn}`,val??'',templateStyles[col]);
  const slData=slByPrd.get(prd);const sl=slData&&slData.po>0?round(slData.bpb/slData.po,4):'NO PO';if(sl==='NO PO')noPo++;row=setXmlCell(row,`${dayRef}${rn}`,sl,templateStyles[dayRef]);updates.push(row);
 }
 const headerRows=oldRows.filter(m=>+m[1]<4).map(m=>m[0]);const sheetData=headerRows.concat(updates).join('');xml=xml.replace(/<sheetData>[\s\S]*?<\/sheetData>/,`<sheetData>${sheetData}</sheetData>`);xml=xml.replace(/<dimension\b[^>]*ref="[^"]+"[^>]*\/?\s*>/,`<dimension ref="A1:AN${wanted.length+3}"/>`);zip.file(path,xml);
 const blob=await zip.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',compression:'DEFLATE',compressionOptions:{level:3}});return {blob,items:wanted.length,noPo,filename:`SL Supplier ke DC ${monthNames[day.getMonth()].toLowerCase()} ${day.getFullYear()}.xlsx`,sheetName,day:day.getDate()};
}

async function makeRekapSupplierXlsx(processDate){
 const book=files.find(f=>f.guess==='rekapsupplierbook'&&f.bytes);
 if(!book?.bytes)throw Error('Upload file Rekap Supplier ...xlsx terakhir terlebih dahulu.');
 const src=getSource('lrbpbsupplier');
 if(!src.length)throw Error('Upload file LRBPB_SUPPLIER ...csv terlebih dahulu.');
 const day=new Date(processDate);day.setHours(0,0,0,0);day.setDate(day.getDate()-1);
 const sheetName=String(day.getDate()).padStart(2,'0');
 const monthNames=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
 const monthYear=`${monthNames[day.getMonth()]} ${day.getFullYear()}`;
 const groups=new Map();
 for(const o of src){
  const rawPrd=text(value(o,'PLU')).trim();if(!/^\d{8}$/.test(rawPrd))continue;const prd=rawPrd;
  const supplier=text(value(o,'SUPPLIER'));const cut=supplier.indexOf(' - ');
  const supco=cut>=0?supplier.slice(0,cut).trim():supplier.split(/\s+/)[0];
  const supname=cut>=0?supplier.slice(cut+3).trim():supplier;
  if(!groups.has(prd))groups.set(prd,{prd,qty:0,gross:0,supco,supname,suppliers:new Set(),supplierNames:new Set()});
  const g=groups.get(prd);g.qty+=num(value(o,'TOT_QTY'));g.gross+=num(value(o,'GROSSPLUSPPN','GROSS_PLUS_PPN'));if(supco)g.suppliers.add(supco);if(supname)g.supplierNames.add(supname);
  if(!g.supco&&supco)g.supco=supco;if(!g.supname&&supname)g.supname=supname;
 }
 if(!groups.size)throw Error('Tidak ada data PLU valid 8 digit pada file LRBPB_SUPPLIER.');
 const zip=await JSZip.loadAsync(book.bytes);
 const wb=await zip.file('xl/workbook.xml').async('string');
 const rel=await zip.file('xl/_rels/workbook.xml.rels').async('string');
 const sharedXml=zip.file('xl/sharedStrings.xml')?await zip.file('xl/sharedStrings.xml').async('string'):'';
 const shared=[...sharedXml.matchAll(/<si(?:\s[^>]*)?>([\s\S]*?)<\/si>/g)].map(m=>[...m[1].matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map(t=>xmlDecode(t[1])).join(''));
 const defs=[...wb.matchAll(/<sheet\b[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"[^>]*\/?\s*>/g)].map(m=>({name:m[1],rid:m[2]}));
 const relMap=new Map([...rel.matchAll(/<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"[^>]*\/?\s*>/g)].map(m=>[m[1],m[2]]));
 const dated=defs.filter(x=>/^\d{1,2}$/.test(x.name));
 if(dated.some(x=>Number(x.name)===day.getDate()))throw Error(`Sheet tanggal ${sheetName} sudah ada. Upload file Rekap Supplier terakhir yang belum memiliki tanggal tersebut.`);
 const prior=dated.slice().sort((a,b)=>Number(b.name)-Number(a.name))[0];if(!prior)throw Error('Tidak menemukan sheet tanggal sebelumnya pada file Rekap Supplier.');
 const pathFor=def=>{const t=relMap.get(def.rid);if(!t)throw Error('Relasi worksheet tidak ditemukan.');return 'xl/'+t.replace(/^\//,'').replace(/^xl\//,'')};
 const priorPath=pathFor(prior);let xml=await zip.file(priorPath).async('string');
 const rows=[...xml.matchAll(/<row\b[^>]*r="(\d+)"[^>]*>[\s\S]*?<\/row>/g)];
 const headerRows=rows.filter(m=>+m[1]<=2).map(m=>m[0]);
 const template=rows.find(m=>+m[1]===3)?.[0]||rows.find(m=>+m[1]>=3)?.[0];
 if(!template)throw Error('Tidak menemukan baris contoh data pada sheet tanggal terakhir.');
 const styles={};for(const c of template.matchAll(/<c\b([^>]*\br="([A-Z]+)\d+"[^>]*)>/g)){const st=c[1].match(/\bs="(\d+)"/);if(st)styles[c[2]]=st[1]}
 // Existing detail data supplies description/division fallback; PRODMAST is preferred.
 const prodMap=new Map(getSource('prod').map(o=>[key(value(o,'PRDCD','PLU')),o]).filter(x=>x[0]));
 const oldLookup=new Map();
 for(const m of rows){if(+m[1]<3)continue;const row=m[0];const cell=(col)=>row.match(new RegExp(`<c\\b[^>]*r="${col}\\d+"[^>]*>[\\s\\S]*?<\\/c>`))?.[0]||'';
  const prd=key(readCellText(cell('B'),shared));if(prd)oldLookup.set(prd,{desc:readCellText(cell('C'),shared),div:readCellText(cell('D'),shared)});
 }
 const outRows=[];
 for(const g of groups.values()){
  const rn=outRows.length+3;let row=template.replace(/(<row\b[^>]*\br=")\d+("[^>]*>)/,`$1${rn}$2`).replace(/(\br="[A-Z]+)\d+("?)/g,`$1${rn}$2`);
  const prod=prodMap.get(g.prd)||{};const old=oldLookup.get(g.prd)||{};
  const desc=value(prod,'DESC2','DESC')||old.desc||'';
  const div=value(prod,'DIV')||old.div||'';
  const vals={B:g.prd,C:desc,D:div,E:[...g.suppliers].join(', '),F:[...g.supplierNames].join(' / '),G:g.qty,H:g.gross};
  for(const [col,val] of Object.entries(vals))row=setXmlCell(row,`${col}${rn}`,val,styles[col]);
  row=row.replace(new RegExp(`(<c\\b[^>]*r="A${rn}"[^>]*>)[\\s\\S]*?<\\/c>`),`<c r="A${rn}"${styles.A?` s="${styles.A}"`:''}><f>IF(B${rn}="","",ROW()-ROW($A$2))</f><v>${rn-2}</v></c>`);
  outRows.push(row);
 }
 const newXml=xml.replace(/<sheetData>[\s\S]*?<\/sheetData>/,`<sheetData>${headerRows.join('')}${outRows.join('')}</sheetData>`).replace(/<dimension\b[^>]*ref="[^"]+"[^>]*\/?\s*>/,`<dimension ref="A1:H${outRows.length+2}"/>`);
 const relTargets=[...rel.matchAll(/Target="worksheets\/sheet(\d+)\.xml"/g)].map(m=>+m[1]);
 const newSheetNum=Math.max(0,...relTargets)+1;const newPath=`xl/worksheets/sheet${newSheetNum}.xml`;zip.file(newPath,newXml);
 const ridNums=[...rel.matchAll(/Id="rId(\d+)"/g)].map(m=>+m[1]);const newRid='rId'+(Math.max(0,...ridNums)+1);
 zip.file('xl/_rels/workbook.xml.rels',rel.replace('</Relationships>',`<Relationship Id="${newRid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${newSheetNum}.xml"/></Relationships>`));
 const sheetIds=defs.map(x=>{const m=wb.match(new RegExp(`<sheet\\b[^>]*name="${x.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}"[^>]*sheetId="(\\d+)"`));return +(m?.[1]||0)});
 const newSheetId=Math.max(0,...sheetIds)+1;
 zip.file('xl/workbook.xml',wb.replace('</sheets>',`<sheet name="${sheetName}" sheetId="${newSheetId}" r:id="${newRid}"/></sheets>`));
 const ct=await zip.file('[Content_Types].xml').async('string');
 zip.file('[Content_Types].xml',ct.replace('</Types>',`<Override PartName="/xl/worksheets/sheet${newSheetNum}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`));
 // Update REKAP summary for this day: row 2 is day 1.
 const rekapDef=defs.find(x=>x.name.toUpperCase()==='REKAP');if(!rekapDef)throw Error('Sheet REKAP tidak ditemukan pada workbook.');
 const rekapPath=pathFor(rekapDef);let rx=await zip.file(rekapPath).async('string');const summaryRow=day.getDate()+1;
 const rekapRows=[...rx.matchAll(/<row\b[^>]*r="(\d+)"[^>]*>[\s\S]*?<\/row>/g)];
 const targetRow=rekapRows.find(m=>+m[1]===summaryRow)?.[0];if(!targetRow)throw Error(`Baris tanggal ${day.getDate()} tidak tersedia pada sheet REKAP.`);
 const supplierCount=new Set([...groups.values()].flatMap(g=>[...g.suppliers])).size;
 const totalQtyItems=groups.size;const totalGross=[...groups.values()].reduce((n,g)=>n+g.gross,0);
 const updated=targetRow.replace(/<\/row>$/,'');
 let upd=setXmlCell(updated,`E${summaryRow}`,supplierCount);
 upd=setXmlCell(upd,`F${summaryRow}`,totalQtyItems);
 upd=setXmlCell(upd,`G${summaryRow}`,totalGross);
 const finalRow=upd+'</row>';
 rx=rx.replace(targetRow,finalRow);zip.file(rekapPath,rx);
 const blob=await zip.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',compression:'DEFLATE',compressionOptions:{level:3}});
 return {blob,filename:`Rekap Supplier ${monthYear}.xlsx`,sheetName,items:groups.size,suppliers:supplierCount,nominal:totalGross,rows:src.length};
}
async function runRekapSupplier(){if(!beginProcess('rekapSupplierBtn'))return;setStatus('Memproses BPB Supplier dan memperbarui Rekap Supplier…',false,true);try{const out=await makeRekapSupplierXlsx(new Date());downloadBlob(out.filename,out.blob);setStatus('BPB SUPPLIER berhasil diperbarui.',false)}catch(e){setStatus(e.message||'Terjadi kesalahan saat membuat BPB Supplier.',true)}finally{endProcess()}}

async function runSlSupplier(){if(!beginProcess('slSupplierBtn'))return;setStatus('Memproses pembaruan SL Supplier G113…',false,true);try{const out=await makeSlSupplierXlsx(new Date());downloadBlob(out.filename,out.blob);setStatus('SL SUPPLIER berhasil diperbarui.',false)}catch(e){setStatus(e.message||'Terjadi kesalahan saat memperbarui SL Supplier.',true)}finally{endProcess()}}
function downloadBlob(name,blob){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000)}
$('filePicker').addEventListener('change',e=>{addFiles(e.target.files);e.target.value=''});const folderPicker=$('dailyFolderPicker');$('pickDailyFolderLink').addEventListener('click',()=>folderPicker.click());$('pickFilesButton').addEventListener('click',()=>$('filePicker').click());folderPicker.addEventListener('change',e=>{const chosen=[...e.target.files];if(!chosen.length){setStatus('Tidak ada file yang dipilih.',true)}else{addFiles(chosen);const rootFiles=chosen.filter(f=>!warehouseFromPath(f)).length;const warehouseFiles=chosen.length-rootFiles;setStatus(`${chosen.length} file ditambahkan: ${rootFiles} file di folder utama/kategori dan ${warehouseFiles} file dari folder gudang.`)}e.target.value=''});$('clearBtn').onclick=()=>{files=[];parsed.clear();renderFiles();setStatus('Daftar file sumber dibersihkan.')};$('fileManageClose').onclick=()=>$('fileManageDialog').close();
const PROCESS_CHECKS={
 poExpiredBtn:['seas'],
 masterBtn:['prod','stm113','stm294','stm295','hrgbeli','supmast','hpg','protect','datawhs','par113','par294','par295','seas','itemdepo','itemwhk','pom113','pom294','pom295','pou113','pou294','pou295','keb','nataru','promo','history','stockout'],
 stockOutBtn:['stockout','stockoutbook'],
 slSupplierBtn:['prod','stm113','pom113','slsupplierbook'],
 rekapSupplierBtn:['lrbpbsupplier','rekapsupplierbook'],
 brdBtn:['brd']
};
const PROCESS_TITLES={poExpiredBtn:'PO EXPIRED',masterBtn:'MASTER STOCK',stockOutBtn:'STOCK OUT',slSupplierBtn:'SL SUPPLIER',rekapSupplierBtn:'BPB SUPPLIER',brdBtn:'BRD'};
const processActions={masterBtn:runMasterStock,stockOutBtn:runStockOut,slSupplierBtn:runSlSupplier,rekapSupplierBtn:runRekapSupplier,brdBtn:runBrd};
function openFileManager(action='allFiles'){$('fileManageDialog').dataset.action=action;renderFiles();$('fileManageDialog').showModal()}
$('openFileManagerButton').addEventListener('click',()=>openFileManager('allFiles'));
function hasRole(role){return files.some(f=>f.guess===role&&(f.bytes||String(f.content||'').trim()!==''));}
function missingFor(buttonId){return (PROCESS_CHECKS[buttonId]||[]).filter(role=>!hasRole(role)&&!(role==='itempar'));}
function showPreflight(buttonId,missing){$('preflightTitle').textContent=`${PROCESS_TITLES[buttonId]} — file belum lengkap`;$('preflightIntro').textContent='Beberapa file sumber belum tersedia. Kamu bisa melengkapi file terlebih dahulu atau tetap melanjutkan proses dengan data yang ada.';$('preflightMissing').innerHTML=missing.map(role=>{const item=ROLES.find(r=>r[0]===role);return `<div class="brd-option missing-option"><span class="missing-mark">!</span><span>${escapeHtml(item?item[1]:role)} belum ada</span></div>`}).join('');$('preflightDialog').dataset.action=buttonId;$('preflightDialog').showModal();}
function requestProcess(buttonId){if($(buttonId).disabled)return;const missing=missingFor(buttonId);if(missing.length){showPreflight(buttonId,missing);return}processActions[buttonId]();}

function buildPoExpiredPayload(){
 const result=processData(new Date());lastResult=result;
 const pomFile=files.find(f=>f.guess==='pom113'&&(!warehouseFromPath(f)||warehouseFromPath(f)==='G113'));
 const pomText=pomFile?pomFile.content:'';
 const stockRows=[['PRDCD','KL'],...getSource('stockout').filter(o=>text(value(o,'STOCK_OUT','STOCKOUT')).toUpperCase()==='Y').map(o=>[value(o,'PLU','PRDCD'),1])];
 const promoRows=[['PLU','DESC','QTY','JENIS','TGL1','TGL2','TGL3','TGL4'],...result.data.map(r=>[r[0],r[1],r[74],r[75],r[72],r[73],'','']).filter(r=>r.slice(4,8).some(v=>text(v)!==''))];
 const seasonalFile=files.find(f=>f.guess==='seas'&&f.bytes);
 return {masterRows:result.rows,pomText,stockOutRows:stockRows,promoRows,seasonalBytes:seasonalFile?seasonalFile.bytes:null,seasonalName:seasonalFile?seasonalFile.name:''};
}
function openPoExpired(){
 const panel=$('poExpiredApp');panel.classList.add('po-open');$('poExpiredDialog').setAttribute('aria-hidden','false');
 try { const payload=buildPoExpiredPayload(); window.dispatchEvent(new CustomEvent('inventory-po-payload',{detail:payload})); }
 catch(e){setStatus('PO Expired: '+(e.message||e),true)}
}
window.openPoExpired=openPoExpired;
$('poExpiredClose').addEventListener('click',()=>{$('poExpiredApp').classList.remove('po-open');$('poExpiredDialog').setAttribute('aria-hidden','true')});

$('masterBtn').onclick=()=>requestProcess('masterBtn');$('stockOutBtn').onclick=()=>requestProcess('stockOutBtn');$('slSupplierBtn').onclick=()=>requestProcess('slSupplierBtn');$('rekapSupplierBtn').onclick=()=>requestProcess('rekapSupplierBtn');$('brdBtn').onclick=()=>requestProcess('brdBtn');
$('preflightCancel').onclick=()=>$('preflightDialog').close();
$('preflightComplete').onclick=()=>{const id=$('preflightDialog').dataset.action;$('preflightDialog').close();openFileManager(id)};
$('preflightProceed').onclick=()=>{const id=$('preflightDialog').dataset.action;$('preflightDialog').close();processActions[id]();};

async function runBrd(){const selected=files.filter(f=>f.guess==='brd'&&f.content);if(!$('brdBtn').disabled&&selected.length){$('brdDialogError').textContent='';$('brdExportDialog').showModal();}else if(!selected.length)setStatus('File BRD belum tersedia. Unggah satu atau beberapa file BRD terlebih dahulu.',true);}
$('brdCancel').onclick=()=>$('brdExportDialog').close();
$('brdSelectAll').onchange=e=>document.querySelectorAll('input[name="brdExport"]').forEach(c=>c.checked=e.target.checked);
document.querySelectorAll('input[name="brdExport"]').forEach(c=>c.onchange=()=>{$('brdSelectAll').checked=[...document.querySelectorAll('input[name="brdExport"]')].every(x=>x.checked)});
$('brdExportForm').addEventListener('submit',e=>{e.preventDefault();const exports=[...document.querySelectorAll('input[name="brdExport"]:checked')].map(c=>c.value);if(!exports.length){$('brdDialogError').textContent='Pilih minimal satu jenis file untuk diekspor.';return;}$('brdExportDialog').close();const selected=files.filter(f=>f.guess==='brd'&&f.content);if(!beginProcess('brdBtn'))return;setStatus('Memproses '+selected.length+' file BRD…',false,true);if(typeof window.convertBrdFiles!=='function'){setStatus('BRD Engine belum siap dimuat.',true);endProcess();return;}window.convertBrdFiles(selected.map(f=>({name:f.name,text:f.content})),exports,result=>{setStatus(result.ok?result.message:('Konversi BRD gagal: '+result.message),!result.ok);endProcess();});});


/* ===== BRD conversion engine integrated into Inventory ===== */
(function InventoryBrdEngine(){

let rawText = '';
let mergeWarning = '';
let detectedName = 'BRD';
let uploadedFileDates = [];
let selectedFiles = [];
const mstgCache = { text:null, val:null };
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const filenameEl = document.getElementById('filename');
const uploadStatusEl = document.getElementById('uploadStatus');
const uploadActions = document.getElementById('uploadActions');
const addMoreBtn = document.getElementById('addMoreBtn');
const continueBtn = document.getElementById('continueBtn');
const resetBtn = document.getElementById('resetBtn');
const configCard = document.getElementById('configCard');
const previewNames = document.querySelectorAll('.previewName');
const processBtn = document.getElementById('processBtn');
const statusEl = document.getElementById('brdEngineStatus');

dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag'));
dropzone.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.classList.remove('drag');
  if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
});
fileInput.addEventListener('change', e => {
  if (e.target.files.length) addFiles(e.target.files);
  fileInput.value = ''; // supaya bisa pilih file yang sama lagi lain waktu
});
addMoreBtn.addEventListener('click', () => fileInput.click());
continueBtn.addEventListener('click', () => {
  updateMstxhVisibility(); // cek apakah data yang terkumpul sejauh ini sudah 1 bulan penuh -> tentukan MSTG atau MSTXH/MSTD yang muncul
  configCard.style.display = 'block';
  configCard.scrollIntoView({ behavior:'smooth', block:'start' });
});
resetBtn.addEventListener('click', () => {
  selectedFiles = [];
  rawText = '';
  mergeWarning = '';
  detectedName = 'BRD';
  uploadedFileDates = [];
  fileCache.clear();
  failedFiles = [];
  fileInput.value = '';

  filenameEl.innerHTML = '';
  uploadStatusEl.textContent = '';
  uploadStatusEl.className = 'status';
  statusEl.textContent = '';
  statusEl.className = 'status';

  uploadActions.style.display = 'none';
  resetBtn.style.display = 'none';
  configCard.style.display = 'none';

  optEls.forEach(c => { c.checked = false; });
  selectAll.checked = false;
  updateBtn();
  updateMstxhVisibility();
  updatePreviewName();
});

// Minimal CSV line parser that respects double-quoted fields containing commas.
function parseCsvLine(line){
  const out = [];
  let cur = '';
  let inQuotes = false;
  for(let i=0; i<line.length; i++){
    const ch = line[i];
    if(inQuotes){
      if(ch === '"'){
        if(line[i+1] === '"'){ cur += '"'; i++; }
        else inQuotes = false;
      } else cur += ch;
    } else {
      if(ch === '"') inQuotes = true;
      else if(ch === ','){ out.push(cur); cur=''; }
      else cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function readFileAsText(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Gagal membaca ' + file.name));
    reader.readAsText(file, 'utf-8');
  });
}

// Cache hasil baca per file (kunci: nama|ukuran). File yang sudah pernah dibaca tidak dibaca/diurai ulang saat file lain ditambahkan.
const fileCache = new Map();
const fileKey = f => f.name + '|' + f.size;
let failedFiles = []; // [{file, msg}] file yang gagal dibaca; tidak ikut digabung, file lain tetap jalan

async function parseOneFile(file){
  const text = await readFileAsText(file);
  const lines = text.split(/\r\n|\n|\r/).filter(l => l.length > 0);
  const entry = { lines, header: lines[0] || null, colCount: 0, codeCounts: {} };
  if(lines.length){
    const headers = parseCsvLine(lines[0]);
    entry.colCount = headers.length;
    const up = headers.map(h => h.trim().toUpperCase());
    let idx = up.indexOf('TBL_DC_KODE');
    if(idx === -1) idx = up.findIndex(h => h.includes('DC_KODE'));
    if(idx !== -1){
      for(let i=1; i<lines.length; i++){
        const v = (parseCsvLine(lines[i])[idx] || '').trim();
        if(v) entry.codeCounts[v] = (entry.codeCounts[v] || 0) + 1;
      }
    }
  }
  return entry;
}

function addFiles(fileList){
  const incoming = Array.from(fileList);
  let newCount = 0;
  incoming.forEach(f => {
    const dup = selectedFiles.some(sf => fileKey(sf) === fileKey(f));
    if(!dup){ selectedFiles.push(f); newCount++; }
  });
  processSelectedFiles(newCount);
}

async function processSelectedFiles(newCount){
  const files = selectedFiles;
  statusEl.textContent = '';
  statusEl.className = 'status';
  uploadStatusEl.textContent = '';
  uploadStatusEl.className = 'status';

  // Hanya file yang belum ada di cache yang dibaca
  const todo = files.filter(f => !fileCache.has(fileKey(f)));

  dropzone.classList.add('loading');
  filenameEl.innerHTML = '<span class="spinner"></span>' + (todo.length
    ? ('Membaca ' + todo.length + ' file baru (total ' + files.length + ')...')
    : ('Menggabung ' + files.length + ' file...'));

  const results = await Promise.allSettled(todo.map(parseOneFile));
  const failedNow = [];
  results.forEach((r, i) => {
    if(r.status === 'fulfilled') fileCache.set(fileKey(todo[i]), r.value);
    else failedNow.push({ file: todo[i], msg: (r.reason && r.reason.message) || 'Gagal membaca' });
  });
  // File yang gagal dikeluarkan dari daftar; bisa dipilih lagi untuk dicoba ulang
  if(failedNow.length){
    const bad = new Set(failedNow.map(x => fileKey(x.file)));
    selectedFiles = selectedFiles.filter(f => !bad.has(fileKey(f)));
  }
  failedFiles = failedNow;
  const okFiles = selectedFiles;

  try{
    uploadedFileDates = okFiles.map(f => parseDateFromFilename(f.name)).filter(Boolean);
    const entries = okFiles.map(f => fileCache.get(fileKey(f)));

    if(entries.length === 0){
      rawText = '';
      mergeWarning = '';
      detectedName = 'BRD';
      updatePreviewName();
    } else {
      // Gabung: header dari file pertama saja, baris data dari semua file.
      const first = entries.find(e => e.header !== null);
      const mergedLines = [];
      let mismatchWarning = false;
      if(first){
        mergedLines.push(first.header);
        entries.forEach(e => {
          if(e.header === null) return;
          if(e.colCount !== first.colCount) mismatchWarning = true;
          for(let i=1; i<e.lines.length; i++) mergedLines.push(e.lines[i]);
        });
      }
      rawText = entries.length === 1 ? entries[0].lines.join('\n') : mergedLines.join('\n');
      mergeWarning = entries.length === 1 ? '' : (mismatchWarning
        ? 'Perhatian: jumlah kolom di beberapa file tidak sama persis. Data tetap digabung, tapi periksa hasilnya. '
        : (entries.length + ' file digabung jadi satu. '));

      // Kode DC: jumlahkan hitungan per file (tanpa mengurai ulang seluruh data)
      const counts = {};
      entries.forEach(e => Object.keys(e.codeCounts).forEach(k => { counts[k] = (counts[k] || 0) + e.codeCounts[k]; }));
      const codes = Object.keys(counts).sort((a,b) => counts[b]-counts[a]);
      detectedName = codes.length ? ('BRD' + codes[0]) : 'BRD';
      updatePreviewName();
    }

    filenameEl.innerHTML = okFiles.map(f => '✓ ' + escapeHtml(f.name)).join('<br>')
      + (failedNow.length ? (okFiles.length ? '<br>' : '') + failedNow.map(x => '✗ ' + escapeHtml(x.file.name)).join('<br>') : '');
    if(failedNow.length){
      uploadStatusEl.className = 'status err';
      uploadStatusEl.textContent = failedNow.length + ' file gagal dibaca dan tidak ikut digabung (' + failedNow.map(x => x.file.name).join(', ') + '). File lain tetap dipakai; pilih ulang file yang gagal untuk mencoba lagi.';
    }
    uploadActions.style.display = okFiles.length ? 'flex' : 'none';
    resetBtn.style.display = 'block';
  }catch(err){
    uploadStatusEl.className = 'status err';
    uploadStatusEl.textContent = 'Gagal menggabung file: ' + err.message;
    resetBtn.style.display = 'block';
  }finally{
    dropzone.classList.remove('loading');
  }
}

function detectCode(text){
  const lines = text.split(/\r\n|\n|\r/).filter(l => l.length > 0);
  if(lines.length < 2){
    detectedName = 'BRD';
    updatePreviewName();
    return;
  }
  const headers = parseCsvLine(lines[0]).map(h => h.trim().toUpperCase());
  let colIdx = headers.indexOf('TBL_DC_KODE');
  if(colIdx === -1){
    // fallback: look for any header containing DC_KODE or KODE
    colIdx = headers.findIndex(h => h.includes('DC_KODE'));
  }

  if(colIdx === -1){
    detectedName = 'BRD';
    updatePreviewName();
    return;
  }

  const codeCounts = {};
  for(let i=1; i<lines.length; i++){
    const fields = parseCsvLine(lines[i]);
    const val = (fields[colIdx] || '').trim();
    if(val) codeCounts[val] = (codeCounts[val] || 0) + 1;
  }
  const codes = Object.keys(codeCounts).sort((a,b) => codeCounts[b]-codeCounts[a]);

  detectedName = codes.length > 0 ? ('BRD' + codes[0]) : 'BRD';
  updatePreviewName();
}

function escapeHtml(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Nama file export: MSTDCI[yy].[mmm] untuk gudang G113, selain itu MSTDPO[yy].[mmm]
function getMstxhName(year, month){
  const kodeGudang = detectedName.toUpperCase().replace(/^BRD/, '');
  const prefix = kodeGudang === 'G113' ? 'MSTDCI' : 'MSTDPO';
  let name = prefix + (year || '');
  if(month) name += '.' + month;
  return name.toUpperCase();
}

function detectMstgMeta(){
  if(!rawText) return { year:'', month:'' };
  try{
    const r = buildMstgRows(rawText);
    return { year: (r && r.year) || '', month: (r && r.month) || '' };
  }catch(e){
    return { year:'', month:'' };
  }
}

function updatePreviewName(){
  previewNames.forEach(el => { el.textContent = detectedName.toUpperCase(); });
  const meta = detectMstgMeta();
  document.getElementById('mstxhName').textContent = getMstxhName(meta.year, meta.month);
}
updatePreviewName();


function normalizeDate(value){
  const s = String(value || '').trim();
  if(!s) return '';

  // yyyymmdd tanpa pemisah (mis. 20260917 pada HIS_TGL_DOC)
  let m = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if(m) return m[3] + '/' + m[2] + '/' + m[1];

  // Already dd/mm/yyyy
  m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if(m) return String(m[1]).padStart(2,'0') + '/' + String(m[2]).padStart(2,'0') + '/' + m[3];

  // yyyy-mm-dd / yyyy/mm/dd
  m = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if(m) return String(m[3]).padStart(2,'0') + '/' + String(m[2]).padStart(2,'0') + '/' + m[1];

  // Try native Date as a fallback.
  const d = new Date(s);
  if(!Number.isNaN(d.getTime())){
    return String(d.getDate()).padStart(2,'0') + '/' +
           String(d.getMonth()+1).padStart(2,'0') + '/' +
           d.getFullYear();
  }
  return s;
}

// Ambil bulan (mm) dari tanggal dokumen. Mengenali yyyymmdd (mis. 20260917)
// dan semua format yang dikenali normalizeDate.
function monthOf(value){
  const s = String(value || '').trim();
  const m = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if(m) return m[2];
  return normalizeDate(s).split('/')[1];
}

function padLokasi(value){
  const s = String(value == null ? '' : value).trim();
  if(!s) return '';
  // LOKASI format text 00: numeric values are padded to 2 digits.
  if(/^\d+$/.test(s)) return s.padStart(2,'0');
  return s;
}

function csvEscape(value){
  const s = String(value == null ? '' : value);
  return '"' + s.replace(/"/g, '""') + '"';
}

// Singkatan bulan untuk ekstensi file MSTXH (mis. MSTXHG113.JAN)
const MONTH_ABBR = {
  '01':'jan','02':'feb','03':'mar','04':'apr','05':'mei','06':'jun',
  '07':'jul','08':'agu','09':'sep','10':'okt','11':'nov','12':'des'
};

// Ambil tanggal dari nama file, format yyyymmdd di awal nama (mis. 20260917.BRD).
function parseDateFromFilename(name){
  const m = String(name || '').match(/(\d{4})(\d{2})(\d{2})/);
  if(!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3];
  if(mo < 1 || mo > 12) return null;
  if(d < 1 || d > 31) return null;
  if(y < 2000 || y > 2100) return null;
  return { y, m:mo, d };
}

// Cek apakah tanggal file-file yang diupload mencakup seluruh tanggal 1 s.d.
// akhir bulan (atau, jika bulan tersebut masih berjalan/belum lewat, minimal
// tidak ada tanggal yang bolong dari 1 s.d. tanggal terakhir yang diupload).
function computeMonthCoverage(dates){
  if(!dates || !dates.length) return null;

  const ymCounts = {};
  const daysByYm = {};
  dates.forEach(dt => {
    const key = dt.y + '-' + dt.m;
    ymCounts[key] = (ymCounts[key] || 0) + 1;
    if(!daysByYm[key]) daysByYm[key] = new Set();
    daysByYm[key].add(dt.d);
  });

  const keys = Object.keys(ymCounts);
  if(!keys.length) return null;
  const topKey = keys.sort((a,b) => ymCounts[b]-ymCounts[a])[0];
  const [yStr, mStr] = topKey.split('-');
  const y = +yStr, m = +mStr;
  const daysSet = daysByYm[topKey];

  const maxDay = Math.max(...daysSet);
  const lastDay = new Date(y, m, 0).getDate();

  // Tidak boleh ada tanggal yang bolong dari 1 s.d. tanggal terakhir yang diupload.
  for(let d=1; d<=maxDay; d++){
    if(!daysSet.has(d)) return { eligible:false, month:m, year:y };
  }

  if(maxDay === lastDay){
    return { eligible:true, month:m, year:y }; // satu bulan penuh
  }

  // Belum sampai akhir bulan -> hanya valid kalau bulan ini masih berjalan
  // (bukan bulan yang sudah lewat).
  const now = new Date();
  const isPastMonth = (y < now.getFullYear()) || (y === now.getFullYear() && m < (now.getMonth()+1));
  return { eligible: !isPastMonth, month:m, year:y };
}

// Tampilkan MSTXH & sembunyikan MSTG hanya jika nama file yang diupload
// mencakup satu bulan penuh (atau s.d. kemarin untuk bulan berjalan). Selain
// itu tampilkan MSTG.
function updateMstxhVisibility(){
  const optMstg = document.getElementById('optMstg');
  const optMstxh = document.getElementById('optMstxh');
  const chkMstg = optMstg.querySelector('input');
  const chkMstxh = optMstxh.querySelector('input');

  let coverage = null;
  try{ coverage = computeMonthCoverage(uploadedFileDates); }catch(e){ coverage = null; }
  const eligible = !!(coverage && coverage.eligible);

  optMstxh.style.display = eligible ? '' : 'none';
  optMstg.style.display = eligible ? 'none' : '';

  if(!eligible && chkMstxh.checked) chkMstxh.checked = false;
  if(eligible && chkMstg.checked) chkMstg.checked = false;

  updateBtn();
}

// ===== MSTG: ditulis sebagai file dBase III (DBF) dengan struktur yang sama seperti MSTG.DBF acuan =====
// [nama, tipe, lebar, desimal]
const MSTG_FIELDS = [
  ['RECID','C',12,0],['GUDANG','C',4,0],['LOKASI','C',2,0],['RTYPE','C',1,0],
  ['TOKO','C',4,0],['TOKO_1','C',12,0],['DOCNO','C',7,0],['TANGGAL1','D',8,0],
  ['PRDCD','C',8,0],['QTY','N',12,0],['HIS_QTY_PO','N',12,0],['GROSS','N',12,0],
  ['PPNRP','N',12,0],['INVNO','C',12,0],['INV_DATE','D',8,0],['PPNBM','N',12,10],
  ['KRM_LSG','L',1,0],['GROSS_JUAL','N',12,10],['PPN_JUAL','N',12,10],['KETER','C',45,0],
  ['DPD','N',12,0],['KANVAS','N',12,0],['NPBALOK','N',12,0]
];

function toNum(v){
  const n = parseFloat(String(v == null ? '' : v).replace(/,/g,'').trim());
  return Number.isFinite(n) ? n : 0;
}

// dd/mm/yyyy -> yyyymmdd (tipe D di DBF). Tidak valid -> kosong.
function toDbfDate(value){
  const p = normalizeDate(value).split('/');
  if(p.length === 3 && /^\d{4}$/.test(p[2])) return p[2] + p[1] + p[0];
  return '';
}

// LOKASI: angka ditulis tanpa nol di depan (1, 2, ...), sama seperti MSTG.DBF acuan.
function lokasiValue(value){
  const s = String(value == null ? '' : value).trim();
  if(/^\d+$/.test(s)) return String(parseInt(s, 10));
  return s;
}

// Angka tipe N: rata kanan, lebar tetap. Desimal dipangkas agar muat di lebar kolom.
function formatDbfNumber(v, len, dec){
  let d = dec;
  let s;
  if(d === 0){
    s = String(Math.round(v));
  } else {
    const intDigits = String(Math.trunc(Math.abs(v))).length + (v < 0 ? 1 : 0);
    d = Math.max(0, Math.min(dec, len - intDigits - 1));
    s = v.toFixed(d);
    while(s.length > len && d > 0){ d--; s = v.toFixed(d); }
  }
  if(s.length > len) throw new Error('Angka ' + s + ' melebihi lebar kolom (' + len + ')');
  return s.padStart(len, ' ');
}

function buildMstgRows(text){
  if(mstgCache.text === text && mstgCache.val) return mstgCache.val;

  const lines = text.split(/\r\n|\n|\r/).filter(l => l.length > 0);
  if(lines.length < 1) return { rows:[], selected:0, month:'', year:'' };

  const headers = parseCsvLine(lines[0]).map(h => h.trim());
  const idx = {};
  headers.forEach((h,i) => idx[h.toUpperCase()] = i);

  const required = [
    'HIS_TYPE_TRANS','TBL_DC_KODE','LOKASI','SUP_SUPKODE','HIS_NO_DOC',
    'HIS_TGL_DOC','HIS_FK_PLUID','HIS_QTY','HIS_QTY_PO','HIS_NILAI','HDR_NO_INV',
    'HDR_TGL_INV','HIS_PPNBM','BKL','HIS_NILAI_JUAL','HIS_PPN_JUAL','HDR_KETER'
  ];
  const missing = required.filter(h => idx[h] === undefined);
  if(missing.length){
    throw new Error('Kolom untuk mstg tidak ditemukan: ' + missing.join(', '));
  }

  const allowed = new Set(['BPB DC','BPB TOKO','NPB DC','NPB TOKO']);
  const monthCounts = {};
  const rows = [];
  const get = (f, name) => String(f[idx[name]] == null ? '' : f[idx[name]]).trim();

  for(let i=1; i<lines.length; i++){
    const f = parseCsvLine(lines[i]);
    const type = get(f,'HIS_TYPE_TRANS').toUpperCase();
    if(!allowed.has(type)) continue;

    const isNpb = type.startsWith('NPB');
    const krm = get(f,'BKL').toUpperCase();

    const tgl = normalizeDate(f[idx['HIS_TGL_DOC']]);
    const tglParts = tgl.split('/');
    if(tglParts.length === 3 && MONTH_ABBR[tglParts[1]]){
      const key = tglParts[2] + '-' + tglParts[1];
      monthCounts[key] = (monthCounts[key] || 0) + 1;
    }

    const toko = get(f,'SUP_SUPKODE');
    const prdcd = get(f,'HIS_FK_PLUID');
    const qty = toNum(f[idx['HIS_QTY']]);
    const qtyPo = toNum(f[idx['HIS_QTY_PO']]);
    // NPBALOK (dan DPD) = max(0, QTY - QTY PO), hanya untuk baris NPB
    const npbalok = isNpb ? Math.max(0, Math.round(qty) - Math.round(qtyPo)) : 0;

    rows.push([
      toko + prdcd,                        // RECID  = TOKO + PRDCD
      get(f,'TBL_DC_KODE'),                // GUDANG
      lokasiValue(f[idx['LOKASI']]),       // LOKASI
      isNpb ? 'K' : 'B',                   // RTYPE
      toko,                                // TOKO
      '',                                  // TOKO_1
      get(f,'HIS_NO_DOC'),                 // DOCNO
      toDbfDate(f[idx['HIS_TGL_DOC']]),    // TANGGAL1
      prdcd,                               // PRDCD
      qty,                                 // QTY
      qtyPo,                               // HIS_QTY_PO
      toNum(f[idx['HIS_NILAI']]),          // GROSS
      0,                                   // PPNRP
      get(f,'HDR_NO_INV'),                 // INVNO
      toDbfDate(f[idx['HDR_TGL_INV']]),    // INV_DATE
      toNum(f[idx['HIS_PPNBM']]),          // PPNBM
      krm === 'Y' || krm === 'TRUE',       // KRM_LSG
      toNum(f[idx['HIS_NILAI_JUAL']]),     // GROSS_JUAL
      toNum(f[idx['HIS_PPN_JUAL']]),       // PPN_JUAL
      get(f,'HDR_KETER'),                  // KETER
      npbalok,                             // DPD
      0,                                   // KANVAS
      npbalok                              // NPBALOK
    ]);
  }

  // Bulan (& tahun) file = yang paling banyak muncul di tanggal dokumen
  const topKey = Object.keys(monthCounts).sort((a,b) => monthCounts[b]-monthCounts[a])[0];
  let month = '', year = '';
  if(topKey){
    const [yyyy, mm] = topKey.split('-');
    month = MONTH_ABBR[mm] || '';
    year = yyyy.slice(-2);
  }

  const val = { rows, selected: rows.length, month, year };
  mstgCache.text = text;
  mstgCache.val = val;
  return val;
}

// Tulis array baris -> bytes dBase III (versi 0x03), 1 byte per karakter (ASCII/Latin-1).
function writeMstgDbf(rows){
  const nf = MSTG_FIELDS.length;
  const headerLen = 32 + nf * 32 + 1;
  const recLen = 1 + MSTG_FIELDS.reduce((s,f) => s + f[2], 0);
  const buf = new Uint8Array(headerLen + rows.length * recLen + 1);
  const dv = new DataView(buf.buffer);

  const now = new Date();
  buf[0] = 0x03;
  buf[1] = now.getFullYear() % 100;
  buf[2] = now.getMonth() + 1;
  buf[3] = now.getDate();
  dv.setUint32(4, rows.length, true);
  dv.setUint16(8, headerLen, true);
  dv.setUint16(10, recLen, true);

  let p = 32;
  let fieldOffset = 1; // posisi kolom di dalam record (byte 0 = penanda hapus)
  MSTG_FIELDS.forEach(([name,type,len,dec]) => {
    for(let i=0; i<name.length; i++) buf[p+i] = name.charCodeAt(i);
    buf[p+11] = type.charCodeAt(0);
    dv.setUint32(p+12, fieldOffset, true);
    fieldOffset += len;
    buf[p+16] = len;
    buf[p+17] = dec;
    p += 32;
  });
  buf[p++] = 0x0D;

  const putText = (s, len) => {
    for(let i=0; i<len; i++){
      let c = i < s.length ? s.charCodeAt(i) : 32;
      if(c > 255) c = 63; // '?'
      buf[p++] = c;
    }
  };

  rows.forEach(r => {
    buf[p++] = 0x20; // record tidak dihapus
    MSTG_FIELDS.forEach(([name,type,len,dec], k) => {
      const v = r[k];
      if(type === 'N')      putText(formatDbfNumber(v, len, dec), len);
      else if(type === 'L') putText(v ? 'Y' : 'N', 1);
      else                  putText(String(v), len); // C & D (rata kiri, sisa spasi)
    });
  });
  buf[p++] = 0x1A; // EOF
  return buf;
}

// ===== BRD -> DBF: semua kolom file BRD ditulis apa adanya sebagai field karakter (dBase III) =====
// Nama field DBF maks. 10 karakter: dipotong, huruf besar, dibuat unik jika bentrok.
function makeDbfFieldNames(headers){
  const used = new Set();
  return headers.map((h,i) => {
    let base = String(h).trim().toUpperCase().replace(/[^A-Z0-9_]/g,'_').slice(0,10) || ('F' + (i+1));
    if(/^[0-9]/.test(base)) base = ('F' + base).slice(0,10);
    let name = base, n = 1;
    while(used.has(name)){
      const suf = String(++n);
      name = base.slice(0, 10 - suf.length) + suf;
    }
    used.add(name);
    return name;
  });
}

function buildBrdDbf(text){
  const lines = text.split(/\r\n|\n|\r/).filter(l => l.length > 0);
  if(lines.length < 1) throw new Error('File BRD kosong');
  const headers = parseCsvLine(lines[0]);
  if(headers.length > 255) throw new Error('Kolom terlalu banyak untuk DBF (' + headers.length + ')');
  const names = makeDbfFieldNames(headers);
  const nf = names.length;

  const data = [];
  const widths = new Array(nf).fill(1);
  for(let i=1; i<lines.length; i++){
    const f = parseCsvLine(lines[i]);
    const row = new Array(nf);
    for(let k=0; k<nf; k++){
      const v = String(f[k] == null ? '' : f[k]).trim().slice(0,254);
      row[k] = v;
      if(v.length > widths[k]) widths[k] = v.length;
    }
    data.push(row);
  }

  const headerLen = 32 + nf * 32 + 1;
  const recLen = 1 + widths.reduce((a,b) => a + b, 0);
  if(recLen > 65535) throw new Error('Panjang record melebihi batas DBF');
  const buf = new Uint8Array(headerLen + data.length * recLen + 1);
  const dv = new DataView(buf.buffer);
  const now = new Date();
  buf[0] = 0x03;
  buf[1] = now.getFullYear() % 100;
  buf[2] = now.getMonth() + 1;
  buf[3] = now.getDate();
  dv.setUint32(4, data.length, true);
  dv.setUint16(8, headerLen, true);
  dv.setUint16(10, recLen, true);

  let p = 32, off = 1;
  names.forEach((name,k) => {
    for(let i=0; i<name.length; i++) buf[p+i] = name.charCodeAt(i);
    buf[p+11] = 0x43; // 'C'
    dv.setUint32(p+12, off, true);
    buf[p+16] = widths[k];
    off += widths[k];
    p += 32;
  });
  buf[p++] = 0x0D;

  data.forEach(row => {
    buf[p++] = 0x20;
    row.forEach((v,k) => {
      for(let i=0; i<widths[k]; i++){
        let c = i < v.length ? v.charCodeAt(i) : 32;
        if(c > 255) c = 63;
        buf[p++] = c;
      }
    });
  });
  buf[p++] = 0x1A;
  return { bytes: buf, selected: data.length };
}

function buildMstgBrd(text){
  const r = buildMstgRows(text);
  return { bytes: writeMstgDbf(r.rows), selected: r.selected, month: r.month, year: r.year };
}


// BPB.CSV / NPB.CSV: semua kolom BRD apa adanya, hanya baris dengan HIS_TYPE_TRANS berawalan BPB / NPB.
function buildTypeCsv(text, prefix){
  const lines = text.split(/\r\n|\n|\r/).filter(l => l.length > 0);
  if(lines.length < 1) return { text:'', selected:0 };
  const headers = parseCsvLine(lines[0]).map(h => h.trim().toUpperCase());
  const ti = headers.indexOf('HIS_TYPE_TRANS');
  if(ti === -1) throw new Error('Kolom HIS_TYPE_TRANS tidak ditemukan');
  const out = [lines[0]];
  for(let i=1; i<lines.length; i++){
    const type = String(parseCsvLine(lines[i])[ti] || '').trim().toUpperCase();
    if(type.startsWith(prefix)) out.push(lines[i]);
  }
  return { text: out.join('\r\n'), selected: out.length - 1 };
}

function buildAlokasiCsv(text){
  const lines = text.split(/\r\n|\n|\r/).filter(l => l.length > 0);
  if(lines.length < 1) return { text:'', selected:0 };

  const headers = parseCsvLine(lines[0]).map(h => h.trim());
  const idx = {};
  headers.forEach((h,i) => idx[h.toUpperCase()] = i);

  const required = [
    'HIS_TYPE_TRANS','HIS_TGL_DOC','SUP_SUPKODE','HIS_FK_PLUID',
    'HIS_QTY','HIS_QTY_PO','HDR_KETER'
  ];
  const missing = required.filter(h => idx[h] === undefined);
  if(missing.length){
    throw new Error('Kolom untuk alokasi.csv tidak ditemukan: ' + missing.join(', '));
  }

  const outHeaders = ['GAB','TANGGAL1','QTY_ALOK','KETER'];
  const out = [outHeaders.map(csvEscape).join(',')];
  let selected = 0;

  for(let i=1; i<lines.length; i++){
    const f = parseCsvLine(lines[i]);
    const type = String(f[idx['HIS_TYPE_TRANS']] || '').trim().toUpperCase();
    if(type !== 'NPB TOKO') continue;

    const toko = String(f[idx['SUP_SUPKODE']] || '').trim();
    const prdcd = String(f[idx['HIS_FK_PLUID']] || '').trim();
    const qtyRaw = String(f[idx['HIS_QTY']] || '').trim();
    const qtyPoRaw = String(f[idx['HIS_QTY_PO']] || '').trim();

    // QTY ALOK = max(0, QTY - QTY PO)
    const qty = Number(qtyRaw.replace(/,/g, ''));
    const qtyPo = Number(qtyPoRaw.replace(/,/g, ''));
    let qtyAlok = Math.max(
      0,
      (Number.isFinite(qty) ? qty : 0) -
      (Number.isFinite(qtyPo) ? qtyPo : 0)
    );

    const keter = String(f[idx['HDR_KETER']] || '').trim();

    // Baris dengan KETER diawali "ALOKASI WH" tidak diikutkan
    if(/^ALOKASI WH/i.test(keter)) continue;

    if(qtyAlok === 0){
      // Selisih 0: tetap dibawa jika KETER tidak kosong (QTY_ALOK diisi HIS_QTY),
      // kalau KETER kosong baris tidak diikutkan.
      if(keter === '') continue;
      qtyAlok = Number.isFinite(qty) ? qty : 0;
    }

    const row = [
      toko + prdcd,
      normalizeDate(f[idx['HIS_TGL_DOC']]),
      String(qtyAlok),
      keter
    ];

    out.push(row.map(csvEscape).join(','));
    selected++;
  }

  return { text: out.join('\n'), selected };
}

const optEls = Array.from(document.querySelectorAll('.exportOpt'));
const selectAll = document.getElementById('selectAll');

function updateBtn(){
  const n = optEls.filter(c => c.checked).length;
  processBtn.disabled = (n === 0);
  processBtn.textContent = n ? ('Ubah & Unduh ' + n + ' File') : 'Pilih file dulu';
  selectAll.checked = (n === optEls.length);
}
optEls.forEach(c => c.addEventListener('change', updateBtn));
selectAll.addEventListener('change', () => {
  optEls.forEach(c => { c.checked = selectAll.checked; });
  updateBtn();
});
updateBtn();

async function executeBrdExport(picked){
  if(!rawText){
    statusEl.className = 'status err';
    statusEl.textContent = 'Belum ada file yang dibaca.';
    return;
  }
  picked = [...new Set((Array.isArray(picked) ? picked : []).filter(k => optEls.some(c => c.value === k)))];
  if(!picked.length) {
    statusEl.className = 'status err';
    statusEl.textContent = 'Tidak ada jenis ekspor yang dipilih.';
    updateBtn();
    return;
  }

  const base = (detectedName || 'BRD').toUpperCase();
  processBtn.disabled = true;
  statusEl.className = 'status';
  statusEl.textContent = '⏳ Menyiapkan ' + picked.length + ' file ekspor...';

  try{
    const outputs = [];
    const info = [];
    const add = (content, name, mime) => outputs.push({content, name, mime});

    // MSTG.DBF dan MSTXH berisi data yang sama; cukup dihitung sekali.
    const mstg = (picked.includes('mstg') || picked.includes('mstxh')) ? buildMstgBrd(rawText) : null;

    if(picked.includes('brd')) add(buildBrdDbf(rawText).bytes, base + '.DBF', 'application/octet-stream');
    if(picked.includes('csv')) add(rawText, base + '.CSV', 'text/csv;charset=utf-8');
    if(picked.includes('mstg')) add(mstg.bytes, 'MSTG.DBF', 'application/octet-stream');
    if(picked.includes('mstxh')) add(mstg.bytes, getMstxhName(mstg.year, mstg.month), 'application/octet-stream');
    if(mstg) info.push(mstg.selected + ' baris MSTG');

    for(const k of ['bpb','npb']){
      if(!picked.includes(k)) continue;
      const result = buildTypeCsv(rawText, k.toUpperCase());
      add(result.text, k === 'npb' ? 'Detail NPB.csv' : 'BPB.csv', 'text/csv;charset=utf-8');
      info.push(k.toUpperCase() + ': ' + result.selected + ' baris');
    }
    if(picked.includes('alokasi')){
      const alokasi = buildAlokasiCsv(rawText);
      add(alokasi.text, 'NPB.csv', 'text/csv;charset=utf-8');
      info.push(alokasi.selected + ' baris alokasi');
    }

    if(!outputs.length) throw new Error('Tidak ada file yang berhasil disiapkan.');
    statusEl.textContent = '⏳ Mengunduh ' + outputs.length + ' file satu per satu...';
    // Unduh setiap hasil dengan nama dan ekstensi aslinya, bukan membungkusnya ke ZIP.
    // Jeda antar-unduhan membantu browser mobile memproses setiap tautan unduhan.
    for(let i=0; i<outputs.length; i++){
      const file = outputs[i];
      downloadBlob(file.content, file.name, file.mime);
      if(i < outputs.length - 1) await new Promise(resolve => setTimeout(resolve, 700));
    }
    statusEl.className = 'status ok';
    statusEl.textContent = '✓ Berhasil menyiapkan ' + outputs.length + ' file terpisah: ' + outputs.map(x => x.name).join(', ') + (info.length ? ' (' + info.join(', ') + ')' : '') + '.';
  }catch(err){
    statusEl.className = 'status err';
    statusEl.textContent = '✗ Gagal membuat file: ' + (err && err.message ? err.message : String(err));
    throw err;
  }finally{
    updateBtn();
  }
}

processBtn.addEventListener('click', () => {
  const checked = optEls.filter(c => c.checked).map(c => c.value);
  executeBrdExport(checked);
});

function downloadBlob(content, filename, mime){
  const blob = new Blob([content], {type: mime});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}


// Inventory integration: engine runs in the Inventory document (no iframe / postMessage).
window.convertBrdFiles = async function(incomingFiles, requestedExports, onResult){
  try {
    const incoming = Array.isArray(incomingFiles) ? incomingFiles : [];
    if (!incoming.length) throw new Error('Tidak ada file BRD yang tersedia.');
    selectedFiles = incoming.map(x => new File([String(x.text || '')], String(x.name || 'BRD.CSV'), {type:'text/csv'}));
    fileCache.clear(); failedFiles = [];
    await processSelectedFiles(selectedFiles.length);
    if (!rawText.trim()) throw new Error('File BRD kosong atau tidak memiliki data.');
    mstgCache.text=null; mstgCache.val=null;
    updatePreviewName(); updateMstxhVisibility();
    optEls.forEach(c => { c.checked=false; });
    const requested = Array.isArray(requestedExports) ? requestedExports : [];
    requested.forEach(k => {
      if(k === 'mstg_or_mstxh'){
        const target = document.getElementById('optMstxh').style.display === 'none' ? 'mstg' : 'mstxh';
        const el = optEls.find(c => c.value === target); if(el) el.checked=true;
      } else { const el=optEls.find(c=>c.value===k); if(el) el.checked=true; }
    });
    const finalExports = requested.map(k => k === 'mstg_or_mstxh' ? (document.getElementById('optMstxh').style.display === 'none' ? 'mstg' : 'mstxh') : k);
    if(!finalExports.length) throw new Error('Tidak ada jenis file ekspor yang dipilih.');
    await executeBrdExport(finalExports);
    const ok = statusEl.classList.contains('ok');
    if(typeof onResult === 'function') onResult({ok, message:statusEl.textContent});
    return {ok, message:statusEl.textContent};
  } catch(err) {
    const result={ok:false,message:err.message||String(err)};
    if(typeof onResult === 'function') onResult(result);
    return result;
  }
};

})();
