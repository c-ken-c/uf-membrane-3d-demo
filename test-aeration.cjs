const { chromium } = require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5189/library.html',{waitUntil:'networkidle'});
 await page.selectOption('#product-select','SMM2030-54');
 let state=await page.evaluate(()=>window.libraryInspect());
 assert.equal(state.fiberMeshes,54);assert.equal(state.diffuser.units,54);assert.equal(state.diffuser.outletsPerBox,3);assert.notEqual(state.serviceColors.air,state.serviceColors.water);
 await page.screenshot({path:'X:/Codex/Projects/Memstar/memstar-products-3d/renders/mbr54-services.png',fullPage:true});
 await page.click('#aeration-focus');assert.equal((await page.evaluate(()=>window.libraryInspect())).aerationDetail,true);
 await page.screenshot({path:'X:/Codex/Projects/Memstar/memstar-products-3d/renders/mbr-esas-closeup.png'});
 await page.selectOption('#aeration-select','perforated');assert.equal((await page.evaluate(()=>window.libraryInspect())).diffuser.mode,'perforated');
 await page.screenshot({path:'X:/Codex/Projects/Memstar/memstar-products-3d/renders/mbr-perforated-closeup.png'});
 await page.selectOption('#product-select','SMM1522-104');
 assert.equal((await page.evaluate(()=>window.libraryInspect())).fiberMeshes,104);
 await page.selectOption('#aeration-select','esas');await page.click('#explode-model');
 await page.waitForTimeout(900);await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'X:/Codex/Projects/Memstar/memstar-products-3d/renders/mbr104-services-mobile.png',timeout:60000});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.selectOption('#product-select','UF-0915E');assert.equal(await page.locator('#aeration-controls').isVisible(),false);
 assert.equal((await page.evaluate(()=>window.libraryInspect())).parts,22);
 assert.deepEqual(errors,[]);console.log('PASS: Memstar 54/104, separate water/air, ESAS/perforated, focus, explosion, mobile, UF regression');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
