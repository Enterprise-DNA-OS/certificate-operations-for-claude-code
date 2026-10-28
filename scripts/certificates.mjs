import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv,pick} from './lib/csv.mjs';
import {table} from './lib/format.mjs';
import {page,table as htmlTable,writeOut} from './lib/render.mjs';

export const reports={
 inventory:'select common_name,fingerprint,issuer,trust_type,state,not_after,days_left,endpoint_count from certificate_inventory order by not_after',
 services:'select code,name,owner,backup_owner,critical,review_on from services order by code',
 endpoints:'select code,name,service,owner,common_name,health,not_after from endpoint_health order by code',
 'renewals-due':"select code,common_name,owner,due_on,status,target_count,verified_count from renewal_progress where status<>'closed' or verified_count<target_count order by due_on",
 attention:"select code,service,owner,health,not_after from endpoint_health where health<>'verified' or not_after<now()+interval '30 days' or owner='' order by not_after",
 'expiry-calendar':"select common_name,issuer,not_after,days_left,endpoint_count from certificate_inventory where state='active' and not_after<now()+interval '90 days' order by not_after",
 'owner-load':"select coalesce(nullif(owner,''),'UNASSIGNED') owner,count(*)::int endpoints,count(*) filter(where health<>'verified')::int needing_check,count(*) filter(where not_after<now()+interval '30 days')::int expiring from endpoint_health group by owner order by needing_check desc,owner",
 'issuer-summary':"select issuer,trust_type,count(*)::int certificates,count(*) filter(where not_after<=now())::int expired from certificates where state='active' group by issuer,trust_type order by issuer",
 'stale-observations':"select code,name,observed_at from endpoints where observed_at<now()-interval '14 days' order by observed_at",
 'deployment-gaps':"select code,common_name,status,target_count,verified_count from renewal_progress where target_count<>verified_count order by code",
 'check-history':'select e.code,v.result,v.fingerprint,v.checked_at,v.actor,v.evidence from verifications v join endpoints e on e.id=v.endpoint_id order by v.checked_at desc,v.sequence desc',
 compliance:'select * from compliance_findings order by rule,item',
 activity:'select action,actor,record_id,note,before_data,after_data,created_at from activity order by created_at desc,id'
};
export const commands=[...Object.keys(reports),'help','show','weekly-review','add','assign','plan-renewal','approve-renewal','record-install','verify-endpoint','close-renewal','set-state','log','import','export','draft-renewal','draft-review'];
const required=(o,k)=>{if(o[k]===undefined||o[k]===true||!String(o[k]).trim())throw Error(`Required --${k}`);return String(o[k]).trim();};
export function stamp(v){if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(v)||!Number.isFinite(Date.parse(v)))throw Error('Timestamp must be a UTC ISO value such as 2026-10-28T10:00:00Z');const d=new Date(v).toISOString();if(d.slice(0,10)!==v.slice(0,10))throw Error('Invalid calendar timestamp');return d;}
const date=v=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error('Invalid calendar date');return v;};
const fingerprint=v=>{const s=String(v).replace(/[:\s]/g,'').toLowerCase();if(!/^[a-f0-9]{64}$/.test(s))throw Error('A SHA256 fingerprint must contain 64 hexadecimal characters');return s;};
const recent=v=>{const s=stamp(v);if(Date.parse(s)>Date.now()+1000)throw Error('Evidence timestamp cannot be in the future');return s;};
const trust=v=>{if(!['public-tls','private','unknown'].includes(v))throw Error('Unknown trust-type');return v;};
const code=v=>{if(!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(v))throw Error('Code must use letters, numbers, underscores or hyphens');return v;};
async function resolve(db,kind,ref){
 const fields={certificates:['common_name','fingerprint','serial_number'],services:['code','name'],endpoints:['code','name'],renewals:['code']}[kind];
 if(!fields)throw Error('Kind must be certificates, services, endpoints or renewals');
 const exact=await db.query(`select * from ${kind} where id::text=$1 or ${fields.map(f=>`lower(${f})=lower($1)`).join(' or ')}`,[ref]);
 const rows=exact.length?exact:await db.query(`select * from ${kind} where starts_with(id::text,lower($1)) or ${fields.map(f=>`strpos(lower(${f}),lower($1))>0`).join(' or ')} order by id`,[ref]);
 if(rows.length!==1)throw Error(rows.length?`Ambiguous ${kind}: ${rows.map(r=>`${r.id} ${r.code||r.common_name}`).join('; ')}`:`No ${kind} match: ${ref}`);return rows[0];
}
async function audit(db,action,actor,before,after,note=''){await db.query('insert into activity(action,actor,record_id,before_data,after_data,note) values($1,$2,$3,$4,$5,$6)',[action,actor,after?.id||before?.id||null,before?JSON.stringify(before):null,after?JSON.stringify(after):null,note]);}
async function insert(db,kind,obj){const keys=Object.keys(obj);return(await db.query(`insert into ${kind}(${keys.join(',')}) values(${keys.map((_,i)=>'$'+(i+1)).join(',')}) returning *`,Object.values(obj)))[0];}
async function validReplacement(db,r){const [c]=await db.query('select * from certificates where id=$1',[r.replacement_id]);if(c.state!=='active'||Date.parse(c.not_after)<=Date.now()||Date.parse(c.not_before)>Date.now())throw Error('Replacement must be active and currently valid');return c;}
export async function run(db,cmd,o={},pos=[]){
 if(reports[cmd])return db.query(reports[cmd]);
 if(cmd==='help')return commands.map(command=>({command}));
 if(cmd==='show')return [await resolve(db,o.kind||'certificates',required(o,'ref'))];
 if(cmd==='weekly-review')return {attention:await run(db,'attention'),renewals:await run(db,'renewals-due'),owners:await run(db,'owner-load'),compliance:await run(db,'compliance')};
 if(cmd==='export'){
  const file=path.resolve(required(o,'file'));let body;
  await db.exec('BEGIN READ ONLY');try{
   if(o.format==='csv'){
    const rows=await db.query('select * from certificate_inventory order by fingerprint');const cols=['fingerprint','common_name','serial_number','issuer','not_before','not_after','trust_type','state'];
    const cell=v=>'"'+String(v??'').replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';
    body=[cols.join(','),...rows.map(r=>cols.map(k=>cell(r[k] instanceof Date?r[k].toISOString():r[k])).join(','))].join('\r\n')+'\r\n';
   }else{const out={format:'certificate-operations-v1'};for(const t of ['services','certificates','endpoints','renewals','renewal_targets','installations','verifications','activity','imports'])out[t]=await db.query(`select * from ${t}`);body=JSON.stringify(out,null,2)+'\n';}
  }finally{await db.exec('ROLLBACK');}
  fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,body,{flag:'wx',mode:0o600});return [{file}];
 }
 if(['draft-review','draft-renewal'].includes(cmd)){
  const rows=await run(db,cmd==='draft-review'?'attention':'renewals-due');
  const file=writeOut('drafts',`${cmd}-${crypto.randomUUID()}`,page({title:cmd==='draft-review'?'Certificate review':'Renewal handover',subtitle:'Draft for human review. Recorded evidence only. Nothing has been sent.',sections:[{title:'Records requiring attention',html:htmlTable(rows)}]}));return [{file}];
 }
 if(!commands.includes(cmd))throw Error(`Unknown command ${cmd}. Run help.`);
 const actor=required(o,'actor');
 await db.exec('BEGIN');
 try{
  // One transaction serializes writes to the operational records on PostgreSQL as well as PGlite.
  await db.exec('LOCK TABLE certificates,services,endpoints,renewals,renewal_targets,installations,verifications IN SHARE ROW EXCLUSIVE MODE');
  let out;
  if(cmd==='add'){
   const kind=required(o,'kind');let data;
   if(kind==='service')data={code:code(required(o,'code')),name:required(o,'name'),owner:o.owner||'',backup_owner:o.backup||'',critical:o.critical===true||o.critical==='true',review_on:date(required(o,'review-on'))};
   else if(kind==='certificate')data={fingerprint:fingerprint(required(o,'fingerprint')),common_name:required(o,'name'),serial_number:required(o,'serial'),issuer:required(o,'issuer'),not_before:stamp(required(o,'not-before')),not_after:stamp(required(o,'not-after')),trust_type:trust(o['trust-type']||'unknown')};
   else if(kind==='endpoint'){const s=await resolve(db,'services',required(o,'service'));const c=await resolve(db,'certificates',required(o,'certificate'));data={code:code(required(o,'code')),name:required(o,'name'),service_id:s.id,certificate_id:c.id,observed_at:recent(required(o,'observed-at'))};}
   else throw Error('add --kind=service|certificate|endpoint');
   out=await insert(db,{service:'services',certificate:'certificates',endpoint:'endpoints'}[kind],data);await audit(db,cmd,actor,null,out);
  }else if(cmd==='assign'){
   const old=await resolve(db,'services',required(o,'ref'));
   [out]=await db.query('update services set owner=$1,backup_owner=$2,review_on=$3 where id=$4 returning *',[required(o,'owner'),required(o,'backup'),date(required(o,'review-on')),old.id]);await audit(db,cmd,actor,old,out);
  }else if(cmd==='plan-renewal'){
   const c=await resolve(db,'certificates',required(o,'certificate')),replacement=await resolve(db,'certificates',required(o,'replacement'));
   const targets=await db.query('select id from endpoints where certificate_id=$1',[c.id]);if(!targets.length)throw Error('A renewal requires at least one recorded endpoint');
   const active=await db.query("select id from renewals where certificate_id=$1 and status<>'closed'",[c.id]);if(active.length)throw Error('An open renewal already exists for this certificate');
   out=await insert(db,'renewals',{code:code(required(o,'code')),certificate_id:c.id,replacement_id:replacement.id,owner:required(o,'owner'),due_on:date(required(o,'due-on')),rollback_plan:required(o,'rollback')});
   await validReplacement(db,out);for(const t of targets)await insert(db,'renewal_targets',{renewal_id:out.id,endpoint_id:t.id});await audit(db,cmd,actor,null,out);
  }else if(cmd==='approve-renewal'){
   const old=await resolve(db,'renewals',required(o,'ref'));if(old.status!=='planned')throw Error('Only a planned renewal can be approved');await validReplacement(db,old);
   [out]=await db.query("update renewals set status='approved',approved_by=$1,approved_at=now(),approval_evidence=$2 where id=$3 returning *",[actor,required(o,'evidence'),old.id]);await audit(db,cmd,actor,old,out);
  }else if(cmd==='record-install'){
   const r=await resolve(db,'renewals',required(o,'renewal')),e=await resolve(db,'endpoints',required(o,'endpoint'));
   if(r.status!=='approved')throw Error('Renewal must be approved before recording installation');await validReplacement(db,r);
   if(!(await db.query('select id from renewal_targets where renewal_id=$1 and endpoint_id=$2',[r.id,e.id])).length)throw Error('Endpoint is not a target of this renewal');
   if(e.certificate_id!==r.certificate_id&&e.certificate_id!==r.replacement_id)throw Error('Endpoint has changed outside this renewal');
   const at=recent(required(o,'installed-at'));if(Date.parse(at)<Date.parse(r.approved_at)||Date.parse(at)<Date.parse(e.observed_at))throw Error('Installation cannot predate approval or the current observation');
   out=await insert(db,'installations',{renewal_id:r.id,endpoint_id:e.id,certificate_id:r.replacement_id,actor,evidence:required(o,'evidence'),installed_at:at});
   const [after]=await db.query('update endpoints set certificate_id=$1,observed_at=$2 where id=$3 returning *',[r.replacement_id,at,e.id]);await audit(db,cmd,actor,e,after,out.evidence);
  }else if(cmd==='verify-endpoint'){
   const e=await resolve(db,'endpoints',required(o,'ref'));const at=recent(required(o,'checked-at'));
   if(Date.parse(at)<Date.parse(e.observed_at))throw Error('Verification cannot predate the current observation');
   if(!['pass','fail'].includes(o.result))throw Error('result must be pass or fail');
   const fp=fingerprint(required(o,'fingerprint'));const [c]=await db.query('select * from certificates where id=$1',[e.certificate_id]);
   if(o.result==='pass'&&fp!==c.fingerprint)throw Error('Passing fingerprint must match the expected certificate');
   out=await insert(db,'verifications',{endpoint_id:e.id,fingerprint:fp,result:o.result,evidence:required(o,'evidence'),actor,checked_at:at});await audit(db,cmd,actor,null,out);
  }else if(cmd==='close-renewal'){
   const old=await resolve(db,'renewals',required(o,'ref'));if(old.status!=='approved')throw Error('Only an approved renewal can close');await validReplacement(db,old);
   const [p]=await db.query('select * from renewal_progress where id=$1',[old.id]);if(!p.target_count||p.verified_count!==p.target_count)throw Error('Every target needs installation evidence and a current passing verification');
   [out]=await db.query("update renewals set status='closed',closed_at=now() where id=$1 returning *",[old.id]);await audit(db,cmd,actor,old,out,required(o,'evidence'));
  }else if(cmd==='set-state'){
   const old=await resolve(db,'certificates',required(o,'ref'));if(!['active','retired','revoked'].includes(o.state))throw Error('state must be active, retired or revoked');
   if(o.state==='retired'&&(await db.query('select id from endpoints where certificate_id=$1',[old.id])).length)throw Error('Cannot retire a certificate still assigned to an endpoint');
   if(old.state==='revoked'&&o.state==='active')throw Error('A revoked certificate cannot be reactivated');
   [out]=await db.query('update certificates set state=$1 where id=$2 returning *',[o.state,old.id]);await audit(db,cmd,actor,old,out,required(o,'evidence'));
  }else if(cmd==='log'){
   const r=await resolve(db,o.kind||'certificates',required(o,'ref'));await audit(db,cmd,actor,r,r,required(o,'note'));out={record:r.id,note:o.note};
  }else if(cmd==='import')out=await importDigicert(db,o,pos,actor);
  else throw Error('Unsupported mutation');
  await db.exec(o['dry-run']?'ROLLBACK':'COMMIT');return Array.isArray(out)?out:[out];
 }catch(e){await db.exec('ROLLBACK');throw e;}
}
async function importDigicert(db,o,pos,actor){
 if(pos[0]!=='digicert')throw Error('Use import digicert');
 const raw=fs.readFileSync(required(o,'file'),'utf8');
 if(/-----BEGIN [A-Z ]*PRIVATE KEY-----|password|private.?key|api.?key|secret/i.test(raw))throw Error('Import accepts certificate metadata only; remove credential columns and material');
 const rows=parseCsv(raw);if(!rows.length)throw Error('CSV contains no certificate rows');
 const map=o.map?JSON.parse(fs.readFileSync(o.map,'utf8')):{};
 const aliases={fingerprint:['Thumbprint (SHA256)','SHA256 fingerprint','fingerprint'],common_name:['Common name','common_name'],serial_number:['Serial number','serial_number'],issuer:['Issuer','Issuer common name'],not_before:['Valid from','Not before','Issued date','not_before'],not_after:['Valid to','Not after','Expiration date','not_after']};
 const grouped=new Map();
 for(const row of rows){
  const v={};for(const [key,names]of Object.entries(aliases))v[key]=pick(row,...(map[key]?[map[key]]:names));
  v.fingerprint=fingerprint(v.fingerprint);if(!v.common_name||!v.serial_number)throw Error('Each row needs Common name and Serial number');
  // Date-only exports are accepted explicitly as UTC midnight and retain the original value.
  for(const k of ['not_before','not_after']){if(/^\d{4}-\d{2}-\d{2}$/.test(v[k]))v[k]+='T00:00:00Z';v[k]=stamp(v[k]);}
  if(Date.parse(v.not_after)<=Date.parse(v.not_before))throw Error('Expiry must be after issuance');
  v.trust_type=trust(o['trust-type']||'unknown');
  const old=grouped.get(v.fingerprint);if(old&&JSON.stringify(old.data)!==JSON.stringify(v))throw Error('Conflicting metadata for one fingerprint');
  if(old)old.rows.push(row);else grouped.set(v.fingerprint,{data:v,rows:[row]});
 }
 let inserted=0,unchanged=0;
 for(const {data,rows:sourceRows}of grouped.values()){
  const [old]=await db.query('select * from certificates where fingerprint=$1',[data.fingerprint]);
  if(old){for(const k of Object.keys(data)){const a=['not_before','not_after'].includes(k)?new Date(old[k]).toISOString():old[k];if(a!==data[k])throw Error(`Changed metadata for existing fingerprint: ${k}. Review the source before importing.`);}unchanged++;}
  else{const c=await insert(db,'certificates',{...data,source_data:JSON.stringify({vendor:'digicert',rows:sourceRows})});await audit(db,'import',actor,null,c);inserted++;}
 }
 await insert(db,'imports',{source:'digicert',file_hash:crypto.createHash('sha256').update(raw).digest('hex'),actor,inserted,unchanged});
 return [{rows:rows.length,certificates:grouped.size,inserted,unchanged,dry_run:!!o['dry-run']}];
}
export function parseArgs(args){const pos=[],o={};for(let i=0;i<args.length;i++){const a=args[i];if(a.startsWith('--')){const eq=a.indexOf('=');const k=a.slice(2,eq<0?undefined:eq);if(eq>=0)o[k]=a.slice(eq+1);else if(['json','dry-run','critical'].includes(k))o[k]=true;else if(args[i+1]&&!args[i+1].startsWith('--'))o[k]=args[++i];else o[k]=true;}else pos.push(a);}return {cmd:pos.shift()||'help',o,pos};}
export function format(rows){if(Array.isArray(rows)){if(!rows.length)return '  (none)';const clean=rows.map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k,v instanceof Date?v.toISOString():typeof v==='object'&&v!==null?JSON.stringify(v):v])));return table(clean,Object.keys(clean[0]).map(key=>({key,label:key,width:70})));}return Object.entries(rows).map(([k,v])=>k+'\n'+format(v)).join('\n\n');}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){const {cmd,o,pos}=parseArgs(process.argv.slice(2));let db;try{db=await getDb();const out=await run(db,cmd,o,pos);console.log(o.json?JSON.stringify(out,null,2):format(out));}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}}
