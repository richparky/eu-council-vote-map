import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {profileAt,summarize,assessSimulation,statusFor} from '../model.js';
const profiles=JSON.parse(await readFile(new URL('../data/populations.json',import.meta.url)));
test('Croatia accession changes membership on 1 July 2013',()=>{assert.equal(profileAt(profiles,'2013-06-30').population.HR,undefined);assert.equal(profileAt(profiles,'2013-07-01').population.HR,4398200);});
test('UK withdrawal changes both members and population base',()=>{const before=profileAt(profiles,'2020-01-31'),after=profileAt(profiles,'2020-02-01');assert.equal(Object.keys(before.population).length,28);assert.equal(Object.keys(after.population).length,27);assert.equal(before.total-before.population.UK,after.total);assert.equal(after.population.UK,undefined);});
test('Germany share uses the 2026 legal population, without adding rounded shares',()=>{const s=summarize(profileAt(profiles,'2026-10-15'),['DE','DE']);assert.equal(s.countries,1);assert.equal(s.population,83502300);assert.equal(s.populationShare.toFixed(2),'18.47');});
test('A rounded display of 65.00% cannot make a below-threshold coalition pass',()=>{const s={countries:15,members:27,population:649999,total:1000000};assert.equal(s.population/s.total*100>=65,false);assert.equal(assessSimulation(s).passes,false);assert.equal(assessSimulation({...s,population:650000}).passes,true);});
test('A population majority alone does not meet the country threshold',()=>{assert.equal(assessSimulation({countries:14,members:27,population:900,total:1000}).passes,false);});
test('Three non-supporting states cannot form a blocking minority',()=>{assert.equal(assessSimulation({countries:24,members:27,population:600,total:1000}).passes,true);assert.equal(assessSimulation({countries:23,members:27,population:600,total:1000}).passes,false);});
test('Missing source positions remain unknown',()=>{const r={votes:{for:['DE'],against:[],abstain:[],'not-participating':['DK']}};assert.equal(statusFor(r,'FR'),'not-recorded');assert.equal(statusFor(r,'DK'),'not-participating');});
test('Members outside the historical period are rejected',()=>{assert.throws(()=>summarize(profileAt(profiles,'2026-10-15'),['UK']));});
test('Unknown dates do not silently fall back to current populations',()=>{assert.equal(profileAt(profiles,'2000-01-01'),null);assert.equal(profileAt(profiles,'2027-01-01'),null);});
test('Distinct budget votes sharing one Council document are all preserved',async()=>{const records=JSON.parse(await readFile(new URL('../data/votes.json',import.meta.url)));const shared=records.filter(r=>r.date==='2014-12-12'&&r.document==='16707/14');assert.equal(shared.length,7);assert.equal(new Set(shared.map(r=>r.title)).size,7);const covid=records.filter(r=>r.date==='2020-04-14'&&r.document==='7201/20');assert.equal(covid.length,2);});

