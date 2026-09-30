#!/usr/bin/env python3
"""Read-only verification of the persisted Figma readback and Runtime projection."""
import itertools,json,pathlib,sys,collections,re
root=pathlib.Path(__file__).resolve().parent.parent
evidence=root/'figma/migrations/token-model-2026-09-30'
before=json.loads((evidence/'before.json').read_text());after=json.loads((evidence/'after.json').read_text());manifest=json.loads((root/'figma/token-projection.json').read_text())
vs={v['id']:v for v in after['variables']};old={v['id']:v for v in before['variables']};cs={c['id']:c for c in after['collections']};oldcs={c['id']:c for c in before['collections']};errors=[]
def require(test,msg):
 if not test:errors.append(msg)
def resolve(v,variables,collections,context,seen=()):
 if v['id'] in seen:raise ValueError('cycle '+v['id'])
 c=collections[v['variableCollectionId']];mode=context.get(c['id'],c['defaultModeId']);x=v['valuesByMode'][mode]
 return resolve(variables[x['id']],variables,collections,context,seen+(v['id'],)) if isinstance(x,dict) and x.get('type')=='VARIABLE_ALIAS' else x
axes=[c for c in before['collections'] if c['name'] in ['Semantics (Brands)','Appearance (Modes)','Typography (Fluid)']]
contexts=[dict(zip([c['id'] for c in axes],values)) for values in itertools.product(*[[m['modeId'] for m in c['modes']] for c in axes])]
for id,v in old.items():
 require(id in vs,'Removed ID '+id)
 if id not in vs:continue
 require(v['codeSyntax']==vs[id]['codeSyntax'],'CSS syntax changed '+id)
 require(v['variableCollectionId']==vs[id]['variableCollectionId'],'Membership changed '+id)
 for context in contexts:require(resolve(v,old,oldcs,context)==resolve(vs[id],vs,cs,context),'Resolved value changed '+id+' '+str(context))
allowed={'Patterns (UI)':{'Semantics (Roles)'},'Semantics (Roles)':{'Appearance (Brand)','Appearance (Scheme)','Appearance (Scale)'},'Appearance (Brand)':{'Core (Primitives)'},'Appearance (Scheme)':{'Core (Primitives)','Appearance (Brand)'},'Appearance (Scale)':{'Core (Primitives)'},'Core (Primitives)':set()}
edges=collections.Counter();names=set();webs={};scope_exceptions=[]
for v in vs.values():
 c=cs[v['variableCollectionId']]['name']
 if c=='Interaction (States)':continue
 key=(c,v['name']);require(key not in names,'Duplicate name '+str(key));names.add(key)
 require(not any(x.isspace() for x in v['name']),'Whitespace name '+v['name'])
 w=v['codeSyntax'].get('WEB');require(bool(w),'Missing WEB '+v['name']);wk=(c,w)
 require(wk not in webs,'Duplicate WEB '+str(wk));webs[wk]=v['id']
 if 'ALL_SCOPES' in v['scopes']:scope_exceptions.append({'id':v['id'],'name':v['name']})
 for x in v['valuesByMode'].values():
  if isinstance(x,dict) and x.get('type')=='VARIABLE_ALIAS':
   require(x['id'] in vs,'Missing target '+v['id']);target=vs[x['id']];tc=cs[target['variableCollectionId']]['name'];edges[(c,tc)]+=1;require(tc in allowed[c],'Illegal edge '+c+' → '+tc)
 for ctx in contexts:resolve(v,vs,cs,ctx)
exports={}
def walk(n,path,file):
 if isinstance(n,dict):
  if '$value' in n:
   id=n.get('$extensions',{}).get('com.figma.variableId')
   if id:exports[id]=(n,'/'.join(path),file)
  else:
   for k,x in n.items():
    if not k.startswith('$'):walk(x,path+[k],file)
for file in (root/'figma/exports').glob('*.json'):walk(json.loads(file.read_text()),[],file.name)
def encoded(x):
 if isinstance(x,dict) and x.get('type')=='VARIABLE_ALIAS':return {'$ref':manifest['variables'][x['id']]['exportPath']}
 if isinstance(x,dict) and 'r' in x:
  values=[x[k] for k in ['r','g','b']];a=x.get('a',1)
  if a<1:values.append(a)
  return '#'+''.join(f'{round(k*255):02x}' for k in values)
 return x
def comparable(x):
 if isinstance(x,dict) and 'value' in x and 'unit' in x:return x['value']
 if isinstance(x,dict) and 'components' in x:
  d=dict(zip(['r','g','b'],x['components']));d['a']=x.get('alpha',1);return encoded(d)
 return x
for id,p in manifest['variables'].items():
 require(id in exports,'Missing exported ID '+id)
 if id not in exports:continue
 n,path,file=exports[id];v=vs[id];e=n['$extensions'];c=cs[v['variableCollectionId']]
 require(path==p['exportPath'] and file==p['file'],'Projection path mismatch '+id)
 require(e.get('com.figma.variableName')==v['name'],'Figma name mismatch '+id)
 require(e.get('com.figma.scopes')==v['scopes'],'Scopes mismatch '+id)
 require(e.get('com.figma.codeSyntax')==v['codeSyntax'],'WEB mismatch '+id)
 x=v['valuesByMode'][c['defaultModeId']]
 # Existing multi-mode export $value is a compatibility fallback; all modes are checked below.
 if len(c['modes'])==1:require(comparable(n['$value'])==encoded(x),'Value/alias mismatch '+id)
 else:
  for m in c['modes']:require(e.get('com.figma.modeValues',{}).get(m['name'])==encoded(v['valuesByMode'][m['modeId']]),'Mode mismatch '+id+' '+m['name'])
 if isinstance(x,dict) and x.get('type')=='VARIABLE_ALIAS':require(e.get('com.figma.aliasData',{}).get('targetVariableId')==x['id'],'Alias ID mismatch '+id)
