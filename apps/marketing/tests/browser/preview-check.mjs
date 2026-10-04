import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:3000';
const portal = process.env.PORTAL_URL || `${base}/portal-preview/index.html`;
const evidence = 'docs/preview-evidence';
await mkdir(evidence, {recursive:true});
const browser = await chromium.launch({ executablePath: process.env.TEST_CHROME || undefined, args:['--no-sandbox'] });
const checks=[],errors=[];
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
context.setDefaultTimeout(7000);
const page=await context.newPage();
page.on('pageerror',e=>errors.push(e.message));
async function check(name,fn){try{await fn();checks.push({name,result:'pass'})}catch(e){checks.push({name,result:'fail',detail:e.message})}}
async function responsive(url,name){
 for(const width of [320,390,768,1280,1440]){
  await page.setViewportSize({width,height:900});await page.goto(url,{waitUntil:'networkidle'});
  const sizes=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));
  assert.ok(sizes.document<=sizes.viewport+1,`${name} ${width}: overflow ${sizes.document}`);
  await page.screenshot({path:`${evidence}/${name}-${width}.png`});
 }
}
await check('Marketing reflows at five widths',()=>responsive(base,'marketing'));
await check('Marketing funnel exposes preview and onboarding',async()=>{
 await page.goto(base,{waitUntil:'networkidle'});
 assert.ok(await page.getByRole('heading',{name:'A website. All your own.'}).isVisible());
 assert.ok(await page.locator('a[href="/brief"]').count());
 assert.equal(await page.locator('iframe').count(),0);await page.goto(base+'/how-we-work');assert.ok(await page.locator('.mk-portal-summary a[href="/preview"]').isVisible());
});
await check('Onboarding sample can save, reload and complete example checkout',async()=>{
 await page.goto(`${base}/preview/start`,{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Use the Mori House example'}).click();
 await page.getByRole('textbox',{name:'Business name',exact:true}).fill('Mori House');
 await page.getByRole('button',{name:'Save and exit',exact:true}).click();
 assert.ok(await page.getByRole('heading',{name:'A little progress. Kept for later.'}).isVisible());
 await page.reload({waitUntil:'networkidle'});await page.locator('[name="businessName"]').waitFor();
 assert.equal(await page.getByRole('textbox',{name:'Business name',exact:true}).inputValue(),'Mori House');
 await page.getByRole('button',{name:'Save & continue'}).click();
 assert.ok(await page.getByRole('heading',{name:'Bring Mori House into form.'}).isVisible());
 await page.getByRole('button',{name:'Explore example checkout'}).click();
 assert.ok(await page.getByRole('link',{name:'Open Initial Direction'}).isVisible());
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('ff-preview-onboarding-v1')));
 assert.ok(saved.name && !('password' in saved));
 
 await page.screenshot({path:`${evidence}/onboarding-complete.png`});
});
await check('First preview has its own price and revision scope',async()=>{
 await page.goto(`${base}/preview/start?package=first`,{waitUntil:'networkidle'});await page.getByRole('button',{name:'Use the Mori House example'}).click();
 await page.getByRole('button',{name:'Save & continue'}).click();
 assert.ok(await page.getByText('A$199',{exact:true}).count());assert.ok(await page.getByText('1 revision round, with any number of Directions.').isVisible());
});
await check('Onboarding reflows at five widths',()=>responsive(`${base}/preview/start`,'onboarding'));
await check('Portal reflows at five widths',()=>responsive(portal,'portal'));
await check('Portal page navigation and direction creation',async()=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto(portal,{waitUntil:'networkidle'});
 await page.locator('.canvasbar [data-page="Menu"]').click();assert.ok(await page.locator('.mori-menu-list').isVisible());
 await page.locator('.canvasbar [data-page="Home"]').click();await page.locator('#addDirection').click();
 await page.locator('#directionText').fill('Keep the opening message clear.');await page.locator('#saveDirection').click();
 assert.ok(await page.getByText('Keep the opening message clear.',{exact:true}).isVisible());
 await page.locator('#saveBtn').click();
 assert.match(await page.locator('#saveState').textContent(),/Saved|saved/);
 await page.reload({waitUntil:'networkidle'});assert.ok(await page.getByText('Keep the opening message clear.',{exact:true}).isVisible());
});
await check('Direction text persists and Send preserves revision allowance',async()=>{
 await page.goto(`${portal}?stage=direction`,{waitUntil:'networkidle'});
 await page.locator('[data-initial-text="business"]').fill('Seasonal Japanese dining, with a quieter evening pace.');
 await page.locator('#saveBtn').click();await page.reload({waitUntil:'networkidle'});
 assert.equal(await page.locator('[data-initial-text="business"]').inputValue(),'Seasonal Japanese dining, with a quieter evening pace.');
 await page.locator('#initialSend').click();await page.locator('#commSendConfirm').click();
 const allowance=await page.evaluate(()=>JSON.parse(localStorage.getItem('fourthform-mori-local-v5')).revisionUsed);assert.equal(allowance,0);
 await page.locator('#initialStartBuild').click();assert.ok(await page.locator('#initialSend').isDisabled());
 assert.equal(await page.locator('[data-initial-text="business"]').getAttribute('readonly'),'');
 await page.locator('#initialUnlock').click();assert.ok(await page.locator('#initialSend').isEnabled());
});
await check('Drawing keeps editable vector strokes and keyboard dismiss restores focus',async()=>{
 await page.locator('[data-initial-add="drawing"]').click();
 const surface=page.locator('#sketchSVG');const rect=await surface.boundingBox();assert.ok(rect);
 await page.mouse.move(rect.x+40,rect.y+40);await page.mouse.down();await page.mouse.move(rect.x+170,rect.y+90,{steps:6});await page.mouse.up();
 await page.locator('#sketchDone').click();assert.ok(await page.locator('.comm-drawing-preview polyline').count());
 await page.locator('#saveBtn').click();await page.locator('#initialLink').click();await page.keyboard.press('Escape');
 assert.equal(await page.locator('#initialLink').evaluate(e=>e===document.activeElement),true);
 await page.screenshot({path:`${evidence}/direction-desktop.png`});
});
await check('Review image proposal leaves the website unchanged',async()=>{
 await page.locator('#leftRail [data-stage="review"]').click();
 const before=await page.locator('[data-edit-image="home-hero"] img').getAttribute('src');
 await page.locator('#asset').click();
 await page.getByText('Proposed replacement · website unchanged',{exact:true}).waitFor();
 assert.equal(await page.locator('[data-edit-image="home-hero"] img').getAttribute('src'),before);
 await page.locator('#saveBtn').click();
});
await check('Revision confirmation, submit once, reload and withdrawal',async()=>{
 await page.locator('#submitBtn').click();assert.ok(await page.locator('#revisionConfirm').isDisabled());
 await page.locator('#revisionCancel').click();
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('fourthform-mori-local-v5')).revisionUsed),0);
 await page.locator('#submitBtn').click();await page.locator('#revisionAcknowledge').check();await page.locator('#revisionConfirm').focus();await page.keyboard.press('Enter');
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('fourthform-mori-local-v5')).revisionUsed),1);
 await page.reload({waitUntil:'networkidle'});await page.locator('#leftRail [data-stage="review"]').click();assert.ok(await page.locator('#submitBtn').isDisabled());
 await page.locator('#reviewWithdraw').click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('fourthform-mori-local-v5')).revisionUsed),0);
 assert.ok(await page.locator('#submitBtn').isEnabled());
});
await check('CMS saved content appears on the reviewed page',async()=>{
 await page.locator('#leftRail [data-view="pages"]').click();
 await page.locator('[data-view-panel="pages"] [data-field="heading"]').fill('Dinner, with room to linger.');
 await page.locator('[data-ops="review-cms"]').click();await page.locator('[data-ops="save-cms"]').click();await page.locator('[data-ops="open-site"]').click();
 assert.equal(await page.locator('.mori-home-hero h1').textContent(),'Dinner, with room to linger.');
});
await check('SEO inspection responds to missing information',async()=>{
 await page.locator('#leftRail [data-view="seo"]').click();await page.locator('[data-field="seoTitle"]').fill('');
 await page.locator('[data-ops="inspect-seo"]').click();assert.ok(await page.getByText('Add a search title before publishing.',{exact:false}).isVisible());
 await page.locator('#opsModal [data-ops="close-dialog"]').last().click();
});
await check('Analytics range updates metrics and chart',async()=>{
 await page.locator('#leftRail [data-view="analytics"]').click();const before=await page.locator('.ops-chart path').last().getAttribute('d');
 await page.locator('[data-range="0"]').click();assert.equal(await page.locator('[data-metric]').first().textContent(),'642');
 const after=await page.locator('.ops-chart path').last().getAttribute('d');const transformed=await page.locator('.ops-chart path').last().getAttribute('transform');
 assert.ok(after!==before||transformed,'Chart should reflect the selected period');
 await page.screenshot({path:`${evidence}/analytics-desktop.png`});
});
await check('Billing preview can explore Pro and return to Core',async()=>{
 await page.locator('#leftRail [data-view="billing"]').click();await page.locator('[data-ops="upgrade-pro"]').click();
 await page.locator('[data-ops="confirm-pro"]').click();assert.ok(await page.getByRole('heading',{name:'Advanced tools Active'}).isVisible());
 await page.locator('[data-ops="manage-pro"]').click();await page.locator('[data-ops="cancel-pro"]').click();
 assert.ok(await page.getByRole('heading',{name:'Included tools Included'}).isVisible());
});

