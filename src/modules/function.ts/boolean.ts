export const BOOLEAN_PROPERTIES = [
    'is_sale',
    'is_active',
    'is_featured',
    'is_hot',
    'is_out_of_stock',
    'estPromo',
    'statut',
];

export const preserveBooleanProperties = (produit: any, reqBody: any) => {
    BOOLEAN_PROPERTIES.forEach(property => {
        if (reqBody[property] === undefined || reqBody[property] === null) {
            reqBody[property] = produit[property];
        }
    });
};