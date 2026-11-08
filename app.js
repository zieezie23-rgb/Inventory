'use strict';
const ROLES=[
 ['prod','PRODMAST — Master barang','PRODMAST'],['stm113','Stok G113 (STM)','STM'],['stm294','Stok G294 (STM)','STM'],['stm295','Stok G295 (STM)','STM'],
 ['hrgbeli','HRGBELI — Harga beli','HRGBELI'],['supmast','SUPMAST — Supplier','SUPMAST'],['hpg','HPG — MEAN / biaya','HPG'],['protect','PROTECT — Proteksi','PROTECT'],['datawhs','DATAWHS — Gudang / station','DATAWHS'],
 ['par113','PAR G113 — Penjualan','PAR'],['par294','PAR G294 — Penjualan','PAR'],['par295','PAR G295 — Penjualan','PAR'],['seas','SEAS — Seasonal (Master Stock)','SEAS'],['seasonalbook','Laporan Harian Seasonal — PO EXPIRED','SEASONALBOOK'],['itempar','ITEMPAR — Keterangan (opsional)','ITEMPAR'],['itemdepo','ITEMDEPO — Item depo','ITEMDEPO'],['itemwhk','ITEMWHK — Item WHK','ITEMWHK'],
 ['pom113','POM G113 — PO / BPB','POM'],['pom294','POM G294 — PO / BPB','POM'],['pom295','POM G295 — PO / BPB','POM'],['pou113','POU G113 — PO outstanding','POU'],['pou294','POU G294 — PO outstanding','POU'],['pou295','POU G295 — PO outstanding','POU'],['keb','KEB — KEB / toko','KEB'],['nataru','NATARU','NATARU'],['promo','PROMO','PROMO'],['history','LaporanHistoryTag — TGL_AKHIR','HISTORY'],['lppplano','LaporanLPPvsPlano — Stock Akhir','LPPVSPLANO'],['reg','REG 4 Bulan — G113','REG'],['stockout','LaporanStokOutDCINew — STOCK_OUT Y','STOCKOUT'],['stockoutbook','Stock Out DC — file terakhir (.xlsx)','STOCKOUTBOOK'],['slsupplierbook','SL Supplier — file terakhir (.xlsx)','SLSUPPLIERBOOK'],['rekapsupplierbook','Rekap Supplier — file terakhir (.xlsx)','REKAPSUPPLIERBOOK'],['lrbpbsupplier','LRBPB_SUPPLIER — transaksi BPB supplier','LRBPBSUPPLIER'],['brd','File BRD — semua file yang diunggah','BRD'],['rawplu','PLU — Raw Material','PLU'],['rawdisplay','Planogram Display — Raw Material','DISPLAY'],['rawstorage','Planogram Storage — Raw Material','STORAGE']
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
function roleGuess(file){const n=norm(file.name);const rel=norm(file.webkitRelativePath||file.relativePath||'');const wh=warehouseFromPath(file)||(rel.match(/(?:^|_)(G113|G294|G295)(?:_|$)/)||n.match(/(?:^|_)(G113|G294|G295)(?:_|$)/)||[])[1]||'';if(/\.XLSX$/i.test(file.name)&&(n.includes('REKAP_SUPPLIER')||n.includes('REKAPSUPPLIER')))return 'rekapsupplierbook';if(/\.XLSX$/i.test(file.name)&&(n.includes('SL_SUPPLIER')||n.includes('SERVICE_LEVEL_SUPPLIER')))return 'slsupplierbook';if(n.includes('LRBPB_SUPPLIER')||n.includes('LRBPBSUPPLIER'))return 'lrbpbsupplier';if(/\.BRD$/i.test(file.name))return 'brd';if(/\.XLSX$/i.test(file.name)&&n.includes('STOCK_OUT_DC')||/\.XLSX$/i.test(file.name)&&n.includes('STOCK_OUT'))return 'stockoutbook';if(/\.XLSX$/i.test(file.name)&&n.includes('STOCKOUTDC'))return 'stockoutbook';if(n.includes('LAPORANSTOKOUTDCI')||n.includes('STOCKOUTDCINEW'))return 'stockout';if(n.includes('HISTORYTAG')||n.includes('LAPORANHISTORY')||n.includes('TGL_AKHIR'))return 'history';if(n.includes('LPPVSPLANO')||n.includes('LAPORANLPP'))return 'lppplano';if(/^(?:REG|PRG)\d{4}(?:_(?:CSV|TXT|XLSX|XLS|XLSM|XLSB))?$/.test(n)||/(^|_)(REG|PRG)(_|$)/.test(n))return 'reg';if(n.includes('PRODMAST'))return 'prod';if(n.includes('STM')||n.includes('STOCK')){if(wh==='G294')return 'stm294';if(wh==='G295')return 'stm295';if(wh==='G113')return 'stm113';return 'stm113'}if(n.includes('HRGBELI'))return 'hrgbeli';if(n.includes('SUPMAST'))return 'supmast';if(n.startsWith('HPG'))return 'hpg';if(n.includes('PROTECT'))return 'protect';if(n.includes('DATAWHS'))return 'datawhs';if(n.includes('ITEMDEPO'))return 'itemdepo';if(n.includes('ITEMWHK'))return 'itemwhk';if(n.includes('ITEMPAR'))return 'itempar';if(n.includes('PAR')){if(wh==='G294')return 'par294';if(wh==='G295')return 'par295';return 'par113'}if(/\.XLSX$/i.test(file.name)&&n.includes('LAPORAN')&&n.includes('SEASONAL'))return 'seasonalbook';if(n.includes('SEAS'))return 'seas';if(n.includes('POM')){if(wh==='G294')return 'pom294';if(wh==='G295')return 'pom295';return 'pom113'}if(n.includes('POU')){if(wh==='G113')return 'pou113';if(wh==='G295')return 'pou295';return 'pou294'}if(n.includes('KEB'))return 'keb';if(n.includes('NATARU'))return 'nataru';if(n.includes('PROMO'))return 'promo';return ''}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function fileGroup(f){const n=norm(f.name);if(['stockoutbook','slsupplierbook','rekapsupplierbook','seasonalbook'].includes(f.guess)||/STOCK_OUT_DC|SERVICE_LEVEL_SUPPLIER|REKAP_SUPPLIER|LAPORAN.*SEASONAL/.test(n))return 'update';if(/LRBPB_SUPPLIER|LAPORANSTOCKOUTDCINEW|LAPORANSTOKOUTDCINEW|LAPORANHISTORYTAG/.test(n)||['lrbpbsupplier','stockout','history','lppplano','rawdisplay','rawstorage'].includes(f.guess))return 'lwa';if(/ITEM_DEPO|ITEMDEPO|ITEM_WH(K|K)|ITEMWHK|\bKEB\b|NATARU|PROMO|DATA_WHS|DATAWHS/.test(n)||['itemdepo','itemwhk','keb','nataru','promo','datawhs','rawplu','seas'].includes(f.guess))return 'bahan';const gm=n.match(/G(\d{3})/);if(gm&&gm[1]!=='113')return 'depo';return 'daily'}
const ROLE_GROUP={
 prod:'daily',stm113:'daily',hrgbeli:'daily',supmast:'daily',hpg:'daily',protect:'daily',par113:'daily',pom113:'daily',
 stm294:'daily',stm295:'daily',par294:'daily',par295:'daily',pom294:'daily',pom295:'daily',pou113:'daily',pou294:'daily',pou295:'daily',
 datawhs:'bahan',itempar:'bahan',itemdepo:'bahan',itemwhk:'bahan',keb:'bahan',nataru:'bahan',promo:'bahan',seas:'bahan',seasonalbook:'update',
 history:'lwa',lppplano:'lwa',stockout:'lwa',lrbpbsupplier:'lwa',reg:'daily',stockoutbook:'update',slsupplierbook:'update',rekapsupplierbook:'update',brd:'daily',rawplu:'bahan',rawdisplay:'lwa',rawstorage:'lwa'
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
   const countText=group==='daily'
    ? `${files.filter(f=>roles.includes(f.guess)&&(f.bytes||String(f.content||'').trim()!=='')).length}/22 file`
    : `${roles.filter(hasRole).length}/${roles.length}`;
   return `<details class="upload-group" data-upload-group="${group}"><summary class="upload-group-heading"><strong>${groupNames[group]}</strong><span class="upload-group-count">${countText}</span><i class="upload-group-toggle" aria-hidden="true">＋</i></summary><div class="upload-group-body">${body}</div></details>`;
  }).join('');
 }else{
  $('fileManageList').innerHTML=`<div class="upload-group-rows">${required.map(renderRole).join('')}</div>`||'<div class="empty-state">Tidak ada file sumber yang diperlukan.</div>';
 }
 const readyFiles=files.filter(f=>required.includes(f.guess)&&(f.bytes||String(f.content||'').trim()!=='' )).length;
 $('fileManageCount').textContent=`${readyFiles} file tersedia`;
 $('fileManageList').querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{const id=Number(b.dataset.remove);files=files.filter(f=>f.id!==id);parsed.delete(id);renderFiles()});
}

function parseLrbpbSupplier(content){
 const rows=parseCSV(content);if(!rows.length)return [];
 const headers=rows[0].map(norm);
 return rows.slice(1).map(r=>{const o={};headers.forEach((h,i)=>{if(h)o[h]=String(r[i]??'').trim()});return o})
  .filter(o=>/^\d{8}$/.test(text(value(o,'PLU')).trim()));
}
function detectRole(file,content){const rows=parseCSV(content);const header=(rows[0]||[]).map(norm);const all=header.join('|');/* POM exports can be named POMGG.CSV without the warehouse code in the filename. Identify them from their actual transaction columns first, then map the warehouse from GUDANG values. */if(['RECID','GUDANG','PRDCD','PO_DATE','BPB_DATE','BPB_QTY','NOPB'].every(h=>header.includes(h))){const whs=new Set(rows.slice(1,100).map(r=>String(r[header.indexOf('GUDANG')]||'').trim().toUpperCase()).filter(Boolean));if(whs.has('G294'))return 'pom294';if(whs.has('G295'))return 'pom295';return 'pom113'}const byName=roleGuess(file);if(byName)return byName;if(header.includes('TBL_DC_KODE')||header.some(h=>h.includes('DC_KODE')))return 'brd';if(header.includes('PLU')&&header.includes('STOCK_OUT'))return 'stockout';if(header.includes('TGL_AKHIR')||all.includes('HISTORYTAG'))return 'history';if(['PRDCD','DESC2','DIV','CAT_COD'].every(x=>header.includes(x)))return 'prod';if(header.includes('SUPCO')&&header.includes('SNAMA'))return 'supmast';if(header.includes('GUDANG')&&header.includes('PRDCD')){const vals=rows.slice(1,30).flat().map(x=>String(x).toUpperCase());if(vals.some(x=>x.includes('G294')))return 'stm294';if(vals.some(x=>x.includes('G295')))return 'stm295';if(vals.some(x=>x.includes('G113')))return 'stm113'}if(header.includes('PRDCD')&&header.includes('ACOST'))return 'hrgbeli';if(header.includes('PRDCD')&&header.includes('PTAG'))return 'prod';if(header.includes('PRDCD')&&header.includes('NOREC'))return 'par113';return ''}
function readFileWithProgress(file,onProgress){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onprogress=e=>{if(e.lengthComputable&&onProgress)onProgress(e.loaded,e.total)};reader.onerror=()=>reject(reader.error||new Error('Gagal membaca file'));reader.onload=()=>resolve(reader.result);reader.readAsArrayBuffer(file)})}
async function readInventoryTextFile(file,onProgress){
 const buffer=await readFileWithProgress(file,onProgress);
 try{return new TextDecoder('utf-8',{fatal:true}).decode(buffer)}
 catch(e){return new TextDecoder('windows-1252').decode(buffer)}
}
function renderProgressBox(boxId,label,percent,show=true){const box=$(boxId);if(!box)return;box.hidden=!show;if(!show)return;const indeterminate=percent===null||percent===undefined;const value=Math.max(0,Math.min(100,Number(percent)||0));const labelId=boxId==='homeProgress'?'homeProgressLabel':'fileUploadProgressLabel';const valueId=boxId==='homeProgress'?'homeProgressValue':'fileUploadProgressValue';const barId=boxId==='homeProgress'?'homeProgressBar':'fileUploadProgressBar';$(labelId).textContent=label;$(valueId).textContent=indeterminate?'':Math.round(value)+'%';const bar=$(barId);bar.style.width=indeterminate?'100%':value+'%';const track=bar.parentElement;track.classList.toggle('is-active',indeterminate||value<100);track.classList.toggle('is-indeterminate',indeterminate);if(!indeterminate)track.setAttribute('aria-valuenow',String(Math.round(value)));else track.removeAttribute('aria-valuenow');track.setAttribute('aria-valuetext',label)}
function updateHomeProgress(label,percent,show=true){renderProgressBox('homeProgress',label,percent,show);renderProgressBox('fileUploadProgress',label,percent,show)}
async function addFiles(list){
 const incoming=Array.from(list);if(!incoming.length)return;
 const totalBytes=incoming.reduce((n,f)=>n+(f.size||0),0)||incoming.length;let completedBytes=0,added=0,failed=[];
 setStatus(`Menyiapkan ${incoming.length} file…`,false,true);updateHomeProgress('Mengunggah dan membaca file',0,true);
 for(let index=0;index<incoming.length;index++){
  const file=incoming[index],detected=roleGuess(file);
  const isPomCsv=/POM/i.test(file.name)&&/\.csv$/i.test(file.name);
  const isSeasonalBook=/\.(xlsx|xls|xlsm|xlsb)$/i.test(file.name)&&detected==='seasonalbook';
  const isUpdateBook=/\.xlsx$/i.test(file.name)&&['stockoutbook','slsupplierbook','rekapsupplierbook'].includes(detected);
  const isCheckItemBook=/\.(xlsx|xls|xlsm|xlsb)$/i.test(file.name)&&['lppplano','reg'].includes(detected);
  const isSpreadsheet=/\.(xlsx|xls|xlsm|xlsb)$/i.test(file.name);
  const isBook=isSeasonalBook||isUpdateBook||isCheckItemBook||isSpreadsheet;
  const isBrd=/\.brd$/i.test(file.name)||detected==='brd';
  const base=totalBytes?completedBytes/totalBytes*100:index/incoming.length*100;
  const weight=totalBytes?(file.size||0)/totalBytes*100:100/incoming.length;
  const onRead=(loaded,total)=>{const part=total?loaded/total:0;updateHomeProgress(`Membaca ${index+1}/${incoming.length}: ${file.name}`,base+weight*part,true)};
  if(!isBook&&!isBrd&&!/\.(csv|txt)$/i.test(file.name)){failed.push(file.name+' (format tidak didukung)');completedBytes+=file.size||0;continue}
  const id=Date.now()+Math.floor(Math.random()*100000);
  try{
   const bytes=await readFileWithProgress(file,onRead);
   let content='';if(!isBook){try{content=new TextDecoder('utf-8',{fatal:true}).decode(bytes)}catch(e){content=new TextDecoder('windows-1252').decode(bytes)}}
   const obj={id,name:file.name,relativePath:file.webkitRelativePath||file.relativePath||file.name,size:file.size,content,bytes:isBook?bytes:null,guess:isBook?detected:(isBrd?'brd':'')};
   if(!isBook&&!isBrd)obj.guess=isPomCsv?detected:detectRole(obj,obj.content);
   // Deteksi sumber Raw Material berdasarkan struktur kolom, bukan nama file.
   if(!isBrd&&!isPomCsv&&window.InventoryRawMaterial&&(!isBook||!detected||detected==='lppplano')){
    try{if(!window.XLSX&&typeof checkItemEnsureXLSX==='function')await checkItemEnsureXLSX();const rawInfo=isBook?await window.InventoryRawMaterial.detectBuffer(obj.bytes,file.name):window.InventoryRawMaterial.detectText(obj.content,file.name);if(rawInfo&&rawInfo.role){obj.rawRole=rawInfo.role;obj.rawRows=rawInfo.rows;const roleMap={lpp:'lppplano',plu:'rawplu',display:'rawdisplay',storage:'rawstorage'};if(roleMap[rawInfo.role]&&(!obj.guess||rawInfo.role!=='lpp'||obj.guess===''))obj.guess=roleMap[rawInfo.role]}}catch(rawErr){console.warn('Deteksi Raw Material dilewati untuk '+file.name,rawErr)}
   }
   if(['stockoutbook','slsupplierbook','rekapsupplierbook','seas','seasonalbook'].includes(obj.guess))files=files.filter(f=>f.guess!==obj.guess);
   files.push(obj);parsed.set(id,null);added++;
  }catch(e){failed.push(file.name+' (gagal dibaca)');console.error('Gagal membaca '+file.name,e)}
  completedBytes+=file.size||0;updateHomeProgress(`Selesai membaca ${index+1}/${incoming.length} file`,totalBytes?(completedBytes/totalBytes*100):((index+1)/incoming.length*100),true);
 }
 UPLOAD_GROUP_KEYS.forEach(group=>collapsedUploadGroups.add(group));renderFiles();
 if(window.InventoryRawMaterial&&window.InventoryRawMaterial.refresh)window.InventoryRawMaterial.refresh();
 updateHomeProgress(failed.length?`${added} file selesai, ${failed.length} gagal`:`${added} file berhasil ditambahkan`,100,true);
 setStatus(failed.length?`Upload selesai. ${added} berhasil; ${failed.join(', ')}.`:`Upload selesai. ${added} file berhasil ditambahkan.`,failed.length>0);
 setTimeout(()=>updateHomeProgress('',0,false),4500);
}
function setStatus(s,error=false,processing=false){const e=$('status');e.textContent=s;e.className='status'+(error?' error':' ok')+(processing?' processing':'')}
const PROCESS_BUTTONS=['poExpiredBtn','masterBtn','stockOutBtn','slSupplierBtn','rekapSupplierBtn','brdBtn','checkItemBtn','rawMaterialBtn'];
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
// Raw Material hanya membutuhkan subset Master Stock. Ambil langsung dari PRODMAST dan STM G113,
// dengan filter barang dan aturan pemilihan lokasi yang sama seperti processData(), tanpa membangun 77 kolom.
function getRawMaterialMasterRows(){
 const prod=allRows('prod');if(!prod.length)throw Error('File PRODMAST belum tersedia atau tidak terbaca.');
 const stmRows=allRows('stm113');if(!stmRows.length)throw Error('File STM G113 belum tersedia atau tidak terbaca. Raw Material memerlukan sumber ALAMAT.');
 const validProd=prod.filter(p=>{const prd=key(value(p,'PRDCD'));return !!prd&&text(value(p,'PRDCD')).trim().toUpperCase()!=='PRDCD'&&!['F','T','G'].some(prefix=>text(value(p,'DIV')).trim().toUpperCase().startsWith(prefix))&&!text(value(p,'CAT_COD')).trim().startsWith('8')});
 const stm113=filterWarehouse(stmRows,'G113');
 const loc1=stmLocationMap(stm113.filter(o=>text(value(o,'LOKASI')).padStart(2,'0')==='01'));
 return validProd.map(p=>{const prd=key(value(p,'PRDCD')),st=loc1.get(prd)||{};const alamat=['LT','RAK','BAR','CELL'].map(f=>text(value(st,f))).join('-').replace(/^-+|-+$/,'');return {PRDCD:prd,DESC2:value(p,'DESC2','DESC'),ALAMAT:alamat,FRAC:value(p,'FRAC')}});
}
function getRawMaterialMasterCount(){return allRows('prod').length&&allRows('stm113').length?allRows('prod').length:0}
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
 const prodRows=allRows('prod'),stmRows=allRows('stm113'),pomRows=allRows('pom113');
 if(!prodRows.length||!stmRows.length)throw Error('File PRODMAST dan STM G113 harus tersedia agar daftar PLU mengikuti MASTER STOCK.');
 if(!pomRows.length)throw Error('File POM G113 belum tersedia. Unggah file POM G113 yang sama seperti MASTER STOCK.');
 // SL Supplier hanya membutuhkan subset MASTER STOCK. Hindari processData() penuh yang juga membangun data G294/G295, KEB, histori, promo, dan kolom lain yang tidak dipakai.
 updateHomeProgress('SL SUPPLIER: membaca PRODMAST dan STM G113…',8,true);await new Promise(r=>setTimeout(r,0));
 const isHeader=p=>text(value(p,'PRDCD')).trim().toUpperCase()==='PRDCD';
 const validProd=prodRows.filter(p=>{const prd=key(value(p,'PRDCD'));return !!prd&&!isHeader(p)&&!['F','T','G'].some(prefix=>text(value(p,'DIV')).trim().toUpperCase().startsWith(prefix))&&!text(value(p,'CAT_COD')).trim().startsWith('8')});
 const stm113=filterWarehouse(stmRows,'G113');const loc113=stmLocationMap(stm113.filter(o=>text(value(o,'LOKASI')).padStart(2,'0')==='01'));
 const hr=firstMap(allRows('hrgbeli')),sup=firstMap(allRows('supmast'),'SUPCO');
 const wanted=[];for(let i=0;i<validProd.length;i++){const p=validProd[i],prd=key(value(p,'PRDCD'));const st=loc113.get(prd)||{};const h=hr.get(prd)||{};const supplierCode=value(h,'SUPCO')||value(p,'SUPCO');const sp=sup.get(key(supplierCode))||{};const r=Array(19).fill('');r[0]=prd;r[1]=value(p,'DESC2','DESC');r[9]=supplierCode;r[10]=value(sp,'SNAMA');r[11]=value(h,'BARU');r[12]=value(p,'DIV');r[15]=num(value(p,'FRAC'));r[16]=num(value(p,'ACOST'));r[18]=num(value(st,'MAX','QTY_MAX'));wanted.push(r);if(i&&i%5000===0){updateHomeProgress(`SL SUPPLIER: menyusun daftar barang ${i.toLocaleString('id-ID')}/${validProd.length.toLocaleString('id-ID')}`,8+Math.min(27,i/validProd.length*27),true);await new Promise(r=>setTimeout(r,0))}}
 updateHomeProgress(`SL SUPPLIER: daftar ${wanted.length.toLocaleString('id-ID')} barang siap; membaca POM G113…`,38,true);await new Promise(r=>setTimeout(r,0));
 // Hitung H-1 secara langsung dari POM G113, memakai rentang dan kriteria yang sama seperti sebelumnya.
 const processDay=new Date(processDate);processDay.setHours(0,0,0,0);const rangeStart=new Date(processDay);rangeStart.setDate(rangeStart.getDate()-14);const slByPrd=new Map();
 for(let i=0;i<pomRows.length;i++){const o=pomRows[i];const folderWh=text(value(o,'__WAREHOUSE')).toUpperCase();const g=text(value(o,'GUDANG','WARE_HOUSE')).toUpperCase();if(folderWh?folderWh!=='G113':!!g&&g!=='G113')continue;const prd=key(value(o,'PRDCD','PLU'));if(!prd)continue;const rec=text(value(o,'RECID')).toUpperCase();if(rec==='1')continue;const poDate=dateVal(value(o,'PO_DATE'));if(!poDate||poDate<rangeStart||poDate>=processDay)continue;const cur=slByPrd.get(prd)||{po:0,bpb:0,rows:0};cur.po+=num(value(o,'QTY'));cur.bpb+=num(value(o,'BPB_QTY'));cur.rows++;slByPrd.set(prd,cur);if(i&&i%10000===0){updateHomeProgress(`SL SUPPLIER: menghitung PO/BPB ${i.toLocaleString('id-ID')}/${pomRows.length.toLocaleString('id-ID')}`,38+Math.min(27,i/pomRows.length*27),true);await new Promise(r=>setTimeout(r,0))}}
 updateHomeProgress('SL SUPPLIER: memperbarui workbook Excel…',68,true);await new Promise(r=>setTimeout(r,0));
 const day=new Date(processDate);day.setHours(0,0,0,0);day.setDate(day.getDate()-1);
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
  const slData=slByPrd.get(prd);const sl=slData&&slData.po>0?round(slData.bpb/slData.po,4):'NO PO';if(sl==='NO PO')noPo++;row=setXmlCell(row,`${dayRef}${rn}`,sl,templateStyles[dayRef]);updates.push(row);if(i&&i%250===0){updateHomeProgress(`SL SUPPLIER: menulis baris Excel ${i.toLocaleString('id-ID')}/${wanted.length.toLocaleString('id-ID')}`,68+Math.min(27,i/wanted.length*27),true);await new Promise(r=>setTimeout(r,0))}
 }
 const headerRows=oldRows.filter(m=>+m[1]<4).map(m=>m[0]);const sheetData=headerRows.concat(updates).join('');xml=xml.replace(/<sheetData>[\s\S]*?<\/sheetData>/,`<sheetData>${sheetData}</sheetData>`);xml=xml.replace(/<dimension\b[^>]*ref="[^"]+"[^>]*\/?\s*>/,`<dimension ref="A1:AN${wanted.length+3}"/>`);zip.file(path,xml);
 updateHomeProgress('SL SUPPLIER: mengompres workbook…',97,true);const blob=await zip.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',compression:'DEFLATE',compressionOptions:{level:3}});updateHomeProgress('SL SUPPLIER selesai — menyiapkan unduhan',100,true);return {blob,items:wanted.length,noPo,filename:`SL Supplier ke DC ${monthNames[day.getMonth()].toLowerCase()} ${day.getFullYear()}.xlsx`,sheetName,day:day.getDate()};
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
 poExpiredBtn:['prod','pom113','seas','seasonalbook'],
 masterBtn:['prod','stm113','stm294','stm295','hrgbeli','supmast','hpg','protect','datawhs','par113','par294','par295','seas','itemdepo','itemwhk','pom113','pom294','pom295','pou113','pou294','pou295','keb','nataru','promo','history','stockout'],
 stockOutBtn:['stockout','stockoutbook'],
 slSupplierBtn:['prod','stm113','pom113','slsupplierbook'],
 rekapSupplierBtn:['lrbpbsupplier','rekapsupplierbook'],
 brdBtn:['brd'],
 checkItemBtn:['prod','pom113','history','lppplano','reg']
};
const PROCESS_TITLES={poExpiredBtn:'PO EXPIRED',masterBtn:'MASTER STOCK',stockOutBtn:'STOCK OUT',slSupplierBtn:'SL SUPPLIER',rekapSupplierBtn:'BPB SUPPLIER',brdBtn:'BRD',checkItemBtn:'CHECK ITEM'};
const processActions={masterBtn:runMasterStock,stockOutBtn:runStockOut,slSupplierBtn:runSlSupplier,rekapSupplierBtn:runRekapSupplier,brdBtn:runBrd};
function openFileManager(action='allFiles'){$('fileManageDialog').dataset.action=action;renderFiles();$('fileManageDialog').showModal()}
$('openFileManagerButton').addEventListener('click',()=>openFileManager('allFiles'));
function hasRole(role){return files.some(f=>f.guess===role&&(f.bytes||String(f.content||'').trim()!==''));}
function missingFor(buttonId){return (PROCESS_CHECKS[buttonId]||[]).filter(role=>!hasRole(role)&&!(role==='itempar'));}
function showPreflight(buttonId,missing){$('preflightTitle').textContent=`${PROCESS_TITLES[buttonId]} — file belum lengkap`;$('preflightIntro').textContent='Beberapa file sumber belum tersedia. Kamu bisa melengkapi file terlebih dahulu atau tetap melanjutkan proses dengan data yang ada.';$('preflightMissing').innerHTML=missing.map(role=>{const item=ROLES.find(r=>r[0]===role);return `<div class="brd-option missing-option"><span class="missing-mark">!</span><span>${escapeHtml(item?item[1]:role)} belum ada</span></div>`}).join('');$('preflightDialog').dataset.action=buttonId;$('preflightDialog').showModal();}
function requestProcess(buttonId){if($(buttonId).disabled)return;const missing=missingFor(buttonId);if(missing.length){showPreflight(buttonId,missing);return}processActions[buttonId]();}

