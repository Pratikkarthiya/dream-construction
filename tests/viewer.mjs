import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import worker from '../worker/index.js';

const db=new DatabaseSync(':memory:');
for(const file of readdirSync('drizzle').filter(file=>file.endsWith('.sql')).sort())db.exec(readFileSync('drizzle/'+file,'utf8'));
db.exec("INSERT INTO accounts VALUES('admin','hash','salt','admin');INSERT INTO accounts VALUES('viewer','hash','salt','viewer');INSERT INTO workers VALUES('w1','Test Worker','Labourer',60000);INSERT INTO sites VALUES('s1','Solar Site');INSERT INTO attendance(id,worker,date,site,units,rate,ot_hours,marked_by) VALUES('a1','w1','2026-10-03','s1',2,60000,1,'admin');INSERT INTO payments VALUES('p1','w1','2026-10-03',10000,'Advance','Test');");
const tokens={admin:'a'.repeat(64),viewer:'c'.repeat(64)};
for(const [role,token] of Object.entries(tokens)){const hash=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))).toString('hex');db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash,role,Date.now()+600000);}
const DB={prepare(sql){let args=[];return{bind(...values){args=values;return this},async run(){return db.prepare(sql).run(...args)},async all(){return{results:db.prepare(sql).all(...args)}},async first(){return db.prepare(sql).get(...args)}}},async batch(statements){return Promise.all(statements.map(statement=>statement.all()))}};
const call=(role,path,body)=>worker.fetch(new Request('https://test.local/api/'+path,{method:body?'POST':'GET',headers:{Cookie:'__Host-labour_session='+tokens[role],...(body?{'Content-Type':'application/json',Origin:'https://test.local'}:{})},body:body?JSON.stringify(body):undefined}),{DB});

const dataResponse=await call('viewer','data');
assert.equal(dataResponse.status,200);
const data=await dataResponse.json();
assert.equal(data.user.role,'viewer');
assert.equal(data.workers.length,1);
assert.equal(data.payments.length,1);
assert.equal((await call('viewer','export?month=2026-10')).status,200);
for(const path of ['workers','sites','payments','payments/delete','attendance','attendance/delete','members'])assert.equal((await call('viewer',path,{id:'p1'})).status,403,path);

assert.equal((await call('admin','payments/delete',{id:'p1'})).status,200);
assert.equal(db.prepare('SELECT COUNT(*) count FROM payments').get().count,0);
console.log('PASS: viewer has full read/export access, all writes are denied, and admin can remove payments.');
