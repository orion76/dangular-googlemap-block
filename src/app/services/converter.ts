import {IEntity, IJSONAPIEntity} from './types';


export function itemToArray(data: any): any[] {
  return Array.isArray(data) ? data : [data];
}


export function normalizeReference(references: IJSONAPIEntity[]): Map<string, IJSONAPIEntity> {
  const all: Map<string, IJSONAPIEntity> = new Map();

  references.forEach((entity: IJSONAPIEntity) => {

    if (!all.has(entity.id)) {
      if (entity.relationships) {
        Object.keys(entity.relationships).forEach((field: string) => {
          entity.relationships[field].data = itemToArray(entity.relationships[field].data);
        });
      }

      all.set(entity.id, entity);
    }
  });
  return all;
}

export function extractRelationships(all: Map<string, IJSONAPIEntity>, entity: IJSONAPIEntity) {
  if (!entity.relationships) {
    return;
  }

  if (entity.attributes) {
    Object.keys(entity.attributes).forEach((fieldName: string) => entity[fieldName] = entity.attributes[fieldName]);
  }

  const relationships: Record<string, IJSONAPIEntity[]> = {};

  Object.keys(entity.relationships).forEach((field: string) => {
    if (field === 'coin') {
      debugger;
    }
    relationships[field] = [];

    const dataOld: IJSONAPIEntity[] = entity.relationships[field].data as IJSONAPIEntity[];

    dataOld
      .filter((rel: IJSONAPIEntity) => !!rel)
      .forEach((rel: IJSONAPIEntity) => {
        if (!all.has(rel.id)) {

          relationships[field].push(rel);
        } else {
          relationships[field].push(all.get(rel.id));
        }
      });


  });

  Object.keys(relationships).forEach((fieldName: string) => entity[fieldName] = relationships[fieldName]);


  delete entity.attributes;
  delete entity.relationships;
}

