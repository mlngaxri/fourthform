import selection from "./selection.json";
import {findConcept} from "./concepts";

export const DESIGN_FILTERS = ["All work", "Immersive", "Editorial", "Product", "Expressive"] as const;
export type DesignGroup = Exclude<typeof DESIGN_FILTERS[number], "All work">;
export type PortfolioProject = {
  id: string; title: string; sourceCategory: string; width: number; height: number; thumbnailWidth: number; source: string;
  group: DesignGroup; sector: string; line: string; description: string; techniques: string[];
  image: string; thumbnail: string; 
};

const notes: Record<string, {group: DesignGroup; sector: string; line: string; description: string; techniques: string[]}> = {
  "monolith-hero": {group:"Immersive",sector:"Architecture",line:"A structure with a world around it.",description:"A solitary architectural form sits between water and mountains. The restrained navigation and small, precise type give the image room to establish the atmosphere.",techniques:["Cinematic composition","Restrained navigation","Spatial depth"]},
  "oyla": {group:"Editorial",sector:"Jewellery",line:"The product becomes the portrait.",description:"An oversized fashion portrait carries the jewellery story. Fine serif type, generous white space and a quiet red wordmark keep the composition focused.",techniques:["Art direction","Fine serif typography","Generous white space"]},
  "keel": {group:"Immersive",sector:"Creative",line:"A whole world in the first frame.",description:"Metallic figures and luminous circles create an otherworldly blue landscape. The small navigation and measured headline make space for an ambitious visual idea.",techniques:["Surreal imagery","Monochrome palette","Layered composition"]},
  "playful-idea": {group:"Expressive",sector:"Creative agency",line:"Personality you can almost touch.",description:"A soft, oversized character gives a minimal agency layout its personality. Small corner details and light typography let the character become the memorable part of the page.",techniques:["Tactile character","Unexpected scale","Corner typography"]},
  "nature-ritual": {group:"Immersive",sector:"Botanical drinks",line:"Freshness, filling the frame.",description:"A botanical product scene fills the page with light, glass and greenery. Widely spaced words frame the central bottle without losing the small practical details.",techniques:["Product world building","Edge typography","Light and texture"]},
  "performance-eyewear": {group:"Editorial",sector:"Eyewear",line:"A close look. A strong point of view.",description:"A tightly framed athlete and reflective eyewear create immediate impact. The oversized brand treatment and compact supporting copy balance product detail with a fashion sensibility.",techniques:["Close crop photography","Bold brand scale","Compact copy"]},
  "velorah-hero": {group:"Immersive",sector:"Agency",line:"An invitation into a quieter world.",description:"A night sky, wildflowers and a small human figure build a dreamlike setting. A tall serif headline brings a quieter voice to the scene, with a simple action beneath it.",techniques:["Atmospheric imagery","Elegant serif headline","Focused action"]},
  "prisma-landing": {group:"Editorial",sector:"Creative studio",line:"A portfolio with an editorial rhythm.",description:"Large landscape imagery and oversized type introduce the studio. The full page moves into a personal introduction and a structured presentation of the work, using space to separate each idea.",techniques:["Oversized typography","Editorial pacing","Image led storytelling"]},
  "custom-spaces": {group:"Editorial",sector:"Architecture",line:"Let the spaces do the talking.",description:"A concise headline leads into a curved row of interiors. The near monochrome interface gives warm material, natural light and varied rooms the attention they deserve.",techniques:["Curved image sequence","Concise messaging","Warm minimalism"]},
  "obsidian": {group:"Immersive",sector:"Interactive art",line:"A sculptural presence, at full scale.",description:"A winged figure stands in front of enormous black lettering. The mostly white palette turns texture and silhouette into the defining elements, with quiet details at the edges.",techniques:["Sculptural imagery","Type behind subject","Minimal palette"]},
  "human-machine": {group:"Product",sector:"AI and robotics",line:"A complex idea, made visual.",description:"Human and robotic hands meet around a soft, circular form. A clear central statement and an uncluttered interface introduce a technical subject with a simple visual metaphor.",techniques:["Visual metaphor","Soft gradients","Clear hierarchy"]},
  "veyra-electric": {group:"Product",sector:"Automotive",line:"A product worth exploring.",description:"A silver electric car sits in a blue product frame, with bright markers pointing to its features. A short headline and compact feature descriptions keep the experience grounded in the vehicle.",techniques:["Product annotations","Controlled colour","Feature hierarchy"]},
  "vintage-care": {group:"Expressive",sector:"Automotive",line:"Classic character. A modern composition.",description:"A vintage red car anchors a light interface with an expressive pink serif headline. Small supporting details sit around the image, keeping the car at the centre of the story.",techniques:["Expressive serif type","Unexpected colour","Centred product"]},
  "nature-portfolio": {group:"Expressive",sector:"Photography",line:"The work becomes the landscape.",description:"Wildlife photographs float around a central image against a black background. The composition turns a collection of individual photographs into a distinctive introduction to the photographer.",techniques:["Floating image collage","Black canvas","Personal introduction"]},
  "anchor-ai": {group:"Product",sector:"Insurance technology",line:"Technical depth, with a clear entrance.",description:"A blue particle tree introduces the product in a dark, spacious layout. The larger product message and contrasting call to action give the technical imagery a clear purpose.",techniques:["Particle imagery","Dark interface","Action contrast"]},
  "vectrus-energy": {group:"Editorial",sector:"Energy",line:"A big subject, with room to breathe.",description:"Pale mountains and open sky form a quiet backdrop to a direct, uppercase headline. Sparse navigation and carefully placed small text create a clear, expansive first impression.",techniques:["Landscape composition","Direct headline","Sparse navigation"]},
  "golden-portal": {group:"Immersive",sector:"Digital archive",line:"A place you want to step into.",description:"Birds and warm clouds surround a mixed serif and sans serif title. A centred composition gives the archive an inviting, dreamlike identity while keeping its main idea readable.",techniques:["Warm atmospheric colour","Mixed typography","Centred composition"]},
  "digital-epoch-hero": {group:"Product",sector:"Digital services",line:"Precision with a little softness.",description:"A blue object and translucent geometric paths give the interface depth. The left aligned headline, compact action and separate partner strip keep the page easy to scan.",techniques:["Geometric depth","Soft materials","Scanning hierarchy"]},
  "peakline-redshift": {group:"Product",sector:"Data platform",line:"An abstract benefit, given a setting.",description:"A narrow red beam rises from a warm mountain landscape. The product statement sits low in the frame, while a compact top navigation preserves the scale of the scene.",techniques:["Cinematic landscape","Single accent colour","Precise navigation"]},
  "orla-fashion": {group:"Editorial",sector:"Fashion",line:"A generous space for the collection.",description:"An oversized wordmark and an asymmetric fashion portrait define the page. A small introduction and plenty of white space make the image and the brand feel considered.",techniques:["Oversized wordmark","Asymmetric composition","Editorial white space"]},
};

export const projects: PortfolioProject[] = selection.map(project => {
  const note = notes[project.id];
  const concept=findConcept(project.id)!;
  return {...project, ...note, line:concept.headline, description:`${concept.body} ${concept.intro}`, image:`/work/${project.id}.webp`, thumbnail:`/work/${project.id}-small.webp`};
});
export const featuredProjects = ["monolith-hero", "oyla", "playful-idea", "nature-ritual"].map(id => projects.find(project=>project.id===id)!);
export const heroProjects = ["monolith-hero", "oyla", "keel"].map(id => projects.find(project=>project.id===id)!);
export function findProject(id: string|null) { return projects.find(project=>project.id===id); }

// Keep design references from earlier saved briefs pointed at the current studio collection.
export function canonicalReferenceLinks(value:string){
 return value.replace(/https?:\/\/[^\s]+/g,link=>{try{const url=new URL(link),project=findProject(url.searchParams.get('prompt'));return project&&url.hostname.endsWith('.ai')&&url.pathname==='/'?project.source:link;}catch{return link;}});
}
