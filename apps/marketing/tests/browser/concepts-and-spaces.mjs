import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import sharp from 'sharp';
const base=process.env.PREVIEW_URL||'http://127.0.0.1:3000';
const concepts=JSON.parse(await readFile('lib/portfolio/concepts.json','utf8'));
const browser=await chromium.launch({args:['--no-sandbox']});
const results=[],errors=[];await mkdir('docs/preview-evidence',{recursive:true});
async function check(name,fn,options={}){const c=await browser.newContext({viewport:{width:1440,height:1080},reducedMotion:'reduce',...options}),p=await c.newPage();p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push({name,error:e.message}));try{await fn(p);results.push({name,result:'pass'});}catch(e){results.push({name,result:'fail',detail:e.message});}finally{await c.close();}}
await check('All 20 live concepts deliver the business copy, meaningful sections and working sample enquiries',async p=>{
 for(const concept of concepts){
  await p.goto(`${base}/work/${concept.id}`);await p.evaluate(async()=>document.fonts.ready);await p.locator('.concept-art img').evaluate(image=>image.decode());
  assert.equal(await p.locator('h1').textContent(),concept.headline);assert.equal(await p.locator('.concept-body').textContent(),concept.body);assert.equal(await p.locator('.concept-offer-grid article').count(),3);
  if(concept.layout==='landscape'){const coverage=await p.locator('.concept-art').evaluate(e=>({art:e.getBoundingClientRect().width,hero:e.closest('.concept-hero').getBoundingClientRect().width}));assert.ok(coverage.art>=coverage.hero*.99,'Landscape artwork must fill the hero');}
  assert.match(await p.locator('.concept-studio-bar').textContent(),/Fictional business/);assert.ok(!(await p.locator('body').innerText()).includes('\u2014'));
  const png=await p.screenshot();const poster=await sharp(png).webp({quality:82}).toBuffer();console.log(`FF_CONCEPT_POSTER_${concept.id}=${poster.toString('base64')}`);
  await p.locator('.concept-contact button').click();await p.locator('.concept-enquiry').waitFor({state:'visible'});
  await p.locator('.concept-enquiry [name="name"]').fill('Example visitor');await p.locator('.concept-enquiry [name="email"]').fill('visitor@example.com');await p.locator('.concept-enquiry [name="message"]').fill('I would like to know more about this concept.');
  await p.getByRole('button',{name:'Preview the response'}).click();assert.match(await p.locator('.concept-enquiry [role="status"]').textContent(),/not been saved or sent/);await p.getByRole('button',{name:'Return to the concept'}).click();
  await p.setViewportSize({width:320,height:844});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),concept.id+' overflows on a phone');assert.ok(await p.locator('.concept-hero h1').isVisible());await p.setViewportSize({width:1440,height:1080});
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
await check('Desktop motion survives resize, reduced-motion changes and reload at a lower section',async p=>{
 await p.goto(base);await p.waitForFunction(()=>document.querySelector('.mk-site').classList.contains('mk-motion'));await p.waitForTimeout(1300);
 const heroNode=await p.locator('.mk-hero-design-image').evaluateHandle(e=>e);await p.getByRole('button',{name:'OYLA',exact:true}).click();assert.ok(await p.locator('.mk-hero-design-image').evaluate((e,original)=>e===original,heroNode),'Switching designs must retain the animated image element');
 for(const width of [1280,1024,1440]){await p.setViewportSize({width,height:1000});await p.locator('#states').evaluate(e=>e.scrollIntoView({block:'end'}));await p.waitForFunction(()=>{const clip=getComputedStyle(document.querySelector('.mk-state-saturday')).clipPath;if(clip==='none')return true;const values=clip.match(/[\d.]+/g);return values&&Number(values[2])<3;});}
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>!document.querySelector('.mk-site').classList.contains('mk-motion'));assert.equal(await p.locator('.mk-state-saturday').evaluate(e=>getComputedStyle(e).clipPath),'none');
 await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForFunction(()=>document.querySelector('.mk-site').classList.contains('mk-motion'));await p.locator('#pricing').evaluate(e=>e.scrollIntoView({block:'start'}));await p.waitForTimeout(1200);await p.reload();await p.waitForTimeout(1800);
 assert.equal(await p.locator('.mk-price-line').evaluate(e=>getComputedStyle(e).opacity),'1');await p.locator('#work').evaluate(e=>e.scrollIntoView({block:'start'}));await p.waitForTimeout(1200);assert.equal(await p.locator('.work-featured .portfolio-card').first().evaluate(e=>getComputedStyle(e).opacity),'1');
},{reducedMotion:'no-preference'});
await writeFile('docs/preview-evidence/concepts-spaces-results.json',JSON.stringify({results,uncaughtErrors:errors},null,2));console.log(JSON.stringify({results,uncaughtErrors:errors},null,2));await browser.close();if(results.some(result=>result.result==='fail')||errors.length)process.exitCode=1;
