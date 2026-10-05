import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import worker from '../worker/index.js';

const db=new DatabaseSync(':memory:');
for(const file of readdirSync('drizzle').filter(file=>file.endsWith('.sql')).sort())db.exec(readFileSync('drizzle/'+file,'utf8'));
db.exec("INSERT INTO accounts VALUES('admin','hash','salt','admin');INSERT INTO accounts VALUES('viewer','hash','salt','viewer');INSERT INTO accounts VALUES('supervisor','hash','salt','supervisor');INSERT INTO workers VALUES('w1','Test Worker','Labourer',60000);INSERT INTO sites VALUES('s1','Solar Site');INSERT INTO attendance(id,worker,date,site,units,rate,ot_hours,marked_by) VALUES('a1','w1','2026-10-03','s1',2,60000,1,'admin');INSERT INTO payments VALUES('p1','w1','2026-10-03',10000,'Advance','Test');");
const tokens={admin:'a'.repeat(64),viewer:'c'.repeat(64),supervisor:'b'.repeat(64)};
for(const [role,token] of Object.entries(tokens)){const hash=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))).toString('hex');db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash,role,Date.now()+600000);}
const DB={prepare(sql){let args=[];return{bind(...values){args=values;return this},async run(){return db.prepare(sql).run(...args)},async all(){return{results:db.prepare(sql).all(...args)}},async first(){return db.prepare(sql).get(...args)}}},async batch(statements){return Promise.all(statements.map(statement=>statement.all()))}};
const call=(role,path,body)=>worker.fetch(new Request('https://test.local/api/'+path,{method:body?'POST':'GET',headers:{Cookie:'__Host-labour_session='+tokens[role],...(body?{'Content-Type':'application/json',Origin:'https://test.local'}:{})},body:body?JSON.stringify(body):undefined}),{DB});


const first=await (await call('admin','data')).json();
assert.ok(first.workers.every(w=>'attendance_start' in w));
const create=await call('admin','workers',{name:'New Worker',role:'Labourer',rate:70000});assert.equal(create.status,200);
const created=db.prepare("SELECT w.id,r.date FROM workers w JOIN worker_roster_start r ON r.worker=w.id WHERE w.name='New Worker'").get();assert.ok(created);
const {dailyAttendance}=await import('../worker/index.js');
const before=await(await call('admin','data')).json();
assert.ok(dailyAttendance(before.workers,before.attendance,created.date).find(a=>a.worker===created.id)?.automatic);
assert.equal(db.prepare('SELECT COUNT(*) count FROM attendance WHERE worker=?').get(created.id).count,0);
const available=await(await call('supervisor','data')).json();assert.ok(!available.unavailable.some(a=>a.worker===created.id));
assert.equal((await call('supervisor','attendance',{date:created.date,entries:[{worker:created.id,units:2,site:'s1',otHours:1}]})).status,200);
const after=await(await call('admin','data')).json(),record=dailyAttendance(after.workers,after.attendance,created.date).find(a=>a.worker===created.id);
assert.equal(record.marked_by,'supervisor');assert.equal(record.units,2);assert.ok(!record.automatic);
console.log('PASS: new workers start today; automatic absence does not claim labour; supervisor can fill attendance and username is recorded.');
