import assert from 'node:assert/strict';
import worker from '../worker/index.js';

const env={DB:{prepare(){throw Error('PWA files must not access the database')}}};
const get=path=>worker.fetch(new Request('https://test.local'+path),env);

const manifestResponse=await get('/manifest.webmanifest');
assert.equal(manifestResponse.status,200);
assert.match(manifestResponse.headers.get('content-type'),/application\/manifest\+json/);
const manifest=await manifestResponse.json();
assert.equal(manifest.display,'standalone');
assert.equal(manifest.start_url,'/');
assert.ok(manifest.icons.some(icon=>icon.sizes==='any'));

const serviceWorker=await get('/service-worker.js');
assert.equal(serviceWorker.status,200);
assert.match(serviceWorker.headers.get('content-type'),/javascript/);
assert.equal(serviceWorker.headers.get('service-worker-allowed'),'/');
assert.match(await serviceWorker.text(),/dream-construction-v1/);

const icon=await get('/app-icon.svg');
assert.equal(icon.status,200);
assert.match(icon.headers.get('content-type'),/image\/svg\+xml/);

const page=await(await get('/')).text();
assert.match(page,/rel="manifest" href="\/manifest\.webmanifest"/);
assert.match(page,/id="install-app"/);
assert.match(page,/serviceWorker\.register\('\/service-worker\.js'\)/);
console.log('PASS: installable PWA manifest, icon, service worker and install button.');
