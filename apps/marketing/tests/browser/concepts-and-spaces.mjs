import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const base=process.env.PREVIEW_URL||'http://127.0.0.1:3000';
const concepts=JSON.parse(await readFile('lib/portfolio/selection.json','utf8'));
const browser=await chromium.launch({args:['--no-sandbox']});
const results=[],errors=[];await mkdir('docs/preview-evidence',{recursive:true});
async function check(name,fn,options={}){const c=await browser.newContext({viewport:{width:1440,height:1080},reducedMotion:'reduce',...options}),p=await c.newPage();p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push({name,error:e.message}));try{await fn(p);results.push({name,result:'pass'});}catch(e){results.push({name,result:'fail',detail:e.message});}finally{await c.close();}}
await check('All 20 portfolio routes preserve the original visual designs',async p=>{
 for(const project of concepts){
  await p.goto(`${base}/work/${project.id}`);await p.locator('.original-media img').evaluate(image=>image.decode());assert.equal(await p.locator('h1').textContent(),project.title);
  const dimensions=await p.locator('.original-media img').evaluate(image=>({width:image.naturalWidth,height:image.naturalHeight}));assert.equal(dimensions.width,project.width);assert.equal(dimensions.height,project.height);
  assert.equal(await p.locator('.original-design-intro a').getAttribute('href'),`/preview/start?reference=${project.id}`);
  assert.equal(await p.locator('.concept-enquiry').count(),0);assert.ok(!(await p.locator('body').innerText()).includes('\u2014'));
  await p.setViewportSize({width:320,height:844});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),project.id+' overflows on a phone');await p.setViewportSize({width:1440,height:1080});
 }
});
await check('Focused portal spaces expose their own navigation and every major feature is reachable',async p=>{
 const spaces={design:['overview','direction','build','review'],content:['pages','states','settings'],insight:['analytics','seo','connections','settings'],launch:['launch','domains','billing','settings']},covered=new Set();
 for(const [id,views] of Object.entries(spaces)){
  await p.goto(`${base}/portal-preview/index.html?space=${id}&view=unknown`);assert.equal(await p.locator('html').getAttribute('data-preview-space'),id);
  const visible=await p.locator('#leftRail button:not([hidden])').evaluateAll(nodes=>nodes.filter(n=>n.dataset.view||n.dataset.stage).map(n=>n.dataset.view||n.dataset.stage));assert.deepEqual(visible,views);
  assert.ok((await p.locator('.ops-mobile-select option').evaluateAll(nodes=>nodes.map(n=>n.value))).every(view=>views.includes(view)),'Phone selectors stay focused on the space');assert.ok((await p.locator('#mobileDock button').evaluateAll(nodes=>nodes.map(n=>n.dataset.view))).every(view=>views.includes(view)),'Phone shortcuts stay focused on the space');
  for(const view of views){covered.add(view);await p.locator(`#leftRail [data-view="${view}"],#leftRail [data-stage="${view}"]`).click();await p.locator(`[data-view-panel="${view}"]`).waitFor({state:'visible'});}
  await p.setViewportSize({width:320,height:844});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.setViewportSize({width:1440,height:1080});
 }
 assert.equal(covered.size,13);
});
await check('Focused saved drafts and preferences cannot change the complete workspace',async p=>{
 await p.goto(`${base}/portal-preview/index.html?space=content`);await p.locator('[data-field="heading"]').fill('Content-space-only heading');await p.locator('[data-ops="review-cms"]').click();await p.locator('[data-ops="save-cms"]').click();await p.reload();assert.equal(await p.locator('[data-field="heading"]').inputValue(),'Content-space-only heading');
 await p.locator('[data-ops="open-site"]').click();await p.locator('[data-view-panel="review"]').waitFor({state:'visible'});assert.equal(await p.locator('#moriPage h1').textContent(),'Content-space-only heading');assert.equal(await p.evaluate(()=>currentMode),'Browse mode');assert.match(await p.locator('.preview-space-heading a').getAttribute('href'),/\?view=review&from=content&package=site$/);
 await p.goto(`${base}/portal-preview/index.html?view=pages`);assert.equal(await p.locator('[data-field="heading"]').inputValue(),'Dinner, at its own pace.');
 await p.goto(`${base}/portal-preview/index.html?space=design`);await p.evaluate(()=>showView('unknown'));assert.equal(await p.evaluate(()=>currentView),'review');
 await p.goto(`${base}/portal-preview/index.html?space=not-real&view=pages`);assert.equal(await p.locator('html').getAttribute('data-preview-space'),null);await p.locator('[data-view-panel="pages"]').waitFor({state:'visible'});
});
await check('Desktop motion advances, pauses, respects preferences and survives navigation',async p=>{
 await p.goto(base);await p.waitForFunction(()=>document.querySelector('.mk-site').classList.contains('mk-motion'));
 const card=p.locator('.orbit-card').first();const first=await card.evaluate(node=>getComputedStyle(node).left);await p.waitForFunction(first=>getComputedStyle(document.querySelector('.orbit-card')).left!==first,first);
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>document.querySelector('.mk-orbit-hero').dataset.orbitRunning==='false');await p.waitForTimeout(1000);const paused=await card.evaluate(node=>getComputedStyle(node).left);await p.waitForTimeout(250);assert.equal(await card.evaluate(node=>getComputedStyle(node).left),paused);
 await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForFunction(()=>document.querySelector('.mk-orbit-hero').dataset.orbitRunning==='true');
 for(const width of [1280,1024,1440]){await p.setViewportSize({width,height:1000});const height=await p.locator('.mk-hero-wrap').evaluate(node=>node.getBoundingClientRect().height);assert.ok(height<1600,'Hero must not create an extended scroll trap');}
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>!document.querySelector('.mk-site').classList.contains('mk-motion'));await p.waitForFunction(()=>document.querySelector('.mk-orbit-hero').dataset.orbitRunning==='false');assert.equal(await p.getByRole('button',{name:/Pause motion|Play motion/}).count(),0);
 await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForFunction(()=>document.querySelector('.mk-site').classList.contains('mk-motion'));await p.goto(base+'/pricing');await p.waitForTimeout(1000);await p.reload();await p.waitForTimeout(1000);
 assert.equal(await p.locator('.mk-price-line').evaluate(node=>getComputedStyle(node).opacity),'1');
},{reducedMotion:'no-preference'});
await writeFile('docs/preview-evidence/concepts-spaces-results.json',JSON.stringify({results,uncaughtErrors:errors},null,2));console.log(JSON.stringify({results,uncaughtErrors:errors},null,2));await browser.close();if(results.some(result=>result.result==='fail')||errors.length)process.exitCode=1;
