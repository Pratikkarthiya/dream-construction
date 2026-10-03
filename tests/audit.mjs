import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import worker from '../worker/index.js';

const db=new DatabaseSync(':memory:');
for(const file of readdirSync('drizzle').filter(file=>file.endsWith('.sql')).sort())db.exec(readFileSync('drizzle/'+file,'utf8'));
db.exec("INSERT INTO accounts VALUES('admin','hash','salt','admin');INSERT INTO accounts VALUES('supervisor','hash','salt','supervisor');INSERT INTO workers VALUES('w1','Test Worker','Labourer',60000);INSERT INTO sites VALUES('s1','Solar Site');");
const tokens={admin:'a'.repeat(64),supervisor:'b'.repeat(64)};
for(const [role,token] of Object.entries(tokens)){const hash=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))).toString('hex');db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash,role,Date.now()+600000);}
const DB={prepare(sql){let args=[];return{bind(...values){args=values;return this},async run(){return db.prepare(sql).run(...args)},async all(){return{results:db.prepare(sql).all(...args)}},async first(){return db.prepare(sql).get(...args)}}},async batch(statements){return Promise.all(statements.map(statement=>statement.all()))}};
const call=(role,path,body)=>worker.fetch(new Request('https://test.local/api/'+path,{method:body?'POST':'GET',headers:{Cookie:'__Host-labour_session='+tokens[role],...(body?{'Content-Type':'application/json',Origin:'https://test.local'}:{})},body:body?JSON.stringify(body):undefined}),{DB});

let response=await call('supervisor','attendance',{date:'2026-10-03',entries:[{worker:'w1',site:'s1',units:2,otHours:1}]});
assert.equal(response.status,200);
response=await call('supervisor','attendance',{date:'2026-10-03',entries:[{worker:'w1',site:'s1',units:1,otHours:0}]});
assert.equal(response.status,423);
response=await call('admin','attendance/unlock',{date:'2026-10-03',supervisor:'supervisor'});
assert.equal(response.status,200);
response=await call('supervisor','attendance',{date:'2026-10-03',entries:[{worker:'w1',site:'s1',units:1,otHours:0}]});
assert.equal(response.status,200);
assert.equal(db.prepare('SELECT COUNT(*) count FROM attendance_unlocks').get().count,0);
const attendance=db.prepare('SELECT id FROM attendance').get();
response=await call('admin','attendance/delete',{id:attendance.id});
assert.equal(response.status,200);
const audit=db.prepare('SELECT action,actor FROM attendance_audit ORDER BY rowid').all();
assert.deepEqual(audit.map(row=>row.action),['created','edited','removed']);
assert.deepEqual(audit.map(row=>row.actor),['supervisor','supervisor','admin']);
const adminData=await(await call('admin','data')).json();
const supervisorData=await(await call('supervisor','data')).json();
assert.equal(adminData.audit.length,3);
assert.deepEqual(supervisorData.audit,[]);
response=await call('supervisor','attendance',{date:'2026-10-02',entries:[{worker:'w1',site:'s1',units:2,otHours:0}]});
assert.equal(response.status,403);
console.log('PASS: locked attendance, one-time admin unlock, audit history and admin-only visibility.');
