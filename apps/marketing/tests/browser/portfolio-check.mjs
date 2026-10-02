import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.PREVIEW_URL||'http://127.0.0.1:3000';
const browser=await chromium.launch({executablePath:process.env.TEST_CHROME||undefined,args:['--no-sandbox']});
const results=[],errors=[];await mkdir('docs/preview-evidence',{recursive:true});
async function check(name,fn,options={}){const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',...options}),page=await context.newPage();page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push({name,error:e.message}));try{await fn(page);results.push({name,result:'pass'});}catch(error){results.push({name,result:'fail',detail:error.message});}finally{await context.close();}}
async function imageReady(page){await page.locator('.portfolio-card-media img').evaluateAll(async images=>{for(const image of images){image.loading='eager';await image.decode();if(!image.naturalWidth)throw new Error(image.src);}});}
async function shot(page,name){const image=await page.screenshot({path:`docs/preview-evidence/portfolio-${name}.jpg`,type:'jpeg',quality:55});console.log(`FF_PORTFOLIO_VISUAL_${name}=${image.toString('base64')}`);}
await check('The collection has 20 unique local previews with source and reference actions',async page=>{
 await page.goto(base+'/work');assert.equal(await page.locator('.portfolio-card').count(),20);
 const ids=await page.locator('.portfolio-card').evaluateAll(cards=>cards.map(card=>card.dataset.project));assert.equal(new Set(ids).size,20);
 await imageReady(page);await page.evaluate(async()=>document.fonts.ready);await shot(page,'desktop');
 await page.locator('.portfolio-card').first().evaluate(element=>element.scrollIntoView({block:'start'}));await shot(page,'collection');
 for(const card of await page.locator('.portfolio-card').all()){const size=await card.evaluate(element=>({card:element.getBoundingClientRect().width,image:element.querySelector('img').getBoundingClientRect().width}));assert.ok(size.image>=size.card*.95,'The design must fill its gallery card');}
 for(const card of await page.locator('.portfolio-card').all()){
  const id=await card.getAttribute('data-project');await card.locator('button').click();
  await page.locator('.work-dialog[open]').waitFor();assert.equal(await page.locator('.work-source').getAttribute('href'),`/work/${id}`);
  assert.equal(await page.locator('.work-reference').getAttribute('href'),`/preview/start?reference=${id}`);
  await page.locator('.work-dialog-media img').evaluate(image=>image.decode());
  assert.ok((await page.locator('#work-dialog-description').textContent()).length>80);
  await page.getByRole('button',{name:'Close design preview'}).click();
 }
});
await check('Design filters update the collection, pressed state and announced count',async page=>{
 await page.goto(base+'/work');
 for(const group of ['Immersive','Editorial','Product','Expressive']){
  const button=page.getByRole('button',{name:new RegExp('^'+group)});await button.click();assert.equal(await button.getAttribute('aria-pressed'),'true');
  const sectors=await page.locator('.portfolio-card-sector').allTextContents();assert.ok(sectors.length>1&&sectors.every(text=>text.endsWith(group)));
  assert.equal(await page.locator('.work-result-count').textContent(),String(sectors.length).padStart(2,'0')+' designs');
 }
 await page.getByRole('button',{name:/^All work/}).click();assert.equal(await page.locator('.portfolio-card').count(),20);
});
await check('Keyboard exploration closes cleanly and restores focus to its card',async page=>{
 await page.goto(base+'/work');const trigger=page.getByRole('button',{name:'Explore Monolith Hero',exact:true});await trigger.click();
 assert.equal(await page.locator('#work-dialog-title').textContent(),'Monolith Hero');await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#work-dialog-title').textContent(),'OYLA');
 await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('#work-dialog-title').textContent(),'Monolith Hero');
 await page.keyboard.press('Escape');await page.locator('.work-dialog[open]').waitFor({state:'hidden'});assert.equal(await trigger.evaluate(element=>element===document.activeElement),true);assert.ok(!new URL(page.url()).searchParams.has('project'));assert.equal(await page.evaluate(()=>document.documentElement.style.overflow),'');
});
await check('Direct design links open the right preview and unknown designs remain safe',async page=>{
 await page.goto(base+'/work?project=oyla');await page.locator('.work-dialog[open]').waitFor();assert.equal(await page.locator('#work-dialog-title').textContent(),'OYLA');await page.getByRole('button',{name:'Close design preview'}).click();
 await page.goto(base+'/work?project=unknown');assert.equal(await page.locator('.work-dialog[open]').count(),0);assert.equal(await page.locator('.portfolio-card').count(),20);
});
await check('Original motion previews open by request and can return to their image',async page=>{
 await page.goto(base+'/work');await page.getByRole('button',{name:'Explore Monolith Hero',exact:true}).click();await page.locator('.work-dialog-media img').evaluate(image=>image.decode());
 await page.getByRole('button',{name:'Play original animation',exact:true}).click();await page.locator('.work-dialog-media video').waitFor();await page.waitForFunction(()=>document.querySelector('.work-dialog-media video').currentTime>0);
 await page.getByRole('button',{name:'Show original image',exact:true}).click();assert.ok(await page.locator('.work-dialog-media img').isVisible());
});
await check('A chosen design survives the example brief and seeds Initial Direction',async page=>{
 await page.goto(base+'/work?project=oyla');await page.locator('.work-reference').click();await page.locator('.obp-design-reference').waitFor();
 assert.match(await page.locator('.obp-design-reference').textContent(),/OYLA/);await page.getByRole('button',{name:'Use the Mori House example'}).click();assert.match(await page.locator('textarea').nth(1).inputValue(),/fourthform-marketing.vercel.app\/work\/oyla/);
 await page.getByRole('button',{name:'Save & continue'}).click();await page.getByRole('button',{name:'Explore example checkout'}).click();await page.getByRole('link',{name:'Open Initial Direction'}).click();
 await page.locator('[data-initial-text="links"]').waitFor();assert.match(await page.locator('[data-initial-text="links"]').inputValue(),/fourthform-marketing.vercel.app\/work\/oyla/);
});
await check('Choosing another design preserves an existing business brief and links',async page=>{
 await page.goto(base+'/preview/start');await page.evaluate(()=>localStorage.setItem('ff-preview-onboarding-v1',JSON.stringify({name:'Existing business',description:'Existing description',links:'https://example.com',goals:['Book'],feels:['Warm'],note:'Existing note'})));
 await page.goto(base+'/preview/start?reference=keel');await page.locator('[name="businessName"]').waitFor();assert.equal(await page.getByRole('textbox',{name:'Business name',exact:true}).inputValue(),'Existing business');
 assert.equal(await page.locator('textarea').nth(1).inputValue(),'https://example.com\nhttps://fourthform-marketing.vercel.app/work/keel');await page.getByRole('button',{name:'Save & continue'}).click();
 const brief=await page.evaluate(()=>JSON.parse(localStorage.getItem('ff-preview-onboarding-v1')));assert.equal(brief.note,'Existing note');assert.deepEqual(brief.goals,['Book']);
});
await check('A new reference reaches an existing editable portal brief without replacing its notes',async page=>{
 await page.goto(base+'/portal-preview/index.html?view=direction');await page.locator('[data-initial-text="business"]').fill('Keep my existing business explanation.');await page.locator('#saveBtn').click();
 await page.goto(base+'/preview/start?reference=oyla');await page.getByRole('button',{name:'Use the Mori House example'}).click();await page.getByRole('button',{name:'Save & continue'}).click();await page.getByRole('button',{name:'Explore example checkout'}).click();await page.getByRole('link',{name:'Open Initial Direction'}).click();
 assert.equal(await page.locator('[data-initial-text="business"]').inputValue(),'Keep my existing business explanation.');assert.match(await page.locator('[data-initial-text="portfolio-links"]').inputValue(),/work\/oyla/);await page.locator('#saveBtn').click();await page.reload();assert.equal(await page.locator('[data-initial-text="portfolio-links"]').count(),1);
});
await check('Portfolio, dialog and reference brief reflow at small widths',async page=>{
 for(const width of [320,390,768,1024]){
  await page.setViewportSize({width,height:844});await page.goto(base+'/work');await page.locator('.portfolio-card').first().locator('button').click();
  assert.ok(await page.getByRole('button',{name:'Close design preview'}).isVisible());
  if(width<=760){assert.ok(await page.locator('.work-dialog-media img').isVisible());await page.getByRole('button',{name:'About this design',exact:true}).click();}const reference=await page.locator('.work-reference').boundingBox();assert.ok(reference&&reference.y>=0&&reference.y+reference.height<=844,'The reference action stays in view');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.ok(await page.locator('.work-dialog').evaluate(element=>element.scrollWidth<=element.clientWidth+1));
  if(width===390)await shot(page,'phone-dialog');await page.keyboard.press('Escape');
 }
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/work');await page.evaluate(async()=>document.fonts.ready);await shot(page,'phone');
 await page.goto(base+'/preview/start?reference=oyla');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
});
await check('The homepage features the portfolio and lets visitors compare visual directions',async page=>{
 await page.goto(base);await page.locator('.mk-hero-design-image').evaluate(image=>image.decode());assert.equal(await page.locator('.work-featured .portfolio-card').count(),4);
 for(const card of await page.locator('.work-featured .portfolio-card').all()){const size=await card.evaluate(element=>({card:element.getBoundingClientRect().width,image:element.querySelector('img').getBoundingClientRect().width}));assert.ok(size.image>=size.card*.95);}
 assert.equal(await page.locator('.mk-hero-design-link').getAttribute('href'),'/work?project=monolith-hero');
 await page.locator('.work-collection-link').click();await page.locator('.portfolio-card').nth(19).waitFor();
});
await check('Portal navigation separates project, website and account tools and preserves the shared view',async page=>{
 await page.goto(base+'/portal-preview/index.html');
 const groups=await page.locator('#leftRail [data-nav-group]').evaluateAll(elements=>elements.map(group=>({name:group.dataset.navGroup,views:[...group.querySelectorAll('button')].map(button=>button.dataset.view||button.dataset.stage)})));
 assert.deepEqual(groups,[{name:'project',views:['overview','direction','build','review','launch']},{name:'website',views:['pages','analytics','seo','domains','connections','states']},{name:'account',views:['billing','settings']}]);
 await page.locator('#leftRail [data-view="analytics"]').click();assert.equal(new URL(page.url()).searchParams.get('view'),'analytics');await page.reload();await page.locator('[data-view-panel="analytics"]').waitFor({state:'visible'});
});
await check('Overview and review instructions follow submitted, completed and exhausted revision rounds',async page=>{
 await page.goto(base+'/portal-preview/index.html');
 const submit=async()=>{await page.locator('#submitBtn').click();await page.locator('#revisionAcknowledge').check();await page.locator('#revisionConfirm').click();await page.locator('#submitModal').waitFor({state:'hidden'});};
 for(let round=1;round<=3;round++){
  if(round>1){await page.locator('#addDirection').click();await page.locator('#directionText').fill(`A meaningful change for round ${round}.`);await page.locator('#saveDirection').click();}
  await submit();assert.match(await page.locator('.review-guide').textContent(),/revision is submitted/);
  await page.locator('#leftRail [data-view="overview"]').click();assert.match(await page.locator('.overview-grid .quiet-card h3').first().textContent(),new RegExp(`Revision 0${round}.*submitted`));
  await page.locator('#leftRail [data-stage="review"]').click();await page.locator('#reviewComplete').click();
 }
 await page.locator('#leftRail [data-view="overview"]').click();assert.match(await page.locator('.hero-summary h2').textContent(),/review rounds are complete/);await page.locator('[data-view-jump="launch"]').click();await page.locator('[data-view-panel="launch"]').waitFor({state:'visible'});
});
await check('Reduced motion and no JavaScript retain the complete readable collection',async page=>{
 await page.goto(base+'/work');assert.equal(await page.locator('.work-intro-star').evaluate(element=>getComputedStyle(element).animationName),'none');assert.ok(!(await page.locator('body').innerText()).includes('\u2014'));
},{reducedMotion:'reduce'});
const staticContext=await browser.newContext({javaScriptEnabled:false});const staticPage=await staticContext.newPage();await staticPage.goto(base+'/work');assert.equal(await staticPage.locator('.portfolio-card').count(),20);assert.ok(await staticPage.getByRole('link',{name:'Try a website brief',exact:true}).isVisible());await staticContext.close();
await writeFile('docs/preview-evidence/portfolio-results.json',JSON.stringify({results,uncaughtErrors:errors},null,2));console.log(JSON.stringify({results,uncaughtErrors:errors},null,2));await browser.close();if(results.some(result=>result.result==='fail')||errors.length)process.exitCode=1;
