/*import { myDataSource } from "./data-source";

export async function checkRelationsOneToMany(entityName: string , id: number) {
    
    const relations = myDataSource.getMetadata(entityName).relations;
    let resultat = false;
    let inverseField;
  
    const oneToManyR = relations.filter(relation => relation.isOneToMany);
    const oneToOneR = relations.filter(relation => relation.isOneToOne);
    const rerelations = [...oneToManyR, ...oneToOneR];
    for (const relation of rerelations) {
        const relatedTableName = relation.inverseEntityMetadata.name;
      if (relation.inverseEntityMetadata.name === relatedTableName) {
        inverseField = relation.inverseSidePropertyPath;
      }
    
    const repository = myDataSource.getRepository(relatedTableName);
    const istrue = await repository
        .createQueryBuilder()
        .where(`${relatedTableName}.${inverseField+'Id'} = :id`, { id })
        .getOne();
      if(istrue){ 
        resultat = true;
        break; 
      }
    }
    return resultat;
} */

import { myDataSource } from "./data-source";

export async function checkRelationsOneToMany(entityName: string , id: number) {
    
    const relations = myDataSource.getMetadata(entityName).relations;
    let resultat = false;
    let inverseField;
  
    const oneToManyR = relations.filter(relation => relation.isOneToMany);
    // const oneToOneR = relations.filter(relation => relation.isOneToOne );
    const oneToOneR = relations.filter(relation => relation.isOneToOne && relation.joinColumns && relation.joinColumns.length > 0);
    const rerelations = [...oneToManyR, ...oneToOneR];
    for (const relation of rerelations) {
        const relatedTableName = relation.inverseEntityMetadata.name;
      if (relation.inverseEntityMetadata.name === relatedTableName) {
        inverseField = relation.inverseSidePropertyPath;
      }
    
    const repository = myDataSource.getRepository(relatedTableName);
    const istrue = await repository
        .createQueryBuilder()
        .where(`${relatedTableName}.${inverseField+'Id'} = :id`, { id })
        .getOne();
      if(istrue){ 
        resultat = true;
        break; 
      }
    }
    return resultat;
}