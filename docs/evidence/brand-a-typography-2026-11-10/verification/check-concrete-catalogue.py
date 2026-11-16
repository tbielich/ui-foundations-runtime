"""Compare actual public compatibility accessors and canonical stable-ID catalogue."""
from pathlib import Path
import json,re
root=Path('/Users/Thomas.Bielich@tui.com/GitHub/uif/worktrees/runtime-brand-a-typography')
old=Path('/tmp/uif-brand-a-pre-concrete-catalogue-20261110')
out=Path(__file__).resolve().parent
source=json.loads((root/'figma/exports/Core (Primitives).tokens.json').read_text())
before_source=json.loads((old/'figma/exports/Core (Primitives).tokens.json').read_text())
projection=json.loads((root/'figma/token-projection.json').read_text())
compat=json.loads((root/'figma/font-family-compatibility.json').read_text())
compat_by_id={x['sourceVariableId']:x for x in compat['exports']}
compat_by_path={x['legacyExportPath']:x for x in compat['exports']}
expected={'VariableID:3:5':('Inter','--font-family-inter'),'VariableID:3:6':('Rokkitt','--font-family-rokkitt'),'VariableID:3:7':('SF Mono','--font-family-sf-mono'),'VariableID:3260:2':('Roboto Slab','--font-family-roboto-slab')}
def leaves(node,path=()):
 if isinstance(node,dict):
  if '$value'in node:yield path,node
  else:
   for k,v in node.items():yield from leaves(v,path+(k,))
catalogue=[(path,node)for path,node in leaves(source)if path[:2]==('Font','Family')]
old_by_id={n.get('$extensions',{}).get('com.figma.variableId'):(p,n)for p,n in leaves(before_source)}
ids={}; failures=[]
for path,node in catalogue:
 vid=node.get('$extensions',{}).get('com.figma.variableId')
 ids.setdefault(vid,[]).append(path)
 if vid not in expected:failures.append({'unexpectedCoreFamily':path,'id':vid})
 else:
  value,css=expected[vid]
  if node['$value']!=value:failures.append({'id':vid,'value':node['$value'],'expected':value})
  web=node.get('$extensions',{}).get('com.figma.codeSyntax',{}).get('WEB')
  if web!='var('+css+')':failures.append({'id':vid,'WEB':web,'expected':css})
  canonical_name=node.get('$extensions',{}).get('com.figma.variableName')
  if canonical_name!='Font/Family/'+value:failures.append({'classificationInsteadOfCanonicalConcreteFamily':canonical_name,'expected':value})
  if '/'.join(path)!=canonical_name:
   declared=compat_by_id.get(vid)
   if not declared or declared['legacyExportPath']!='/'.join(path)or declared['canonicalFigmaName']!=canonical_name or declared['canonicalCssVar']!=css:
    failures.append({'undeclaredLegacyProjection':path,'id':vid,'canonicalName':canonical_name})
  mapped=projection['variables'].get(vid)
  if not mapped or mapped['exportPath']!='/'.join(path):failures.append({'id':vid,'projectionMismatch':mapped,'actualPath':path})
for vid in expected:
 if len(ids.get(vid,[]))!=1:failures.append({'idCount':vid,'count':len(ids.get(vid,[]))})
stale_refs=[]
def scan_refs(node,loc):
 if isinstance(node,dict):
  if node.get('$ref')in ('Font/Family/Sans','Font/Family/Serif','Font/Family/Mono'):
   stale_refs.append({'locator':loc,'reference':node['$ref']})
  for k,v in node.items():scan_refs(v,loc+'/'+k)
 elif isinstance(node,list):
  for i,v in enumerate(node):scan_refs(v,loc+'/'+str(i))
for f in (root/'figma/exports').glob('*.json'):scan_refs(json.loads(f.read_text()),f.name)
for ref in stale_refs:
 declared=compat_by_path.get(ref['reference'])
 source_match=[n for p,n in catalogue if '/'.join(p)==ref['reference']]
 if not declared or len(source_match)!=1 or source_match[0].get('$extensions',{}).get('com.figma.variableId')!=declared['sourceVariableId']:
  failures.append({'unboundLegacySourceReference':ref})
if compat['status']!='deprecated-compatibility-output' or projection.get('fontFamilyCompatibility',{}).get('jsonProjection')!='preserve-existing-literal-accessors':
 failures.append({'compatibilityProjectionNotExplicit':projection.get('fontFamilyCompatibility')})
old_json=json.loads((old/'dist/tokens/json/core-primitives.tokens.json').read_text())
new_json=json.loads((root/'dist/tokens/json/core-primitives.tokens.json').read_text())
legacy={}
for key in ['Sans','Serif','Mono']:
 a=old_json['Font']['Family'][key]
 b=new_json.get('Font',{}).get('Family',{}).get(key)
 legacy[key]={'before':a,'after':b}
 if b is None or a['$value']!=b.get('$value') or a['$type']!=b.get('$type'):failures.append({'legacyJSONAccessor':key,'before':a,'after':b})
def ts_entries(p):
 # Read exact generated tokens.typography namespace via JSON literal decoder.
 text=p.read_text()
 literal=text.split('export const tokens = ',1)[1]
 obj=json.JSONDecoder().raw_decode(literal)[0]
 return {k:v for k,v in obj['typography'].items()if k.startswith('--font-family-')}
a=ts_entries(old/'dist/tokens/ts/core-primitives.tokens.ts');b=ts_entries(root/'dist/tokens/ts/core-primitives.tokens.ts')
for k in ['--font-family-sans','--font-family-serif','--font-family-mono']:
 if k not in b or a[k]!=b[k]:failures.append({'legacyTSAccessor':k,'before':a[k],'after':b.get(k)})
for value,css in expected.values():
 if b.get(css)!=value:failures.append({'canonicalTSAccessor':css,'expected':value,'after':b.get(css)})
allids={}
for p,n in leaves(source):
 vid=n.get('$extensions',{}).get('com.figma.variableId')
 if vid:allids.setdefault(vid,[]).append(p)
duplicate={k:v for k,v in allids.items()if len(v)>1}
if duplicate:failures.append({'duplicateSourceVariableIDs':duplicate})
result={'command':'python3 docs/evidence/brand-a-typography-2026-11-10/verification/check-concrete-catalogue.py','catalogue':[{'legacyExportPath':p,'canonicalFigmaName':n.get('$extensions',{}).get('com.figma.variableName'),'id':n.get('$extensions',{}).get('com.figma.variableId'),'value':n['$value'],'beforePath':old_by_id.get(n.get('$extensions',{}).get('com.figma.variableId'),[None])[0]}for p,n in catalogue],'legacyJSON':legacy,'jsonProjection':'Existing literal accessors preserved; no new Inter/Rokkitt/SF Mono JSON paths claimed. Canonical catalogue is checked by stable-ID Figma name and WEB syntax, not the explicitly historical exportPath.','compatibilityManifest':compat,'declaredLegacySourceReferences':stale_refs,'TSBefore':a,'TSAfter':b,'failures':failures,'gate':'PASS'if not failures else'FAIL'}
(out/'concrete-catalogue.json').write_text(json.dumps(result,indent=2));print(json.dumps({'gate':result['gate'],'failures':failures,'catalogue':result['catalogue']},indent=2))
