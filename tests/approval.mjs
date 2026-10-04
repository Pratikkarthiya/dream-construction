import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import worker from '../worker/index.js';

const db=new DatabaseSync(':memory:');
for(const file of readdirSync('drizzle').filter(file=>file.endsWith('.sql')).sort())db.exec(readFileSync('drizzle/'+file,'utf8'));
db.exec("INSERT INTO accounts VALUES('admin','hash','salt','admin');INSERT INTO accounts VALUES('supervisor','hash','salt','supervisor');INSERT INTO workers VALUES('w1','Test Worker','Labourer',60000);INSERT INTO sites VALUES('s1','Solar Site');INSERT INTO attendance(id,worker,date,site,units,rate,ot_hours,marked_by) VALUES('a1','w1','2026-10-03','s1',2,60000,1,'supervisor');INSERT INTO payments VALUES('p1','w1','2026-10-03',10000,'Advance','Test');");
const tokens={admin:'a'.repeat(64),supervisor:'c'.repeat(64)};
for(const [role,token] of Object.entries(tokens)){const hash=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))).toString('hex');db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash,role,Date.now()+600000);}
const DB={prepare(sql){let args=[];return{bind(...values){args=values;return this},async run(){return db.prepare(sql).run(...args)},async all(){return{results:db.prepare(sql).all(...args)}},async first(){return db.prepare(sql).get(...args)}}},async batch(statements){return Promise.all(statements.map(statement=>statement.all()))}};
const call=(role,path,body)=>worker.fetch(new Request('https://test.local/api/'+path,{method:body?'POST':'GET',headers:{Cookie:'__Host-labour_session='+tokens[role],...(body?{'Content-Type':'application/json',Origin:'https://test.local'}:{})},body:body?JSON.stringify(body):undefined}),{DB});


const body={date:'2026-10-03',entries:[{worker:'w1',site:'s1',units:1,otHours:2}]};
assert.equal((await call('supervisor','attendance',body)).status,200);
assert.equal(db.prepare('SELECT units FROM attendance').get().units,2);
let request=db.prepare('SELECT * FROM attendance_requests').get();
assert.equal((await call('supervisor','attendance/review',{id:request.id,decision:'approve'})).status,403);
assert.equal((await call('admin','attendance/review',{id:request.id,decision:'reject'})).status,200);
assert.equal(db.prepare('SELECT units FROM attendance').get().units,2);
assert.equal((await call('supervisor','attendance',body)).status,200);
request=db.prepare("SELECT * FROM attendance_requests WHERE status='pending'").get();
assert.equal((await call('admin','attendance/review',{id:request.id,decision:'approve'})).status,200);
assert.equal(db.prepare('SELECT units FROM attendance').get().units,1);
assert.equal(db.prepare('SELECT ot_hours FROM attendance').get().ot_hours,2);
assert.equal((await call('admin','attendance/review',{id:request.id,decision:'approve'})).status,409);
console.log('PASS: pending preserves attendance; rejection preserves wages; approval applies changes; supervisor cannot approve; repeated approval blocked.');
