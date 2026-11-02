/* Pengeksport DOCX dan PDF/cetak berasaskan template AMILIN. */
const docKinds={program:{label:"Laporan Program"},minutes:{label:"Minit Mesyuarat"}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const notify=msg=>toast(msg);
const lines=v=>esc(v||"—").replace(/\r?\n/g,"<br>");
function printStyles(){return `
@page{size:A4;margin:17mm 16mm}*{box-sizing:border-box}body{font:12px/1.5 Arial,sans-serif;color:#192f39;margin:0;background:white}
h1{font-size:22px;margin:5px 0 0}h2{font-size:15px;margin:18px 0 7px;border-bottom:1px solid #bfd5d7;padding-bottom:5px}p{white-space:pre-wrap;margin:6px 0}table{width:100%;border-collapse:collapse;margin:10px 0}td,th{border:1px solid #a9bfc9;padding:7px 8px;vertical-align:top;text-align:left;white-space:pre-wrap}th{background:#edf5f4;width:26%}.banner{border-bottom:3px solid #46236D;padding-bottom:12px;margin-bottom:17px}.banner-main{display:flex;gap:14px;align-items:center}.logo-img{width:66px;height:66px;object-fit:contain;flex-shrink:0}.logo{font-size:21px;font-weight:800;letter-spacing:2px;color:#0d626b}.meta{font-size:11px;color:#48616d}.tag{font-weight:bold;color:#087c7a;text-transform:uppercase;font-size:12px}.signs{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:30px}.sign{padding-top:33px;border-top:1px solid #687f8a}.appendix{break-before:page;page-break-before:always}.photos{display:grid;grid-template-columns:1fr 1fr;gap:12px}.photo{border:1px solid #ccd7da;padding:6px;break-inside:avoid}.photo img{width:100%;height:160px;object-fit:contain}.photo div{font-size:10px;color:#60717b}.feedback-img{max-width:100%;max-height:500px;object-fit:contain}.watermark{position:fixed;left:0;right:0;bottom:0;font-size:9px;color:#9b4c3c;margin:0;border-top:1px solid #eee;padding-top:6px;background:#fff}.agenda-block{break-inside:avoid;margin:12px 0}.agenda-block h3{font-size:12px;margin:0 0 6px}.agenda-block p{margin:2px 0}.keep{break-inside:avoid}`;}
function documentBody(doc){
 const f=doc.fields||{};const isProgram=doc.kind==='program';
 const td=(label,value)=>`<tr><th>${esc(label)}</th><td>${lines(value)}</td></tr>`;
 const header=`<div class="banner"><div class="banner-main"><img class="logo-img" src="${MEDISTA_LOGO_DATA}" alt="Logo MEDISTA"><div><div class="logo">MEDISTA</div><div class="meta">MEDISTA MANAGEMENT SYSTEM · DOKUMEN RASMI</div><h1>${isProgram?'LAPORAN PROGRAM':'MINIT MESYUARAT'}</h1></div></div></div>`;
 const sig=`<div class="signs"><div class="sign"><b>Disediakan oleh</b><p>${lines(f.preparedBy)}</p><p>${lines(f.preparedPosition)}</p><p>Tarikh: __________________</p></div><div class="sign"><b>Disemak oleh</b><p>${lines(f.reviewedBy)}</p><p>${lines(f.reviewedPosition)}</p><p>Tarikh: __________________</p></div></div>`;
 const wm=`<p class="watermark">Dokumen sistem — Sila sahkan dengan tandatangan pegawai yang berkenaan. Rujukan: ${esc(doc.id||'DRAF')} · ${esc(doc.status)}</p>`;
 if(isProgram){
  const imgs=(doc.images||[]).filter(x=>x.kind==='photo');const feedback=(doc.images||[]).find(x=>x.kind==='feedback');
  const photos=Array.from({length:6},(_,i)=>`<div class="photo">${imgs[i]?`<img src="${imgs[i].data}" alt="Gambar ${i+1}"><div>Gambar ${i+1} — ${esc(imgs[i].name)}</div>`:`<div style="height:160px;display:grid;place-items:center;background:#f7fafb;color:#9caeb5">Ruang gambar ${i+1}</div>`}</div>`).join('');
  return `${header}<div class="tag">Butiran Program</div><table>${td('Tajuk Program',f.programTitle)}${td('Tarikh',f.programDate)}${td('Tempat',f.programPlace)}${td('Kehadiran',f.attendance)}${td('Bajet Program',f.budget)}${td('Tentatif Program',f.tentative)}${td('Permasalahan',f.issues)}${td('Cadangan Penambahbaikan',f.improvement)}</table>${sig}${wm}<div class="appendix"><h2>LAMPIRAN 1 — GAMBAR PROGRAM (6 KEPING)</h2><div class="photos">${photos}</div></div><div class="appendix"><h2>LAMPIRAN 2 — MAKLUM BALAS PESERTA</h2><table>${td('Bilangan Responden',f.feedbackResponses)}${td('Skor Purata / Penilaian',f.feedbackAverage)}${td('Ringkasan Maklum Balas',f.feedbackText)}</table>${feedback?`<img class="feedback-img" src="${feedback.data}" alt="Graf maklum balas">`:'<p>Ruang graf atau carta maklum balas peserta.</p>'}</div>`;
 }
 const attendees=Array.from({length:15},(_,i)=>({n:f['attName'+i],p:f['attPosition'+i],s:f['attStatus'+i]})).filter(x=>x.n||x.p||x.s);
 const attRows=attendees.map((x,i)=>`<tr><td>${i+1}</td><td>${lines(x.n)}</td><td>${lines(x.p)}</td><td>${lines(x.s)}</td></tr>`).join('')||'<tr><td colspan="4">Belum diisi</td></tr>';
 const agendas=Array.from({length:8},(_,i)=>({n:i+1,t:f['agendaTitle'+i],d:f['agendaNotes'+i],a:f['agendaAction'+i]})).filter(x=>x.t||x.d||x.a);
 const ag=agendas.map(x=>`<div class="agenda-block"><h3>${x.n}. ${esc(x.t)}</h3><p><b>Perbincangan / Keputusan:</b> ${lines(x.d)}</p><p><b>Tindakan:</b> ${lines(x.a)}</p></div>`).join('');
 return `${header}<div class="tag">Butiran Mesyuarat</div><table>${td('Bil',f.meetingNo)}${td('Tarikh',f.meetingDate)}${td('Masa',f.meetingTime)}${td('Tempat',f.meetingPlace)}${td('Perkara',f.meetingSubject)}</table><h2>KEHADIRAN</h2><table><thead><tr><th>Bil</th><th>Nama</th><th>Jawatan</th><th>Kehadiran</th></tr></thead><tbody>${attRows}</tbody></table><h2>BIL / AGENDA / TINDAKAN</h2>${ag}${sig}${wm}`;
}
function printDocument(doc){
 const html=`<!doctype html><html lang="ms"><head><meta charset="utf-8"><title>${esc(docKinds[doc.kind].label)} ${esc(doc.id)}</title><style>${printStyles()}</style></head><body>${documentBody(doc)}<script>window.addEventListener('load',()=>{setTimeout(()=>{window.focus();window.print()},250)});<\/script></body></html>`;
 const win=window.open('','_blank');if(win){win.document.open();win.document.write(html);win.document.close();notify('Dalam dialog cetak, pilih “Save as PDF” / “Simpan sebagai PDF”.');}
 else{const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`${doc.id}-cetak.html`;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);notify('Popup disekat: fail HTML cetakan dimuat turun. Buka dan pilih Cetak > PDF.');}
}