// PO EXPIRED hanya membentuk subset data yang benar-benar dipakai modulnya.
// Tidak menjalankan processData() / membangun 77 kolom Master Stock.
function buildPoExpiredMasterRows(processDate=new Date()){
 const prod=firstMap(allRows('prod'));
 if(!prod.size)throw Error('File PRODMAST belum tersedia atau tidak terbaca.');
 const hr=firstMap(allRows('hrgbeli'));
 const sup=firstMap(allRows('supmast'),'SUPCO');
 const hpg=firstMap(allRows('hpg'));
 const par=firstMap(allRows('par113'));
 const seas=firstMap(allRows('seas'));
 const protectSet=new Set(allRows('protect').map(o=>key(value(o,'PLU','PRDCD'))).filter(Boolean));
 const kebQty=sumBy(allRows('keb'),'KEB_QTY');
 const stmRows=filterWarehouse(allRows('stm113'),'G113');
 const loc1=stmLocationMap(stmRows.filter(o=>text(value(o,'LOKASI')).padStart(2,'0')==='01'));
 const pomRows=filterWarehouse(allRows('pom113'),'G113');
 const day=new Date(processDate);day.setHours(0,0,0,0);
 const rangeStart=new Date(day);rangeStart.setDate(rangeStart.getDate()-14);
 const poSum=new Map();
 for(const o of pomRows){
  const rec=text(value(o,'RECID')).toUpperCase(),poDate=dateVal(value(o,'PO_DATE'));
  if(rec==='1'||!poDate||poDate<rangeStart||poDate>=day)continue;
  const k=key(value(o,'PRDCD'));if(!k)continue;
  const cur=poSum.get(k)||{po:0};cur.po+=num(value(o,'QTY'));poSum.set(k,cur);
 }
 const rows=[H1];
 for(const [k,p] of prod){
  if(!k||text(value(p,'PRDCD')).trim().toUpperCase()==='PRDCD')continue;
  if(['F','T','G'].some(prefix=>text(value(p,'DIV')).trim().toUpperCase().startsWith(prefix))||text(value(p,'CAT_COD')).trim().startsWith('8'))continue;
  const h=hr.get(k)||{},supco=text(value(h,'SUPCO')||value(p,'SUPCO'));
  const sp=sup.get(key(supco))||{},hp=hpg.get(k)||{},pg=par.get(k)||{},st=loc1.get(k)||{},seaRow=seas.get(k)||{};
  const jenis=value(seaRow,'JENIS');
  const r=Array(77).fill('');
  r[0]=k;r[1]=value(p,'DESC2','DESC');r[9]=supco;r[10]=value(sp,'SNAMA');
  r[11]=value(h,'BARU');r[15]=num(value(p,'FRAC'));r[18]=num(value(st,'MAX','QTY_MAX'));
  r[20]=value(p,'PTAG')===''?0:value(p,'PTAG');r[24]=num(value(pg,'QTYAVG','SLSAVG'));
  r[28]=num(value(hp,'MEAN'));r[37]=num(value(st,'QTY'));r[44]=poSum.get(k)?.po||0;
  r[52]=kebQty.get(k)||0;r[58]=['TERKAIT','BASIC'].includes(jenis)?jenis:'0';
  r[59]=r[58]==='0'?'0':value(seaRow,'RINCIAN')||'0';
  r[63]=protectSet.has(k)?'PROTECT HO':'NON PROTECT HO';r[65]=value(sp,'LEAD');
  rows.push(r);
 }
 if(rows.length===1)throw Error('Tidak ada item PRODMAST yang memenuhi filter untuk PO EXPIRED.');
 return rows;
}
function buildPoExpiredPayload(){
 const masterRows=buildPoExpiredMasterRows(new Date());
 const pomFile=files.find(f=>f.guess==='pom113'&&(!warehouseFromPath(f)||warehouseFromPath(f)==='G113'));
 const pomText=pomFile?pomFile.content:'';
 const stockRows=[['PRDCD','KL'],...getSource('stockout').filter(o=>text(value(o,'STOCK_OUT','STOCKOUT')).toUpperCase()==='Y').map(o=>[value(o,'PLU','PRDCD'),1])];
 const promoRows=[['PLU','DESC','QTY','JENIS','TGL1','TGL2','TGL3','TGL4'],...getSource('promo').map(o=>[value(o,'PRDCD','PLU'),value(o,'DESC','DESC2'),value(o,'QTY','QTY_TGT'),value(o,'JNS_PRO','JENIS_PRO'),value(o,'TGL_AWAL'),value(o,'TGL_AKH','TGL_AKHIR'),'','']).filter(r=>r[0]&&r.slice(4,8).some(v=>text(v)!==''))];
 const seasonalFile=files.find(f=>f.guess==='seasonalbook'&&f.bytes);
 return {masterRows,pomText,stockOutRows:stockRows,promoRows,seasonalBytes:seasonalFile?seasonalFile.bytes:null,seasonalName:seasonalFile?seasonalFile.name:''};
}
async function openPoExpired(){
 if(!beginProcess('poExpiredBtn'))return;
 const panel=$('poExpiredApp'),dialog=$('poExpiredDialog');
 // Persiapan dilakukan di halaman utama. Popup tetap tertutup sampai seluruh data
 // termasuk laporan Seasonal selesai diparsing oleh modul PO EXPIRED.
 updateHomeProgress('Menyiapkan data PO EXPIRED…',5,true);
 try {
  await new Promise(r=>requestAnimationFrame(()=>setTimeout(r,35)));
  updateHomeProgress('Membaca sumber data PO EXPIRED…',20,true);
  await new Promise(r=>requestAnimationFrame(()=>setTimeout(r,35)));
  const payload=buildPoExpiredPayload();
  updateHomeProgress('Memuat dan membaca laporan Seasonal…',65,true);
  await new Promise(r=>requestAnimationFrame(r));
  const ready=new Promise((resolve,reject)=>{
   let timer=setTimeout(()=>{window.removeEventListener('inventory-po-payload-ready',onReady);reject(new Error('Waktu persiapan data PO EXPIRED habis.'))},120000);
   function onReady(e){clearTimeout(timer);window.removeEventListener('inventory-po-payload-ready',onReady);const d=e.detail||{};if(d.ok)resolve();else reject(new Error(d.error||'Data PO EXPIRED gagal disiapkan.'))}
   window.addEventListener('inventory-po-payload-ready',onReady);
  });
  window.dispatchEvent(new CustomEvent('inventory-po-payload',{detail:payload}));
  await ready;
  updateHomeProgress('Data PO EXPIRED siap — membuka pemeriksaan…',100,true);
  await new Promise(r=>requestAnimationFrame(()=>setTimeout(r,120)));
  panel.classList.add('po-open');dialog.setAttribute('aria-hidden','false');
  setTimeout(()=>updateHomeProgress('',0,false),1800);
 } catch(e){
  setStatus('PO EXPIRED gagal disiapkan: '+(e.message||e),true);
  updateHomeProgress('Persiapan PO EXPIRED gagal',100,true);
  setTimeout(()=>updateHomeProgress('',0,false),4000);
 } finally{endProcess()}
}
window.openPoExpired=openPoExpired;
window.addEventListener('inventory-po-progress',e=>{const d=e.detail||{};updateHomeProgress(d.label||'Memproses PO EXPIRED…',d.percent||0,d.show!==false);if(d.done)setTimeout(()=>updateHomeProgress('',0,false),1800)});
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
      downloadBrdBlob(file.content, file.name, file.mime);
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

function downloadBrdBlob(content, filename, mime){
  // BRD exports use their own downloader so they cannot shadow Inventory's XLSX Blob downloader.
  // Add one UTF-8 BOM to CSV files for reliable character detection in spreadsheet applications.
  const isCsv = String(mime || '').toLowerCase().startsWith('text/csv');
  const payload = isCsv && typeof content === 'string' && !content.startsWith('\uFEFF')
    ? '\uFEFF' + content
    : content;
  const blob = content instanceof Blob ? content : new Blob([payload], {type: mime || 'application/octet-stream'});
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


;(()=>{
const $=id=>document.getElementById(id);

/* ============================================================
   SHARED HELPERS (identik di kedua aplikasi asal)
   ============================================================ */
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function norm(v){return String(v??'').replace(/^\uFEFF/,'').trim()}
function num(v){let n=Number(v);return Number.isFinite(n)?n:0}
function ext(n){return String(n||'').toLowerCase().split('.').pop()}
function sleep(){return new Promise(r=>setTimeout(r,0))}
function isSpreadsheet(n){return ['xlsx','xls','xlsm','xlsb'].includes(ext(n))}
function detectDelimiter(text){const lines=text.split(/\r?\n/).filter(x=>x.trim()).slice(0,5);const candidates=[',',';','\t','|'];let best=',',score=-1;for(const d of candidates){let n=0;for(const line of lines){let q=false,c=0;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"')q=!q;else if(ch===d&&!q)c++;}n+=c;}if(n>score){score=n;best=d}}return best}
function hmap(h){const m={};h.forEach((v,i)=>{if(v)m[v]=i});return m}
function headRow(rows,i){return (rows[i]||[]).map(x=>norm(x).toUpperCase())}
function unpipe(rows){const sample=rows.slice(0,10).filter(r=>(r||[]).some(x=>norm(x)!==''));const hit=sample.filter(r=>typeof r[0]==='string'&&r[0].includes('|')&&r.slice(1).every(x=>norm(x)==='')).length;if(!sample.length||hit<Math.ceil(sample.length/2))return rows;return rows.map(r=>String((r||[])[0]??'').split('|').map(x=>x.trim()))}
function parseDate(v){if(v instanceof Date&&!isNaN(v))return new Date(v.getFullYear(),v.getMonth(),v.getDate());if(typeof v==='number'&&v>0&&v<600000){const d=XLSX.SSF.parse_date_code(v);if(d)return new Date(d.y,d.m-1,d.d)}const s=norm(v);if(!s)return null;let m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(m)return new Date(+m[3],+m[1]-1,+m[2]);return null}
function sameDate(a,b){return a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()}
function daysBetween(a,b){return Math.round((b-a)/86400000)}
function fmtDate(d){return d?d.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'2-digit'}):''}
function today0(){const t=new Date();t.setHours(0,0,0,0);return t}

/* ============================================================
   BAGIAN "BB" — logic app "Check Barang Baru" (dipertahankan)
   ============================================================ */
const bb_resultCols=['PRDCD','DESC2','ZONA','ALAMAT','FRAC','ACOST','PTAG','TGL AKTIF','TGL Open TAG','X BPB','FIRST BPB','Tgl Kedatangan Terakhir','QTY BPB','STOCK','DSI','JTD','OVER','PKM 0','Est Kebutuhan','Hari','KET1','KET2'];
const bb_colKey={'PRDCD':'PRDCD','DESC2':'DESC2','ZONA':'ZONA','ALAMAT':'ALAMAT','FRAC':'FRAC','ACOST':'ACOST','PTAG':'PTAG','TGL AKTIF':'TGL_AKTIF','TGL Open TAG':'TGL_OPEN_TAG','X BPB':'X_BPB','FIRST BPB':'FIRST_BPB','Tgl Kedatangan Terakhir':'LAST_BPB','QTY BPB':'QTY_BPB','STOCK':'STOCK','DSI':'DSI','JTD':'JTD','OVER':'OVER','PKM 0':'PKM0','Est Kebutuhan':'EST','Hari':'HARI','KET1':'KET1','KET2':'KET2'};
const bb_numCols=new Set(['FRAC','ACOST','X BPB','QTY BPB','STOCK','DSI','JTD','OVER','PKM 0','Est Kebutuhan']);
const bb_dateCols=new Set(['TGL AKTIF','TGL Open TAG','FIRST BPB','Tgl Kedatangan Terakhir']);
const bb_ket2Names=['Belum Ada JTD Toko','Belum ada NPB ke Toko','PKM Toko 0 (Nol)','Over Stock di Toko','Stock Exist masih >50% BPB terakhir'];
const bb_kindLabel={PRODMAST:'PRODMAST',POMGG:'POMGG',HISTAG:'HISTAG',STOCK:'Stock Akhir',MASTER:'Master'};
const bbState={prodmast:null,pomgg:null,master:null,stock:null,histag:null,kandidat:[],rows:[],tgl:''};

function bb_parseCSVText(text,delim){const rows=[];let row=[],field='',inQ=false,i=0,n=text.length;while(i<n){const c=text[i];if(inQ){if(c==='"'){if(text[i+1]==='"'){field+='"';i+=2;continue}else{inQ=false;i++;continue}}field+=c;i++;continue}if(c==='"'&&field===''){inQ=true;i++;continue}if(c===delim){row.push(field);field='';i++;continue}if(c==='\r'){i++;continue}if(c==='\n'){row.push(field);rows.push(row);row=[];field='';i++;continue}field+=c;i++}if(field!==''||row.length){row.push(field);rows.push(row)}return rows}
async function bb_readAny(file){const ab=await file.arrayBuffer(),u=new Uint8Array(ab);if(isSpreadsheet(file.name)||(u[0]===80&&u[1]===75)){const wb=XLSX.read(ab,{type:'array',cellDates:true,raw:true});const ws=wb.Sheets[wb.SheetNames[0]];return ws?XLSX.utils.sheet_to_json(ws,{header:1,defval:'',raw:true,blankrows:false}):[]}let text=new TextDecoder('utf-8').decode(ab);if(text.charCodeAt(0)===0xFEFF)text=text.slice(1);const delim=detectDelimiter(text);return bb_parseCSVText(text,delim)}

function bb_detectKind(rows){for(let i=0;i<Math.min(rows.length,15);i++){const h=headRow(rows,i);if(!h.length)continue;if(h.includes('BPB_DATE')&&h.includes('BPB_QTY'))return 'POMGG';if(h.includes('PTAG_OLD')&&h.includes('PTAG_NEW'))return 'HISTAG';if(h.includes('BRG_AKTIF')&&h.includes('PRDCD'))return 'PRODMAST';if((h.includes('PLU')||h.includes('PLUKODE'))&&(h.includes('QTY_LPP')||h.includes('QTY_AKHIR')))return 'STOCK'}return null}
function bb_parseMaster(rows){let h3=-1,h4=-1;for(let i=0;i<10;i++){const r=headRow(rows,i);if(r.includes('PRDCD')&&r.includes('DESC2'))h3=i;if(r.includes('ST')&&r.includes('ZONA'))h4=i}if(h3<0)return null;const a=hmap(headRow(rows,h3)),b=h4>=0?hmap(headRow(rows,h4)):{};const map={...a};for(const k of ['ST','ZONA','LT','RAK','BAR','CELL'])if(b[k]!==undefined)map[k]=b[k];if(map.LT===undefined)return null;const start=Math.max(h3,h4)+2,out=new Map();for(let i=start;i<rows.length;i++){const r=rows[i]||[],id=norm(r[map.PRDCD]);if(!id||norm(r[map.LT])==='')continue;if(!out.has(id))out.set(id,{row:r,map})}return out}
function bb_parseStock(rows){const IDK=['PLU','PLUKODE'],QK=['QTY_LPP','QTY_AKHIR'];let row=-1,headers=headRow(rows,0);for(let i=0;i<Math.min(rows.length,10);i++){const h=headRow(rows,i);if(IDK.some(k=>h.includes(k))&&QK.some(k=>h.includes(k))){row=i;headers=h;break}}const idCol=IDK.map(k=>headers.indexOf(k)).find(x=>x>=0),qCol=QK.map(k=>headers.indexOf(k)).find(x=>x>=0);if(row<0||idCol===undefined||qCol===undefined)throw Error('Stock Akhir: kolom PLU / QTY_LPP tidak ditemukan.');const out=new Map();for(let i=row+1;i<rows.length;i++){const r=rows[i]||[],id=norm(r[idCol]);if(id)out.set(id,num(r[qCol]))}return out}
function bb_parseProdmast(rows){const h=hmap(headRow(rows,0));for(const k of ['PRDCD','DESC2','CAT_COD','BRG_AKTIF','TGL_TAMBAH'])if(h[k]===undefined)throw Error('PRODMAST: kolom '+k+' tidak ditemukan.');const out=[];for(let i=1;i<rows.length;i++){const r=rows[i]||[],id=norm(r[h.PRDCD]);if(!id)continue;out.push({PRDCD:id,DESC2:norm(r[h.DESC2]),CAT_COD:norm(r[h.CAT_COD]),BRG_AKTIF:norm(r[h.BRG_AKTIF]),TGL_TAMBAH:r[h.TGL_TAMBAH]})}return out}
function bb_parsePomgg(rows){const h=hmap(headRow(rows,0));for(const k of ['PRDCD','BPB_DATE','BPB_QTY'])if(h[k]===undefined)throw Error('POMGG: kolom '+k+' tidak ditemukan.');const idx=new Map();for(let i=1;i<rows.length;i++){const r=rows[i]||[],id=norm(r[h.PRDCD]);if(!id)continue;const date=parseDate(r[h.BPB_DATE]);if(!date)continue;const qty=num(r[h.BPB_QTY]);const nopb=h.NOPB!==undefined?norm(r[h.NOPB]):'';if(!idx.has(id))idx.set(id,[]);idx.get(id).push({date,qty,nopb})}return idx}
function bb_parseHistag(rows){const h=hmap(headRow(rows,0));for(const k of ['PLU','PTAG_OLD','PTAG_NEW','TGL_AKHIR'])if(h[k]===undefined)throw Error('HISTAG: kolom '+k+' tidak ditemukan.');const byId=new Map();for(let i=1;i<rows.length;i++){const r=rows[i]||[],id=norm(r[h.PLU]);if(!id)continue;const tglAkhir=parseDate(r[h.TGL_AKHIR]),po=norm(r[h.PTAG_OLD]),pn=norm(r[h.PTAG_NEW]).toUpperCase();if(!byId.has(id))byId.set(id,[]);byId.get(id).push({tglAkhir,po,pn})}const out=new Map();for(const [id,list] of byId){const withDate=list.filter(x=>x.tglAkhir);const best=withDate.length?withDate.reduce((a,b)=>b.tglAkhir>a.tglAkhir?b:a):list[list.length-1];const ket=(best.po!==''&&['E','D','S','L',''].includes(best.pn))?'Item Open Tag':'';out.set(id,{ket,tglAkhir:best.tglAkhir})}return out}

// Catatan penggabungan: file yang tidak dikenali BB (mis. REG/PRG milik ITB) DILEWATI, bukan error —
// karena sekarang satu bucket upload dipakai bersama oleh kedua aplikasi.
async function bb_parseBahan(files){
  const out={prodmast:null,pomgg:null,master:null,stock:null,histag:null};
  for(const f of files){
    let rows;try{rows=await bb_readAny(f)}catch(e){continue}
    let kind=bb_detectKind(rows);
    if(!kind){const m=bb_parseMaster(rows);if(m){out.master=m;continue}}
    if(kind==='POMGG')out.pomgg=bb_parsePomgg(rows);
    else if(kind==='HISTAG')out.histag=bb_parseHistag(rows);
    else if(kind==='PRODMAST')out.prodmast=bb_parseProdmast(rows);
    else if(kind==='STOCK')out.stock=bb_parseStock(rows);
    else{const m=bb_parseMaster(rows);if(m)out.master=m}
  }
  const missing=['prodmast','pomgg','master','stock','histag'].filter(k=>!out[k]);
  if(missing.length)throw Error('BAHAN belum lengkap, kurang: '+missing.join(', ').toUpperCase());
  return out;
}

function bb_findHeader(rows,required,maxScan=15){const req=required.map(x=>x.toUpperCase());for(let i=0;i<Math.min(rows.length,maxScan);i++){const h=headRow(rows,i);if(req.every(k=>h.includes(k)))return {row:i,headers:h}}return {row:-1,headers:[]}}
function bb_parseSsft(rows){rows=unpipe(rows);const h=bb_findHeader(rows,['PRDCD','STOCK','PKM','MINOR']);if(h.row<0)throw Error('SS-FT: kolom PRDCD/STOCK/PKM/MINOR tidak ditemukan. Header terbaca: '+headRow(rows,0).filter(Boolean).slice(0,14).join(', '));const m=hmap(h.headers),stats=new Map();for(let i=h.row+1;i<rows.length;i++){const r=rows[i]||[],id=norm(r[m.PRDCD]);if(!id)continue;const stock=num(r[m.STOCK]),pkm=num(r[m.PKM]),minor=num(r[m.MINOR]);let ket2='';if(pkm===0)ket2='PKM Toko 0';else if(stock+minor>pkm)ket2='Over Stock Toko';const est=minor>0?Math.max(0,Math.floor((pkm-stock)/minor)*minor):Math.max(0,pkm-stock);if(!stats.has(id))stats.set(id,{jtd:0,over:0,pkm0:0,est:0});const x=stats.get(id);x.jtd++;if(ket2==='Over Stock Toko')x.over++;if(ket2==='PKM Toko 0')x.pkm0++;x.est+=est}return stats}

function bb_mget(mrow,key){return mrow&&mrow.map[key]!==undefined?mrow.row[mrow.map[key]]:''}
function bb_classifyItem(pm,pomggIdx,stockMap,histagMap,tdy){const catcod=norm(pm.CAT_COD);const dnd=catcod===''?'':(catcod.charAt(0)==='4'?'NON DRY':'DRY');if(dnd==='NON DRY')return null;const brgAktif=norm(pm.BRG_AKTIF).toUpperCase()==='Y';const tglTambah=parseDate(pm.TGL_TAMBAH);const hariAktif=(brgAktif&&tglTambah)?daysBetween(tglTambah,tdy):null;let CI;if(hariAktif!==null&&hariAktif<90){CI='Barang Baru'}else{const h=histagMap.get(pm.PRDCD);CI=(h&&h.ket)?h.ket:''}if(CI==='')return null;const bpbAll=pomggIdx.get(pm.PRDCD)||[];const bpbPos=bpbAll.filter(x=>x.qty>0);const CJ=bpbPos.length;let CK=null,CL=0;if(CJ===1){CK=bpbAll.reduce((mx,x)=>(!mx||x.date>mx)?x.date:mx,null)}else if(CJ>1){const noNopb=bpbAll.filter(x=>x.nopb==='');CK=noNopb.reduce((mx,x)=>(!mx||x.date>mx)?x.date:mx,null)}if(CK)CL=bpbAll.filter(x=>sameDate(x.date,CK)).reduce((s,x)=>s+x.qty,0);const CM=stockMap.has(pm.PRDCD)?stockMap.get(pm.PRDCD):'';const CN=(CL>0&&CM!=='')?(CM/CL):null;let CO='';if(CJ===1&&CN!==null&&CN>=0.999995)CO='Belum pernah NPB ke toko';else if(CJ===1&&CN!==null&&CN>0.5&&CN<1)CO=`Sisa Stock Masih ada ${(CN*100).toFixed(2)}%`;else if(CK&&sameDate(CK,tdy))CO=`${CI}Datang Hari Ini`;if(CO==='')return null;const firstBpb=bpbAll.length?bpbAll.reduce((mn,x)=>(!mn||x.date<mn)?x.date:mn,null):null;return {CI,CJ,CK,CL,CM,CO,CN,tglTambah,firstBpb}}
function bb_ket2Class(ss,cn){if(cn!==null&&cn!==undefined&&cn>=0.999995)return 'Belum ada NPB ke Toko';if(ss.jtd===0)return 'Belum Ada JTD Toko';if(ss.pkm0===ss.jtd)return 'PKM Toko 0 (Nol)';if(ss.over===ss.jtd)return 'Over Stock di Toko';return 'Stock Exist masih >50% BPB terakhir'}
function bb_buildRekap(bahan,ssftStats){const tdy=today0(),masterById=bahan.master,histagMap=bahan.histag,pomggIdx=bahan.pomgg,stockMap=bahan.stock;const out=new Map();for(const pm of bahan.prodmast){if(out.has(pm.PRDCD))continue;const cls=bb_classifyItem(pm,pomggIdx,stockMap,histagMap,tdy);if(!cls)continue;const master=masterById.get(pm.PRDCD),histag=histagMap.get(pm.PRDCD);const ss=ssftStats.get(pm.PRDCD)||{jtd:0,over:0,pkm0:0,est:0};const daysSinceLast=cls.CK?daysBetween(cls.CK,tdy):null;let dsi=0;if(daysSinceLast&&cls.CL!==''&&cls.CM!==''){const soldQty=cls.CL-cls.CM;if(soldQty!==0){const rate=soldQty/daysSinceLast;if(rate)dsi=cls.CM/rate}}if(!isFinite(dsi)||isNaN(dsi))dsi=0;out.set(pm.PRDCD,{PRDCD:pm.PRDCD,DESC2:pm.DESC2,ZONA:master?norm(bb_mget(master,'ZONA')):'',ALAMAT:master?norm(bb_mget(master,'ALAMAT')):'',FRAC:master?num(bb_mget(master,'FRAC')):'',ACOST:master?num(bb_mget(master,'ACOST')):'',PTAG:master?norm(bb_mget(master,'PTAG')):'',TGL_AKTIF:cls.tglTambah,TGL_OPEN_TAG:histag?histag.tglAkhir:null,X_BPB:cls.CJ,FIRST_BPB:cls.firstBpb,LAST_BPB:cls.CK,QTY_BPB:cls.CL,STOCK:cls.CM,DSI:dsi,JTD:ss.jtd,OVER:ss.over,PKM0:ss.pkm0,EST:ss.est,HARI:daysSinceLast!==null?`${daysSinceLast} Hari`:'',KET1:cls.CO,KET2:bb_ket2Class(ss,cls.CN),PERSEN:(cls.CN!==null&&cls.CN!==undefined)?cls.CN:-1})}return [...out.values()].sort((a,b)=>b.PERSEN-a.PERSEN||String(a.PRDCD).localeCompare(String(b.PRDCD),'en',{numeric:true}))}
function bb_computeCandidates(bahan){const kandidat=bahan.prodmast.filter(pm=>bb_classifyItem(pm,bahan.pomgg,bahan.stock,bahan.histag,today0()));return [...new Set(kandidat.map(x=>x.PRDCD))]}

function bb_fmt(c,v){if(v===''||v===null||v===undefined)return '';if(bb_dateCols.has(c))return fmtDate(v);if(bb_numCols.has(c))return num(v).toLocaleString('id-ID',{maximumFractionDigits:2});return v}
function bb_render(arr){const th=$('bb_resultTable').querySelector('thead'),tb=$('bb_resultTable').querySelector('tbody');th.innerHTML='<tr>'+bb_resultCols.map(c=>`<th>${esc(c)}</th>`).join('')+'</tr>';tb.innerHTML=arr.map(r=>'<tr>'+bb_resultCols.map(c=>{const v=r[bb_colKey[c]];return `<td class="${typeof v==='number'?'num':''}">${esc(bb_fmt(c,v))}</td>`}).join('')+'</tr>').join('');$('bb_summary').textContent=`${arr.length.toLocaleString('id-ID')} item`}
function bb_renderKesimpulan(){const rows=bbState.rows;if(!rows.length){$('bb_kesimpulan').textContent='Tidak ada item.';return}const tgl=new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});bbState.tgl=tgl;const cnt=n=>rows.filter(r=>r.KET2===n).length;const lines=[`*Monitoring Stock Item Barang Baru dan Open TAG*`,tgl,''];const jtd0=cnt('Belum Ada JTD Toko');if(jtd0>0){lines.push('Belum Pernah Ada NPB ke TOKO :',`- ${jtd0} Item Belum Ada JTD Toko`,'')}const belumNpb=cnt('Belum ada NPB ke Toko'),stockExist=cnt('Stock Exist masih >50% BPB terakhir'),pkm0=cnt('PKM Toko 0 (Nol)');if(belumNpb>0||stockExist>0||pkm0>0){lines.push('Stock Sisa di DC');if(belumNpb>0)lines.push(`- ${belumNpb} Item Belum ada NPB ke Toko`);if(stockExist>0)lines.push(`- ${stockExist} Item Stock Exist masih >50% BPB terakhir`);if(pkm0>0)lines.push(`- ${pkm0} Item PKM Toko 0 (Nol)`);lines.push('')}const over=cnt('Over Stock di Toko');if(over>0){lines.push('Over Stock di Toko',`- ${over} Item Over Stock di Toko`,'')}while(lines.length&&lines[lines.length-1]==='')lines.pop();$('bb_kesimpulan').textContent=lines.join('\n')}
function bb_exportXlsx(){const wb=XLSX.utils.book_new();const data=bbState.rows.map(r=>{const o={};bb_resultCols.forEach(c=>{const v=r[bb_colKey[c]];o[c]=bb_dateCols.has(c)?fmtDate(v):v});return o});XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(data),'REKAP');const d=bb_ket2Names.map(n=>({KET2:n,ITEM:bbState.rows.filter(r=>r.KET2===n).length}));XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(d),'Rincian');XLSX.writeFile(wb,`Monitoring Stock Item Barang Baru dan Open TAG ${bbState.tgl}.xlsx`)}
function bb_exportJpg(){const rows=bbState.rows;if(!rows.length)return;const FF='Calibri, Carlito, "Segoe UI", Roboto, Arial, sans-serif',FONT='13px '+FF,BOLD='bold 13px '+FF,TFONT='22px '+FF,RH=19,PAD=5,TH=38,S=1.5,title=`Monitoring Stock Item Barang Baru dan Open TAG ${bbState.tgl}`;const text=rows.map(r=>bb_resultCols.map(c=>{const v=r[bb_colKey[c]];const s=bb_dateCols.has(c)?fmtDate(v):bb_fmt(c,v);return String(s??'')}));const m=document.createElement('canvas').getContext('2d');const widths=bb_resultCols.map((c,j)=>{m.font=BOLD;let w=m.measureText(c).width;m.font=FONT;for(const t of text)w=Math.max(w,m.measureText(t[j]).width);w=Math.ceil(w)+PAD*2;return c==='DESC2'?Math.min(w,360):w});const W=widths.reduce((a,b)=>a+b,0)+3;const per=Math.max(20,Math.floor((Math.floor(14e6/(W*S*S))-TH-RH-6)/RH)),pages=Math.ceil(rows.length/per);for(let pg=0;pg<pages;pg++){const a=pg*per,b=Math.min(rows.length,a+per),H=TH+RH*(b-a+1)+3,cv=document.createElement('canvas');cv.width=Math.ceil(W*S);cv.height=Math.ceil(H*S);const g=cv.getContext('2d');g.scale(S,S);g.fillStyle='#fff';g.fillRect(0,0,W,H);g.textBaseline='middle';g.strokeStyle='#000';g.lineWidth=1;g.fillStyle='#000';g.font=TFONT;g.textAlign='left';g.fillText(title,2,TH/2);const cell=(x,y,w,t,o={})=>{if(o.bg){g.fillStyle=o.bg;g.fillRect(x+1,y+1,w-1,RH-1)}g.strokeRect(x+1.5,y+.5,w,RH);g.fillStyle=o.fg||'#000';g.font=o.bold?BOLD:FONT;g.save();g.beginPath();g.rect(x+2,y+1,w-2,RH-1);g.clip();if(o.al==='r'){g.textAlign='right';g.fillText(t,x+w-PAD+1,y+RH/2+1)}else if(o.al==='c'){g.textAlign='center';g.fillText(t,x+1+w/2,y+RH/2+1)}else{g.textAlign='left';g.fillText(t,x+PAD,y+RH/2+1)}g.restore()};let y=TH,x=0;bb_resultCols.forEach((c,j)=>{cell(x,y,widths[j],c,{bold:true,al:'c',bg:'#2563eb',fg:'#fff'});x+=widths[j]});for(let i=a;i<b;i++){y+=RH;x=0;bb_resultCols.forEach((c,j)=>{const t=text[i][j],right=bb_numCols.has(c);cell(x,y,widths[j],t,{al:right?'r':'l'});x+=widths[j]})}const name=`Monitoring Stock Item Barang Baru dan Open TAG ${bbState.tgl}${pages>1?` (${pg+1})`:''}.jpg`;setTimeout(()=>cv.toBlob(bl=>{const u=URL.createObjectURL(bl),el=document.createElement('a');el.href=u;el.download=name;document.body.appendChild(el);el.click();el.remove();setTimeout(()=>URL.revokeObjectURL(u),5000)},'image/jpeg',.92),pg*500)}}
async function bb_identifyBahanFile(f){try{const rows=await bb_readAny(f);let kind=bb_detectKind(rows);if(!kind&&bb_parseMaster(rows))kind='MASTER';return kind}catch(e){return null}}

