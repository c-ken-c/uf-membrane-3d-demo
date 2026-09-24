const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {createServer}=require('node:http');const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{
 const password=process.env.LIBRARY_PASSWORD;assert.ok(password,'Test password must be provided through environment');
 const root=path.resolve('dist');const server=createServer((req,res)=>{let rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/uf-membrane-3d-demo\//,'');if(!rel)rel='index.html';const file=path.resolve(root,rel);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'application/json');res.end(data);});});
 await new Promise(r=>server.listen(5192,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
 try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url='http://127.0.0.1:5192/uf-membrane-3d-demo/library.html';await page.goto(url);
 assert.equal(await page.locator('#product-select').count(),0);
 await page.click('#return-studio');await page.waitForURL('**/uf-membrane-3d-demo/');assert.ok(await page.locator('body').innerText());
 await page.goto(url);await page.fill('#password','incorrect');await page.click('#unlock-button');await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('不正確'));
 assert.equal(await page.locator('#return-studio').isVisible(),true);assert.equal(await page.locator('#product-select').count(),0);
 await page.fill('#password',password);await page.click('#unlock-button');await page.waitForSelector('#product-select');await page.waitForFunction(()=>window.libraryInspect?.().parts===22);
 assert.equal(await page.evaluate(()=>sessionStorage.length+localStorage.length),0);
 await page.click('#lock-library');await page.waitForSelector('#password');assert.equal(await page.locator('#product-select').count(),0);
 assert.deepEqual(errors,[]);
 for(const name of fs.readdirSync(root)){const p=path.join(root,name);if(fs.statSync(p).isFile())assert.equal(fs.readFileSync(p,'utf8').includes(password),false,'Password must not be published');}
 console.log('PASS: locked by default, return navigation, wrong password rejection, decryption, relock, no persisted credentials');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
