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
  {key:'master',title:'Master Stock dari Inventory',ready:masterReady,count:masterCount,detail:'Dibentuk dari sumber Master Stock Inventory'},
  {key:'plu',title:'PLU.csv — kategori Bahan',ready:!!(src.plu&&src.plu.rawRows.length),count:src.plu?.rawRows?.length||0,detail:src.plu?.name||'Belum diunggah'},
  {key:'lpp',title:'LPP vs Plano — sumber Inventory',ready:!!(src.lpp&&src.lpp.rawRows.length),count:src.lpp?.rawRows?.length||0,detail:src.lpp?.name||'Belum diunggah'},
  {key:'display',title:'Listing Planogram Display — Tarikan LWA',ready:!!(src.display&&src.display.rawRows.length),count:src.display?.rawRows?.length||0,detail:src.display?.name||'Belum diunggah'},
  {key:'storage',title:'Listing Planogram Storage — Tarikan LWA',ready:!!(src.storage&&src.storage.rawRows.length),count:src.storage?.rawRows?.length||0,detail:src.storage?.name||'Belum diunggah'}
 ];
 return {src,defs,ready:defs.every(x=>x.ready)};
}
function renderSourceState(){
 const state=sourceState(),box=$rm('rawMaterialSources');
 box.innerHTML=state.defs.map(x=>`<div class="raw-source-row ${x.ready?'is-ready':'is-missing'}"><span class="raw-source-mark">${x.ready?'✓':'!'}</span><div class="raw-source-copy"><strong>${x.title}</strong><small>${x.ready?`${x.count.toLocaleString('id-ID')} baris · ${x.detail}`:x.detail}</small></div><span class="raw-source-state">${x.ready?'SIAP':'BELUM ADA'}</span></div>`).join('');
 const missing=state.defs.filter(x=>!x.ready);
 $rm('rawMaterialProcess').disabled=!state.ready;
 $rm('rawMaterialStatus').textContent=state.ready?'Semua sumber lengkap. Tekan Proses Raw Material untuk menghitung dua tabel.':`Belum lengkap: ${missing.map(x=>x.title).join(', ')}.`;
 return state;
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
function exportAOA(aoa,filename,merges){if(!aoa||aoa.length<2){$rm('rawMaterialStatus').textContent='Belum ada data untuk diekspor.';return}const ws=XLSX.utils.aoa_to_sheet(aoa);if(merges&&merges.length)ws['!merges']=merges.map(m=>({s:m.s,e:m.e}));const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Sheet1');XLSX.writeFile(wb,filename)}
async function runRawMaterial(){
 const state=renderSourceState();$rm('rawMaterialResults').hidden=true;
 if(!state.ready){$rm('rawMaterialDialog').showModal();return}
 const btn=$rm('rawMaterialBtn');if(typeof beginProcess==='function'&&!beginProcess('rawMaterialBtn'))return;
 $rm('rawMaterialDialog').showModal();$rm('rawMaterialStatus').textContent='Membentuk Master Stock dari Inventory dan menghitung Raw Material…';$rm('rawMaterialProcess').disabled=true;
 try{
  if(typeof checkItemEnsureXLSX==='function')await checkItemEnsureXLSX();
  const masterData=getInventoryMaster();
  const master=masterData.map(r=>({PRDCD:r[0],DESC2:r[1],ALAMAT:r[8],FRAC:r[15]}));
  const current=sourceState().src;
  const src={master,lpp:current.lpp.rawRows,display:current.display.rawRows,storage:current.storage.rawRows,plu:current.plu.rawRows};
  const result=buildResult(src);lastResult=result;renderResult(result);
  $rm('rawMaterialResults').hidden=false;$rm('rawMaterialStatus').textContent=`Selesai. ${result.summary.length.toLocaleString('id-ID')} item masuk Rekap dan ${result.detail.length.toLocaleString('id-ID')} baris Detail.`;
  $rm('rawMaterialResults').scrollIntoView({behavior:'smooth',block:'nearest'});
 }catch(e){console.error(e);$rm('rawMaterialStatus').textContent='Proses gagal: '+(e.message||String(e));}
 finally{$rm('rawMaterialProcess').disabled=!sourceState().ready;if(typeof endProcess==='function')endProcess()}
}
function init(){
 if(typeof window.XLSX==='undefined'&&typeof checkItemEnsureXLSX==='function'){}
 $rm('rawMaterialBtn').addEventListener('click',runRawMaterial);
 $rm('rawMaterialProcess').addEventListener('click',runRawMaterial);
 $rm('rawMaterialClose').addEventListener('click',()=>$rm('rawMaterialDialog').close());
 $rm('rawMaterialOpenFiles').addEventListener('click',()=>{$rm('rawMaterialDialog').close();openFileManager('allFiles')});
 $rm('rmExportSummary').addEventListener('click',()=>exportAOA(lastSummaryAOA,'Rekap_Item.xlsx'));
 $rm('rmExportDetail').addEventListener('click',()=>exportAOA(lastDetailAOA,'Detail_Display_Storage.xlsx',lastDetailMerges));
 document.querySelectorAll('[data-rm-tab]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-rm-tab]').forEach(x=>x.classList.toggle('active',x===b));$rm('rmSummaryPanel').hidden=b.dataset.rmTab!=='summary';$rm('rmDetailPanel').hidden=b.dataset.rmTab!=='detail'}));
 $rm('rawMaterialDialog').addEventListener('close',()=>{$rm('rawMaterialResults').hidden=true});
}
function initWithInventory(api){getInventoryFiles=api.getFiles;getInventoryMaster=api.getMasterRows;getInventoryMasterCount=api.getMasterCount;init();renderSourceState()}
window.InventoryRawMaterial={detectText,detectBuffer,refresh:renderSourceState,init:initWithInventory,buildResult};
if(typeof files!=='undefined'&&typeof allRows==='function'&&typeof processData==='function'){initWithInventory({getFiles:()=>files,getMasterCount:()=>allRows('prod').length,getMasterRows:()=>{if(!allRows('prod').length)throw new Error('File PRODMAST belum tersedia di Inventory.');return processData(new Date()).data;}})}
})();
