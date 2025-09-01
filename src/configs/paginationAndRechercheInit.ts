/*import { myDataSource } from "./data-source";

export function paginationAndRechercheInit(req, table){
    //initiation pour la pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit =(parseInt(req.query.limit as string)==0)? 0 : parseInt(req.query.limit as string) || 10;
    const searchTerm = req.query.mot as string || '';
    const startIndex = (page - 1) * limit;
    let searchQueries = [];

    if(searchTerm != '') { 
        // get fields of entity
        const entityRepository = myDataSource.getRepository(table);
        const tableName = entityRepository.metadata.tableName;
        const relationFields = entityRepository.metadata.relations.flatMap(relation => relation.joinColumns.map(column => `${tableName}.${column.propertyName}`));
        const currentFields = entityRepository.metadata.columns.map(column => `${tableName}.${column.propertyName}`).filter(field => !relationFields.includes(field));
        console.log(relationFields);

        // get fields of entity that have a ManyToOne relation
        const relations = entityRepository.metadata.relations;
        const manyToOneRelationsAndEntities = relations
        .filter(relation => relation.isManyToOne && relation.inverseEntityMetadata.name !== 'User')
        .reduce((result, relation) => {
            const relatedTableName = relation.inverseEntityMetadata.name;
            const rrelationFields = relation.inverseEntityMetadata.relations.flatMap(rel => rel.joinColumns.map(column => `${relatedTableName}.${column.propertyName}`));
            
            const relatedTableColumns = relation.inverseEntityMetadata.columns
                .map(column => `${relatedTableName}.${column.propertyName}`)
                .filter(field => !rrelationFields.includes(field));
            result[relatedTableName] = (result[relatedTableName] || []).concat(relatedTableColumns);
            return result;
        }, {});
        
        // merge all fields
        const allFields = Object.values(manyToOneRelationsAndEntities).flat() as string[];
        const fields = currentFields.concat(allFields);
        // console.log(fields);

        // trie des champs
        const excludedStrings = ['createdAt', 'updatedAt', 'deletedAt', 'userCreation','abonneCreation'];
        searchQueries = fields
            .filter(field => {
                const fieldParts = field.split('.');
                const lastPart = fieldParts[fieldParts.length - 1];
                return !excludedStrings.includes(lastPart);
            })
            .map(field =>  {
            return `${field} LIKE :keyword`; 
        });
    }

    return { page, limit, searchTerm, startIndex, searchQueries };
}

export function paginationAndRechercheInit2(req, table){

    //initiation pour la pagination
    const page = parseInt(req.body.page as string) || 1;
    const limit = parseInt(req.body.limit as string) || 10;
    const searchTerm = req.body.mot as string || '';
    const startIndex = (page - 1) * limit;
    let searchQueries = [];

    if(searchTerm != '') { 
        // get fields of entity
        const entityRepository = myDataSource.getRepository(table);
        const tableName = entityRepository.metadata.tableName;
        const relationFields = entityRepository.metadata.relations.flatMap(relation => relation.joinColumns.map(column => `${tableName}.${column.propertyName}`));
        const currentFields = entityRepository.metadata.columns.map(column => `${tableName}.${column.propertyName}`).filter(field => !relationFields.includes(field));
        

        // get fields of entity that have a ManyToOne relation
        const relations = entityRepository.metadata.relations;
        const manyToOneRelationsAndEntities = relations
        .filter(relation => relation.isManyToOne && relation.inverseEntityMetadata.name !== 'User')
        .reduce((result, relation) => {
            const relatedTableName = relation.inverseEntityMetadata.name;
            const rrelationFields = relation.inverseEntityMetadata.relations.flatMap(rel => rel.joinColumns.map(column => `${relatedTableName}.${column.propertyName}`));
            const relatedTableColumns = relation.inverseEntityMetadata.columns
                .map(column => `${relatedTableName}.${column.propertyName}`)
                .filter(field => !rrelationFields.includes(field));
            result[relatedTableName] = (result[relatedTableName] || []).concat(relatedTableColumns);
            return result;
        }, {});
        
        // merge all fields
        const allFields = Object.values(manyToOneRelationsAndEntities).flat() as string[];
        const fields = currentFields.concat(allFields);

        // trie des champs
        const excludedStrings = ['createdAt', 'updatedAt', 'deletedAt', 'userCreation','abonneCreation'];
        searchQueries = fields
            .filter(field => {
                const fieldParts = field.split('.');
                const lastPart = fieldParts[fieldParts.length - 1];
                return !excludedStrings.includes(lastPart);
            })
            .map(field =>  {
            return `${field} LIKE :keyword`; 
        });
    }


    return { page, limit, searchTerm, startIndex, searchQueries };
}*/


import { myDataSource } from "./data-source";


