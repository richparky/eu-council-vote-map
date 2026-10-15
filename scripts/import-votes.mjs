/** Rebuild a snapshot by navigating the official, public archive. No CAPTCHA bypass. */
import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createInterface} from 'node:readline/promises';
const base='https://www.consilium.europa.eu/en/general-secretariat/corporate-policies/transparency/voting-results/';
const params=new URLSearchParams({ActNumber:'',ActType:'0',CouncilAction:'0',Country:'0',DateFrom:'',DateTo:'',DocNumber:'',InterinstNumber:'',PolicyArea:'0',Session:'0',Title:'',VoteAbstain:'on',VoteAgainst:'on',VoteFor:'on',VoteNotParticipating:'on',VotingProcedure:'0',VotingRule:'0',page:'1'});
const browser=await chromium.launch({headless:false});
const page=await browser.newPage();const raw=[];let reported;
try{
 await page.goto(base+'?'+params);
 const rl=createInterface({input:process.stdin,output:process.stdout});await rl.question('If the official site asks for browser verification, complete it manually. Press Enter once voting records are visible. ');rl.close();
 while(true){await page.locator('.gsc-search-results__act-meta').first().waitFor();const body=await page.locator('body').innerText();reported??=Number(body.match(/([\d,]+) result\(s\) found/)?.[1].replaceAll(',',''));if(!reported)throw Error('Cannot read source result count');
  const rows=await page.evaluate(()=>[...document.querySelectorAll('.gsc-search-results__act-meta')].map(meta=>{const section=meta.parentElement,vote=section.nextElementSibling;const fields=Object.fromEntries([...section.querySelectorAll('li')].map(li=>[li.querySelector('span')?.textContent.trim().replace(/:$/,''),li.querySelector('strong')?.textContent.trim()]));return {title:section.querySelector('.gsc-search-results__heading').textContent.trim(),fields,outcome:section.querySelector('.gsc-search-results__status strong').textContent.trim(),documentUrl:meta.querySelector('a')?.href,groups:[...vote.querySelectorAll('.gsc-votes__countries')].map(g=>[...g.querySelectorAll('abbr')].map(a=>a.textContent.trim())),counts:[...vote.querySelectorAll('.gsc-votes__number')].map(n=>Number(n.textContent)),archivePage:Number(new URL(location.href).searchParams.get('page'))}}));
  for(const r of rows){if(r.groups.length!==4||r.groups.some((g,i)=>g.length!==r.counts[i]))throw Error('Source count mismatch');}raw.push(...rows);console.log(`${raw.length}/${reported} source entries`);
  const next=await page.locator('a[title="Next page"]').getAttribute('href').catch(()=>null);if(!next)break;await page.goto(new URL(next,base).href);
 }
 if(raw.length!==reported)throw Error(`Incomplete snapshot (${raw.length}/${reported}); files were not replaced`);
 const records=raw.map(v=>{const date=v.fields.Date.split('/').reverse().join('-'),document=v.fields['Doc. no.'],interinstitutional=v.fields['Interinstitutional number'];return {id:createHash('sha256').update([date,document,interinstitutional,v.title,v.fields['Act no (OJ).'],v.fields['Voting rule'],v.outcome,v.fields['Action by the Council'],JSON.stringify(v.groups)].join('|')).digest('hex').slice(0,16),date,title:v.title,document,actNumber:v.fields['Act no (OJ).']||null,interinstitutional:interinstitutional||null,policy:v.fields['Policy area'],procedure:v.fields['Legislative procedure'],rule:v.fields['Voting rule'],action:v.fields['Action by the Council'],outcome:v.outcome,votes:Object.fromEntries(['for','against','abstain','not-participating'].map((k,i)=>[k,v.groups[i]])),source:v.documentUrl,archivePage:v.archivePage}});
 const unique=[...new Map(records.map(r=>[r.id,r])).values()].sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id));
 const {default:fs}=await import('node:fs/promises');const manifest=JSON.parse(await fs.readFile(new URL('../data/manifest.json',import.meta.url),'utf8'));
 Object.assign(manifest,{retrievedOn:new Date().toISOString().slice(0,10),records:unique.length,sourceReportedRecords:reported,duplicatesRemoved:raw.length-unique.length,sourcePages:Math.max(...raw.map(r=>r.archivePage)),earliest:unique.at(-1).date,latest:unique[0].date,coverage:`All ${reported.toLocaleString('en-GB')} entries returned by the official search on the retrieval date. Unpublished votes and documents available only in the separate public register are outside this snapshot.`});
 await writeFile(new URL('../data/votes.json',import.meta.url),JSON.stringify(unique));await writeFile(new URL('../data/manifest.json',import.meta.url),JSON.stringify(manifest,null,2)+'\n');console.log(`Saved ${unique.length} unique records. Run npm run validate:data before committing.`);
}finally{await browser.close();}