await check('Operational drafts recover and Reset clears all sample settings',async()=>{
 await page.locator('#leftRail [data-view="seo"]').click();
 await page.locator('[data-field="seoTitle"]').fill('An unfinished search title');
 await page.reload({waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Restore draft',exact:true}).click();
 await page.locator('#leftRail [data-view="seo"]').click();
 assert.equal(await page.locator('[data-field="seoTitle"]').inputValue(),'An unfinished search title');
 await page.locator('[data-view-panel="seo"] [data-ops="save"]').click();
 await page.locator('#projectBtn').click();
 page.once('dialog',d=>d.accept());await page.locator('#resetLocalBtn').click();
 assert.equal(await page.evaluate(()=>localStorage.getItem('fourthform-operations-preview-v1')),null);
 await page.locator('#leftRail [data-view="seo"]').click();
 assert.match(await page.locator('[data-field="seoTitle"]').inputValue(),/Mori House/);
});

await check('CMS page drafts do not publish on navigation',async()=>{
 await page.locator('#leftRail [data-view="pages"]').click();
 await page.locator('[data-view-panel="pages"] [data-page="Home"]').click();
 await page.locator('[data-field="heading"]').fill('An unsaved Home heading');
 await page.locator('[data-view-panel="pages"] [data-page="Menu"]').click();
 await page.locator('#leftRail [data-stage="review"]').click();
 await page.locator('.canvasbar [data-page="Home"]').click();
 assert.notEqual(await page.locator('.mori-home-hero h1').textContent(),'An unsaved Home heading');
 await page.locator('#leftRail [data-view="pages"]').click();
 await page.locator('[data-view-panel="pages"] [data-page="Home"]').click();
 assert.equal(await page.locator('[data-field="heading"]').inputValue(),'An unsaved Home heading');
});
await check('Analytics sources match the selected visitors total',async()=>{
 await page.locator('#leftRail [data-view="analytics"]').click();
 for(const range of ['0','1','2']){await page.locator(`[data-range="${range}"]`).click();const total=Number((await page.locator('[data-metric]').first().textContent()).replaceAll(',',''));const sum=await page.locator('[data-report-kind="sources"]').evaluate(el=>[...el.closest('table').querySelectorAll('tbody tr')].reduce((n,row)=>n+Number(row.lastElementChild.textContent.replaceAll(',','')),0));assert.equal(sum,total);}
});

await check('No empty named buttons in active portal surface',async()=>{
 const unnamed=await page.locator('button:visible').evaluateAll(es=>es.filter(e=>!e.textContent.trim()&&!e.getAttribute('aria-label')&&!e.getAttribute('title')).length);
 assert.equal(unnamed,0);
});
await writeFile(`${evidence}/browser-results.json`,JSON.stringify({checkedAt:new Date().toISOString(),base,portal,checks,uncaughtErrors:errors},null,2));
await browser.close();
console.log(JSON.stringify({checks,uncaughtErrors:errors},null,2));
if(checks.some(c=>c.result==='fail')||errors.length)process.exitCode=1;