function toCamelCase(str: string): string {
    // Vérifie si la chaîne contient '_'
    if (!str.includes('_')) {
        return str.charAt(0).toLowerCase() + str.slice(1);
    }

    // Traite le cas snake_case
    return str
        .split('_')
        .map((word, index) => 
            index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join('');
}

export function paginationAndRechercheInit(req, table){
    //initiation pour la pagination
    const page = parseInt(req.query.page as string) || 1;
    //const limit = parseInt(req.query.limit as string) || 10;
    const limit =(parseInt(req.query.limit as string)==0)? 0 : parseInt(req.query.limit as string) || 10;
    const searchTerm = req.query.mot as string || '';
    const startIndex = (page - 1) * limit;
    let searchQueries = [];

    if(searchTerm != '') { 
        // get fields of entity
        const entityRepository = myDataSource.getRepository(table);
        const tableName = entityRepository.metadata.tableName;
        const relationFields = entityRepository.metadata.relations.flatMap(relation => relation.joinColumns.map(column => `${tableName}.${column.propertyName}`));
        const currentFields = entityRepository.metadata.columns.map(column => `${tableName}.${column.propertyName}`).filter(field => !relationFields.includes(field));
           
        const relations = entityRepository.metadata.relations;
        const manyToOneRelationsAndEntities = relations
        .filter(relation => relation.isManyToOne && relation.inverseEntityMetadata.name.toLowerCase() !== 'user')
        .reduce((result, relation) => {
            const relatedTableName = toCamelCase(relation.inverseEntityMetadata.name);
            const relationFields = relation.inverseEntityMetadata.relations.flatMap(rel => 
                rel.joinColumns.map(column => `${toCamelCase(relatedTableName)}.${toCamelCase(column.propertyName)}`));
            
            const relatedTableColumns = relation.inverseEntityMetadata.columns
                .map(column => `${toCamelCase(relatedTableName)}.${toCamelCase(column.propertyName)}`)
                .filter(field => !relationFields.includes(toCamelCase(field)));
            result[relatedTableName] = (result[relatedTableName] || []).concat(relatedTableColumns);
            return result;
        }, {});
        
        // merge all fields
        const allFields = Object.values(manyToOneRelationsAndEntities).flat() as string[];
        const fields = currentFields.concat(allFields);

        // trie des champs
        const excludedStrings = ['createdAt','createdat', 'updatedAt', 'updatedat', 'deletedAt', 'deletedat', 'userCreation', 'usercreation','abonneCreation','abonnecreation'];
        

        searchQueries = Array.from(new Set(fields
        .filter(field => {
            const fieldParts = field.split('.');
            const lastPart = fieldParts[fieldParts.length - 1];
            return !excludedStrings.includes(lastPart);
        })
        .map(field => `${field} LIKE :keyword`)));
        
        console.log("LES QUERYS", searchQueries);
    }

    return { page, limit, searchTerm, startIndex, searchQueries };
}

export function paginationAndRechercheInit2(req, table){

    //initiation pour la pagination
    const page = parseInt(req.body.page as string) || 1;
    //const limit = parseInt(req.body.limit as string) || 10;
    const limit =(parseInt(req.query.limit as string)==0)? 0 : parseInt(req.query.limit as string) || 10;
    const searchTerm = req.body.mot as string || '';
    const startIndex = (page - 1) * limit;
    let searchQueries = [];

    if(searchTerm != '') { 
        // get fields of entity
        const entityRepository = myDataSource.getRepository(table);
        const tableName = entityRepository.metadata.tableName;
        const relationFields = entityRepository.metadata.relations.flatMap(relation => relation.joinColumns.map(column => `${tableName}.${column.propertyName}`));
        const currentFields = entityRepository.metadata.columns.map(column => `${tableName}.${column.propertyName}`).filter(field => !relationFields.includes(field));
        

        // get fields of entity that have a ManyToOne relation
        const relations = entityRepository.metadata.relations;
        const manyToOneRelationsAndEntities = relations
        .filter(relation => relation.isManyToOne && relation.inverseEntityMetadata.name !== 'User')
        .reduce((result, relation) => {
            const relatedTableName = relation.inverseEntityMetadata.name;
            const rrelationFields = relation.inverseEntityMetadata.relations.flatMap(rel => rel.joinColumns.map(column => `${relatedTableName}.${column.propertyName}`));
            const relatedTableColumns = relation.inverseEntityMetadata.columns
                .map(column => `${relatedTableName}.${column.propertyName}`)
                .filter(field => !rrelationFields.includes(field));
            result[relatedTableName] = (result[relatedTableName] || []).concat(relatedTableColumns);
            return result;
        }, {});
        
        // merge all fields
        const allFields = Object.values(manyToOneRelationsAndEntities).flat() as string[];
        const fields = currentFields.concat(allFields);

        // trie des champs
        const excludedStrings = ['createdAt', 'updatedAt', 'deletedAt', 'userCreation','abonneCreation'];
        searchQueries = fields
            .filter(field => {
                const fieldParts = field.split('.');
                const lastPart = fieldParts[fieldParts.length - 1];
                return !excludedStrings.includes(lastPart);
            })
            .map(field =>  {
            return `${field} LIKE :keyword`; 
        });
    }

    return { page, limit, searchTerm, startIndex, searchQueries };

}