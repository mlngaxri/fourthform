import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.PREVIEW_URL||'http://127.0.0.1:3000',portal=process.env.PORTAL_URL||`${base}/portal-preview/index.html`;
const browser=await chromium.launch({executablePath:process.env.TEST_CHROME||undefined,args:['--no-sandbox']});
const results=[],errors=[];await mkdir('docs/preview-evidence',{recursive:true});
async function check(name,fn,options={}){const c=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',...options}),p=await c.newPage();p.setDefaultTimeout(7000);p.on('pageerror',e=>errors.push({name,error:e.message}));try{await fn(p);results.push({name,result:'pass'});}catch(e){results.push({name,result:'fail',detail:e.message});}finally{await c.close();}}
const shot=async(p,name)=>{const data=await p.screenshot({path:`docs/preview-evidence/content-${name}.jpg`,type:'jpeg',quality:55});console.log(`FF_CONTENT_SHOT_${name}=${data.toString('base64')}`);};
await check('The first screen explains the audience, offer, price and next action',async p=>{await p.goto(base);await p.locator('.mk-hero-copy').waitFor({state:'visible'});await p.evaluate(async()=>{await document.fonts.ready;});await p.locator('.orbit-card img').first().evaluate(async image=>{await image.decode();});assert.match(await p.locator('.mk-hero-eyebrow').textContent(),/Custom websites for independent businesses/);assert.match(await p.locator('.mk-hero-copy .mk-body').textContent(),/custom website.*business clear/);assert.match(await p.locator('.mk-included').textContent(),/A\$1,500.*3 revision rounds/);assert.equal(await p.locator('.mk-hero-actions a').first().getAttribute('href'),'/work');await shot(p,'hero');});
await check('The portal introduction leads to a focused content preview without nested controls',async p=>{
 await p.goto(base);assert.equal(await p.locator('#portal iframe').count(),0);assert.equal(await p.locator('#portal button').count(),0);await p.locator('.mk-portal-showcase').click();const frame=p.frameLocator('.standalone-preview iframe');await frame.locator('[data-view-panel="pages"]').waitFor({state:'visible'});await frame.locator('[data-field="heading"]').fill('A kept example draft');await frame.locator('[data-ops="review-cms"]').click();await frame.locator('[data-ops="save-cms"]').click();await p.reload();assert.equal(await frame.locator('[data-field="heading"]').inputValue(),'A kept example draft');
});
await check('Full previews preserve task context and reject unknown views',async p=>{await p.goto(base+'/preview?view=analytics');await p.frameLocator('.standalone-preview iframe').locator('[data-view-panel="analytics"]').waitFor({state:'visible'});await p.goto(base+'/preview?view=unknown');await p.frameLocator('.standalone-preview iframe').locator('[data-view-panel="review"]').waitFor({state:'visible'});});
await check('Review instructions explain each mode as the customer changes it',async p=>{await p.goto(portal);assert.match(await p.locator('.review-guide').textContent(),/Collect the changes.*whole round/);await p.locator('#modeBtn').click();await p.locator('[data-mode="Edit site"]').click();assert.match(await p.locator('.review-guide').textContent(),/Update words and images directly/);await p.locator('#modeBtn').click();await p.locator('[data-mode="Browse mode"]').click();assert.match(await p.locator('.review-guide').textContent(),/See the website as a visitor/);});
await check('Marketing and portal describe Core and Pro with the same capabilities and prices',async p=>{await p.goto(base);await p.locator('.mk-package-details summary').click();const core=(await p.locator('.mk-price-secondary>div').first().textContent()).toLowerCase(),pro=await p.locator('.mk-price-secondary>div').last().textContent();for(const term of ['content updates','basic analytics','search details','domain management'])assert.ok(core.includes(term));assert.match(pro,/A\$39 \/ month/);for(const term of ['States','deeper analytics','search insights'])assert.ok(pro.includes(term));await p.goto(portal);await p.locator('#leftRail [data-view="billing"]').click();const billing=await p.locator('[data-view-panel="billing"]').textContent();for(const term of ['Content updates','basic analytics','search details','domain management','A$200','A$1,300','A$1,500','A$39 / month','A$150'])assert.ok(billing.includes(term),term);await p.locator('[data-ops="upgrade-pro"]').click();const dialog=await p.locator('#opsModal').textContent();for(const term of ['States','deeper analytics','search insights','A$39 / month'])assert.ok(dialog.includes(term));});
await check('New content remains readable without horizontal clipping at small widths',async p=>{await p.goto(base);for(const width of [320,390,768,1024]){await p.setViewportSize({width,height:900});for(const selector of ['.mk-hero-copy','.mk-work-context','.mk-portal-summary','.mk-price-line','.mk-faq-grid']){const size=await p.locator(selector).evaluate(e=>({width:e.clientWidth,scroll:e.scrollWidth}));assert.ok(size.scroll<=size.width+1,`${selector} clips at ${width}: ${size.scroll}/${size.width}`);}}await p.setViewportSize({width:390,height:844});await p.locator('#pricing').evaluate(e=>e.scrollIntoView({block:'start'}));await shot(p,'phone-pricing');});
await check('Rendered marketing and portal surfaces use no em dashes',async p=>{await p.goto(base);assert.ok(!(await p.locator('body').innerText()).includes('\u2014'));assert.ok(!(await p.title()).includes('\u2014'));await p.goto(portal);for(const view of ['overview','direction','build','review','pages','analytics','seo','domains','connections','states','billing','launch','settings']){await p.evaluate(view=>showView(view),view);assert.ok(!(await p.locator('.view.active').innerText()).includes('\u2014'),view);}});

await check('Pricing actions carry Site and First scope into the example checkout',async p=>{
 for(const option of ['site','first']){
  await p.goto(base);
  if(option==='first')await p.locator('.mk-package-details summary').click();
  await p.locator(option==='site'?'.mk-price-action':'.mk-first a').click();
  await p.waitForFunction(option=>document.querySelector('.obp-story footer').textContent.includes(option==='site'?'Site · A$1,500':'First · A$199'),option);
  await p.getByRole('button',{name:'Use the Mori House example'}).click();
  await p.getByRole('button',{name:'Save & continue'}).click();
  const summary=await p.locator('.obp-summary').textContent();
  assert.ok(summary.includes(option==='site'?'Fourthform Site':'Fourthform First'));
  assert.ok(summary.includes(option==='site'?'A$200':'A$199'));
  if(option==='site')assert.ok(summary.includes('A$1,300'));
  else assert.ok(!summary.includes('A$1,300'));
 }
});
await check('Optional States remain available in the dedicated content preview',async p=>{
 await p.goto(base);await p.locator('.mk-package-details summary').click();await p.locator('.mk-price-secondary a').click();const frame=p.frameLocator('.standalone-preview iframe');await frame.locator('[data-view-panel="states"]').waitFor({state:'visible'});assert.equal(await frame.locator('[data-field="stateName"]').inputValue(),'Evening service');
});
await check('Initial Direction confirmation clearly explains the revision boundary',async p=>{
 await p.goto(portal+'?view=direction');await p.locator('#initialSend').click();
 const paragraphs=await p.locator('#commSend .modal>p').allTextContents();
 assert.equal(paragraphs[0],'Sending Initial Direction uses no revision round. You can update the brief until building begins.');
 assert.match(paragraphs[1],/No message leaves this browser/);
 await p.locator('#commSendCancel').click();
 assert.equal(await p.evaluate(()=>ffCommunicationFields().initialDirection.sent),false);
});

await check('Editorial line breaks stay readable in content fields and summaries',async p=>{
 await p.goto(portal+'?view=pages');
 assert.equal(await p.locator('[data-field="heading"]').inputValue(),'Dinner, at its own pace.');
 await p.locator('[data-field="heading"]').fill('Dinner, at a new pace.');
 await p.locator('[data-ops="review-cms"]').click();await p.locator('[data-ops="save-cms"]').click();
 await p.locator('#leftRail [data-view="states"]').click();
 await p.locator('[data-state-preview="base"]').click();
 assert.equal(await p.locator('[data-view-panel="states"] [data-mini-heading]').textContent(),'Dinner, at a new pace.');
 await p.reload();await p.locator('#leftRail [data-view="pages"]').click();
 assert.equal(await p.locator('[data-field="heading"]').inputValue(),'Dinner, at a new pace.');
});
await writeFile('docs/preview-evidence/content-results.json',JSON.stringify({results,uncaughtErrors:errors},null,2));console.log(JSON.stringify({results,uncaughtErrors:errors},null,2));await browser.close();if(results.some(r=>r.result==='fail')||errors.length)process.exitCode=1;
