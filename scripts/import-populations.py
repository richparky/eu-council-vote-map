from pathlib import Path
from decimal import Decimal
import xml.etree.ElementTree as ET
import json,re,copy
from urllib.request import Request,urlopen
ROOT=Path(__file__).resolve().parent.parent
CACHE=ROOT/'.cache/population-sources'
CACHE.mkdir(parents=True,exist_ok=True)
DEST=ROOT
(DEST/'data').mkdir(parents=True,exist_ok=True)
names={'Germany':'DE','France':'FR','United Kingdom':'UK','Italy':'IT','Spain':'ES','Poland':'PL','Romania':'RO','Netherlands':'NL','Greece':'EL','Belgium':'BE','Portugal':'PT','Czech Republic':'CZ','Czechia':'CZ','Hungary':'HU','Sweden':'SE','Austria':'AT','Bulgaria':'BG','Denmark':'DK','Slovakia':'SK','Finland':'FI','Ireland':'IE','Lithuania':'LT','Latvia':'LV','Slovenia':'SI','Estonia':'EE','Cyprus':'CY','Luxembourg':'LU','Malta':'MT','Croatia':'HR'}
defs=[('2009-12-01','32009D0937',0),('2011-01-01','32010D0795',0),('2012-01-01','32011D0900',0),('2013-01-01','32013D0037',0),('2014-01-01','32013D0746',0),('2014-11-01','32014D0692',0),('2015-01-01','32014D0900',0),('2016-01-01','32015D2393',0),('2017-01-01','32016D2353',0),('2018-01-01','32017D2461',0),('2019-01-01','32018D2076',0),('2020-01-01','32019D2209',0),('2020-02-01','32019D2209',1),('2021-01-01','32020D2030',0),('2022-01-01','32021D2320',0),('2023-01-01','32022D2518',0),('2024-01-01','32023D2827',0),('2025-01-01','32024D3231',0),('2026-01-01','32025D2427',0)]
def tables(celex):
 cache=CACHE/(celex+'.html')
 if not cache.exists():
  request=Request('https://publications.europa.eu/resource/celex/'+celex,headers={'Accept':'application/xhtml+xml','Accept-Language':'en'})
  with urlopen(request,timeout=60) as response: content=response.read()
  if len(content)<1000: raise RuntimeError('Empty official source: '+celex)
  cache.write_bytes(content)
 root=ET.parse(cache).getroot()
 candidates=[]
 for t in root.iter():
  if t.tag.split('}')[-1]!='table':continue
  rows=[]
  for tr in t.iter():
   if tr.tag.split('}')[-1]!='tr':continue
   cells=[' '.join(''.join(td.itertext()).split()) for td in tr if td.tag.split('}')[-1] in ('td','th')]
   if cells:rows.append(cells)
  if rows and rows[0][0]=='Member State' and any(r[0]=='Germany' for r in rows):candidates.append(rows)
 return candidates
profiles=[]
for start,celex,idx in defs:
 rows=tables(celex)[idx]
 multiplier=1000 if '1 000' in rows[0][1] else 1
 parse=lambda s:int(Decimal(re.sub(r'[^\d,]','',s).replace(',','.'))*multiplier)
 population={names[r[0]]:parse(r[1]) for r in rows if r[0] in names}
 total=next(parse(r[1]) for r in rows if r[0]=='Total' or re.match(r'^EU.?\s?2[78]$',r[0]))
 difference=sum(population.values())-total
 if difference: print('Published total reconciliation:',start,difference,'persons')
 assert abs(difference)<2000,(start,difference)
 profiles.append(dict(id=start,validFrom=start,population=population,total=total,roundingDifference=difference,source=f'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:{celex}',celex=celex,unit='persons',sourceUnit='thousands' if multiplier==1000 else 'persons'))
# Accession amends the 2013 table by adding Croatia, not by replacing all other values.
accession=copy.deepcopy(next(p for p in profiles if p['id']=='2013-01-01'))
accession.update(id='2013-07-01',validFrom='2013-07-01',celex='32013D0345',source='https://eur-lex.europa.eu/eli/dec/2013/345/oj/eng',additionalSource=accession['source'])
accession['population']['HR']=4398200;accession['total']=508077900
accession['roundingDifference']=sum(accession['population'].values())-accession['total']
profiles.append(accession);profiles.sort(key=lambda p:p['validFrom'])
for i,p in enumerate(profiles):p['validUntil']=profiles[i+1]['validFrom'] if i+1<len(profiles) else '2027-01-01'
(DEST/'data/populations.json').write_text(json.dumps(profiles,indent=2),encoding='utf-8')
print(f'{len(profiles)} official population periods imported; published rounding differences retained')