/* ============================================================
   BAGIAN "ITB" — logic app "Check Item Tidak Bergerak" (dipertahankan)
   ============================================================ */
const itb_resultCols=['PRDCD','DESC2','ZONA','ALAMAT','DIV','FRAC','ACOST','MINOR','PTAG','QTY','CTN','RUPIAH','SPD','DSI','KEB','KET ZONA','JTD','Over','PKM 0','Hari','KETERANGAN','KET'];
const itb_categoryNames=['Non Dry','Item WHK','Over Stock di toko','PKM Toko 0 (Nol)','Stock kurang dari Minor','Tidak ada JTD Toko','Tidak ada Kebutuhan (PBRO)','Check Fisik WH'];
const itbState={master:null,stock:null,regIndex:null,kandidat:[],rows:[],filtered:[],tgl:''};

function itb_toWb(ab,file){const u=new Uint8Array(ab);if(isSpreadsheet(file.name)||(u[0]===80&&u[1]===75))return XLSX.read(ab,{type:'array',cellDates:true,raw:true});let text=new TextDecoder('utf-8').decode(ab);if(text.charCodeAt(0)===0xFEFF)text=text.slice(1);const delim=detectDelimiter(text);return XLSX.read(text,{type:'string',raw:true,cellDates:true,FS:delim,codepage:65001})}
async function itb_readAny(file){return itb_toWb(await file.arrayBuffer(),file)}
function itb_sheetRows(wb,name){const ws=wb.Sheets[name]||wb.Sheets[wb.SheetNames[0]];return ws?XLSX.utils.sheet_to_json(ws,{header:1,defval:'',raw:true,blankrows:false}):[]}
function itb_findHeader(rows,required,maxScan=15){const req=required.map(x=>x.toUpperCase());for(let i=0;i<Math.min(rows.length,maxScan);i++){const h=headRow(rows,i);if(req.every(k=>h.includes(k)))return {row:i,headers:h}}return {row:0,headers:headRow(rows,0)}}
function itb_parseMaster(rows){let h3=-1,h4=-1;for(let i=0;i<10;i++){const r=headRow(rows,i);if(r.includes('PRDCD')&&r.includes('DESC2'))h3=i;if(r.includes('ST')&&r.includes('ZONA'))h4=i}if(h3<0)throw Error('Master: header PRDCD/DESC2 tidak ditemukan.');const a=hmap(headRow(rows,h3)),b=h4>=0?hmap(headRow(rows,h4)):{};const map={...a};for(const k of ['ST','ZONA','LT','RAK','BAR','CELL'])if(b[k]!==undefined)map[k]=b[k];const data=[];if(map.LT===undefined)throw Error('Master: kolom LT tidak ditemukan.');const start=Math.max(h3,h4)+2;for(let i=start;i<rows.length;i++){const r=rows[i]||[],id=norm(r[map.PRDCD]);if(!id||norm(r[map.LT])==='')continue;data.push({id,row:r,map})}return data}
function itb_parseStock(rows){const IDK=['PLUKODE','PLU'],QK=['QTY_AKHIR','QTY_LPP'];let row=-1,headers=headRow(rows,0);for(let i=0;i<Math.min(rows.length,10);i++){const h=headRow(rows,i);if(IDK.some(k=>h.includes(k))&&QK.some(k=>h.includes(k))){row=i;headers=h;break}}const idCol=IDK.map(k=>headers.indexOf(k)).find(x=>x>=0),qCol=QK.map(k=>headers.indexOf(k)).find(x=>x>=0);if(row<0||idCol===undefined||qCol===undefined)throw Error(`Stock Akhir: kolom kode item / qty tidak ditemukan. Header terbaca: ${headers.filter(Boolean).slice(0,12).join(', ')}`);const out=new Map();for(let i=row+1;i<rows.length;i++){const r=rows[i]||[],id=norm(r[idCol]);if(id)out.set(id,num(r[qCol]))}return out}
function itb_parseRegRows(rows){const out=[];const starts=[];for(let c=0;c<rows[0]?.length;c++)if(norm(rows[0][c]).toUpperCase()==='PRDCD')starts.push(c);if(starts.length>1){for(const start of starts){const trnh=start+97;if(trnh>=rows[0].length||norm(rows[0][trnh]).toUpperCase()!=='TRNH')continue;out.push({rows,start,trnh})}return out}const h=itb_findHeader(rows,['PRDCD','TRNH'],12),m=hmap(h.headers);if(m.PRDCD===undefined||m.TRNH===undefined){const found=(h.headers||[]).filter(Boolean).slice(0,12).join(', ');throw Error('REG/PRG: PRDCD dan TRNH tidak ditemukan. Format CSV tidak terbaca. Header: '+found)}return [{rows,start:m.PRDCD,trnh:m.TRNH,map:m,row0:h.row}]}
function itb_monthKey(v){if(v instanceof Date&&!isNaN(v))return `${v.getFullYear()}-${String(v.getMonth()+1).padStart(2,'0')}`;let s=norm(v);if(/^\d{4}$/.test(s)){return `20${s.slice(0,2)}-${s.slice(2)}`}let m=s.match(/(20\d{2})[-\/]?(\d{1,2})/);if(m)return `${m[1]}-${String(m[2]).padStart(2,'0')}`;m=s.match(/(\d{1,2})[-\/]?(20\d{2})/);if(m)return `${m[2]}-${String(m[1]).padStart(2,'0')}`;return s}
function itb_buildRegIndex(regBlocks){const idx=new Map();for(const b of regBlocks){const rows=b.rows;const start=b.start;const trnh=b.trnh;const first=Math.max(1,b.row0?b.row0+1:1);for(let r=first;r<rows.length;r++){const id=norm(rows[r]?.[start]);const mo=itb_monthKey(rows[r]?.[trnh]);if(!id||!mo)continue;if(!idx.has(id))idx.set(id,new Map());idx.get(id).set(mo,{row:rows[r],start})}}return idx}
function itb_stockVal(rec,d){if(!rec)return 0;const c=rec.start+3+(d.getDate()-1)*3;return num(rec.row[c])}
function itb_dateSeries(){const now=new Date();const end=new Date(now.getFullYear(),now.getMonth(),now.getDate()-1);const a=[];for(let i=99;i>=0;i--){const d=new Date(end);d.setDate(end.getDate()-i);a.push(d)}return a}
function itb_daily(id,idx,dates){const mm=idx.get(id);return dates.map(d=>itb_stockVal(mm?.get(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`),d))}
function itb_maxRun(v){const n=v.length,out=Array(n).fill(0);out[n-1]=v[n-1]!==0?1:0;for(let i=n-2;i>=0;i--)out[i]=(out[i+1]===0||v[i]!==v[i+1])?0:out[i+1]+1;return Math.max(...out)}
function itb_ssStats(rows){rows=unpipe(rows);const h=itb_findHeader(rows,['PRDCD'],10),m=hmap(h.headers),s=new Map();if(m.PRDCD===undefined)throw Error('SS-FT: header PRDCD tidak ditemukan. Header terbaca: '+h.headers.filter(Boolean).slice(0,12).join(', '));for(let i=h.row+1;i<rows.length;i++){const r=rows[i]||[],id=norm(r[m.PRDCD]);if(!id)continue;if(!s.has(id))s.set(id,{jtd:0,over:0,pkm0:0});const x=s.get(id);x.jtd++;let ket=m.KET!==undefined?norm(r[m.KET]):'';if(!ket){const st=num(r[m.STOCK]),pk=num(r[m.PKM]),mi=num(r[m.MINOR]);ket=pk===0?'PKM 0':(st+mi>pk?'Over':'Kurang')}if(ket==='Over')x.over++;if(ket==='PKM 0')x.pkm0++}return s}
function itb_calc(item,stockRec,regIndex,ss,dates){const r=item.row,m=item.map,id=item.id,get=k=>r[m[k]];const whk=norm(r[76]).toUpperCase()==='Y';const desc=norm(get('DESC2')),zona=get('ZONA'),div=norm(get('DIV')),frac=num(get('FRAC')),acost=num(get('ACOST')),minor=num(get('MINOR')),ptag=norm(get('PTAG')),avg=num(get('AVG')),dsi=num(get('DSISTK')),keb=num(get('KEB'));const vals=itb_daily(id,regIndex,dates),qty=vals[99]||0,stockFinal=stockRec===undefined?'':num(stockRec);const hari=itb_maxRun(vals);let keterangan='';if(!['N','R','F'].includes(ptag)&&qty!==0&&hari>=5&&qty!==stockFinal){} else if(!['N','R','F'].includes(ptag)&&qty!==0&&hari>=5&&qty===stockFinal){if(hari>=90)keterangan='Tdk Bergerak >3 Bulan';else if(hari>=60)keterangan='Tdk Bergerak >2 Bulan';else if(hari>30)keterangan='Tdk Bergerak >1 Bulan';else keterangan=`Tdk Bergerak ${hari} Hari`}
if(!keterangan)return null;const st=ss.get(id)||{jtd:0,over:0,pkm0:0};let ket;if((num(zona)===0)&&div==='4')ket='Non Dry';else if(whk)ket='Item WHK';else if(st.jtd===0)ket='Tidak ada JTD Toko';else if(st.pkm0>st.jtd*.5)ket='PKM Toko 0 (Nol)';else if(st.over>st.jtd*.5)ket='Over Stock di toko';else if(qty<minor)ket='Stock kurang dari Minor';else if(num(zona)!==0&&keb<10)ket='Tidak ada Kebutuhan (PBRO)';else ket='Check Fisik WH';const ctn=frac?qty/frac:0;return {PRDCD:id,DESC2:desc,ZONA:zona,ALAMAT:norm(get('ALAMAT')),DIV:div,FRAC:frac,ACOST:acost,MINOR:minor,PTAG:ptag,QTY:qty,CTN:ctn,RUPIAH:acost*qty,SPD:avg,DSI:dsi,KEB:keb,'KET ZONA':num(zona)===0?0:(['14','15'].includes(norm(zona))?'Bulky':'Bulky Fraction'),JTD:st.jtd,Over:st.over,'PKM 0':st.pkm0,Hari:hari,KETERANGAN:keterangan,KET:ket}}
function itb_sheetType(name){const n=String(name).toLowerCase().replace(/[^a-z0-9]/g,'');if(n.startsWith('master'))return 'master';if(n.startsWith('stock'))return 'stock';if(/^(reg|prg)/.test(n))return 'reg';return null}
function itb_contentType(rows){const scan=rows.slice(0,12).map(r=>(r||[]).map(x=>norm(x).toUpperCase()));const has=(...k)=>scan.some(r=>k.every(x=>r.includes(x)));if(has('PLUKODE','QTY_AKHIR')||has('PLU','QTY_LPP'))return 'stock';if(has('PRDCD','TRNH'))return 'reg';if(has('PRDCD','DESC2'))return 'master';return null}
function itb_sortRows(a){const kr=Object.fromEntries(itb_categoryNames.map((n,i)=>[n,i])),ag=k=>String(k).includes('>3 Bulan')?0:String(k).includes('>2 Bulan')?1:String(k).includes('>1 Bulan')?2:3;return a.sort((x,y)=>(kr[x.KET]??99)-(kr[y.KET]??99)||ag(x.KETERANGAN)-ag(y.KETERANGAN)||y.Hari-x.Hari||String(x.PRDCD).localeCompare(String(y.PRDCD),'en',{numeric:true}))}

// Catatan penggabungan: file PRODMAST (milik BB) memiliki kolom PRDCD & DESC2 sehingga bisa salah
// terdeteksi sebagai "Master" oleh pengenal berbasis konten milik ITB. Penjaga di bawah ini
// mencegah itu: jika file yang sama sudah dikenali BB sebagai PRODMAST/POMGG/HISTAG, file itu
// tidak akan dianggap Master/Stock/REG oleh ITB.
async function itb_parseBahanOnly(files){
  if(!files.length)throw Error('BAHAN wajib diupload (Master, REG 4 bulan, dan Stock Akhir).');
  const found={master:[],stock:[],reg:[]},seen=[];
  for(let i=0;i<files.length;i++){
    const f=files[i],wb=await itb_readAny(f);
    seen.push(`${f.name} [${wb.SheetNames.join(', ')}]`);
    for(const n of wb.SheetNames){
      let t=itb_sheetType(n),rows=null;
      if(!t&&wb.SheetNames.length===1){
        rows=itb_sheetRows(wb,n);
        t=itb_contentType(rows);
        if(t==='master'){const bbk=bb_detectKind(rows);if(bbk==='PRODMAST'||bbk==='POMGG'||bbk==='HISTAG')t=null}
      }
      if(!t)continue;
      found[t].push({src:f.name+(wb.SheetNames.length>1?' / '+n:''),rows:rows||itb_sheetRows(wb,n)});
    }
  }
  const one=(k,label)=>{const a=found[k];if(!a.length)throw Error(`BAHAN: ${label} tidak ditemukan. File terbaca: ${seen.join('; ')}`);if(a.length>1)throw Error(`BAHAN: ${label} terdeteksi lebih dari satu (${a.map(x=>x.src).join(', ')}).`);return a[0].rows};
  const master=itb_parseMaster(one('master','Master'));
  const stock=itb_parseStock(one('stock','Stock Akhir'));
  let blocks=[];for(const r of found.reg)blocks.push(...itb_parseRegRows(r.rows));
  if(blocks.length<4)throw Error(`REG/PRG terdeteksi ${blocks.length} blok. Diperlukan 4 bulan.`);
  return {master,stock,regIndex:itb_buildRegIndex(blocks)};
}
function itb_computeResult(bahan,ss){const dates=itb_dateSeries();const arr=[];for(let i=0;i<bahan.master.length;i++){const x=itb_calc(bahan.master[i],bahan.stock.get(bahan.master[i].id),bahan.regIndex,ss,dates);if(x)arr.push(x)}itb_sortRows(arr);return arr}
function itb_computeCandidates(bahan){const arr=itb_computeResult(bahan,new Map());return [...new Set(arr.filter(r=>r.KETERANGAN).map(r=>r.PRDCD))]}

function itb_fmt(c,v){if(v===''||v==null)return '';if(['ACOST','RUPIAH','SPD','DSI'].includes(c))return num(v).toLocaleString('id-ID',{maximumFractionDigits:2});if(['QTY','CTN','FRAC','MINOR','JTD','Over','PKM 0','Hari'].includes(c))return num(v).toLocaleString('id-ID',{maximumFractionDigits:4});return v}
function itb_render(arr){itbState.filtered=arr;const th=$('itb_resultTable').querySelector('thead'),tb=$('itb_resultTable').querySelector('tbody');th.innerHTML='<tr>'+itb_resultCols.map(c=>`<th>${esc(c)}</th>`).join('')+'</tr>';tb.innerHTML=arr.map(r=>'<tr>'+itb_resultCols.map(c=>`<td class="${typeof r[c]==='number'?'num':''}">${esc(itb_fmt(c,r[c]))}</td>`).join('')+'</tr>').join('');$('itb_summary').textContent=`${arr.length.toLocaleString('id-ID')} item • RUPIAH ${arr.reduce((s,r)=>s+num(r.RUPIAH),0).toLocaleString('id-ID')}`}
function itb_renderKesimpulan(){const rows=itbState.rows;if(!rows.length){$('itb_kesimpulan').textContent='Tidak ada item.';return}const nf=v=>Math.round(v).toLocaleString('en-US');const list=itb_categoryNames.map(n=>{const a=rows.filter(r=>r.KET===n);return {n,c:a.length,rp:Math.round(a.reduce((t,r)=>t+num(r.RUPIAH),0))}}).filter(x=>x.c>0).sort((a,b)=>b.c-a.c);const tgl=new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});itbState.tgl=tgl;const totC=list.reduce((t,x)=>t+x.c,0),totRp=list.reduce((t,x)=>t+x.rp,0);$('itb_kesimpulan').textContent=[`*Checking Item tidak bergerak ${tgl}*`,'','Item  KET | RP',...list.map(x=>`${x.c} Item ${x.n} | Rp ${nf(x.rp)} ,-`),'=================================',`Total | ${totC} Item | Rp ${nf(totRp)} ,-`].join('\n')}
function itb_exportXlsx(){const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(itbState.rows),'Hasil');const d=itb_categoryNames.map(n=>{const a=itbState.rows.filter(r=>r.KET===n);return {KET:n,ITEM:a.length,RUPIAH:a.reduce((s,r)=>s+num(r.RUPIAH),0)}});XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(d),'Rincian');XLSX.writeFile(wb,`Checking Item tidak bergerak ${itbState.tgl}.xlsx`)}
const itb_JPG_COLS=itb_resultCols;
const itb_JPG_NUM=new Set(['FRAC','ACOST','MINOR','QTY','CTN','RUPIAH','SPD','DSI','KEB','JTD','Over','PKM 0','Hari']);
function itb_jpgText(c,v){if(itb_JPG_NUM.has(c)){const n=num(v);return n===0?'-':Math.round(n).toLocaleString('en-US')}if(c==='ZONA')return(v===0||norm(v)===''||norm(v)==='0')?'':norm(v);if(c==='KET ZONA')return v===0?'-':norm(v);return norm(v)}
function itb_pctl(a,p){const k=(a.length-1)*p,f=Math.floor(k),c=Math.ceil(k);return a[f]+(a[c]-a[f])*(k-f)}
function itb_scaleColor(v,lo,mid,hi){const A=[99,190,123],B=[255,235,132],C=[248,105,107];let f,g,t;if(v<=mid){f=A;g=B;t=mid===lo?1:(v-lo)/(mid-lo)}else{f=B;g=C;t=hi===mid?0:(v-mid)/(hi-mid)}return `rgb(${f.map((x,i)=>Math.round(x+(g[i]-x)*t)).join(',')})`}
function itb_exportJpg(){const rows=itbState.rows;if(!rows.length)return;
const FF='Calibri, Carlito, "Segoe UI", Roboto, Arial, sans-serif',FONT='13px '+FF,BOLD='bold 13px '+FF,TFONT='22px '+FF,RH=19,PAD=5,TH=38,S=1.5,title=`Checking Item tidak bergerak ${itbState.tgl}`;
const text=rows.map(r=>itb_JPG_COLS.map(c=>itb_jpgText(c,r[c]))),m=document.createElement('canvas').getContext('2d');
const widths=itb_JPG_COLS.map((c,j)=>{m.font=BOLD;let w=m.measureText(c).width;m.font=FONT;for(const t of text)w=Math.max(w,m.measureText(t[j]).width);w=Math.ceil(w)+PAD*2;return c==='DESC2'?Math.min(w,360):w});
const W=widths.reduce((a,b)=>a+b,0)+3,rp=rows.map(r=>num(r.RUPIAH)).sort((a,b)=>a-b),lo=rp[0],hi=rp[rp.length-1],mid=itb_pctl(rp,.5);
const per=Math.max(20,Math.floor((Math.floor(14e6/(W*S*S))-TH-RH-6)/RH)),pages=Math.ceil(rows.length/per);
for(let pg=0;pg<pages;pg++){const a=pg*per,b=Math.min(rows.length,a+per),H=TH+RH*(b-a+1)+3,cv=document.createElement('canvas');cv.width=Math.ceil(W*S);cv.height=Math.ceil(H*S);const g=cv.getContext('2d');g.scale(S,S);g.fillStyle='#fff';g.fillRect(0,0,W,H);g.textBaseline='middle';g.strokeStyle='#000';g.lineWidth=1;
g.fillStyle='#000';g.font=TFONT;g.textAlign='left';g.fillText(title,2,TH/2);
const cell=(x,y,w,t,o={})=>{if(o.bg){g.fillStyle=o.bg;g.fillRect(x+1,y+1,w-1,RH-1)}g.strokeRect(x+1.5,y+.5,w,RH);g.fillStyle=o.fg||'#000';g.font=o.bold?BOLD:FONT;g.save();g.beginPath();g.rect(x+2,y+1,w-2,RH-1);g.clip();if(o.al==='r'){g.textAlign='right';g.fillText(t,x+w-PAD+1,y+RH/2+1)}else if(o.al==='c'){g.textAlign='center';g.fillText(t,x+1+w/2,y+RH/2+1)}else{g.textAlign='left';g.fillText(t,x+PAD,y+RH/2+1)}g.restore()};
let y=TH,x=0;itb_JPG_COLS.forEach((c,j)=>{cell(x,y,widths[j],c,{bold:true,al:'c',bg:'#2563eb',fg:'#fff'});x+=widths[j]});
for(let i=a;i<b;i++){y+=RH;x=0;itb_JPG_COLS.forEach((c,j)=>{const t=text[i][j],right=itb_JPG_NUM.has(c)||t==='-';cell(x,y,widths[j],t,{al:right?'r':'l',bg:c==='RUPIAH'?itb_scaleColor(num(rows[i].RUPIAH),lo,mid,hi):null});x+=widths[j]})}
const name=`Checking Item tidak bergerak ${itbState.tgl}${pages>1?` (${pg+1})`:''}.jpg`;
setTimeout(()=>cv.toBlob(bl=>{const u=URL.createObjectURL(bl),el=document.createElement('a');el.href=u;el.download=name;document.body.appendChild(el);el.click();el.remove();setTimeout(()=>URL.revokeObjectURL(u),5000)},'image/jpeg',.92),pg*500)}}
async function itb_identifyKindsInFile(f){try{const wb=await itb_readAny(f);const kinds=new Set();for(const n of wb.SheetNames){let t=itb_sheetType(n);if(!t&&wb.SheetNames.length===1){const rows=itb_sheetRows(wb,n);t=itb_contentType(rows);if(t==='master'){const bbk=bb_detectKind(rows);if(bbk==='PRODMAST'||bbk==='POMGG'||bbk==='HISTAG')t=null}}if(t)kinds.add(t)}return kinds}catch(e){return new Set()}}


/* CHECK ITEM — terintegrasi langsung pada Inventory; tidak memakai iframe/aplikasi kedua. */
let checkItemXlsxPromise=null;
async function checkItemEnsureXLSX(){
 if(window.XLSX)return window.XLSX;
 if(checkItemXlsxPromise)return checkItemXlsxPromise;
 const urls=['https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js','https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'];
 checkItemXlsxPromise=new Promise((resolve,reject)=>{let i=0;const next=()=>{if(i>=urls.length){checkItemXlsxPromise=null;reject(new Error('Pustaka Excel gagal dimuat. Hubungkan internet lalu coba lagi.'));return}const sc=document.createElement('script');sc.src=urls[i++];sc.crossOrigin='anonymous';sc.onload=()=>window.XLSX?resolve(window.XLSX):next();sc.onerror=()=>{sc.remove();next()};document.head.appendChild(sc)};next()});
 return checkItemXlsxPromise;
}
// Expose the shared loader explicitly for isolated modules such as History.
window.checkItemEnsureXLSX=checkItemEnsureXLSX;
function checkItemVirtualFile(f){
 const content=f.content!=null?f.content:'';
 const bytes=f.bytes?f.bytes:content;
 const mime=/\.(xlsx|xls|xlsm|xlsb)$/i.test(f.name)?'application/octet-stream':'text/plain';
 return new File([bytes],f.name,{type:mime});
}
async function checkItemRows(f){
 const virtual=checkItemVirtualFile(f);
 return await bb_readAny(virtual);
}
let combinedPrdcd=[];
function downloadPrdcd(){const b=new Blob([combinedPrdcd.join('\n')+'\n'],{type:'text/plain'}),u=URL.createObjectURL(b),x=document.createElement('a');x.href=u;x.download='PRDCD_SS-FT.txt';document.body.appendChild(x);x.click();x.remove();setTimeout(()=>URL.revokeObjectURL(u),3000)}
function checkItemMasterRows(){
 const result=processData(new Date());
 if(!result.rows||!result.rows.length)throw new Error('Hasil perhitungan Master Stock Inventory kosong.');
 return result.rows;
}
async function checkItemBuildFirstStep(){
 updateHomeProgress('CHECK ITEM: memuat pustaka Excel…',null,true);await new Promise(r=>setTimeout(r,0));
 await checkItemEnsureXLSX();
 const prodFile=files.find(f=>f.guess==='prod'&&f.content);
 const pomFile=files.find(f=>f.guess==='pom113'&&f.content);
 const histFile=files.find(f=>f.guess==='history'&&f.content);
 const stockFile=files.find(f=>f.guess==='lppplano'&&(f.content||f.bytes));
 const regFiles=files.filter(f=>f.guess==='reg'&&(f.content||f.bytes));
 const missing=[];if(!prodFile)missing.push('PRODMAST');if(!pomFile)missing.push('POM G113');if(!histFile)missing.push('LaporanHistoryTag');if(!stockFile)missing.push('LaporanLPPvsPlano');if(regFiles.length<4)missing.push(`REG 4 bulan (tersedia ${regFiles.length})`);
 if(missing.length)throw new Error('File belum lengkap: '+missing.join(', ')+'. Lengkapi melalui Daftar File & Upload.');
 updateHomeProgress('CHECK ITEM: membaca PRODMAST, POM, History Tag, dan LPP…',null,true);await new Promise(r=>setTimeout(r,0));
 const [prodRows,pomRows,histRows,stockRows]=await Promise.all([checkItemRows(prodFile),checkItemRows(pomFile),checkItemRows(histFile),checkItemRows(stockFile)]);
 updateHomeProgress('CHECK ITEM: menyiapkan data Master Stock…',28,true);await new Promise(r=>setTimeout(r,0));
 const masterRows=checkItemMasterRows();
 updateHomeProgress('CHECK ITEM: menghitung Barang Baru & Open TAG…',42,true);await new Promise(r=>setTimeout(r,0));
 const bbMaster=bb_parseMaster(masterRows);if(!bbMaster||!bbMaster.size)throw new Error('Hasil Master Stock Inventory belum memiliki data lokasi LT. Pastikan sumber STM G113 tersedia.');
 const bahan={prodmast:bb_parseProdmast(prodRows),pomgg:bb_parsePomgg(pomRows),master:bbMaster,stock:bb_parseStock(stockRows),histag:bb_parseHistag(histRows)};
 bbState.prodmast=bahan.prodmast;bbState.pomgg=bahan.pomgg;bbState.master=bahan.master;bbState.stock=bahan.stock;bbState.histag=bahan.histag;
 bbState.kandidat=bb_computeCandidates(bahan);
 updateHomeProgress('CHECK ITEM: membaca 4 file REG…',62,true);await new Promise(r=>setTimeout(r,0));
 const itbMaster=itb_parseMaster(masterRows);
 const itbStock=itb_parseStock(stockRows);
 const regBlocks=[];
 for(let i=0;i<regFiles.length;i++){const rows=await checkItemRows(regFiles[i]);const blocks=itb_parseRegRows(rows);regBlocks.push(...blocks);updateHomeProgress(`CHECK ITEM: membaca REG ${i+1}/${regFiles.length}…`,62+Math.round((i+1)/regFiles.length*18),true);await new Promise(r=>setTimeout(r,0))}
 if(regBlocks.length<4)throw new Error(`REG/PRG terbaca ${regBlocks.length} blok; dibutuhkan minimal 4 bulan.`);
 updateHomeProgress('CHECK ITEM: menghitung Item Tidak Bergerak…',84,true);await new Promise(r=>setTimeout(r,0));
 const bahan2={master:itbMaster,stock:itbStock,regIndex:itb_buildRegIndex(regBlocks)};
 itbState.master=bahan2.master;itbState.stock=bahan2.stock;itbState.regIndex=bahan2.regIndex;
 itbState.kandidat=itb_computeCandidates(bahan2);
 updateHomeProgress('CHECK ITEM: menyiapkan hasil tahap 1…',100,true);
 return {bbCandidates:bbState.kandidat,itbCandidates:itbState.kandidat};
}
async function runCheckItem(){
 if($('checkItemBtn').disabled)return;
 if(!beginProcess('checkItemBtn'))return;
 setStatus('CHECK ITEM: memproses tahap 1 — membaca sumber dan menghitung kandidat…',false,true);updateHomeProgress('CHECK ITEM: memulai pemeriksaan…',null,true);
 try{
  const {bbCandidates,itbCandidates}=await checkItemBuildFirstStep();
  combinedPrdcd=[...new Set([...bbCandidates,...itbCandidates])];
  if(combinedPrdcd.length)downloadPrdcd();
  const summary=`Tahap 1 selesai. Barang Baru & Open TAG: ${bbCandidates.length.toLocaleString('id-ID')} item. Item Tidak Bergerak: ${itbCandidates.length.toLocaleString('id-ID')} item.`;
  setStatus(summary,false,false);
  $('checkItemStep1Notice').textContent=summary;
  $('checkItemPrdcdCount').textContent=combinedPrdcd.length?`${combinedPrdcd.length.toLocaleString('id-ID')} PRDCD gabungan siap dipakai untuk mengambil SS-FT.`:'Tidak ada PRDCD kandidat. Kamu tetap dapat melanjutkan jika ingin memeriksa SS-FT.';
  $('checkItemStep2Message').textContent='Pilih file SS-FT hasil scan, lalu tekan PROSES.';
  $('checkItemSsftFile').value='';
  $('checkItemSsftDialog').showModal();
 }catch(e){console.error(e);setStatus('CHECK ITEM gagal: '+(e.message||String(e)),true,false)}
 finally{endProcess();setTimeout(()=>updateHomeProgress('',0,false),2200)}
}
async function processCheckItemSsft(){
 const file=$('checkItemSsftFile').files[0];
 if(!file){$('checkItemStep2Message').textContent='Upload file SS-FT terlebih dahulu.';return}
 $('checkItemSsftRun').disabled=true;
 $('checkItemStep2Message').textContent='Membaca SS-FT dan menghitung hasil…';updateHomeProgress('CHECK ITEM tahap 2: membaca SS-FT…',null,true);setStatus('CHECK ITEM tahap 2: membaca SS-FT dan menghitung hasil…',false,true);
 try{
  await checkItemEnsureXLSX();updateHomeProgress('CHECK ITEM tahap 2: memproses Barang Baru & Open TAG…',35,true);await new Promise(r=>setTimeout(r,0));
  $('step3')?.setAttribute('hidden','');
  const rows=await bb_readAny(file);const stats=bb_parseSsft(rows);const bbArr=bb_buildRekap(bbState,stats);bbState.rows=bbArr;bb_render(bbArr);bb_renderKesimpulan();$('bb_exportBtn').disabled=!bbArr.length;$('bb_exportJpgBtn').disabled=!bbArr.length;$('bb_panel').hidden=false;
  updateHomeProgress('CHECK ITEM tahap 2: memproses Item Tidak Bergerak…',70,true);await new Promise(r=>setTimeout(r,0));const wb=await itb_readAny(file);const ssRows=itb_sheetRows(wb,'SS-FT');const ss=itb_ssStats(ssRows);const itbArr=itb_computeResult(itbState,ss);itbState.rows=itbArr;itb_render(itbArr);itb_renderKesimpulan();$('itb_exportBtn').disabled=!itbArr.length;$('itb_exportJpgBtn').disabled=!itbArr.length;$('itb_panel').hidden=false;
  $('checkItemStep2Message').textContent=`Tahap 2 selesai. Barang Baru & Open TAG: ${bbArr.length.toLocaleString('id-ID')} item. Item Tidak Bergerak: ${itbArr.length.toLocaleString('id-ID')} item.`;
  $('checkItemSsftDialog').close();$('checkItemResultDialog').showModal();
  setStatus('CHECK ITEM selesai. Hasil tahap 2 sudah tersedia.',false,false);updateHomeProgress('CHECK ITEM selesai',100,true);setTimeout(()=>updateHomeProgress('',0,false),2500);
 }catch(e){console.error(e);$('checkItemStep2Message').textContent='Proses SS-FT gagal: '+(e.message||String(e));setStatus('CHECK ITEM tahap 2 gagal: '+(e.message||String(e)),true,false);updateHomeProgress('CHECK ITEM tahap 2 gagal',100,true);setTimeout(()=>updateHomeProgress('',0,false),4000)}
 finally{$('checkItemSsftRun').disabled=false}
}
$('checkItemBtn').addEventListener('click',runCheckItem);
$('checkItemSsftRun').addEventListener('click',processCheckItemSsft);
$('checkItemSsftClose').addEventListener('click',()=>$('checkItemSsftDialog').close());
$('checkItemResultClose').addEventListener('click',()=>$('checkItemResultDialog').close());
$('bb_exportBtn').addEventListener('click',bb_exportXlsx);$('bb_exportJpgBtn').addEventListener('click',bb_exportJpg);
$('itb_exportBtn').addEventListener('click',itb_exportXlsx);$('itb_exportJpgBtn').addEventListener('click',itb_exportJpg);

})();
/* Raw Material engine integrated into Inventory. Calculation functions below are preserved from Check Raw Material v1.0. */
(function(){
'use strict';
const $rm=id=>document.getElementById(id);
function cleanKey(v){return String(v??"").replace(/^\uFEFF/,"").trim().toUpperCase()}
function num(v){if(v===null||v===undefined||v==="")return 0; if(typeof v==="number")return v; let s=String(v).trim().replace(/,/g,""); let n=Number(s); return Number.isFinite(n)?n:0}
function plu(v){if(v===null||v===undefined||v==="")return ""; if(typeof v==="number")return String(Math.trunc(v)); let s=String(v).trim(); if(/^\d+\.0+$/.test(s))s=s.split(".")[0]; return s.replace(/\D/g,"")||s}
function excelDate(v){
  if(v instanceof Date) return isNaN(v)?null:v;
  if(typeof v==="number"){
    if(v>20000 && v<80000) return new Date(Date.UTC(1899,11,30)+v*86400000);
    return null;
  }
  if(typeof v!=="string") return null;
  let s=v.trim();
  if(!s) return null;
  // Some exports append a time component, e.g. "9/22/2026 00:00:00" or "2026-09-22T00:00:00".
  s=s.replace(/[T ]\d{1,2}:\d{2}(:\d{2})?(\s*[AaPp][Mm])?$/,"").trim();
  // A date stored as plain text digits, e.g. an Excel serial saved as a text cell.
  if(/^\d+(\.\d+)?$/.test(s)){
    const n=Number(s);
    return (n>20000 && n<80000) ? new Date(Date.UTC(1899,11,30)+n*86400000) : null;
  }
  // ISO-style: yyyy-mm-dd, yyyy/mm/dd, yyyy.mm.dd
  let m=s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
  if(m){
    const yy=+m[1], mm=+m[2], dd=+m[3];
    if(mm>=1&&mm<=12&&dd>=1&&dd<=31) return new Date(Date.UTC(yy,mm-1,dd));
  }
  // US-style: mm/dd/yy, mm-dd-yyyy, mm.dd.yy — the raw format used by the source files.
  m=s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if(m){
    let mm=+m[1], dd=+m[2], yy=+m[3];
    if(yy<100) yy+=(yy<70?2000:1900);
    if(mm>12 && dd<=12){ const t=mm; mm=dd; dd=t; } // e.g. "22-09-2026" is dd-mm-yyyy, not mm-dd-yyyy
    if(mm>=1&&mm<=12&&dd>=1&&dd<=31) return new Date(Date.UTC(yy,mm-1,dd));
  }
  return null;
}
const MONTHS_ID=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
function dateText(v){
  const d=excelDate(v); if(!d||isNaN(d)) return "";
  const dd=String(d.getUTCDate()).padStart(2,"0");
  const mmm=MONTHS_ID[d.getUTCMonth()];
  const yy=String(d.getUTCFullYear()).slice(-2);
  return dd+" "+mmm+" "+yy;
}
function minDate(arr){let ds=arr.map(excelDate).filter(d=>d&&!isNaN(d)); return ds.length?new Date(Math.min(...ds.map(d=>d.getTime()))):null}
function maxNum(arr){let a=arr.map(num);return a.length?Math.max(...a):0}
function sum(arr){return arr.reduce((a,b)=>a+num(b),0)}
// Recognized column names used both to classify a file and to locate its
// real header row, since some sources (e.g. Master Stock) have a title row
// and a merged sub-header row above the actual column headers.
const HEADER_VOCAB=new Set(["DIVISI","QTY_LPP","PUTPICK","QTY_IN_STORAGE","TGL_EXP","QTY","RAK","SHELF","PRDCD","DESC","DESC2","ALAMAT","FRAC","PLU"]);
function toAOA(ws){return XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:""})}
function findHeaderRow(aoa){
  let best=0,bestScore=0;
  const scanRows=Math.min(aoa.length,20);
  for(let i=0;i<scanRows;i++){
    const row=aoa[i]||[];
    const seen=new Set();
    row.forEach(c=>{const k=cleanKey(c); if(HEADER_VOCAB.has(k)) seen.add(k)});
    if(seen.size>bestScore){bestScore=seen.size;best=i}
  }
  return bestScore>=2?best:0; // fall back to row 1 if nothing recognizable found
}
function rowsFromSheet(ws){
  const aoa=toAOA(ws);
  const hIdx=findHeaderRow(aoa);
  const headers=(aoa[hIdx]||[]).map(cleanKey);
  const rows=[];
  for(let r=hIdx+1;r<aoa.length;r++){
    const arr=aoa[r]; if(!arr) continue;
    const o={};
    headers.forEach((h,ci)=>{ if(h) o[h]=arr[ci]??"" });
    rows.push(o);
  }
  return rows;
}

async function readFile(file){
  const ab=await file.arrayBuffer();
  if(/\.csv$/i.test(file.name)){
    let txt=new TextDecoder("utf-8").decode(ab);
    if(txt.includes("\u0000")) txt=new TextDecoder("windows-1252").decode(ab);
    // UTF-8 BOM and common Windows CSV are handled here.
    let wb=XLSX.read(txt,{type:"string",raw:true});
    return rowsFromSheet(wb.Sheets[wb.SheetNames[0]]);
  }
  const wb=XLSX.read(ab,{type:"array",cellDates:false});
  // Master Stock is the only large xlsx input; use its first sheet.
  return rowsFromSheet(wb.Sheets[wb.SheetNames[0]]);
}

function classify(name,rows){
  const h=new Set(Object.keys(rows[0]||{}));
  const n=cleanKey(name);
  if(h.has("DIVISI")&&h.has("QTY_LPP")&&h.has("PUTPICK"))return "lpp";
  if(h.has("QTY_IN_STORAGE")&&h.has("TGL_EXP"))return "storage";
  if(h.has("QTY")&&h.has("TGL_EXP")&&h.has("RAK")&&h.has("SHELF"))return "display";
  if(h.has("PRDCD")&&h.has("DESC")&&!h.has("DESC2"))return "plu";
  if(h.has("PRDCD")&&h.has("DESC2")&&h.has("ALAMAT")&&h.has("FRAC"))return "master";
  return "";
}

function indexBy(rows,key){
  const m=new Map(); rows.forEach(r=>{const k=plu(r[key]); if(k&&!m.has(k))m.set(k,r)}); return m;
}
function groupBy(rows,key){
  const m=new Map(); rows.forEach(r=>{const k=plu(r[key]);if(!k)return;if(!m.has(k))m.set(k,[]);m.get(k).push(r)});return m;
}
// Groups storage batches by expiry date, summing qty across different racks
// that share the same expiry date. Sorted by date ascending (no-date rows last).
function groupByExpiry(rows,qtyField){
  const map=new Map(); const order=[];
  rows.forEach(x=>{
    const d=excelDate(x.TGL_EXP);
    const key=d?d.getTime():"__nodate__";
    if(!map.has(key)){ map.set(key,{TGL_EXP:x.TGL_EXP, qty:0}); order.push(key); }
    map.get(key).qty+=num(x[qtyField]);
  });
  return order.map(k=>map.get(k)).sort((a,b)=>{
    const da=excelDate(a.TGL_EXP), db=excelDate(b.TGL_EXP);
    if(!da&&!db) return 0; if(!da) return 1; if(!db) return -1;
    return da-db;
  });
}

function buildResult(src){
  const master=src.master||[], lpp=src.lpp||[], display=src.display||[], storage=src.storage||[], pluRows=src.plu||[];
  const mm=indexBy(master,"PRDCD"), lm=groupBy(lpp,"PLU"), dm=groupBy(display,"PLU"), sm=groupBy(storage,"PLU");

  // The spreadsheet's ITEM sheet is a list of raw-material PLUs. PLU.csv is used
  // as the portable equivalent. If PLU.csv is absent, use LPP items that also exist in master.
  let items=pluRows.length?pluRows.map(r=>plu(r.PRDCD)).filter(Boolean):[...lm.keys()].filter(k=>mm.has(k));
  items=[...new Set(items)];

  const summary=[];
  for(const p of items){
    const m=mm.get(p)||{};
    const lr=lm.get(p)||[];
    const dr=dm.get(p)||[];
    const sr=sm.get(p)||[];
    // Rows with no stock (qty <= 0) don't represent a real physical location/expiry,
    // so they're excluded from totals, min-expiry dates, and rack lookup.
    const drStock=dr.filter(x=>num(x.QTY)>0);
    const srStock=sr.filter(x=>num(x.QTY_IN_STORAGE)>0);
    const frac=num(m.FRAC)||1;
    const storageQty=sum(srStock.map(x=>num(x.QTY_IN_STORAGE)))*frac;
    const rakDisplay=maxNum(drStock.map(x=>x.RAK));
    const rakStorage=maxNum(srStock.map(x=>x.RAK));
    summary.push({
      prdcd:p,
      desc2:m.DESC2 || ((pluRows.find(x=>plu(x.PRDCD)===p)||{}).DESC||""),
      alamat:m.ALAMAT||"", frac:m.FRAC||"",
      lpp:sum(lr.map(x=>x.QTY_LPP)),
      display:sum(drStock.map(x=>x.QTY)),
      storage:storageQty,
      minDisplay:minDate(drStock.map(x=>x.TGL_EXP)),
      minStorage:minDate(srStock.map(x=>x.TGL_EXP)),
      rakDisplay:Math.max(4,rakDisplay||0),
      rakStorage:Math.max(4,rakStorage||0)
    });
  }

  // Only keep items that actually have qty somewhere (LPP, Display or Storage).
  let filteredSummary=summary.filter(r=>r.lpp>0||r.display>0||r.storage>0);
  filteredSummary.forEach((r,i)=>r.no=i+1);
  const summaryFinal=filteredSummary;

  // Reproduce the useful visible result of REKAP's second table:
  // one leading row per item plus subsequent storage expiry rows.
  // rowCount on the first row of an item tells the renderer how many
  // sub-rows to merge the shared columns (NO..LPP, PUTPICK, SELISIH) across.
  const detail=[];
  summaryFinal.forEach((s,i)=>{
    const dr=(dm.get(s.prdcd)||[]).filter(x=>num(x.QTY)>0);
    const srRaw=(sm.get(s.prdcd)||[]).filter(x=>num(x.QTY_IN_STORAGE)>0);
    const sr=groupByExpiry(srRaw,"QTY_IN_STORAGE"); // multiple racks, same expiry date -> summed into one row
    const lr=lm.get(s.prdcd)||[];
    const putpick=lr.length?sum(lr.map(x=>x.PUTPICK)):0;
    const displayFirst=dr.length?num(dr[0].QTY):0;
    const rowCount=Math.max(dr.length,sr.length,1);
    const first={no:i+1,prdcd:s.prdcd,desc2:shortDesc(s.desc2),frac:s.frac,lpp:s.lpp,
      display:displayFirst+putpick,displayExp:dr.length?dateText(dr[0].TGL_EXP):"",
      storage:sr.length?sr[0].qty*num(s.frac||1):0,
      storageExp:sr.length?dateText(sr[0].TGL_EXP):"",putpick:putpick,
      selisih:(displayFirst+putpick)+(sr.length?sr[0].qty*num(s.frac||1):0)-s.lpp,
      rowCount};
    detail.push(first);
    for(let j=1;j<rowCount;j++){
      const sd=sr[j], dd=dr[j];
      detail.push({no:"",prdcd:"",desc2:"",frac:"",lpp:"",
        display:"",displayExp:"",
        storage:sd?(sd.qty*num(s.frac||1)):"",
        storageExp:sd?dateText(sd.TGL_EXP):"",putpick:"",selisih:"",
        continuation:true});
    }
  });
  return {summary:summaryFinal,detail};
}
function shortDesc(s){return String(s||"").trim()}

function detectRows(rows,name){return {role:classify(name||'',rows),rows};}
function parseCsvText(text){
  const source=String(text||'').replace(/^\uFEFF/,'');
  const candidates=[',',';','\t','|'];
  const sample=source.split(/\r?\n/).slice(0,8);
  const countOutsideQuotes=(line,delimiter)=>{
    let count=0,quoted=false;
    for(let i=0;i<line.length;i++){
      const ch=line[i];
      if(ch==='"'&&line[i+1]==='"'&&quoted){i++;continue}
      if(ch==='"'){quoted=!quoted;continue}
      if(ch===delimiter&&!quoted)count++;
    }
    return count;
  };
  const delimiter=candidates.map(d=>({d,score:sample.reduce((n,line)=>n+countOutsideQuotes(line,d),0)})).sort((a,b)=>b.score-a.score)[0].d;
  const rows=[];let row=[],field='',quoted=false;
  for(let i=0;i<source.length;i++){
    const ch=source[i];
    if(ch==='"'){
      if(quoted&&source[i+1]==='"'){field+='"';i++}
      else quoted=!quoted;
    }else if(ch===delimiter&&!quoted){row.push(field);field=''}
    else if((ch==='\n'||ch==='\r')&&!quoted){
      if(ch==='\r'&&source[i+1]==='\n')i++;
      row.push(field);field='';
      if(row.some(v=>String(v).trim()!==''))rows.push(row);
      row=[];
    }else field+=ch;
  }
  row.push(field);if(row.some(v=>String(v).trim()!==''))rows.push(row);
  return rows;
}
function rowsFromCsvText(text){
  const aoa=parseCsvText(text);
  const hIdx=findHeaderRow(aoa);
  const headers=(aoa[hIdx]||[]).map(cleanKey);
  const rows=[];
  for(let r=hIdx+1;r<aoa.length;r++){
    const arr=aoa[r]||[],o={};
    headers.forEach((h,ci)=>{if(h)o[h]=arr[ci]??""});
    if(Object.values(o).some(v=>String(v).trim()!==''))rows.push(o);
  }
  return rows;
}
function detectText(text,name){
  const txt=String(text||'').replace(/^\uFEFF/,'');
  if(/\.(csv|txt)$/i.test(String(name||'')))return detectRows(rowsFromCsvText(txt),name);
  if(!window.XLSX)throw new Error('Pustaka Excel belum siap.');
  const wb=XLSX.read(txt,{type:'string',raw:true});
  const ws=wb.Sheets[wb.SheetNames[0]];
  return detectRows(ws?rowsFromSheet(ws):[],name);
}
function detectBuffer(buffer,name){
  if(!window.XLSX)throw new Error('Pustaka Excel belum siap.');
  const wb=XLSX.read(buffer,{type:'array',cellDates:false});
  const ws=wb.Sheets[wb.SheetNames[0]];
  return detectRows(ws?rowsFromSheet(ws):[],name);
}

let lastResult=null,lastSummaryAOA=null,lastDetailAOA=null,lastDetailMerges=null;
let getInventoryFiles=()=>[],getInventoryMaster=()=>[],getInventoryMasterCount=()=>0;
function sourceState(){
 const fs=getInventoryFiles();
 const pick=role=>fs.filter(f=>f.rawRole===role&&Array.isArray(f.rawRows)).slice(-1)[0]||null;
 let masterReady=false,masterCount=0;
 try{masterCount=getInventoryMasterCount();masterReady=masterCount>0}catch(e){}
 const src={master:null,lpp:pick('lpp'),display:pick('display'),storage:pick('storage'),plu:pick('plu')};
 const defs=[
  {key:'master',title:'PRODMAST + STM G113 — sumber Master Stock',ready:masterReady,count:masterCount,detail:'Diambil langsung dari sumber, tanpa membentuk ulang Master Stock'},
  {key:'plu',title:'PLU.csv — kategori Bahan',ready:!!(src.plu&&src.plu.rawRows.length),count:src.plu?.rawRows?.length||0,detail:src.plu?.name||'Belum diunggah'},
  {key:'lpp',title:'LPP vs Plano — sumber Inventory',ready:!!(src.lpp&&src.lpp.rawRows.length),count:src.lpp?.rawRows?.length||0,detail:src.lpp?.name||'Belum diunggah'},
  {key:'display',title:'Listing Planogram Display — Tarikan LWA',ready:!!(src.display&&src.display.rawRows.length),count:src.display?.rawRows?.length||0,detail:src.display?.name||'Belum diunggah'},
  {key:'storage',title:'Listing Planogram Storage — Tarikan LWA',ready:!!(src.storage&&src.storage.rawRows.length),count:src.storage?.rawRows?.length||0,detail:src.storage?.name||'Belum diunggah'}
 ];
 return {src,defs,ready:defs.every(x=>x.ready)};
}
function renderSourceState(){return sourceState()}
function rmHomeProgress(label,percent,show=true){if(typeof renderProgressBox==='function')renderProgressBox('homeProgress',label,percent,show)}
function rmHomeStatus(message,error=false,processing=false){if(typeof setStatus==='function')setStatus(message,error,processing);else if($rm('status'))$rm('status').textContent=message}
async function buildResultProgressive(src,onProgress){
 const master=src.master||[],lpp=src.lpp||[],display=src.display||[],storage=src.storage||[],pluRows=src.plu||[];
 onProgress('Menyusun indeks sumber data',5);await new Promise(r=>setTimeout(r,0));
 const mm=indexBy(master,'PRDCD'),lm=groupBy(lpp,'PLU'),dm=groupBy(display,'PLU'),sm=groupBy(storage,'PLU');
 let items=pluRows.length?pluRows.map(r=>plu(r.PRDCD)).filter(Boolean):[...lm.keys()].filter(k=>mm.has(k));items=[...new Set(items)];
 const summary=[];
 for(let i=0;i<items.length;i++){
  const p=items[i],m=mm.get(p)||{},lr=lm.get(p)||[],dr=dm.get(p)||[],sr=sm.get(p)||[];
  const drStock=dr.filter(x=>num(x.QTY)>0),srStock=sr.filter(x=>num(x.QTY_IN_STORAGE)>0),frac=num(m.FRAC)||1,storageQty=sum(srStock.map(x=>num(x.QTY_IN_STORAGE)))*frac,rakDisplay=maxNum(drStock.map(x=>x.RAK)),rakStorage=maxNum(srStock.map(x=>x.RAK));
  summary.push({prdcd:p,desc2:m.DESC2||((pluRows.find(x=>plu(x.PRDCD)===p)||{}).DESC||''),alamat:m.ALAMAT||'',frac:m.FRAC||'',lpp:sum(lr.map(x=>x.QTY_LPP)),display:sum(drStock.map(x=>x.QTY)),storage:storageQty,minDisplay:minDate(drStock.map(x=>x.TGL_EXP)),minStorage:minDate(srStock.map(x=>x.TGL_EXP)),rakDisplay:Math.max(4,rakDisplay||0),rakStorage:Math.max(4,rakStorage||0)});
  if(i%500===0){onProgress('Menghitung rekap item',8+(i/Math.max(1,items.length))*48);await new Promise(r=>setTimeout(r,0))}
 }
 let filteredSummary=summary.filter(r=>r.lpp>0||r.display>0||r.storage>0);filteredSummary.forEach((r,i)=>r.no=i+1);const summaryFinal=filteredSummary;
 onProgress('Menyusun detail Display, Storage, dan Put Pick',62);await new Promise(r=>setTimeout(r,0));
 const detail=[];
 for(let i=0;i<summaryFinal.length;i++){
  const item=summaryFinal[i],dr=(dm.get(item.prdcd)||[]).filter(x=>num(x.QTY)>0),srRaw=(sm.get(item.prdcd)||[]).filter(x=>num(x.QTY_IN_STORAGE)>0),sr=groupByExpiry(srRaw,'QTY_IN_STORAGE'),lr=lm.get(item.prdcd)||[],putpick=lr.length?sum(lr.map(x=>x.PUTPICK)):0,displayFirst=dr.length?num(dr[0].QTY):0,rowCount=Math.max(dr.length,sr.length,1);
  detail.push({no:i+1,prdcd:item.prdcd,desc2:shortDesc(item.desc2),frac:item.frac,lpp:item.lpp,display:displayFirst+putpick,displayExp:dr.length?dateText(dr[0].TGL_EXP):'',storage:sr.length?sr[0].qty*num(item.frac||1):0,storageExp:sr.length?dateText(sr[0].TGL_EXP):'',putpick,selisih:(displayFirst+putpick)+(sr.length?sr[0].qty*num(item.frac||1):0)-item.lpp,rowCount});
  for(let j=1;j<rowCount;j++){const sd=sr[j];detail.push({no:'',prdcd:'',desc2:'',frac:'',lpp:'',display:'',displayExp:'',storage:sd?(sd.qty*num(item.frac||1)):'',storageExp:sd?dateText(sd.TGL_EXP):'',putpick:'',selisih:'',continuation:true})}
  if(i%300===0){onProgress('Menyusun detail hasil',64+(i/Math.max(1,summaryFinal.length))*28);await new Promise(r=>setTimeout(r,0))}
 }
 onProgress('Menyiapkan tabel hasil',95);await new Promise(r=>setTimeout(r,0));return {summary:summaryFinal,detail};
}
function escHtml(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function colgroup(totalCols,equalFrom,firstWidths){const used=firstWidths.reduce((a,b)=>a+b,0),remainCols=totalCols-equalFrom,eachPct=remainCols>0?((100-used)/remainCols):0;let html='<colgroup>';for(let i=0;i<totalCols;i++){const w=i<equalFrom?firstWidths[i]:eachPct;html+="<col style='width:"+w.toFixed(2)+"%'>"}return html+'</colgroup>'}
function renderTable(el,data,opts){const DESC2_COL=2;let html=colgroup(data[0].length,opts.equalFrom,opts.firstWidths);html+='<thead><tr>'+data[0].map(x=>'<th>'+escHtml(x)+'</th>').join('')+'</tr></thead><tbody>';for(let i=1;i<data.length;i++){html+='<tr>'+data[i].map((x,j)=>"<td class='"+(j===DESC2_COL?'':'center')+(j===10&&typeof x==='number'&&x<0?' bad':'')+"'>"+escHtml(fmt(x))+'</td>').join('')+'</tr>'}html+='</tbody>';el.innerHTML=html}
const DETAIL_MERGE_COLS=new Set([0,1,2,3,4,9,10]),DETAIL_OWN_COLS=[5,6,7,8];
function renderDetailTable(el,data,rows,opts){const DESC2_COL=2;let html=colgroup(data[0].length,opts.equalFrom,opts.firstWidths);html+='<thead><tr>'+data[0].map(x=>'<th>'+escHtml(x)+'</th>').join('')+'</tr></thead><tbody>';for(let i=1;i<data.length;i++){const r=rows[i-1];if(r.continuation){html+='<tr>'+DETAIL_OWN_COLS.map(j=>"<td class='center'>"+escHtml(fmt(data[i][j]))+'</td>').join('')+'</tr>';continue}const rowspan=r.rowCount>1?" rowspan='"+r.rowCount+"'":'';html+='<tr>'+data[i].map((x,j)=>{const cls=(j===DESC2_COL?'':'center')+(j===10&&typeof x==='number'&&x<0?' bad':'');const span=DETAIL_MERGE_COLS.has(j)?rowspan:'';return '<td'+span+" class='"+cls+"'>"+escHtml(fmt(x))+'</td>'}).join('')+'</tr>'}html+='</tbody>';el.innerHTML=html}
function fmt(v){if(v===null||v===undefined||v==='')return '';if(typeof v==='number'){if(v===0)return '';return v.toLocaleString('id-ID',{maximumFractionDigits:2})}return String(v)}
function renderResult(res){
 const sh=[['NO','PRDCD','DESC2','ALAMAT','FRAC','LPP','DISPLAY','STORAGE','Min Exp Display','Min Exp Storage','Rak Display','Rak Storage']];
 res.summary.forEach(r=>sh.push([r.no,r.prdcd,r.desc2,r.alamat,r.frac,r.lpp,r.display,r.storage,dateText(r.minDisplay),dateText(r.minStorage),r.rakDisplay,r.rakStorage]));
 renderTable($rm('rmSummaryTable'),sh,{equalFrom:4,firstWidths:[5,9,24,10]});$rm('rmSummaryCount').textContent=res.summary.length+' item';lastSummaryAOA=sh;
 const dh=[['NO','PRDCD','DESC2','FRAC','LPP','Display Qty','Exp Date','Storage Qty','Exp Date','Put Pick','Selisih']],merges=[],MERGE_COLS=[0,1,2,3,4,9,10];let excelRow=1;
 res.detail.forEach(r=>{dh.push([r.no,r.prdcd,r.desc2,r.frac,r.lpp,r.display,r.displayExp,r.storage,r.storageExp,r.putpick,r.selisih]);if(r.rowCount>1)MERGE_COLS.forEach(c=>merges.push({s:{r:excelRow,c},e:{r:excelRow+r.rowCount-1,c}}));excelRow++});
 renderDetailTable($rm('rmDetailTable'),dh,res.detail,{equalFrom:3,firstWidths:[5,10,26]});$rm('rmDetailCount').textContent=res.detail.length+' baris';lastDetailAOA=dh;lastDetailMerges=merges;
}
function dateTextToExcelSerial(v){
 if(typeof v!=='string'||!v.trim())return null;
 const m=v.trim().match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{2})$/);if(!m)return null;
 const months=MONTHS_ID.map(x=>x.toLowerCase()),month=months.indexOf(m[2].toLowerCase());if(month<0)return null;
 const year=Number(m[3])+(Number(m[3])<70?2000:1900),day=Number(m[1]);
 const d=new Date(Date.UTC(year,month,day));if(d.getUTCFullYear()!==year||d.getUTCMonth()!==month||d.getUTCDate()!==day)return null;
 return (d.getTime()-Date.UTC(1899,11,30))/86400000;
}
function makeRawMaterialSheet(aoa,merges,dateCols=[]){
 const exportData=aoa.map((row,i)=>row.map((v,j)=>i>0&&dateCols.includes(j)?(dateTextToExcelSerial(v)??''):v));
 const ws=XLSX.utils.aoa_to_sheet(exportData);
 dateCols.forEach(col=>{for(let r=1;r<exportData.length;r++){const addr=XLSX.utils.encode_cell({r,c:col}),cell=ws[addr];if(cell&&typeof cell.v==='number'){cell.t='n';cell.z='dd mmm yy';}}});
 if(merges&&merges.length)ws['!merges']=merges.map(m=>({s:m.s,e:m.e}));
 return ws;
}
function exportRawMaterialWorkbook(){
 if(!lastSummaryAOA||lastSummaryAOA.length<2||!lastDetailAOA||lastDetailAOA.length<2){rmHomeStatus('Belum ada data untuk diekspor.',true);return}
 const wb=XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb,makeRawMaterialSheet(lastSummaryAOA,null,[8,9]),'Rekap');
 XLSX.utils.book_append_sheet(wb,makeRawMaterialSheet(lastDetailAOA,lastDetailMerges,[6,8]),'Detail');
 const d=new Date(),dd=String(d.getDate()).padStart(2,'0'),mmm=MONTHS_ID[d.getMonth()],yy=String(d.getFullYear()).slice(-2);
 XLSX.writeFile(wb,`Check Raw Material ${dd} ${mmm} ${yy}.xlsx`,{cellDates:false});
}
async function runRawMaterial(){
 const state=renderSourceState();
 if(!state.ready){const missing=state.defs.filter(x=>!x.ready).map(x=>x.title);rmHomeStatus('Raw Material belum bisa diproses. File belum lengkap: '+missing.join(', ')+'. Silakan lengkapi melalui Daftar File.',true);if(typeof openFileManager==='function')openFileManager('allFiles');return}
 if(typeof beginProcess==='function'&&!beginProcess('rawMaterialBtn'))return;
 rmHomeProgress('Menyiapkan Raw Material',2,true);rmHomeStatus('Raw Material sedang diproses. Jangan tutup aplikasi…',false,true);
 try{
  await new Promise(r=>setTimeout(r,40));
  if(typeof checkItemEnsureXLSX==='function')await checkItemEnsureXLSX();
  rmHomeProgress('Membaca PRODMAST dan STM G113 langsung',5,true);
  const master=getInventoryMaster();
  const current=sourceState().src,src={master,lpp:current.lpp.rawRows,display:current.display.rawRows,storage:current.storage.rawRows,plu:current.plu.rawRows};
  const result=await buildResultProgressive(src,(label,pct)=>rmHomeProgress(label,pct,true));lastResult=result;
  renderResult(result);$rm('rawMaterialResults').hidden=false;
  rmHomeProgress('Selesai',100,true);rmHomeStatus(`Raw Material selesai. ${result.summary.length.toLocaleString('id-ID')} item masuk Rekap dan ${result.detail.length.toLocaleString('id-ID')} baris Detail.`);
  $rm('rawMaterialDialog').showModal();$rm('rawMaterialResults').scrollIntoView({behavior:'smooth',block:'nearest'});
 }catch(e){console.error(e);rmHomeStatus('Proses Raw Material gagal: '+(e.message||String(e)),true);rmHomeProgress('Proses gagal',100,true)}
 finally{if(typeof endProcess==='function')endProcess();setTimeout(()=>rmHomeProgress('',0,false),5000)}
}
function init(){
 if(typeof window.XLSX==='undefined'&&typeof checkItemEnsureXLSX==='function'){}
 $rm('rawMaterialBtn').addEventListener('click',runRawMaterial);
 $rm('rawMaterialClose').addEventListener('click',()=>$rm('rawMaterialDialog').close());
 $rm('rmExport').addEventListener('click',exportRawMaterialWorkbook);
 document.querySelectorAll('[data-rm-tab]').forEach(b=>b.addEventListener('click',()=>{const summary=b.dataset.rmTab==='summary';document.querySelectorAll('[data-rm-tab]').forEach(x=>x.classList.toggle('active',x===b));$rm('rmSummaryPanel').hidden=!summary;$rm('rmDetailPanel').hidden=summary;}));
 $rm('rawMaterialDialog').addEventListener('close',()=>{$rm('rawMaterialResults').hidden=true});
}
function initWithInventory(api){getInventoryFiles=api.getFiles;getInventoryMaster=api.getMasterRows;getInventoryMasterCount=api.getMasterCount;init();renderSourceState()}
window.InventoryRawMaterial={detectText,detectBuffer,refresh:renderSourceState,init:initWithInventory,buildResult};
if(typeof files!=='undefined'&&typeof allRows==='function'&&typeof getRawMaterialMasterRows==='function'){initWithInventory({getFiles:()=>files,getMasterCount:getRawMaterialMasterCount,getMasterRows:getRawMaterialMasterRows})}
})();


/* HISTORY — modul tambahan terisolasi; tidak mengubah kalkulasi modul lain. */
(function(){
'use strict';
const H=$id=>document.getElementById($id);
const Hfmt=n=>n===null||n===undefined||n===''?'-':Number(n)===0?'-':Number(n)<0?`(${Math.abs(Math.round(Number(n))).toLocaleString('id-ID')})`:Math.round(Number(n)).toLocaleString('id-ID');const Hcount=n=>Number(n||0).toLocaleString('id-ID');const Hdelta=n=>Number(n)<0?`<span class=\"history-negative\">(${Math.abs(Number(n)).toLocaleString('id-ID')})</span>`:Math.abs(Number(n)||0).toLocaleString('id-ID');
const Hpercent=n=>n===null||n===undefined||n===''?'-':`${Number(n)<0?`(${Math.abs(Number(n)).toLocaleString('id-ID',{maximumFractionDigits:1})})`:(Number(n)>0&&Number(n)<1?1:Number(n)).toLocaleString('id-ID',{maximumFractionDigits:1})}%`;
const Hval=n=>n===null||n===undefined||n===''?'-':Number(n)===0?'-':Number(n)<0?`<span class=\"history-negative\">(${Math.abs(Math.round(Number(n))).toLocaleString('id-ID')})</span>`:Math.round(Number(n)).toLocaleString('id-ID');
const Hstatus=x=>{if(!x||!(Number(x.po)>0))return 'Tidak ada PO';if(x.sl===null||x.sl===undefined||!Number.isFinite(Number(x.sl)))return 'SL belum dapat dihitung';const sl=Number(x.sl);return sl<=0?'SL 0%':sl<100?'SL <100%':'SL 100%'};
const HtagEligible=tag=>['','E','D','S','L'].includes(String(tag??'').trim().toUpperCase());
const Hconclusion=z=>z.FULL_RECEIPT_NEXTDAY>0&&Hstatus(z.PERIOD3)==='SL 100%'?'SL 100%, tetapi STOCK OUT H+1':Hstatus(z.PERIOD3);
const Hdate=d=>`${String(d.getDate()).padStart(2,'0')} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
const Hkey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const Hmonth=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
const Hnum=v=>{if(v===null||v===undefined||String(v).trim()==='')return 0;return num(v)};
let Hstate=null,Hpage=0;const HPAGE_SIZE=50;
function HwalkCSV(source,visit){const t=String(source||'').replace(/^\uFEFF/,'');let row=[],field='',quoted=false;const emit=()=>{row.push(field.replace(/\r$/,''));visit(row);row=[];field=''};for(let i=0;i<t.length;i++){const c=t[i];if(quoted){if(c==='\"'&&t[i+1]==='\"'){field+='\"';i++;continue}if(c==='\"'){quoted=false;continue}field+=c;continue}if(c==='\"'&&field===''){quoted=true;continue}if(c===','){row.push(field);field='';continue}if(c==='\n'){if(field!==''||row.length)emit();else{row=[];field=''}continue}field+=c}if(field!==''||row.length)emit()}
function HparseTrnh(v,name){let s=text(v)||String(name||'').match(/(?:REG|PRG)(\d{4})/i)?.[1]||'';if(/^\d{4}$/.test(s))return {year:2000+Number(s.slice(0,2)),month:Number(s.slice(2,4))};let m=s.match(/(20\d{2})[-/]?(\d{1,2})/);return m?{year:+m[1],month:+m[2]}:null}
function HdateUS(v){return dateVal(v)}
function HmonthDates(end){const start=new Date(end),day=start.getDate();start.setDate(1);start.setMonth(start.getMonth()-3);const last=new Date(start.getFullYear(),start.getMonth()+1,0).getDate();start.setDate(Math.min(day,last));const a=[];for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1))a.push(new Date(d));return a}
async function Hbuild(onProgress=()=>{}){
 const prod=allRows('prod');if(!prod.length)throw Error('PRODMAST belum tersedia.');const prodMissing=['PRDCD','DESC2','FRAC','ACOST'].filter(k=>!Object.prototype.hasOwnProperty.call(prod[0],k));if(prodMissing.length)throw Error('PRODMAST tidak memiliki kolom: '+prodMissing.join(', ')+'.');
 const stm=filterWarehouse(allRows('stm113'),'G113').filter(o=>text(value(o,'LOKASI')).padStart(2,'0')==='01');if(!stm.length)throw Error('STM G113 lokasi 01 belum tersedia.');const stmMissing=['PRDCD','LT','MAX'].filter(k=>!Object.prototype.hasOwnProperty.call(stm[0],k));if(stmMissing.length)throw Error('STM G113 tidak memiliki kolom: '+stmMissing.join(', ')+'.');
 const loc=new Map();for(const o of stm){const id=key(value(o,'PRDCD'));if(!id)continue;const old=loc.get(id);if(!old||(!text(value(old,'LT'))&&text(value(o,'LT'))))loc.set(id,o)}
 const hrRows=allRows('hrgbeli'),hpgRows=allRows('hpg'),supRows=allRows('supmast');if(!hpgRows.length)throw Error('HPG belum tersedia.');if(!supRows.length)throw Error('SUPMAST belum tersedia.');const hr=firstMap(hrRows),hpg=firstMap(hpgRows),sup=firstMap(supRows,'SUPCO');
 const items=[],itemMap=new Map();for(const p of prod){const id=key(value(p,'PRDCD'));if(!id||itemMap.has(id))continue;const st=loc.get(id)||{},lt=text(value(st,'LT')).toUpperCase();if(!/^[A-Z]+$/.test(lt))continue;const zona=zone(lt);if(!zona)continue;const h=hr.get(id)||{},hp=hpg.get(id)||{},supco=text(value(h,'SUPCO')||value(p,'SUPCO')),s=sup.get(supco)||{};const it={PRDCD:id,DESC2:text(value(p,'DESC2','DESC')),ZONA:zona,FRAC:Hnum(value(p,'FRAC')),ACOST:Hnum(value(p,'ACOST')),PKM:Hnum(value(st,'MAX','QTY_MAX')),MEAN:value(hp,'MEAN')!==''?Hnum(value(hp,'MEAN')):null,SUPCO:supco,SNAMA:text(value(s,'SNAMA')),_stock:new Map(),_tag:new Map(),_bpb:new Map(),_poByDate:new Map(),_poLines:[]};items.push(it);itemMap.set(id,it)}
 if(!items.length)throw Error('Tidak ada PRDCD PRODMAST yang memiliki ZONA berdasarkan LT STM G113 lokasi 01.');
 const regFiles=files.filter(f=>f.guess==='reg'&&f.content);if(!regFiles.length)throw Error('File REG belum tersedia.');let regMonths=0,latestRegUpdate=null,latestStockDate=null;const regMonthKeys=new Set();
 for(let fi=0;fi<regFiles.length;fi++){const f=regFiles[fi];onProgress(`History: membaca REG ${fi+1}/${regFiles.length}…`,10+Math.round(fi/regFiles.length*25));await new Promise(r=>setTimeout(r,0));let headers=null,ix={},fileUpdate=null;HwalkCSV(f.content,r=>{if(!headers){headers=r.map(norm);for(const k of ['PRDCD','TRNH','TGLUPD'])ix[k]=headers.indexOf(k);for(let d=1;d<=31;d++){ix['STOCK'+String(d).padStart(2,'0')]=headers.indexOf('STOCK'+String(d).padStart(2,'0'));ix['TAG'+String(d).padStart(2,'0')]=headers.indexOf('TAG'+String(d).padStart(2,'0'))}const miss=['PRDCD','TRNH','TGLUPD',...Array.from({length:31},(_,i)=>'STOCK'+String(i+1).padStart(2,'0')),...Array.from({length:31},(_,i)=>'TAG'+String(i+1).padStart(2,'0'))].filter(k=>ix[k]<0);if(miss.length)throw Error(`REG ${f.name}: kolom wajib tidak ditemukan (${miss.slice(0,8).join(', ')}${miss.length>8?'…':''}).`);return}if(!fileUpdate&&ix.TGLUPD>=0)fileUpdate=HdateUS(r[ix.TGLUPD]);const id=key(r[ix.PRDCD]),it=itemMap.get(id);if(!it)return;const meta=HparseTrnh(r[ix.TRNH],f.name);if(!meta)return;regMonthKeys.add(`${meta.year}-${String(meta.month).padStart(2,'0')}`);for(let day=1;day<=31;day++){const d=new Date(meta.year,meta.month-1,day);if(d.getMonth()!==meta.month-1)continue;const k=Hkey(d),sv=r[ix['STOCK'+String(day).padStart(2,'0')]],tv=r[ix['TAG'+String(day).padStart(2,'0')]];if(sv!==''&&sv!==undefined){it._stock.set(k,Hnum(sv));if(!latestStockDate||d>latestStockDate)latestStockDate=new Date(d)}if(tv!==''&&tv!==undefined)it._tag.set(k,text(tv))}});if(headers&&ix.PRDCD>=0&&ix.TRNH>=0)regMonths++;if(fileUpdate&&(!latestRegUpdate||fileUpdate>latestRegUpdate))latestRegUpdate=fileUpdate}
 if(regMonths<3)throw Error(`REG yang terbaca baru ${regMonths} bulan. Dibutuhkan REG yang mencakup 3 bulan riwayat.`);
 const today=new Date();today.setHours(0,0,0,0);if(!latestStockDate)throw Error('REG tidak memiliki data STOCK harian yang dapat digunakan.');const end=new Date(latestStockDate);end.setHours(0,0,0,0);const dates=HmonthDates(end),start3=dates[0];const missing=[...new Set(dates.map(Hmonth))].filter(m=>!regMonthKeys.has(m));if(missing.length)throw Error('REG belum lengkap untuk bulan: '+missing.join(', ')+'.');
 const pomFiles=files.filter(f=>f.guess==='pom113'&&f.content);if(!pomFiles.length)throw Error('POM G113 belum tersedia.');let pomRows=0,ignoredRec1=0;
 for(let fi=0;fi<pomFiles.length;fi++){const f=pomFiles[fi];onProgress(`History: membaca POM ${fi+1}/${pomFiles.length}…`,40+Math.round(fi/pomFiles.length*10));await new Promise(r=>setTimeout(r,0));let headers=null,ix={};HwalkCSV(f.content,r=>{if(!headers){headers=r.map(norm);for(const k of ['RECID','PRDCD','DOCNO','QTY','PO_DATE','BPB_DATE','BPB_QTY'])ix[k]=headers.indexOf(k);const miss=['RECID','PRDCD','DOCNO','QTY','PO_DATE','BPB_DATE','BPB_QTY'].filter(k=>ix[k]<0);if(miss.length)throw Error(`POM ${f.name}: kolom wajib tidak ditemukan (${miss.join(', ')}).`);return}const id=key(r[ix.PRDCD]),it=itemMap.get(id);if(!it)return;const rec=text(r[ix.RECID]).toUpperCase();if(!['R','H',''].includes(rec)){ignoredRec1++;return}const pd=HdateUS(r[ix.PO_DATE]),bd=rec==='R'?HdateUS(r[ix.BPB_DATE]):null,qty=Hnum(r[ix.QTY]),bqty=rec==='R'?Hnum(r[ix.BPB_QTY]):0;if(!pd||qty<=0)return;const line={doc:text(r[ix.DOCNO]),poDate:pd,poQty:qty,bpbDate:bd,bpbQty:bqty,rec};it._poLines.push(line);const pk=Hkey(pd),pm=it._poByDate.get(pk)||{po:0,lines:[]};pm.po+=qty;pm.lines.push(line);it._poByDate.set(pk,pm);if(bd&&bqty>0){const bk=Hkey(bd);it._bpb.set(bk,(it._bpb.get(bk)||0)+bqty)}pomRows++})}
 if(!pomRows)throw Error('Tidak ada baris PO valid pada POM G113.');
 const stockoutByDate=dates.map(d=>({date:d,valueRp:0,count:0,total:items.length})),totalByDate=dates.map(d=>({date:d,bpbRp:0,stockRp:0,stockCount:0,po14Rp:0,bpb14Rp:0,sl:null,stockOutRp:0,stockOutStockRp:0,stockOut:0}));
 const winStartDays=(end,n)=>{const d=new Date(end);d.setDate(d.getDate()-n+1);d.setHours(0,0,0,0);return d};
 const periodStats=(it,start,finish=end)=>{let po=0,bpb=0,noArrival=0,lines=0,arrivalRp=0;const arrivals=new Set();for(const l of it._poLines){const poInRange=l.poDate>=start&&l.poDate<=finish;if(!poInRange)continue;po+=l.poQty;lines++;const matchedBpb=l.bpbQty>0;if(!matchedBpb)noArrival++;else{bpb+=l.bpbQty;arrivalRp+=l.bpbQty*it.ACOST;arrivals.add(`${l.doc}|${l.rec}`)}}return {po,bpb,poRp:po*it.ACOST,bpbRp:bpb*it.ACOST,arrivalRp,sl:po>0?bpb/po*100:null,noArrival,lines,arrivalCount:arrivals.size}};
 const linearTrend=values=>{const a=values.map((v,i)=>({x:i,y:Number(v)||0})).filter(v=>Number.isFinite(v.y));if(a.length<2)return 'stabil';const mx=(a.length-1)/2,my=a.reduce((t,v)=>t+v.y,0)/a.length;let num=0,den=0;for(const v of a){num+=(v.x-mx)*(v.y-my);den+=(v.x-mx)**2}const slope=den?num/den:0,span=slope*(a.length-1),scale=Math.max(1,Math.abs(my));return Math.abs(span)<=scale*0.05?'stabil':span>0?'naik':'turun'};
 const trendLabel=(it,start,finish)=>{const current=periodStats(it,start,finish);if(!(current.po>0))return 'Tidak ada PO';const initialEnd=new Date(Math.min(start.getTime()+6*86400000,finish.getTime()));const initial=periodStats(it,start,initialEnd);const a=Hstatus(initial),b=Hstatus(current);if(a==='SL 0%'&&b==='SL 0%')return 'SL 0%, tidak ada kedatangan';if(a==='Tidak ada PO'){if(b==='SL 0%')return 'Ada PO, tetapi tidak ada kedatangan';if(b==='SL <100%')return 'Ada PO dan kedatangan, SL <100%';if(b==='SL 100%')return 'Ada PO dengan kedatangan penuh, SL 100%'}let slTrend;if(a===b){slTrend=a==='SL <100%'?'stabil <100%':a==='SL 100%'?'stabil 100%':'stabil 0%'}else{const rank=label=>label==='SL 0%'?0:label==='SL <100%'?1:label==='SL 100%'?2:-1;slTrend=rank(b)>rank(a)?'naik':'turun'}const dailyBpb=[];for(let d=new Date(start);d<=finish;d.setDate(d.getDate()+1))dailyBpb.push(it._bpb.get(Hkey(d))||0);const arrivalDirection=linearTrend(dailyBpb),arrivalTrend=arrivalDirection==='naik'?'meningkat':arrivalDirection==='turun'?'menurun':'stabil';return `SL ${slTrend}, nilai kedatangan ${arrivalTrend}`};
 const classifyCause=x=>Hstatus(x);
 for(let ii=0;ii<items.length;ii++){const it=items[ii],daily=[];for(let di=0;di<dates.length;di++){const d=dates[di],k=Hkey(d),stock=it._stock.has(k)?it._stock.get(k):null,tag=it._tag.has(k)?it._tag.get(k):'',bpb=it._bpb.get(k)||0;const ws=new Date(d);ws.setDate(ws.getDate()-14);let po14=0,bpb14=0;for(const l of it._poLines){if(l.poDate>=ws&&l.poDate<d){po14+=l.poQty;bpb14+=l.bpbQty}}const sl=po14>0?bpb14/po14*100:null;daily.push({date:d,tag,bpb,stock,po:po14,bpb14,bpbRp:bpb*it.ACOST,stockRp:stock===null?null:stock*it.ACOST,poRp:po14*it.ACOST,bpb14Rp:bpb14*it.ACOST,sl});const agg=totalByDate[di];agg.bpbRp+=bpb*it.ACOST;agg.po14Rp+=po14*it.ACOST;agg.bpb14Rp+=bpb14*it.ACOST;if(stock!==null){agg.stockRp+=stock*it.ACOST;agg.stockCount++;if(it.MEAN!==null&&it.MEAN>0&&stock<it.MEAN&&HtagEligible(tag)){agg.stockOut++;agg.stockOutRp+=(it.MEAN-stock)*it.ACOST;agg.stockOutStockRp+=stock*it.ACOST}}}
  it._daily=daily;const first=daily[0]?.stock!==null?daily[0]:null,last=[...daily].reverse().find(x=>x.stock!==null);const decline=first&&last?Math.max(0,first.stock-last.stock):0;const change=first&&last?last.stock-first.stock:null;const declineRp=decline*it.ACOST;const changeRp=change===null?null:change*it.ACOST;const startStockRp=first?.stock===null||first?.stock===undefined?null:first.stock*it.ACOST;const endStockRp=last?.stock===null||last?.stock===undefined?null:last.stock*it.ACOST;const p14Start=winStartDays(end,14),p30Start=winStartDays(end,30),p14=periodStats(it,p14Start),p30=periodStats(it,p30Start),p3=periodStats(it,start3),p14Initial=periodStats(it,p14Start,new Date(Math.min(p14Start.getTime()+6*86400000,end.getTime()))),p30Initial=periodStats(it,p30Start,new Date(Math.min(p30Start.getTime()+6*86400000,end.getTime()))),p3Initial=periodStats(it,start3,new Date(Math.min(start3.getTime()+6*86400000,end.getTime())));const trend14=trendLabel(it,winStartDays(end,14),end),trend30=trendLabel(it,winStartDays(end,30),end),trend3=trendLabel(it,start3,end);const cause14=classifyCause(p14),cause30=classifyCause(p30),cause3=classifyCause(p3);let fullReceiptNextDay=0;for(const l of it._poLines){if(!l.bpbDate||l.bpbDate<start3||l.bpbDate>end||l.bpbQty<l.poQty)continue;const next=new Date(l.bpbDate);next.setDate(next.getDate()+1);const ns=it._stock.get(Hkey(next));if(ns!==undefined&&it.MEAN!==null&&it.MEAN>0&&ns<it.MEAN&&HtagEligible(it._tag.get(Hkey(next))))fullReceiptNextDay++}
  const stockOutDays=daily.filter(x=>x.stock!==null&&it.MEAN!==null&&it.MEAN>0&&x.stock<it.MEAN&&HtagEligible(x.tag)).length;const latest=last||{};const latestTag=latest.date?it._tag.get(Hkey(latest.date)):'';const shortage=latest.stock===null||latest.stock===undefined||it.MEAN===null||it.MEAN<=0||!HtagEligible(latestTag)?null:Math.max(0,it.MEAN-latest.stock);const shortageRp=shortage===null?null:shortage*it.ACOST;let lastBpb=null;for(const k of it._bpb.keys()){const d=new Date(k+'T00:00:00');if(d<=end&&(!lastBpb||d>lastBpb))lastBpb=d}const daysSince=lastBpb?Math.floor((end-lastBpb)/86400000):null;it._summary={STOCK:latest.stock??null,SHORTAGE:shortage,SHORTAGE_RP:shortageRp,PO14:p14.po,BPB14:p14.bpb,SL14:p14.sl,LAST_BPB:lastBpb?Hdate(lastBpb):'Tidak ada',DAYS_SINCE_BPB:daysSince,BPB_DAYS_14:daily.slice(-14).filter(x=>x.bpb>0).length,START_STOCK:first?.stock??null,END_STOCK:last?.stock??null,START_STOCK_RP:startStockRp,END_STOCK_RP:endStockRp,STOCK_CHANGE:change,STOCK_DECLINE:decline,STOCK_CHANGE_RP:changeRp,STOCK_DECLINE_RP:declineRp,STOCK_OUT_DAYS:stockOutDays,FULL_RECEIPT_NEXTDAY:fullReceiptNextDay,PERIOD14:p14,PERIOD30:p30,PERIOD3:p3,PERIOD14_INITIAL:p14Initial,PERIOD30_INITIAL:p30Initial,PERIOD3_INITIAL:p3Initial,CAUSE14:cause14,CAUSE30:cause30,CAUSE3:cause3,TREND14:trend14,TREND30:trend30,TREND3:trend3};
  const isStockOutDay=d=>d.stock!==null&&it.MEAN!==null&&it.MEAN>0&&d.stock<it.MEAN&&HtagEligible(d.tag);
  const stockOutFlags=daily.map(isStockOutDay);
  const allOut=n=>stockOutFlags.length>=n&&stockOutFlags.slice(-n).every(Boolean);
  let stockOutPeriod='',stockOutSL=null,stockOutStatus='';
  if(stockOutFlags.length&&stockOutFlags.every(Boolean)){stockOutPeriod='3 Bulan';stockOutSL=p3.sl;stockOutStatus=Hstatus(p3)}
  else if(allOut(30)){stockOutPeriod='1 Bulan';stockOutSL=p30.sl;stockOutStatus=Hstatus(p30)}
  else if(allOut(14)){stockOutPeriod='2 Minggu';stockOutSL=p14.sl;stockOutStatus=Hstatus(p14)}
  const stockOutDescription=stockOutPeriod?`Stock Out ${stockOutPeriod} berturut-turut, ${stockOutStatus==='Tidak ada PO'?'Tidak ada PO':stockOutStatus}`:'';
  it._stockOutHistory=stockOutPeriod?{period:stockOutPeriod,sl:stockOutSL,status:stockOutStatus,description:stockOutDescription}:null;

  if(ii%150===0||ii===items.length-1){onProgress(`History: analisa tren ${Math.min(ii+1,items.length).toLocaleString('id-ID')}/${items.length.toLocaleString('id-ID')}…`,52+Math.round((ii+1)/items.length*43));await new Promise(r=>setTimeout(r,0))}}
 for(let i=0;i<totalByDate.length;i++){const a=totalByDate[i];a.sl=a.po14Rp>0?a.bpb14Rp/a.po14Rp*100:null}
 const stockOutTrend=dates.map((d,i)=>({date:d,count:totalByDate[i].stockOut,total:totalByDate[i].stockCount,valueRp:totalByDate[i].stockRp}));const topItems=[...items].filter(x=>x._summary.STOCK_DECLINE_RP>0).sort((a,b)=>b._summary.STOCK_DECLINE_RP-a._summary.STOCK_DECLINE_RP).slice(0,50);
 const sm=new Map();for(const it of items){const k=it.SUPCO||'(Tanpa SUPCO)';if(!sm.has(k))sm.set(k,{SUPCO:k,SNAMA:it.SNAMA,ITEM_TURUN:0,TOTAL_TURUN:0,TOTAL_TURUN_RP:0,ITEM_STOCK_OUT:0,ITEM_TIDAK_PO:0,ITEM_TIDAK_DATANG:0,ITEM_SL_KURANG:0,ITEM_BPBFULL_STOCKOUT:0,ITEM:0});const s=sm.get(k),z=it._summary;s.ITEM++;if(z.STOCK_DECLINE>0){s.ITEM_TURUN++;s.TOTAL_TURUN+=z.STOCK_DECLINE;s.TOTAL_TURUN_RP+=z.STOCK_DECLINE_RP}if(z.SHORTAGE>0)s.ITEM_STOCK_OUT++;if(z.PERIOD3.po===0)s.ITEM_TIDAK_PO++;else if(z.PERIOD3.bpb===0)s.ITEM_TIDAK_DATANG++;else if(z.PERIOD3.sl<100)s.ITEM_SL_KURANG++;if(z.FULL_RECEIPT_NEXTDAY>0)s.ITEM_BPBFULL_STOCKOUT++}const topSup=[...sm.values()].filter(x=>x.ITEM_TURUN>0).sort((a,b)=>b.ITEM_TURUN-a.ITEM_TURUN||String(a.SUPCO).localeCompare(String(b.SUPCO))).slice(0,50);
 const analysisItems=items.filter(it=>it._summary.STOCK_DECLINE_RP>0||it._summary.SHORTAGE_RP>0);const periodDefs=[['2 Minggu','CAUSE14','TREND14'],['1 Bulan','CAUSE30','TREND30'],['3 Bulan','CAUSE3','TREND3']];const causeSet=new Set(analysisItems.flatMap(it=>periodDefs.map(([,causeKey,trendKey])=>it._summary[trendKey]).filter(v=>v!==null&&v!==undefined&&String(v).trim()!=='')));const causeOrder=v=>{if(v==='Tidak ada PO')return [0,0];if(String(v).startsWith('Ada PO'))return [1,String(v)];if(String(v).startsWith('SL 0%'))return [2,String(v)];if(String(v).startsWith('SL stabil <100%'))return [3,String(v)];if(String(v).startsWith('SL stabil 100%'))return [4,String(v)];if(String(v).startsWith('SL naik'))return [5,String(v)];if(String(v).startsWith('SL turun'))return [6,String(v)];return [99,String(v)]};const causeNames=[...causeSet].sort((a,b)=>{const x=causeOrder(a),y=causeOrder(b);return x[0]-y[0]||(typeof x[1]==='number'&&typeof y[1]==='number'?x[1]-y[1]:String(x[1]).localeCompare(String(y[1])))});const causeCountsByPeriod={},causeSupcoCountsByPeriod={};for(const [label,causeKey,trendKey] of periodDefs){const counts=Object.fromEntries(causeNames.map(n=>[n,0])),supcoSets=Object.fromEntries(causeNames.map(n=>[n,new Set()]));for(const it of analysisItems){const supKey=it.SUPCO||'(Tanpa SUPCO)',conclusion=it._summary[trendKey];if(conclusion===null||conclusion===undefined||String(conclusion).trim()==='')continue;if(!Object.prototype.hasOwnProperty.call(counts,conclusion))continue;counts[conclusion]++;supcoSets[conclusion].add(supKey)}causeCountsByPeriod[label]=counts;causeSupcoCountsByPeriod[label]=Object.fromEntries(causeNames.map(n=>[n,supcoSets[n].size]));}const causeVariances={};for(const cause of causeNames){const a=causeCountsByPeriod['2 Minggu'][cause],b=causeCountsByPeriod['1 Bulan'][cause],c=causeCountsByPeriod['3 Bulan'][cause];causeVariances[cause]={'1 Bulan - 2 Minggu':b-a,'3 Bulan - 1 Bulan':c-b,'3 Bulan - 2 Minggu':c-a}}const topCauseCounts=causeNames.map(name=>({name,count:analysisItems.filter(it=>it._summary.TREND3===name).length})).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'id'));const topSupConclusionNames=topCauseCounts.slice(0,4).map(x=>x.name);for(const sup of topSup){sup.CONCLUSION_COUNTS=Object.fromEntries(topSupConclusionNames.map(name=>[name,analysisItems.filter(it=>(it.SUPCO||'(Tanpa SUPCO)')===sup.SUPCO&&it._summary.TREND3===name).length]));}const causeCounts={STOCK_OUT:items.filter(x=>x._summary.SHORTAGE_RP>0).length};
 const stockOutItems=items.filter(it=>it._stockOutHistory).map(it=>({item:it,period:it._stockOutHistory.period,sl:it._stockOutHistory.sl,status:it._stockOutHistory.status,description:it._stockOutHistory.description}));
 const stockOutSummaryMap=new Map();for(const row of stockOutItems)stockOutSummaryMap.set(row.description,(stockOutSummaryMap.get(row.description)||0)+1);
 const stockOutSummary=[...stockOutSummaryMap.entries()].map(([description,count])=>({description,count})).sort((a,b)=>b.count-a.count||a.description.localeCompare(b.description,'id'));
 return {items,analysisItems,dates,totalByDate,topItems,topSup,topSupConclusionNames,end,regUpdate:latestRegUpdate,regMonths,stockOutTrend,causeCounts,causeCountsByPeriod,causeSupcoCountsByPeriod,causeVariances,causeNames,pomRows,ignoredRec1,start3,stockOutItems,stockOutSummary};
}
function HsvgChart(title,series,labels){const W=900,Hh=230,L=88,R=72,T=24,B=35,main=series.filter(s=>!s.secondary),secondary=series.filter(s=>s.secondary),mainVals=main.flatMap(s=>s.values.filter(v=>v!==null&&Number.isFinite(v)&&v>=0)),secVals=secondary.flatMap(s=>s.values.filter(v=>v!==null&&Number.isFinite(v)&&v>=0)),rawMax=Math.max(0,...mainVals),rawMax2=Math.max(0,...secVals),niceMax=v=>{if(!(v>0))return 1;const p=Math.pow(10,Math.floor(Math.log10(v))),n=v/p;return (n<=1?1:n<=2?2:n<=5?5:10)*p},max=niceMax(rawMax),max2=secondary[0]?.axisUnit==='%'?Math.max(100,niceMax(rawMax2)):niceMax(rawMax2),x=i=>L+i*(W-L-R)/Math.max(1,labels.length-1),y=v=>T+(max-v)*(Hh-T-B)/max,y2=v=>T+(max2-v)*(Hh-T-B)/max2;let svg=`<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${escapeHtml(title)}">`;for(let g=0;g<=4;g++){const yy=T+g*(Hh-T-B)/4,left=max*(1-g/4),right=max2*(1-g/4);svg+=`<line x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}" stroke="#294b32"/><text x="${L-9}" y="${yy+4}" text-anchor="end" fill="#8db99a" font-size="10">${Hfmt(left)}</text>`;if(secondary.length)svg+=`<text x="${W-R+9}" y="${yy+4}" text-anchor="start" fill="#8db99a" font-size="10">${Hfmt(right)}${secondary[0].axisUnit||''}</text>`}for(const z of series){let path='',started=false;z.values.forEach((v,i)=>{if(v===null||!Number.isFinite(v)){started=false;return}path+=(started?' L':'M')+x(i).toFixed(1)+' '+(z.secondary?y2(v):y(v)).toFixed(1);started=true});svg+=`<path d="${path}" fill="none" stroke="${z.color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`}const every=Math.max(1,Math.floor(labels.length/8));labels.forEach((l,i)=>{if(i%every===0||i===labels.length-1)svg+=`<text x="${x(i)}" y="${Hh-9}" text-anchor="middle" fill="#8db99a" font-size="9">${escapeHtml(l)}</text>`});svg+='</svg>';return svg+`<div class="history-legend">${series.map(z=>`<span><i style="background:${z.color}"></i>${escapeHtml(z.name||'')}</span>`).join('')}</div>`}
function HrenderCharts(){const s=Hstate,labels=s.dates.map(Hdate),agg=s.totalByDate;H('historyChartAll').innerHTML=HsvgChart('PO • BPB • STOCK • SL SUPP',[{name:'PO 14 Hari (Rp)',color:'#b58cff',values:agg.map(x=>x.po14Rp)},{name:'BPB (Rp)',color:'#79e86b',values:agg.map(x=>x.bpbRp)},{name:'STOCK (Rp)',color:'#43b6ff',values:agg.map(x=>x.stockRp)},{name:'SL Supp (%)',color:'#ffc45c',values:agg.map(x=>x.sl),secondary:true,axisUnit:'%'}],labels);H('historyChartStockOut').innerHTML=HsvgChart('JUMLAH ITEM STOCK OUT & NILAI STOCK (Rp)',[{name:'STOCK (Rp)',color:'#ff8a65',values:s.stockOutTrend.map(x=>x.valueRp)},{name:'Jumlah Item STOCK OUT (Item)',color:'#ffc45c',values:s.stockOutTrend.map(x=>x.count),secondary:true,axisUnit:' item'}],labels)}
function HrenderTable(){const s=Hstate,head=['PRDCD','DESC2','ZONA','FRAC','ACOST','PKM','PKM Rp','MEAN','SUPCO','SNAMA'];let html='<thead><tr>'+head.map(x=>`<th rowspan="2">${x}</th>`).join('')+s.dates.map(d=>`<th colspan="4">${Hdate(d)}</th>`).join('')+'</tr><tr>'+s.dates.map(()=>'<th>PTAG</th><th>BPB (Rp)</th><th>STOCK (Rp)</th><th>SL Supp</th>').join('')+'</tr></thead><tbody>';const start=Hpage*HPAGE_SIZE,part=s.items.slice(start,start+HPAGE_SIZE);for(const it of part){html+='<tr>'+[it.PRDCD,it.DESC2,it.ZONA,it.FRAC,it.ACOST,it.PKM,it.PKM*it.ACOST,it.MEAN,it.SUPCO,it.SNAMA].map(v=>`<td>${escapeHtml(typeof v==='number'?Hfmt(v):v)}</td>`).join('');for(const d of it._daily)html+=`<td>${escapeHtml(d.tag||'-')}</td><td>${Hval(d.bpbRp)}</td><td>${Hval(d.stockRp)}</td><td>${Hpercent(d.sl)}</td>`;html+='</tr>'}html+='</tbody>';H('historyTable').innerHTML=html;H('historyPageInfo').textContent=`Menampilkan ${start+1}–${Math.min(start+HPAGE_SIZE,s.items.length)} dari ${s.items.length.toLocaleString('id-ID')} item`;H('historyPrev').disabled=Hpage===0;H('historyNext').disabled=start+HPAGE_SIZE>=s.items.length}
function HrenderAnalysis(){const s=Hstate,periodSelect=H('historyAnalysisPeriodFilter'),conclusionSelect=H('historyAnalysisConclusionFilter'),period=periodSelect?.value||'14',key=period==='30'?'TREND30':period==='90'?'TREND3':'TREND14',conclusion=conclusionSelect?.value||'',periodKey=period==='30'?'1 Bulan':period==='90'?'3 Bulan':'2 Minggu',options=[...new Set(s.analysisItems.map(x=>x._summary[key]).filter(v=>v!==null&&v!==undefined&&String(v).trim()!==''))].sort((a,b)=>{if(a==='Tidak ada PO')return -1;if(b==='Tidak ada PO')return 1;return String(a).localeCompare(String(b),'id')});if(conclusion&&!options.includes(conclusion)){conclusionSelect.value=''}conclusionSelect.innerHTML='<option value="">Semua Jenis Kesimpulan</option>'+options.map(n=>`<option value="${escapeHtml(n)}" ${conclusion===n?'selected':''}>${escapeHtml(n)}</option>`).join('');const selected=conclusion&&options.includes(conclusion)?conclusion:'';const rows=s.analysisItems.filter(x=>!selected||x._summary[key]===selected);H('historyAnalysis').querySelector('tbody').innerHTML=rows.map(x=>{const z=x._summary;return `<tr><td>${escapeHtml(x.PRDCD)}</td><td>${escapeHtml(x.DESC2)}</td><td>${escapeHtml(x.SUPCO)}</td><td>${Hval(z.START_STOCK_RP)}</td><td>${Hval(z.END_STOCK_RP)}</td><td>${Hval(z.STOCK_DECLINE_RP)}</td><td>${Hpercent(z.PERIOD14_INITIAL.sl)}</td><td>${Hpercent(z.PERIOD14.sl)}</td><td>${escapeHtml(Hstatus(z.PERIOD14))}</td><td>${escapeHtml(z.TREND14)}</td><td>${Hpercent(z.PERIOD30_INITIAL.sl)}</td><td>${Hpercent(z.PERIOD30.sl)}</td><td>${escapeHtml(Hstatus(z.PERIOD30))}</td><td>${escapeHtml(z.TREND30)}</td><td>${Hpercent(z.PERIOD3_INITIAL.sl)}</td><td>${Hpercent(z.PERIOD3.sl)}</td><td>${escapeHtml(Hstatus(z.PERIOD3))}</td><td>${escapeHtml(z.TREND3)}</td><td>${Hfmt(z.FULL_RECEIPT_NEXTDAY)}</td></tr>`}).join('')||'<tr><td colspan="19">Tidak ada item untuk periode dan jenis kesimpulan tersebut.</td></tr>';const periodLabel=periodSelect?.selectedOptions?.[0]?.textContent||periodKey;const toolbar=H('historyAnalysisFilterHint');if(toolbar)toolbar.textContent=`Menampilkan ${rows.length.toLocaleString('id-ID')} item • Filter: ${periodLabel}`}
function Hrender(){const s=Hstate;H('historySummary').textContent=`${s.items.length.toLocaleString('id-ID')} PRDCD ber-ZONA • ${s.dates.length} hari • REG ${s.regMonths} bulan • STOCK/PTAG terakhir ${Hdate(s.end)}`;const periods=['2 Minggu','1 Bulan','3 Bulan'];const renderCauseTable=(kind,title)=>{let out=`<section class="history-cause-table-block"><h4>${title}</h4><div class="history-cause-periods"><div class="history-cause-header"><span>Keterangan</span>${periods.map(p=>`<b>${p}</b>`).join('')}<b>Δ 1B−2M</b><b>Δ 3B−1B</b><b>Δ 3B−2M</b></div>`;for(const cause of s.causeNames){const values=periods.map(p=>kind==='item'?s.causeCountsByPeriod[p][cause]:s.causeSupcoCountsByPeriod[p][cause]);const d1=values[1]-values[0],d2=values[2]-values[1],d3=values[2]-values[0];out+=`<div class="history-cause-row"><span>${escapeHtml(cause)}</span>${values.map(v=>`<strong>${Hcount(v)}</strong>`).join('')}<strong class="history-cause-delta">${Hdelta(d1)}</strong><strong class="history-cause-delta">${Hdelta(d2)}</strong><strong class="history-cause-delta">${Hdelta(d3)}</strong></div>`}return out+'</div></section>'};const periodIntro=periods.map((period,i)=>{const label=['2 Minggu','1 Bulan','3 Bulan'][i],detail=period==='2 Minggu'?'dalam 2 minggu':period==='1 Bulan'?'dalam 1 bulan':'dalam 3 bulan';const ranked=s.causeNames.map(cause=>({cause,items:s.causeCountsByPeriod[label][cause]||0,suppliers:s.causeSupcoCountsByPeriod[label][cause]||0})).filter(x=>x.items>0).sort((a,b)=>b.items-a.items||a.cause.localeCompare(b.cause,'id'));return `<section class="history-summary-conclusion"><h4>Penyebab terbanyak penurunan STOCK ${period==='2 Minggu'?'dalam 2 minggu terakhir':period==='1 Bulan'?'dalam 1 bulan terakhir':'dalam 3 bulan terakhir'}:</h4><ul>${ranked.map(x=>`<li>${escapeHtml(x.cause)} ${detail} dengan <b>${Hcount(x.items)} item</b> atas <b>${Hcount(x.suppliers)} supplier</b></li>`).join('')||'<li>Tidak ada data penyebab.</li>'}</ul></section>`}).join('');H('historyCauseSummary').innerHTML=renderCauseTable('item','Jumlah Item per Keterangan')+renderCauseTable('supco','Jumlah SUPCO per Keterangan')+`<div class="history-summary-conclusions"><h4>Kesimpulan Ringkasan</h4>${periodIntro}</div>`;HrenderCharts();
 const topRows=s.topItems.slice(0,20).map((x,i)=>{const z=x._summary;return `<tr><td>${i+1}</td><td>${escapeHtml(x.PRDCD)}</td><td>${escapeHtml(x.DESC2)}</td><td>${escapeHtml(x.SUPCO)}</td><td>${Hval(z.START_STOCK_RP)}</td><td>${Hval(z.END_STOCK_RP)}</td><td>${Hval(z.STOCK_DECLINE_RP)}</td><td>${Hval(z.PERIOD3.poRp)}</td><td>${Hval(z.PERIOD3.bpbRp)}</td><td>${Hpercent(z.PERIOD3.sl)}</td><td>${escapeHtml(z.TREND3||'')}</td></tr>`}).join('');H('historyTopItems').querySelector('tbody').innerHTML=topRows||'<tr><td colspan="11">Tidak ada data.</td></tr>';
 const supHead=['No','SUPCO','SNAMA','Jumlah Item Turun','Total Penurunan (Rp)','STOCK OUT',...(s.topSupConclusionNames||[])];H('historyTopSup').querySelector('thead').innerHTML='<tr>'+supHead.map(x=>`<th>${escapeHtml(x)}</th>`).join('')+'</tr>';const supRows=s.topSup.slice(0,20).map((x,i)=>`<tr><td>${i+1}</td><td>${escapeHtml(x.SUPCO)}</td><td>${escapeHtml(x.SNAMA)}</td><td>${Hfmt(x.ITEM_TURUN)}</td><td>${Hval(x.TOTAL_TURUN_RP)}</td><td>${Hfmt(x.ITEM_STOCK_OUT)}</td>${(s.topSupConclusionNames||[]).map(c=>`<td>${Hcount(x.CONCLUSION_COUNTS?.[c]||0)}</td>`).join('')}</tr>`).join('');H('historyTopSup').querySelector('tbody').innerHTML=supRows||`<tr><td colspan="${6+(s.topSupConclusionNames||[]).length}">Tidak ada data.</td></tr>`;
 HrenderAnalysis();
 const soTable=H('historyStockOutSummary');if(soTable){soTable.querySelector('tbody').innerHTML=s.stockOutSummary.map((x,i)=>`<tr data-stockout-description="${escapeHtml(x.description)}"><td>${i+1}</td><td style="text-align:left">${escapeHtml(x.description)}</td><td>${Hcount(x.count)}</td></tr>`).join('')||'<tr><td colspan="3">Tidak ada item STOCK OUT berturut-turut.</td></tr>';}
 document.querySelectorAll('[data-history-page]').forEach((el,i)=>el.hidden=i!==0);document.querySelectorAll('[data-history-tab]').forEach((el,i)=>{el.classList.toggle('is-active',i===0);el.setAttribute('aria-selected',i===0?'true':'false')});}
async function Hexport(){if(!window.XLSX)throw Error('Pustaka Excel belum siap.');const s=Hstate,wb=XLSX.utils.book_new();const graf=[['Tanggal','PO 14 Hari (Rp)','BPB (Rp)','STOCK (Rp)','SL Supp (%)','Jumlah Item STOCK OUT','Nilai STOCK Item STOCK OUT (Rp)'],...s.totalByDate.map((x,i)=>[Hdate(x.date),x.po14Rp,x.bpbRp,x.stockRp,x.sl??'',s.stockOutTrend[i]?.count??0,s.stockOutTrend[i]?.valueRp??0])];const wsGraf=XLSX.utils.aoa_to_sheet(graf);wsGraf['!autofilter']={ref:`A1:G${graf.length}`};wsGraf['!cols']=[{wch:16},{wch:20},{wch:20},{wch:20},{wch:14},{wch:24},{wch:32}];XLSX.utils.book_append_sheet(wb,wsGraf,'Grafik');
 const fixed=['PRDCD','DESC2','ZONA','FRAC','ACOST','PKM','PKM Rp','MEAN','SUPCO','SNAMA'];const addHistorySheet=(name,field,header,mapper)=>{const rows=[[...fixed,...s.dates.map(Hdate)],...s.items.map(it=>[it.PRDCD,it.DESC2,it.ZONA,it.FRAC,it.ACOST,it.PKM,it.PKM*it.ACOST,it.MEAN,it.SUPCO,it.SNAMA,...it._daily.map(d=>mapper(d,it))])];const ws=XLSX.utils.aoa_to_sheet(rows);ws['!autofilter']={ref:`A1:${XLSX.utils.encode_col(fixed.length+s.dates.length-1)}${rows.length}`};ws['!cols']=[{wch:13},{wch:34},{wch:10},{wch:8},{wch:13},{wch:12},{wch:16},{wch:12},{wch:12},{wch:30},...s.dates.map(()=>({wch:13}))];XLSX.utils.book_append_sheet(wb,ws,name)};addHistorySheet('History Stock','stock','STOCK (Rp)',(d,it)=>d.stock===null?'':d.stock*it.ACOST);addHistorySheet('History Ptag','tag','PTAG',d=>d.tag||'');addHistorySheet('History BPB','bpb','BPB (Rp)',(d,it)=>d.bpb*it.ACOST);addHistorySheet('History SL','sl','SL Supplier (%)',d=>d.sl??'');{
 const headers=[...fixed,...s.dates.map(Hdate),'Periode','SL','Keterangan'];
 const rows=[headers,...s.items.map(it=>[it.PRDCD,it.DESC2,it.ZONA,it.FRAC,it.ACOST,it.PKM,it.PKM*it.ACOST,it.MEAN,it.SUPCO,it.SNAMA,...it._daily.map(d=>d.stock!==null&&it.MEAN!==null&&it.MEAN>0&&d.stock<it.MEAN&&HtagEligible(d.tag)?'Y':''),it._stockOutHistory?.period||'',it._stockOutHistory?(it._stockOutHistory.sl===null?'Tidak ada PO':it._stockOutHistory.sl):'',it._stockOutHistory?.description||''])];
 const ws=XLSX.utils.aoa_to_sheet(rows);ws['!autofilter']={ref:`A1:${XLSX.utils.encode_col(headers.length-1)}${rows.length}`};
 ws['!cols']=[{wch:13},{wch:34},{wch:10},{wch:8},{wch:13},{wch:12},{wch:16},{wch:12},{wch:12},{wch:30},...s.dates.map(()=>({wch:13})),{wch:14},{wch:16},{wch:58}];
 XLSX.utils.book_append_sheet(wb,ws,'History Stock Out');
}
{
 const rows=[['No','Keterangan','Jumlah Item'],...s.stockOutSummary.map((x,i)=>[i+1,x.description,x.count])];
 const ws=XLSX.utils.aoa_to_sheet(rows);ws['!autofilter']={ref:`A1:C${rows.length}`};ws['!cols']=[{wch:7},{wch:62},{wch:16}];
 XLSX.utils.book_append_sheet(wb,ws,'Ringkasan StockOut');
}
 const periods=['2 Minggu','1 Bulan','3 Bulan'];const ana=[['RINGKASAN JUMLAH ITEM PER KETERANGAN'],['Keterangan','2 Minggu','1 Bulan','3 Bulan','Selisih 1B−2M','Selisih 3B−1B','Selisih 3B−2M'],...s.causeNames.map(c=>[c,s.causeCountsByPeriod['2 Minggu'][c],s.causeCountsByPeriod['1 Bulan'][c],s.causeCountsByPeriod['3 Bulan'][c],s.causeVariances[c]['1 Bulan - 2 Minggu'],s.causeVariances[c]['3 Bulan - 1 Bulan'],s.causeVariances[c]['3 Bulan - 2 Minggu']]),[],['RINGKASAN JUMLAH SUPCO PER KETERANGAN'],['Keterangan','2 Minggu','1 Bulan','3 Bulan','Selisih 1B−2M','Selisih 3B−1B','Selisih 3B−2M'],...s.causeNames.map(c=>[c,s.causeSupcoCountsByPeriod['2 Minggu'][c],s.causeSupcoCountsByPeriod['1 Bulan'][c],s.causeSupcoCountsByPeriod['3 Bulan'][c],s.causeSupcoCountsByPeriod['1 Bulan'][c]-s.causeSupcoCountsByPeriod['2 Minggu'][c],s.causeSupcoCountsByPeriod['3 Bulan'][c]-s.causeSupcoCountsByPeriod['1 Bulan'][c],s.causeSupcoCountsByPeriod['3 Bulan'][c]-s.causeSupcoCountsByPeriod['2 Minggu'][c]]),[],['PRDCD','DESC2','ZONA','SUPCO','SNAMA','STOCK Awal (Rp)','STOCK Akhir (Rp)','Penurunan STOCK (Rp)','SL Awal 2 Minggu','SL 2 Minggu','Trend 2 Minggu','Kesimpulan 2 Minggu','SL Awal 1 Bulan','SL 1 Bulan','Trend 1 Bulan','Kesimpulan 1 Bulan','SL Awal 3 Bulan','SL 3 Bulan','Trend 3 Bulan','Kesimpulan 3 Bulan','SL 100% → STOCK OUT H+1']];const anaHeaderRow=ana.length;for(const x of s.analysisItems){const z=x._summary;ana.push([x.PRDCD,x.DESC2,x.ZONA,x.SUPCO,x.SNAMA,z.START_STOCK_RP,z.END_STOCK_RP,-z.STOCK_DECLINE_RP,z.PERIOD14_INITIAL.sl??'',z.PERIOD14.sl??'',Hstatus(z.PERIOD14),z.TREND14,z.PERIOD30_INITIAL.sl??'',z.PERIOD30.sl??'',Hstatus(z.PERIOD30),z.TREND30,z.PERIOD3_INITIAL.sl??'',z.PERIOD3.sl??'',Hstatus(z.PERIOD3),z.TREND3,z.FULL_RECEIPT_NEXTDAY])}const wsAna=XLSX.utils.aoa_to_sheet(ana);wsAna['!merges']=[{s:{r:0,c:0},e:{r:0,c:5}},{s:{r:s.causeNames.length+3,c:0},e:{r:s.causeNames.length+3,c:5}}];wsAna['!autofilter']={ref:`A${anaHeaderRow}:U${ana.length}`};wsAna['!cols']=[{wch:28},{wch:34},{wch:18},{wch:18},{wch:20},{wch:20},{wch:10},{wch:12},{wch:14},{wch:14},{wch:20},{wch:42},{wch:14},{wch:14},{wch:20},{wch:42},{wch:14},{wch:14},{wch:20},{wch:42},{wch:24}];XLSX.utils.book_append_sheet(wb,wsAna,'Analisa');

 const top=[['No','PRDCD','DESC2','ZONA','SUPCO','SNAMA','STOCK Awal (Rp)','STOCK Akhir (Rp)','Penurunan STOCK (Rp)','Perubahan STOCK (Rp)','STOCK OUT Days','PO 3 Bulan (Rp)','BPB 3 Bulan (Rp)','SL 3 Bulan (%)','Kesimpulan 3 Bulan'],...s.topItems.map((x,i)=>{const z=x._summary;return [i+1,x.PRDCD,x.DESC2,x.ZONA,x.SUPCO,x.SNAMA,z.START_STOCK_RP,z.END_STOCK_RP,-z.STOCK_DECLINE_RP,z.STOCK_CHANGE_RP,z.STOCK_OUT_DAYS,z.PERIOD3.poRp,z.PERIOD3.bpbRp,z.PERIOD3.sl??'',z.TREND3]})];const wsTop=XLSX.utils.aoa_to_sheet(top);wsTop['!autofilter']={ref:`A1:O${top.length}`};wsTop['!cols']=[{wch:7},{wch:13},{wch:34},{wch:10},{wch:12},{wch:28},...Array.from({length:8},()=>({wch:18})),{wch:44}];XLSX.utils.book_append_sheet(wb,wsTop,'50 Item Terbesar');const sup=[['No','SUPCO','SNAMA','JUMLAH ITEM TURUN','TOTAL PENURUNAN STOCK (Rp)','STOCK OUT',...(s.topSupConclusionNames||[])],...s.topSup.map((x,i)=>[i+1,x.SUPCO,x.SNAMA,x.ITEM_TURUN,-x.TOTAL_TURUN_RP,x.ITEM_STOCK_OUT,...(s.topSupConclusionNames||[]).map(c=>x.CONCLUSION_COUNTS?.[c]||0)])];const wsSup=XLSX.utils.aoa_to_sheet(sup);wsSup['!autofilter']={ref:`A1:${String.fromCharCode(64+sup[0].length)}${sup.length}`};wsSup['!cols']=[{wch:6},{wch:10},{wch:23},{wch:12},{wch:17},{wch:10},...(s.topSupConclusionNames||[]).map(()=>({wch:16}))];wsSup['!rows']=[{hpt:48}];XLSX.utils.book_append_sheet(wb,wsSup,'50 SUPCO Terbesar'); const summaryConclusion=[['KESIMPULAN PENYEBAB TERBANYAK PENURUNAN STOCK'],['Periode','No','Jenis Kesimpulan','Jumlah Item','Jumlah Supplier']];
 for(const [label,periodText] of [['2 Minggu','dalam 2 minggu'],['1 Bulan','dalam 1 bulan'],['3 Bulan','dalam 3 bulan']]){const ranked=s.causeNames.map(cause=>({cause,items:s.causeCountsByPeriod[label][cause]||0,suppliers:s.causeSupcoCountsByPeriod[label][cause]||0})).filter(x=>x.items>0).sort((a,b)=>b.items-a.items||a.cause.localeCompare(b.cause,'id'));if(!ranked.length)summaryConclusion.push([label,'','Tidak ada data penyebab.','','']);else ranked.forEach((x,i)=>summaryConclusion.push([label,i+1,x.cause,x.items,x.suppliers]));summaryConclusion.push([])}
 const wsConclusion=XLSX.utils.aoa_to_sheet(summaryConclusion);wsConclusion['!merges']=[{s:{r:0,c:0},e:{r:0,c:4}}];wsConclusion['!cols']=[{wch:16},{wch:7},{wch:48},{wch:16},{wch:18}];wsConclusion['!rows']=[{hpt:24},{hpt:30}];XLSX.utils.book_append_sheet(wb,wsConclusion,'Kesimpulan Ringkasan');const raw=XLSX.write(wb,{bookType:'xlsx',type:'array'});const blob=await HstyleWorkbook(new Blob([raw],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),s.dates.length+1);downloadBlob(`History Inventory ${Hdate(s.end).replaceAll(' ','-')}.xlsx`,blob)}
function HexcelTitle(t){return `<c:title><c:tx><c:rich><a:bodyPr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"/><a:p xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:pPr><a:defRPr/></a:pPr><a:r><a:t>${String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</a:t></a:r></a:p></c:rich></c:tx></c:title>`}
function HexcelChartXml(sheet,title,cols,lastRow){const ser=cols.map((col,i)=>`<c:ser><c:idx val="${i}"/><c:order val="${i}"/><c:tx><c:strRef><c:f>'${sheet}'!${String.fromCharCode(64+col)}1</c:f></c:strRef></c:tx><c:spPr><a:ln xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:prstDash val="solid"/></a:ln></c:spPr><c:marker><c:symbol val="none"/></c:marker><c:cat><c:strRef><c:f>'${sheet}'!$A$2:$A$${lastRow}</c:f></c:strRef></c:cat><c:val><c:numRef><c:f>'${sheet}'!$${String.fromCharCode(64+col)}$2:$${String.fromCharCode(64+col)}$${lastRow}</c:f></c:numRef></c:val></c:ser>`).join('');return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart>${HexcelTitle(title)}<c:plotArea><c:lineChart><c:grouping val="standard"/>${ser}<c:axId val="10"/><c:axId val="100"/></c:lineChart><c:catAx><c:axId val="10"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:axPos val="b"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:crossAx val="100"/><c:lblOffset val="100"/></c:catAx><c:valAx><c:axId val="100"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:axPos val="l"/><c:majorGridlines/><c:numFmt formatCode="#,##0" sourceLinked="1"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:crossAx val="10"/></c:valAx></c:plotArea><c:legend><c:legendPos val="b"/></c:legend><c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/></c:chart></c:chartSpace>`}
function HexcelDrawingXml(entries){return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">${entries.map((e,i)=>`<xdr:oneCellAnchor><xdr:from><xdr:col>0</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${e.row}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:ext cx="7200000" cy="3600000"/><xdr:graphicFrame><xdr:nvGraphicFramePr><xdr:cNvPr id="${i+1}" name="${e.name}"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr><xdr:xfrm/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="${e.rid}"/></a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/></xdr:oneCellAnchor>`).join('')}</xdr:wsDr>`}
async function HattachExcelCharts(zip,lastRow){const ct=await zip.file('[Content_Types].xml').async('string');let content=ct;for(const part of ['/xl/drawings/drawing1.xml','/xl/charts/chart1.xml','/xl/charts/chart2.xml','/xl/charts/chart3.xml']){const type=part.includes('/charts/')?'application/vnd.openxmlformats-officedocument.drawingml.chart+xml':'application/vnd.openxmlformats-officedocument.drawing+xml';content=content.replace('</Types>',`<Override PartName="${part}" ContentType="${type}"/></Types>`)}zip.file('[Content_Types].xml',content);
 const addSheet=(sheetNo,drawingNo,entries)=>{const path=`xl/worksheets/sheet${sheetNo}.xml`;let sh=zip.file(path).async('string');return sh.then(xml=>{if(!/xmlns:r=/.test(xml))xml=xml.replace('<worksheet ','<worksheet xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ');xml=xml.replace('</worksheet>','<drawing r:id="rId1"/></worksheet>');zip.file(path,xml);zip.file(`xl/worksheets/_rels/sheet${sheetNo}.xml.rels`,`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing${drawingNo}.xml"/></Relationships>`);zip.file(`xl/drawings/drawing${drawingNo}.xml`,HexcelDrawingXml(entries));zip.file(`xl/drawings/_rels/drawing${drawingNo}.xml.rels`,`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${entries.map(e=>`<Relationship Id="${e.rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/${e.chart}"/>`).join('')}</Relationships>`)});};
 zip.file('xl/charts/chart1.xml',HexcelChartXml('Grafik','Tren PO, BPB, dan STOCK (Rp)',[2,3,4],lastRow));zip.file('xl/charts/chart2.xml',HexcelChartXml('Grafik','Jumlah Item STOCK OUT',[6],lastRow));zip.file('xl/charts/chart3.xml',HexcelChartXml('Grafik','Nilai STOCK Item STOCK OUT (Rp)',[7],lastRow));await addSheet(1,1,[{row:lastRow+2,rid:'rId1',chart:'chart1.xml',name:'PO BPB STOCK'},{row:lastRow+22,rid:'rId2',chart:'chart2.xml',name:'Jumlah Item STOCK OUT'},{row:lastRow+42,rid:'rId3',chart:'chart3.xml',name:'Nilai STOCK STOCK OUT'}]);}
async function HstyleWorkbook(blob,chartLastRow){
 const zip=await JSZip.loadAsync(blob),stylePath='xl/styles.xml';let xml=await zip.file(stylePath).async('string');
 const nfmt='<numFmt numFmtId="164" formatCode="#,##0;[Red](#,##0);-"/><numFmt numFmtId="165" formatCode="0&quot;%&quot;;[Red](0&quot;%&quot;);0&quot;%&quot;"/>';
 if(xml.includes('</numFmts>')){xml=xml.replace('</numFmts>',nfmt+'</numFmts>');xml=xml.replace(/<numFmts count="(\d+)"/,(_,n)=>`<numFmts count="${+n+2}"`)}else xml=xml.replace('<fonts',`<numFmts count="2">${nfmt}</numFmts><fonts`);
 xml=xml.replace(/<fonts count="(\d+)"/,(_,n)=>`<fonts count="${+n+1}"`).replace('</fonts>','<font><b/><color rgb="FFFFFFFF"/><sz val="10"/><name val="Arial"/></font></fonts>');
 xml=xml.replace(/<fills count="(\d+)"/,(_,n)=>`<fills count="${+n+1}"`).replace('</fills>','<fill><patternFill patternType="solid"><fgColor rgb="FF174A2A"/><bgColor indexed="64"/></patternFill></fill></fills>');
 xml=xml.replace(/<cellXfs count="(\d+)"/,(_,n)=>`<cellXfs count="${+n+5}"`).replace('</cellXfs>','<xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="164" fontId="0" fillId="0" borderId="0" applyNumberFormat="1" applyAlignment="1"><alignment horizontal="right"/></xf><xf numFmtId="165" fontId="0" fillId="0" borderId="0" applyNumberFormat="1" applyAlignment="1"><alignment horizontal="center"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyAlignment="1"><alignment horizontal="center"/></xf><xf numFmtId="164" fontId="0" fillId="0" borderId="0" applyNumberFormat="1" applyAlignment="1"><alignment horizontal="right"/></xf></cellXfs>');
 zip.file(stylePath,xml);
 const sheetFiles=Object.keys(zip.files).filter(x=>/^xl\/worksheets\/sheet\d+\.xml$/.test(x)).sort((a,b)=>+(a.match(/sheet(\d+)/)[1])-(+(b.match(/sheet(\d+)/)[1])));
 for(let si=0;si<sheetFiles.length;si++){
  const f=sheetFiles[si];let sh=await zip.file(f).async('string');
  const headerRows=new Set([1]);
  const percentCols=si===0?new Set([5]):si===4?new Set(Array.from({length:Math.max(0,chartLastRow-1)},(_,i)=>11+i)):si===6?new Set([9,13,17]):si===7?new Set([14]):new Set();
  const centerCols=si===2?new Set([3]):si===4?new Set([2]):si===6?new Set([3,4,5,11,15,19]):si===7?new Set([1,4,5,11,14]):si===8?new Set([1,2,3,4,5,6]):new Set();
  sh=sh.replace(/<row\b([^>]*)>([\s\S]*?)<\/row>/g,(whole,attrs,inner)=>{
   const rn=+(attrs.match(/\br="(\d+)"/)||[])[1]||0;
   inner=inner.replace(/<c\b([^>]*)>([\s\S]*?)<\/c>/g,(cell,at,body)=>{
    const ref=(at.match(/\br="([A-Z]+)(\d+)"/)||[]),col=ref[1]||'';const ci=col.split('').reduce((v,c)=>v*26+c.charCodeAt(0)-64,0);
    let st=0;if(headerRows.has(rn))st=1;else if(percentCols.has(ci)&&body.includes('<v>')&&!/\bt="s"/.test(at))st=3;else if(centerCols.has(ci))st=4;else if(body.includes('<v>')&&!/\bt="s"/.test(at))st=2;
    return `<c${at.replace(/\s+s="\d+"/g,'')} s="${st}">${body}</c>`;
   });return `<row${attrs}>${inner}</row>`;
  });zip.file(f,sh);
 }
 await HattachExcelCharts(zip,chartLastRow);
 return await zip.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',compression:'DEFLATE',compressionOptions:{level:3}});
}
async function Hrun(){if(!files.some(f=>f.guess==='prod'&&f.content)){setStatus('History membutuhkan PRODMAST. Silakan unggah melalui Daftar File.',true);openFileManager('allFiles');return}const busy=PROCESS_BUTTONS.some(id=>$(id).disabled);if(busy)return;PROCESS_BUTTONS.forEach(id=>$(id).disabled=true);H('historyBtn').disabled=true;setStatus('History: membaca PRODMAST, STM, REG, dan POM…',false,true);updateHomeProgress('History: menyiapkan sumber data…',null,true);try{await window.checkItemEnsureXLSX();await new Promise(r=>setTimeout(r,30));Hstate=await Hbuild((label,pct)=>updateHomeProgress(label,pct,true));Hpage=0;Hrender();H('historyDialog').showModal();setStatus(`History selesai diproses: ${Hstate.items.length.toLocaleString('id-ID')} item.`,false);updateHomeProgress('History selesai',100,true)}catch(e){console.error(e);setStatus('History gagal: '+(e.message||String(e)),true);updateHomeProgress('History gagal',100,true)}finally{PROCESS_BUTTONS.forEach(id=>$(id).disabled=false);H('historyBtn').disabled=false;setTimeout(()=>updateHomeProgress('',0,false),3500)}}
function HshowStockOutDetails(description){const s=Hstate,panel=H('historyStockOutDetailPanel'),table=H('historyStockOutDetail');if(!panel||!table)return;const matches=s.stockOutItems.filter(x=>x.description===description);H('historyStockOutDetailTitle').textContent=`${description} • ${matches.length.toLocaleString('id-ID')} item`;table.querySelector('tbody').innerHTML=matches.map(({item,period,sl,description:desc})=>{const last=item._daily[item._daily.length-1]||{};return `<tr><td>${escapeHtml(item.PRDCD)}</td><td>${escapeHtml(item.DESC2)}</td><td>${escapeHtml(item.SUPCO)}</td><td>${escapeHtml(item.SNAMA)}</td><td>${escapeHtml(last.tag||'-')}</td><td>${Hfmt(last.stock??0)}</td><td>${escapeHtml(period||'')}</td><td>${sl===null?'Tidak ada PO':Hpercent(sl)}</td><td>${escapeHtml(desc||'')}</td></tr>`}).join('')||'<tr><td colspan="9">Tidak ada item.</td></tr>';panel.hidden=false;const btn=H('historyStockOutExportJpeg');if(btn)btn.disabled=!matches.length;panel.dataset.description=description;}
function HexportStockOutJpeg(){const panel=H('historyStockOutDetailPanel');if(!panel||panel.hidden)throw Error('Pilih keterangan dan tampilkan daftar item terlebih dahulu.');const table=H('historyStockOutDetail'),rows=[...table.querySelectorAll('tr')].map(tr=>[...tr.children].map(td=>td.textContent.trim())),title=H('historyStockOutDetailTitle').textContent;const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),pad=28,rowH=34,widths=[105,220,100,180,70,90,100,100,310],width=widths.reduce((a,b)=>a+b,0)+pad*2;const wrap=(txt,max)=>{const words=String(txt).split(/\s+/),lines=[];let line='';for(const w of words){const test=line?line+' '+w:w;if(ctx.measureText(test).width>max&&line){lines.push(line);line=w}else line=test}lines.push(line);return lines};ctx.font='bold 22px Arial';const titleLines=wrap(title,width-pad*2);ctx.font='14px Arial';let totalH=pad+titleLines.length*30+18;for(let r=0;r<rows.length;r++){let maxLines=1;rows[r].forEach((v,c)=>{maxLines=Math.max(maxLines,wrap(v,widths[c]-14).length)});totalH+=Math.max(rowH,maxLines*18+12)}canvas.width=width;canvas.height=totalH+pad;ctx.fillStyle='#ffffff';ctx.fillRect(0,0,width,canvas.height);ctx.fillStyle='#123c25';ctx.font='bold 22px Arial';let y=pad+22;titleLines.forEach(line=>{ctx.fillText(line,pad,y);y+=30});y+=8;for(let r=0;r<rows.length;r++){const isHead=r===0;ctx.fillStyle=isHead?'#174a2a':(r%2?'#f1f6f1':'#ffffff');let maxLines=1;rows[r].forEach((v,c)=>{maxLines=Math.max(maxLines,wrap(v,widths[c]-14).length)});const h=Math.max(rowH,maxLines*18+12);ctx.fillRect(pad,y,width-pad*2,h);let x=pad;rows[r].forEach((v,c)=>{ctx.fillStyle=isHead?'#ffffff':'#15251a';ctx.font=isHead?'bold 13px Arial':'13px Arial';const lines=wrap(v,widths[c]-14);lines.forEach((line,i)=>ctx.fillText(line,x+7,y+21+i*17));x+=widths[c]});ctx.strokeStyle='#cbd8cc';ctx.strokeRect(pad,y,width-pad*2,h);y+=h}const a=document.createElement('a');a.download='Ringkasan-StockOut.jpg';a.href=canvas.toDataURL('image/jpeg',.92);a.click();}
function Hinit(){H('historyBtn').addEventListener('click',Hrun);H('historyClose').addEventListener('click',()=>H('historyDialog').close());H('historyExport').addEventListener('click',async()=>{try{H('historyExport').disabled=true;await Hexport();setStatus('Export History berhasil dibuat.',false)}catch(e){setStatus('Export History gagal: '+e.message,true)}finally{H('historyExport').disabled=false}});H('historyAnalysisPeriodFilter').addEventListener('change',()=>{H('historyAnalysisConclusionFilter').value='';HrenderAnalysis()});H('historyAnalysisConclusionFilter').addEventListener('change',HrenderAnalysis);document.querySelectorAll('[data-history-tab]').forEach(btn=>btn.addEventListener('click',()=>{const key=btn.dataset.historyTab;document.querySelectorAll('[data-history-page]').forEach(page=>page.hidden=page.dataset.historyPage!==key);document.querySelectorAll('[data-history-tab]').forEach(tab=>{const active=tab===btn;tab.classList.toggle('is-active',active);tab.setAttribute('aria-selected',active?'true':'false')})}));H('historyStockOutSummary').querySelector('tbody').addEventListener('click',e=>{const row=e.target.closest('tr[data-stockout-description]');if(row)HshowStockOutDetails(row.dataset.stockoutDescription)});H('historyStockOutDetailClose').addEventListener('click',()=>{H('historyStockOutDetailPanel').hidden=true});H('historyStockOutExportJpeg').addEventListener('click',()=>{try{HexportStockOutJpeg()}catch(e){setStatus(e.message,true)}})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',Hinit);else Hinit();
})();
