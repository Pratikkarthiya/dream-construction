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


assert.equal((await call('admin','worker-profile',{worker:'w1',phone:'9876543210',account_holder:'Test Worker',bank_name:'Test Bank',account_number:'00123456789',ifsc:'SBIN0001234'})).status,200);
const profile=await (await call('admin','worker-profile?worker=w1')).json();assert.equal(profile.profile.account_number,'00123456789');
assert.equal((await call('viewer','worker-profile?worker=w1')).status,403);
assert.equal((await call('admin','worker-file',{worker:'w1',name:'test.pdf',type:'application/pdf',kind:'document',data:Buffer.from('%PDF-1.4 test').toString('base64')})).status,200);
const id=db.prepare('SELECT id FROM worker_files').get().id;
assert.equal((await call('viewer','worker-file?id='+id)).status,403);
const file=await call('admin','worker-file?id='+id);assert.equal(file.status,200);assert.equal(await file.text(),'%PDF-1.4 test');
assert.equal((await call('viewer','worker-profile',{worker:'w1'})).status,403);
assert.equal((await call('admin','worker-file',{worker:'w1',name:'fake.pdf',type:'application/pdf',kind:'document',data:Buffer.from('not PDF').toString('base64')})).status,400);
console.log('PASS: profile preserves account number, upload/download works, invalid files rejected, viewer denied private fields and files.');
