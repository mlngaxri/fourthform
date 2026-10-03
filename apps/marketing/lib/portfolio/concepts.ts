import concepts from './concepts.json';
export type Concept = typeof concepts[number];
export const websiteConcepts = concepts;
export function findConcept(id:string){return concepts.find(concept=>concept.id===id);}