# Verify generated aliases independently of the source/export parity checks.
generated={}
for file in (root/'dist/tokens/css').glob('*.css'):
 text=file.read_text();selector=text.split('{',1)[0].split('*/')[-1].strip()
 for name,value in re.findall(r'(--[a-z0-9-]+):\s*([^;]+);',text):generated.setdefault(name,[]).append((selector,value.strip()))
for id,pr in manifest['variables'].items():
 v=vs[id];web=v['codeSyntax'].get('WEB','');match=re.search(r'var\((--[a-z0-9-]+)\)',web)
 if not match:continue
 name=match.group(1);require(name in generated,'Not generated '+id+' '+name)
 c=cs[v['variableCollectionId']]
 for mode,x in v['valuesByMode'].items():
  if not isinstance(x,dict) or x.get('type')!='VARIABLE_ALIAS':continue
  expected=vs[x['id']]['codeSyntax'].get('WEB','');expected='var('+expected+')' if expected.startswith('--') else expected;require(any(value==expected for selector,value in generated.get(name,[])),'Generated alias mismatch '+id+' '+expected)
 if c['name']=='Appearance (Scale)':require(any(selector==':root' for selector,value in generated.get(name,[])),'Scale incorrectly scoped to Scheme '+id)
sem=next(c for c in cs.values() if c['name']=='Semantics (Roles)');roles={v['name']:v for v in vs.values() if v['variableCollectionId']==sem['id']}
def luminance(x):
 return sum(w*(n/12.92 if n<=.04045 else ((n+.055)/1.055)**2.4) for w,n in zip([.2126,.7152,.0722],[x[k] for k in ['r','g','b']]))
def composite(a,b):
 alpha=a.get('a',1);return {k:a[k]*alpha+b[k]*(1-alpha) for k in ['r','g','b']}
def contrast(a,b):
 x,y=luminance(a),luminance(b);return (max(x,y)+.05)/(min(x,y)+.05)
contrast_rows=[];foreground_rows=[];overlay_rows=[]
brandc=next(c for c in cs.values() if c['name']=='Appearance (Brand)');schemec=next(c for c in cs.values() if c['name']=='Appearance (Scheme)')
for b,m in itertools.product(brandc['modes'],schemec['modes']):
 ctx={brandc['id']:b['modeId'],schemec['id']:m['modeId']};canvas=resolve(roles['Color/Surface/Default'],vs,cs,ctx)
 for name,v in roles.items():
  if '/Surface/' not in name:continue
  paired=name.replace('/Surface/','/Content/')
  require(paired in roles,'Unpaired Surface '+name)
  if paired not in roles:continue
  surface=composite(resolve(v,vs,cs,ctx),canvas);content=composite(resolve(roles[paired],vs,cs,ctx),surface);ratio=contrast(surface,content)
  contrast_rows.append({'brand':b['name'],'scheme':m['name'],'surface':name,'content':paired,'ratio':round(ratio,4),'threshold':None if name.endswith('/Disabled') else 4.5,'result':'EXEMPT' if name.endswith('/Disabled') else 'PASS' if ratio>=4.5 else 'FAIL'})
 for state in ['Default','Hover','Active','Focus']:
  fg=resolve(roles['Color/Action/Foreground/'+state],vs,cs,ctx);ratio=contrast(composite(fg,canvas),canvas);foreground_rows.append({'brand':b['name'],'scheme':m['name'],'state':state,'surroundingSurface':'Color/Surface/Default','ratio':round(ratio,4),'result':'PASS' if ratio>=4.5 else 'FAIL'})
 for state in ['Hover','Active']:
  surface=resolve(roles['Color/Action/Surface/'+state],vs,cs,ctx);overlay=resolve(roles['Color/Overlay/'+state],vs,cs,ctx);rendered=composite(overlay,composite(surface,canvas));content=resolve(roles['Color/Action/Content/'+state],vs,cs,ctx);ratio=contrast(composite(content,rendered),rendered);overlay_rows.append({'brand':b['name'],'scheme':m['name'],'state':state,'ratio':round(ratio,4),'result':'PASS' if ratio>=4.5 else 'FAIL'})
report={'structuralGate':'FAIL' if errors else 'PASS','errors':errors,'counts':{'beforeVariables':len(old),'afterVariables':len(vs),'projectedVariables':len(manifest['variables']),'roles':len(roles),'valuePreservationChecks':len(old)*len(contexts)},'edges':[{'from':a,'to':b,'count':n} for (a,b),n in edges.items()],'scopeExceptions':scope_exceptions,'legacyLiteralPatternSlots':[v['name'] for v in vs.values() if cs[v['variableCollectionId']]['name']=='Patterns (UI)' and not isinstance(next(iter(v['valuesByMode'].values())),dict)],'accessibility':{'pairGate':'FAIL' if any(x['result']=='FAIL' for x in contrast_rows) else 'PASS','surfaceContent':contrast_rows,'foreground':foreground_rows,'actionOverlay':overlay_rows,'limitation':'Declared token pair checks only; existing Foreground/overlay failures preserved, no full rendered component certification.'}}
print(json.dumps(report,indent=2));sys.exit(1 if errors else 0)
