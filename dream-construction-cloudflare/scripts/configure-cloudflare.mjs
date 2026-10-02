import {readFileSync,writeFileSync} from 'node:fs';
const config=JSON.parse(readFileSync('wrangler.json','utf8'));
const id=process.env.CLOUDFLARE_D1_DATABASE_ID||config.d1_databases[0].database_id;
if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id))throw Error('Set CLOUDFLARE_D1_DATABASE_ID to your D1 database ID in GitHub Actions repository variables, or replace the placeholder in wrangler.json.');
config.d1_databases[0].database_id=id;writeFileSync('wrangler.json',JSON.stringify(config,null,2)+'\n');console.log('Cloudflare D1 binding configured.');
