import {readFile} from 'node:fs/promises';
import {profileAt,COUNTRIES,summarize} from '../model.js';
const load=async f=>JSON.parse(await readFile(new URL('../data/'+f,import.meta.url),'utf8'));
const [records,profiles,manifest]=await Promise.all(['votes.json','populations.json','manifest.json'].map(load));
const issues=[],missing=[];const known=new Set(COUNTRIES.map(c=>c.code)),ids=new Set();
for(const p of profiles){if(p.validFrom>=p.validUntil)issues.push('Invalid population interval '+p.id);const sum=Object.values(p.population).reduce((a,b)=>a+b,0);if(sum-p.total!==(p.roundingDifference||0))issues.push('Population reconciliation '+p.id);for(const [c,n]of Object.entries(p.population))if(!known.has(c)||!Number.isSafeInteger(n)||n<=0)issues.push('Invalid population '+p.id+' '+c);}
for(const r of records){if(ids.has(r.id))issues.push('Duplicate '+r.id);ids.add(r.id);const p=profileAt(profiles,r.date);if(!p){issues.push('Missing population profile '+r.id);continue;}const all=Object.values(r.votes).flat();if(new Set(all).size!==all.length)issues.push('Repeated country '+r.id);if(all.some(c=>!p.population[c]))issues.push('Non-member country '+r.id);if(!r.source.startsWith('https://www.consilium.europa.eu/'))issues.push('Unexpected source '+r.id);if(!['Qualified majority','Unanimity','QMV without COM'].includes(r.rule))issues.push('Unknown rule '+r.id);const absent=Object.keys(p.population).filter(c=>!all.includes(c));if(absent.length)missing.push({id:r.id,date:r.date,countries:absent});summarize(p,r.votes.for);}
if(records.length!==manifest.records)issues.push('Manifest record count');if(ids.size!==records.length)issues.push('Unique IDs');
console.log(JSON.stringify({records:records.length,populationPeriods:profiles.length,missingCountryRecords:missing.length,issues},null,2));
if(issues.length)process.exitCode=1;
