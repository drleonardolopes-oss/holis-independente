import {ClinicBrand} from './clinic-types';
import {jsPDF} from 'jspdf';
import {Answers,Point,fields,sections,applicable,entryText} from './reporting';
export function buildPdf(requestedKind:'answers',a:Answers,points:Point[],mapData?:string,fonts?:{normal:string,bold:string},clinic?:ClinicBrand){
 const doc=new jsPDF();if(fonts){doc.addFileToVFS('HolisSans.ttf',fonts.normal);doc.addFont('HolisSans.ttf','HolisSans','normal');doc.addFileToVFS('HolisSans-Bold.ttf',fonts.bold);doc.addFont('HolisSans-Bold.ttf','HolisSans','bold')}const font=fonts?'HolisSans':'helvetica';let y=33;let page=1;if(requestedKind!=='answers')throw new Error('Apenas o PDF das respostas originais está disponível.');
 const color=clinic?.primaryColor||'#22513f';const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)) as [number,number,number];
 const top=()=>{doc.setFillColor(...rgb);doc.rect(0,0,210,20,'F');doc.setTextColor(255,255,255);doc.setFontSize(13);doc.setFont(font,'bold');doc.setFontSize(11);const title=clinic?.name||'Holis';doc.setFontSize(9);const titleLines=doc.splitTextToSize(title+' | AVALIAÇÃO ATM',clinic?.logo?145:176) as string[];doc.text(titleLines.slice(0,2),clinic?.logo?42:17,titleLines.length>1?9:13);if(clinic?.logo){try{const props=doc.getImageProperties(clinic.logo);const scale=Math.min(20/props.width,14/props.height);doc.addImage(clinic.logo,17,3,props.width*scale,props.height*scale,undefined,'FAST')}catch{}}doc.setTextColor(30,48,40);y=32};top();
 const line=(text:string,size=10,bold=false)=>{doc.setFont(font,bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(30,48,40);for(const source of String(text).split('\n')){const lines=doc.splitTextToSize(source||' ',176) as string[];for(const l of lines){if(y+size*.45>277){doc.addPage();page++;top();doc.setFont(font,bold?'bold':'normal');doc.setFontSize(size)}doc.text(l,17,y);y+=size*.45+1.4}}y+=2};
 const heading=(t:string)=>{if(y>253){doc.addPage();page++;top()}y+=3;line(t,12,true)};
 const fact=(id:string,label?:string)=>{if(a[id]?.trim())line(`${label||fields.find(f=>f.id===id)?.label||id}: ${a[id]}`)};
 line('Respostas integrais do paciente',16,true);
 line(`Paciente: ${a.name||'[não informado]'} | Avaliação: ${a.date||'[não informada]'}`,10,true);
  line('Registro integral das respostas salvas, sem correção de português, resumo ou interpretação. Campos não preenchidos são identificados.',9);
  for(const section of sections){heading(section.title);for(const f of section.fields){if(f.type==='map')continue;const value=a[f.id]||'';if(!applicable(f,a)&&!value.trim())continue;line(f.label,10,true);
   if((f.id==='doctor'||f.id==='dentist')&&a[f.id+'None']==='Sim')line('Opção marcada: Não tenho '+(f.id==='doctor'?'médico':'dentista')+' que me acompanhe');
   if(!applicable(f,a)&&value.trim())line('Dado salvo em campo atualmente oculto/condicional; mantido para fidelidade ao registro.',8);
   line(['medications','professionals'].includes(f.type)?entryText(value,f.type as 'medications'|'professionals'):(value||'[não respondido]'));
   if(a[f.id+'Side'])line(`Lado informado: ${a[f.id+'Side']}`);
   if(a[f.id+'Intensity']!==undefined&&a[f.id+'Intensity']!=='')line(`Intensidade da dor: ${a[f.id+'Intensity']}/10`);
  }}
  if(a.audioTranscriptOriginal?.trim()){heading('Transcrição original de registro anterior');line(a.audioTranscriptOriginal)}
 if(mapData){doc.addPage();page++;top();heading('Mapa corporal original');doc.addImage(mapData,'PNG',12,y,186.6,126.6);y+=134;line(`${points.length} ponto(s) marcado(s). Sem inferência automática de anatomia ou lado a partir das coordenadas.`);if(a.noPain==='Sim')line('Opção marcada: Não sinto dor no momento.');fact('mapDescription')}

 const total=doc.getNumberOfPages();for(let i=1;i<=total;i++){doc.setPage(i);doc.setFont(font,'normal');doc.setFontSize(8);doc.setTextColor(95,110,101);doc.text(doc.splitTextToSize((clinic?.name||'Holis')+' | Documento confidencial de saúde',155)[0],17,289);doc.text(`${i} / ${total}`,193,289,{align:'right'})}return doc;
}
export async function downloadPdf(kind:'answers',a:Answers,points:Point[],clinic?:ClinicBrand){const img=new Image();img.src='/mapa-dor.png';await img.decode();const canvas=document.createElement('canvas');canvas.width=933;canvas.height=633;const ctx=canvas.getContext('2d')!;ctx.drawImage(img,0,0,933,633);ctx.fillStyle='#e02f3f';points.forEach(p=>{ctx.beginPath();ctx.arc(p.x*933,p.y*633,5,0,Math.PI*2);ctx.fill()});const fontData=await Promise.all(['/fonts/HolisSans.ttf','/fonts/HolisSans-Bold.ttf'].map(async path=>{const response=await fetch(path);if(!response.ok)throw Error('Fonte do PDF indisponível');const bytes=new Uint8Array(await response.arrayBuffer());let binary='';for(let offset=0;offset<bytes.length;offset+=8192)binary+=String.fromCharCode(...bytes.subarray(offset,offset+8192));return btoa(binary)}));const doc=buildPdf(kind,a,points,canvas.toDataURL('image/png'),{normal:fontData[0],bold:fontData[1]},clinic);doc.save(`Holis-respostas-originais-${(a.name||'paciente').replace(/[^a-zA-Z0-9À-ÿ -]/g,'').replace(/ /g,'-')}.pdf`)}