/* Offline, standards-compliant DOCX export. ZIP files use STORED entries to avoid external CDNs. */
const xmlEsc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const wp=(text,opts={})=>{
 let st=`<w:rPr>${opts.bold?'<w:b/>':''}<w:sz w:val="${opts.size||20}"/>${opts.color?`<w:color w:val="${opts.color}"/>`:''}</w:rPr>`;
 const paras=String(text??'').split(/\r?\n/);
 return `<w:p><w:pPr>${opts.heading?`<w:spacing w:before="240" w:after="100"/><w:keepNext/>`:''}</w:pPr><w:r>${st}${paras.map((p,i)=>`${i?'<w:br/>':''}<w:t xml:space="preserve">${xmlEsc(p||' ')}</w:t>`).join('')}</w:r></w:p>`;
};
function wt(rows){return `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="5" w:color="B7C9CD"/><w:left w:val="single" w:sz="5" w:color="B7C9CD"/><w:bottom w:val="single" w:sz="5" w:color="B7C9CD"/><w:right w:val="single" w:sz="5" w:color="B7C9CD"/><w:insideH w:val="single" w:sz="5" w:color="B7C9CD"/><w:insideV w:val="single" w:sz="5" w:color="B7C9CD"/></w:tblBorders></w:tblPr>${rows.map(row=>`<w:tr>${row.map((cell,i)=>`<w:tc><w:tcPr><w:tcW w:w="${i===0?3100:6100}" w:type="dxa"/></w:tcPr>${wp(cell,{bold:i===0,size:19})}</w:tc>`).join('')}</w:tr>`).join('')}</w:tbl>`;}
const pageBreak=()=>'<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
function getImgBuffer(img){const b64=img.data.split(',')[1]||'';const bin=atob(b64);const bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);return bytes;}
function imageParagraph(image,rid,n,maxWidth=4600000,maxHeight=2800000){const w=Math.min(maxWidth,maxWidth*Math.max(0.1,image.width/image.height));const h=Math.min(maxHeight,w*image.height/image.width);const cx=Math.round(Math.min(w,h*image.width/image.height));const cy=Math.round(Math.min(h,cx*image.height/image.width));return `<w:p><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${n}" name="Imej ${n}"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="${n}" name="Imej ${n}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;}
function docxParts(doc){
 const f=doc.fields||{};const imgs=(doc.images||[]);let parts=[];let relationships=[];let imageFiles=[];
 const heading=(t)=>wp(t,{heading:true,bold:true,size:26,color:'46236D'});
 const row=(key,value)=>[key,String(value||'—')];
 const logoImg={data:MEDISTA_LOGO_DATA,width:500,height:500};
 imageFiles.push({name:'medista-logo.png',bytes:getImgBuffer(logoImg)});
 relationships.push({id:'rIdLogo',target:'media/medista-logo.png'});
 parts.push(imageParagraph(logoImg,'rIdLogo',1,880000,880000));
 parts.push(wp('MEDISTA',{bold:true,size:35,color:'46236D'}));
 parts.push(wp(doc.kind==='program'?'LAPORAN PROGRAM':'MINIT MESYUARAT',{bold:true,size:29}));
 parts.push(wp('MEDISTA MANAGEMENT SYSTEM • DOKUMEN RASMI',{size:17,color:'72858C'}));
 if(doc.kind==='program'){
  parts.push(heading('BUTIRAN PROGRAM'));
  parts.push(wt([row('Tajuk Program',f.programTitle),row('Tarikh',f.programDate),row('Tempat',f.programPlace),row('Kehadiran',f.attendance),row('Bajet Program',f.budget),row('Tentatif Program',f.tentative),row('Permasalahan',f.issues),row('Cadangan Penambahbaikan',f.improvement)]));
 }else{
  parts.push(heading('BUTIRAN MESYUARAT'));
  parts.push(wt([row('Bil',f.meetingNo),row('Tarikh',f.meetingDate),row('Masa',f.meetingTime),row('Tempat',f.meetingPlace),row('Perkara',f.meetingSubject)]));
  parts.push(heading('KEHADIRAN'));
  const at=Array.from({length:15},(_,i)=>[String(i+1),f['attName'+i]||'',f['attPosition'+i]||'',f['attStatus'+i]||'']).filter(x=>x.some(Boolean));
  parts.push(wt([['Bil','Nama','Jawatan','Kehadiran'],...at]));
  parts.push(heading('BIL / AGENDA / TINDAKAN'));
  Array.from({length:8},(_,i)=>({n:i+1,t:f['agendaTitle'+i],d:f['agendaNotes'+i],a:f['agendaAction'+i]})).filter(x=>x.t||x.d||x.a).forEach(x=>{
   parts.push(wp(`${x.n}. ${x.t||'Agenda'}`,{bold:true,size:23}));parts.push(wp('Perbincangan / Keputusan: '+(x.d||'—')));parts.push(wp('Tindakan: '+(x.a||'—')));
  });
 }
 parts.push(heading('PENGESAHAN'));
 parts.push(wt([row('Disediakan oleh',f.preparedBy),row('Jawatan',f.preparedPosition),row('Tandatangan / Tarikh','__________________________________'),row('Disemak oleh',f.reviewedBy),row('Jawatan penyemak',f.reviewedPosition),row('Tandatangan / Tarikh','__________________________________')]));
 parts.push(wp('Pengesahan tertakluk kepada tandatangan dan semakan rasmi. '+doc.id,{size:16,color:'A05040'}));
 if(doc.kind==='program'){
  parts.push(pageBreak());parts.push(heading('LAMPIRAN 1 — GAMBAR PROGRAM (6 KEPING)'));
  const photos=imgs.filter(x=>x.kind==='photo');
  for(let i=0;i<6;i++){
   const photo=photos[i];parts.push(wp('Gambar '+(i+1)+(photo?' — '+photo.name:''),{bold:true,size:19}));
   if(photo){const id=imageFiles.length+1;imageFiles.push({name:`image${id}.jpg`,bytes:getImgBuffer(photo)});relationships.push({id:'rId'+id,target:`media/image${id}.jpg`});parts.push(imageParagraph(photo,'rId'+id,id));}
   else parts.push(wp('[Ruang gambar '+(i+1)+']'));
  }
  parts.push(pageBreak());parts.push(heading('LAMPIRAN 2 — MAKLUM BALAS PESERTA'));
  parts.push(wt([row('Bilangan Responden',f.feedbackResponses),row('Skor Purata / Penilaian',f.feedbackAverage),row('Ringkasan Maklum Balas',f.feedbackText)]));
  const feedback=imgs.find(x=>x.kind==='feedback');if(feedback){const id=imageFiles.length+1;imageFiles.push({name:`image${id}.jpg`,bytes:getImgBuffer(feedback)});relationships.push({id:'rId'+id,target:`media/image${id}.jpg`});parts.push(imageParagraph(feedback,'rId'+id,id));}
  else parts.push(wp('[Ruang carta maklum balas peserta]'));
 }
 parts.push(`<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1040" w:right="1050" w:bottom="1040" w:left="1050" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>`);
 const documentXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>${parts.join('')}</w:body></w:document>`;
 const rels=`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relationships.map(r=>`<Relationship Id="${r.id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${r.target}"/>`).join('')}</Relationships>`;
 const types=`<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpg" ContentType="image/jpeg"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;
 const mainrels=`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
 return {'[Content_Types].xml':types,'_rels/.rels':mainrels,'word/document.xml':documentXml,'word/_rels/document.xml.rels':rels,...Object.fromEntries(imageFiles.map(x=>['word/media/'+x.name,x.bytes]))};
}
function write16(a,i,x){a[i]=x&255;a[i+1]=(x>>>8)&255;}
function write32(a,i,x){write16(a,i,x&65535);write16(a,i+2,(x>>>16)&65535);}
const textBytes=(s)=>new TextEncoder().encode(s);
function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^(0xedb88320&-(c&1));}return(c^0xffffffff)>>>0;}
function zipStore(parts){
 const chunks=[],dirs=[];let offset=0;
 const push=b=>{chunks.push(b);offset+=b.length;};
 for(const [name,value] of Object.entries(parts)){
  const n=textBytes(name);const b=typeof value==='string'?textBytes(value):value;const crc=crc32(b);const start=offset;const h=new Uint8Array(30+n.length);write32(h,0,0x04034b50);write16(h,4,20);write16(h,6,0x0800);write16(h,8,0);write32(h,14,crc);write32(h,18,b.length);write32(h,22,b.length);write16(h,26,n.length);h.set(n,30);push(h);push(b);
  const cd=new Uint8Array(46+n.length);write32(cd,0,0x02014b50);write16(cd,4,20);write16(cd,6,20);write16(cd,8,0x0800);write32(cd,16,crc);write32(cd,20,b.length);write32(cd,24,b.length);write16(cd,28,n.length);write32(cd,42,start);cd.set(n,46);dirs.push(cd);
 }
 const cdStart=offset;dirs.forEach(push);const end=new Uint8Array(22);write32(end,0,0x06054b50);write16(end,8,dirs.length);write16(end,10,dirs.length);write32(end,12,offset-cdStart);write32(end,16,cdStart);push(end);
 return new Blob(chunks,{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
}
function downloadWord(doc){
 try{
  const blob=zipStore(docxParts(doc));const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`MEDISTA_${doc.id}_${doc.kind==='program'?'Laporan_Program':'Minit_Mesyuarat'}.docx`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);notify('Dokumen Word (.docx) berjaya disediakan.');
 }catch(e){console.error('DOCX generation failed',e);notify('Gagal menjana Word. Cuba simpan draf semula.');}
}
