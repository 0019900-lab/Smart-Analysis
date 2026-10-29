// عارض النتائج – جداول بتنسيق APA + نسخ
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const ar=()=>document.documentElement.lang==='ar';
function tableHTML(t){const lc=t.lc||1;
 let h=`<div class="tbw"><div class="cap"><span>${esc(t.cap)}</span><button class="cp" title="Copy">⧉</button></div><div class="tw"><table class="ot"><thead><tr>${t.head.map((x,i)=>`<th class="${i<lc?'l':''}">${esc(x)}</th>`).join('')}</tr></thead><tbody>`;
 for(const r of t.rows)h+='<tr>'+r.map((x,i)=>`<td class="${i<lc?'l':''}">${esc(x)}</td>`).join('')+'</tr>';
 return h+'</tbody></table></div>'+(t.note?`<div class="nt">${esc(t.note)}</div>`:'')+'</div>'}
export function addBlock(title,tables,apa){
 const b=$('#outputBody');if(b.classList.contains('empty')){b.classList.remove('empty');b.textContent=''}
 $('#outputPane').style.display='';
 let h=`<section class="blk"><h4>${esc(title)}</h4>`+tables.map(tableHTML).join('');
 if(apa&&apa.length)h+=`<div class="apa"><b>APA</b><br>${[].concat(apa).map(esc).join('<br>')}</div>`;
 b.insertAdjacentHTML('beforeend',h+'</section>');b.lastElementChild.scrollIntoView({behavior:'smooth',block:'start'})}
export function clearOutput(){const b=$('#outputBody');b.className='empty';b.textContent=ar()?'النتائج هتظهر هنا':'Results will appear here'}
export function initOutput(){const pane=$('#outputPane'),h=pane.querySelector('h3'),oh=document.createElement('div');oh.className='oh';h.replaceWith(oh);
 const mk=(t,title,f)=>{const b=document.createElement('button');b.textContent=t;b.title=title;b.onclick=f;return b};
 oh.append(h,mk('⤢','Expand',()=>pane.classList.toggle('wide')),mk('🗑','Clear',clearOutput));
 $('#outputBody').addEventListener('click',e=>{const b=e.target.closest('.cp');if(!b)return;const t=b.closest('.tbw').querySelector('table');
  const tsv=[...t.rows].map(r=>[...r.cells].map(c=>c.textContent).join('\t')).join('\n');navigator.clipboard.writeText(tsv).then(()=>{$('#status').textContent=ar()?'اتنسخ الجدول':'Table copied'})})}
