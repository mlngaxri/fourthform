import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const base=process.env.PREVIEW_URL||'http://127.0.0.1:3000';
const projects=JSON.parse(await readFile('lib/portfolio/selection.json','utf8'));
const browser=await chromium.launch({args:['--no-sandbox']});const results=[];await mkdir('docs/preview-evidence',{recursive:true});
async function check(name,fn){const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await c.newPage();try{await fn(page);results.push({name,result:'pass'});}catch(e){results.push({name,result:'fail',detail:e.message});}finally{await c.close();}}
async function briefReady(page){await page.waitForFunction(()=>document.querySelector('[name="businessName"]')?.matches(':enabled'));}
await check('Every design uses original source, an original recording or the original still',async page=>{
 for(const project of projects){
  await page.goto(`${base}/work/${project.id}`);await page.locator('.original-design-page').waitFor();
  assert.equal(await page.locator('h1').textContent(),project.title);
  assert.equal(await page.locator('.original-design-page').getAttribute('data-preview-kind'),project.originalSite?'website':project.recording?'recording':'image');
  assert.equal(await page.locator('.original-design-intro a').getAttribute('href'),`/brief?reference=${project.id}`);
  assert.equal(await page.locator('.concept-site,.concept-enquiry').count(),0,'Reconstructed sample websites must never replace the originals');
  if(project.originalSite){
   assert.equal(await page.locator('.original-site-frame').getAttribute('src'),project.originalSite);
   assert.equal(await page.getByRole('link',{name:'Open full screen'}).getAttribute('href'),project.originalSite);
  }else{
   await page.locator('.original-media>img').first().evaluate(image=>image.decode());
   assert.equal(await page.locator('.original-media>img').first().getAttribute('src'),`/work/${project.id}.webp`);
   assert.match(await page.locator('.original-source-note').textContent(),project.recording?/original motion recording.*Interactive source is not available/:/original full-page image/);
  }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),project.id+' overflows on a phone');
 }
});
await check('NeuralKinetics restores the actual animated site and below-fold content',async page=>{
 await page.goto(base+'/work/human-machine');const original=page.frameLocator('.original-site-frame');
 await original.getByRole('heading',{name:'NeuralKinetics',exact:true}).waitFor();
 assert.equal(await original.locator('.hands-canvas').count(),1);assert.equal(await original.getByRole('list',{name:'Our disciplines'}).locator('li').count(),6);
 await original.locator('.about-bio').scrollIntoViewIfNeeded();assert.match(await original.locator('.about-bio').textContent(),/intersection of biology and computation/);
});
await check('An unavailable recording retains the original image with a clear status',async page=>{
 await page.route('**/*bewpostArea.mp4',route=>route.abort());
 await page.goto(base+'/work/oyla');await page.getByRole('button',{name:'Play original recording',exact:true}).click();
 await page.getByRole('status').filter({hasText:'Motion preview is unavailable.'}).waitFor();
 await page.locator('.original-media>img').first().evaluate(image=>image.decode());assert.ok(await page.locator('.original-media>img').first().isVisible());
 assert.equal(await page.getByRole('button',{name:'Play original recording',exact:true}).count(),0);
});
await check('Home navigation and useful content continue below the first viewport',async page=>{await page.goto(base);await page.getByRole('button',{name:'Open navigation'}).click();assert.ok(await page.locator('#mk-mobile-menu a[href="/"]').isVisible());await page.getByRole('button',{name:'Close navigation'}).click();await page.locator('.ff-scroll-cue').click();assert.equal(new URL(page.url()).hash,'#your-website');assert.ok(await page.getByRole('heading',{name:'A good website makes your business clear.'}).isVisible());assert.equal(await page.locator('.ff-home-paths>a').count(),3);});
await check('Real brief stays blank, saves reliably and downloads the visitor answers',async page=>{await page.goto(base+'/brief?reference=keel');await briefReady(page);assert.equal(await page.locator('[name="businessName"]').inputValue(),'');await page.locator('[name="businessName"]').fill('Cedar Workshop');await page.locator('[name="businessDescription"]').fill('Handmade furniture for Brisbane homes.');await page.getByRole('textbox',{name:'Who is the website for?'}).fill('Homeowners in Brisbane.');await page.getByRole('button',{name:'Save brief',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.brief-status')?.textContent.startsWith('Saved on this device.'));await page.reload();await briefReady(page);assert.equal(await page.locator('[name="businessName"]').inputValue(),'Cedar Workshop');assert.match(await page.getByRole('textbox',{name:'Design references'}).inputValue(),/work\/keel/);const promise=page.waitForEvent('download');await page.getByRole('button',{name:'Download brief'}).click();const download=await promise;const text=await readFile(await download.path(),'utf8');assert.match(text,/Cedar Workshop/);assert.match(text,/Homeowners in Brisbane/);assert.ok(!(await page.locator('body').innerText()).includes('Example checkout'));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'docs/preview-evidence/real-brief-phone.png',fullPage:true});});
await check('Incomplete drafts can be saved and unsaved navigation can be cancelled',async page=>{await page.setViewportSize({width:1440,height:900});await page.goto(base+'/brief?package=first');await page.locator('[name="businessName"]').fill('An early idea');await page.getByRole('textbox',{name:'Email',exact:true}).fill('unfinished@');page.once('dialog',dialog=>dialog.dismiss());await page.locator('.mk-wordmark').click();assert.equal(new URL(page.url()).pathname,'/brief');assert.equal(await page.locator('[name="businessName"]').inputValue(),'An early idea');await page.getByRole('button',{name:'Save brief',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.brief-status')?.textContent.startsWith('Saved on this device.'));await page.reload();await briefReady(page);assert.equal(await page.locator('[name="businessName"]').inputValue(),'An early idea');assert.equal(await page.locator('[name="businessDescription"]').inputValue(),'');assert.equal(await page.getByRole('textbox',{name:'Email',exact:true}).inputValue(),'unfinished@');await page.goto(base+'/brief');await page.waitForFunction(()=>document.querySelector('.brief-scope')?.textContent.includes('One-page website · A$199'));assert.match(await page.locator('.brief-scope').textContent(),/One-page website · A\$199/);});
await writeFile('docs/preview-evidence/site-exploration-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await browser.close();if(results.some(r=>r.result==='fail'))process.exitCode=1;
