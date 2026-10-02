import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.TEST_CHROME,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const base=process.env.PREVIEW_URL||'http://127.0.0.1:3001';
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base,{waitUntil:'networkidle'});await page.waitForFunction(()=>document.querySelector('.mk-site').classList.contains('mk-motion'));await page.evaluate(async()=>{await document.fonts.ready;});await page.waitForTimeout(1200);
assert.ok(await page.locator('.mk-hero-design-image').evaluate(e=>e.complete&&e.naturalWidth>0),'Marketing portfolio image must load');
await page.screenshot({path:'docs/preview-evidence/marketing-motion.png'});const hero=await page.screenshot({type:'jpeg',quality:55});console.log('FF_FINAL_VISUAL_hero='+hero.toString('base64'));
for(const id of ['work','portal','states','pricing']){const section=page.locator('#'+id);if(await section.count()){await section.evaluate(e=>e.scrollIntoView({block:'start'}));await page.waitForTimeout(600);await page.screenshot({path:`docs/preview-evidence/marketing-${id}.png`});if(id==='states'||id==='work'){const shot=await page.screenshot({type:'jpeg',quality:55});console.log('FF_FINAL_VISUAL_'+id+'='+shot.toString('base64'));}}}
await page.goto(base+'/portal-preview/index.html',{waitUntil:'networkidle'});await page.setViewportSize({width:320,height:900});
const panels=['overview','direction','build','review','pages','analytics','seo','domains','connections','states','billing','launch'];
for(const name of panels){await page.evaluate(n=>window.showView(n),name);await page.waitForTimeout(100);const dimensions=await page.evaluate(()=>({w:innerWidth,sw:document.documentElement.scrollWidth}));assert.ok(dimensions.sw<=dimensions.w+1,name+' overflows');await page.screenshot({path:`docs/preview-evidence/mobile-${name}.png`});}
assert.equal(errors.length,0);
await writeFile('docs/preview-evidence/visual-tour-results.json',JSON.stringify({result:'pass',animatedMarketing:true,marketingImageLoaded:true,mobilePanels:panels,uncaughtErrors:errors},null,2));await browser.close();
