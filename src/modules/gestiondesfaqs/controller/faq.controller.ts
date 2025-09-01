import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Faq } from "../entity/Faq";
import { FaqTag } from "../entity/FaqTag";
import { CategorieFaq } from "../entity/CategorieFaq";
import { Tag } from "../entity/Tag";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createFaq = async (req: Request, res: Response) => {
    console.log("Enregistrement d'un FAQ");
    console.log(req.body)

    const faq = myDataSource.getRepository(Faq).create(req.body);
    const errors = await validate(faq)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.manager.transaction(async (transactionalEntityManager) => {
        const faqu = await transactionalEntityManager.save(faq);
        var fa = null;
        var boitePostale;
        var abonne;
        if(isArray(faqu)) {
            //roleId = abo[0].id
        } else {
            const resultrol = faqu as Faq
            fa = resultrol;
        }
        for(let i=0 ; i<req.body.tags.length ; i++ ){
            const tag = new FaqTag();
            tag.faqId = fa;
            tag.tagId = req.body.tags[i];
            await transactionalEntityManager.save(tag);
        }
    }).then(faq => {
        const message = `La faq a bien été créée.`
        return success(res,201, faq,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette faq existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette faq existe déjà.')
        }
        const message = `La faq n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

// export const getAllFaq = async (req: Request, res: Response) => {
//     await myDataSource.getRepository(Faq).find({
//         relations:{
//             faqtags:{
//                 tag:true
//             },
//             categorieFaq:true
//         }
//     })
//     .then((retour) => {
//         const message = 'La liste des faqs a bien été récupérée.';
//         return success(res,200,{data:retour}, message);
//     }).catch(error => {
//         const message = `La liste des faqs n'a pas pu être récupérée. Réessayez dans quelques instants.`
//         //res.status(500).json({ message, data: error })
//         return generateServerErrorCode(res,500,error,message)
//     })
// };

export const getAllFaq = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Faq);
    let reque = await myDataSource.getRepository(Faq)
    .createQueryBuilder('faq')
    .leftJoinAndSelect('faq.categorieFaq', 'categorieFaq')
    .leftJoinAndSelect('faq.faqtags', 'faqtags')
    .leftJoinAndSelect('faqtags.tag', 'tag')
    .where("faq.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des faqs a bien été récupéré.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des faqs n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

// export const getAllFaqByCategorie = async (req: Request, res: Response) => {
//     await myDataSource.getRepository(Faq).find({
//         relations:{
//             faqtags:{
//                 tag:true
//             },
//             categorieFaq:true
//         },
//         where: {
//             categorieFaq:{
//                 id:parseInt(req.params.categorieId),
//             }
//         },

//     })
//     .then((retour) => {
//         const message = 'La liste des faqs a bien été récupérée.';
//         return success(res,200,{data:retour}, message);
//     }).catch(error => {
//         const message = `La liste des faqs n'a pas pu être récupérée. Réessayez dans quelques instants.`
//         //res.status(500).json({ message, data: error })
//         return generateServerErrorCode(res,500,error,message)
//     })
// };

export const getAllFaqByCategorie = async (req: Request, res: Response) => {
    try {
      console.log('req.params.categorieId:', req.params.categorieId);
  
      const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Faq);
      const categorieId = parseInt(req.params.categorieId, 10);
  
      console.log('categorieId:', categorieId);
  
      if (isNaN(categorieId)) {
        throw new Error('Invalid category ID');
      }
  
      let reque = myDataSource.getRepository(Faq)
        .createQueryBuilder('faq')
        .leftJoinAndSelect('faq.faqtags', 'faqtags')
        .leftJoinAndSelect('faqtags.tag', 'tag')
        .leftJoinAndSelect('faq.categorieFaq', 'categorieFaq')
        .where("faq.deletedAt IS NULL")
        .andWhere("categorieFaq.id = :id", { id: categorieId });
  
      if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
          qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` });
        }));
      }
  
      reque.skip(startIndex)
        .take(limit)
        .getManyAndCount()
        .then(([data, totalElements]) => {
          const message = 'La liste des faqs a bien été récupérée.';
          const totalPages = Math.ceil(totalElements / limit);
          return success(res, 200, { data, totalPages, totalElements, limit }, message);
        })
        .catch(error => {
          const message = `La liste des faqs n'a pas pu être récupérée. Réessayez dans quelques instants.`;
          return generateServerErrorCode(res, 500, error, message);
        });
  
    } catch (error) {
      const message = `Erreur lors de la récupération des faqs: ${error.message}`;
      return generateServerErrorCode(res, 400, error, message);
    }
  };

// export const getFaq = async (req: Request, res: Response) => {
//     await myDataSource.getRepository(Faq).findOne({
//         where: {
//             id: parseInt(req.params.id),
//         },
//         relations: {
//             faqtags:{
//                 tag:true
//             },
//             categorieFaq:true,
//     },
//     })
//     .then(faq => {
//         if(faq === null) {
//           const message = `La faq demandé n'existe pas. Réessayez avec un autre identifiant.`
//           return generateServerErrorCode(res,400,"L'id n'existe pas",message)
//         }
//         const message = `La faq a bien été trouvée.`
//         return success(res,200,{data:faq},message);
//     })
//     .catch(error => {
//         const message = `La faq n'a pas pu être récupérée. Réessayez dans quelques instants.`
//         return generateServerErrorCode(res,500,error,message)
//     })
// };

export const getFaq = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Faq).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            faqtags:{
                tag:true
            },
            categorieFaq:true,
    },
    })
    .then(faq => {
        if(faq === null) {
          const message = `Le faq demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `Le faq a bien été trouvée.`
        return success(res,200, faq,message);
    })
    .catch(error => {
        const message = `Le faq n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getTagsNotIn = async (req: Request, res: Response) => {
    try {
      const faqId = req.params.faqId;
  
      // Récupérer les tags que le faq possède
      const faqtags = await myDataSource.getRepository(Tag)
        .createQueryBuilder("tag")
        .select("tag.id")
        .leftJoinAndSelect("tag.faqtags", "faqtag")
        .leftJoinAndSelect("faqtag.faq", "faq")
        .where("faq.id = :id", { id: faqId })
        .getMany();
  
      // Récupérer les tags que le faq n'a pas
      const tagsNotIn = await myDataSource.getRepository(Tag)
        .createQueryBuilder("tag")
        .where(`tag.id NOT IN (:...ids)`, { ids: faqtags.map(tag => tag.id) })
        .getMany();
  
      const message = 'Les tags non attribués ont été récupérés avec succès.';
      return success(res, 200, tagsNotIn, message);
    } catch (error) {
      const message = `Les tags non attribués n'ont pas pu être récupérés. Réessayez dans quelques instants.`;
      return generateServerErrorCode(res, 500, error, message);
    }
  };

  export const createFaqTag = async (req: Request, res: Response) => {
    if (req.body.tags.length < 1) {
        return generateServerErrorCode(res, 400, "Aucune liste de tag", "Aucune liste de tag");
    }
    
    await myDataSource.manager.transaction(async (transactionalEntityManager) => {
        const tag = req.body.tags;
        let faqtags = [];
        if (tag && req.body.faqId) {
            for (let index = 0; index < tag.length; index++) {
                const element = new FaqTag();
                element.tagId = parseInt(tag[index]);
                element.faqId = req.body.faqId;
                faqtags.push(element);
            }
            await transactionalEntityManager.save(faqtags);
        }
    }).then(tag => {
        const message = `Le tag(s) du faq a été mis à jour avec succès`;
        return success(res, 200, tag, message);
    }).catch(error => {
        if (error instanceof ValidationError) {
            return generateServerErrorCode(res, 400, error, 'Ce tag existe déjà');
        }
        if (error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res, 400, error, 'Ce tag existe déjà');
        }
        const message = `Le tag n'a pas pu être ajouté. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    });
};

export const deleteFaqTag = async (req: Request, res: Response) => {
    //const resultat = await checkRelationsOneToMany('Role', parseInt(req.params.id));
    await myDataSource.getRepository(FaqTag).findOneBy({id: parseInt(req.params.id)}).then(tag => {        
        if(tag === null) {
        const message = `Le tag demandé n'existe pas. Réessayez avec un autre identifiant.`
        return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }
        myDataSource.getRepository(FaqTag).softRemove(tag)
        .then(_ => {
            const message = `Le tag avec l'identifiant n°${tag.id} a bien été supprimé.`;
            return success(res,200, tag,message);
        })
    })
    .catch(error => {
        const message = `Le tag n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

export const updateFaq = async (req: Request, res: Response) => {
    console.log("LES MODIFICATIONS FAQS");
    console.log(req.body, req.params);
    const faq = await myDataSource.getRepository(Faq).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            faqtags: {
                tag:true
            },
            categorieFaq:true,
        },
    }
    )
    if (!faq) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cette faq existe déjà')
    }
    myDataSource.getRepository(Faq).merge(faq,req.body);
    const errors = await validate(faq);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Faq).save(faq).then(Faq => {
        const message = `La faq ${faq.id} a bien été modifiée.`
        return success(res,200, Faq,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette faq existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette faq existe déjà')
        }
        const message = `La faq n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

// export const updateFaq = async (req: Request, res: Response) => {
//     console.log("LES MODIFICATIONS FAQS");
//     console.log(req.body, req.params);
    
//     const faqRepository = myDataSource.getRepository(Faq);
//     const faq = await faqRepository.findOne({
//         where: { id: parseInt(req.params.id) },
//         //relations: ['faqtags', 'categorieFaq'] 
//     });

//     if (!faq) {
//         return generateServerErrorCode(res, 404, "L'id n'existe pas", 'Cette faq existe déjà');
//     }

//     faqRepository.merge(faq, req.body);

//     const errors = await validate(faq);
//     if (errors.length > 0) {
//         const message = validateMessage(errors);
//         return generateServerErrorCode(res, 400, errors, message);
//     }

//     const tagsToDelete = faq.faqtags.filter(existingTag => !req.body.tags.includes(existingTag.tag));
//     const tagsToAdd = req.body.tags.filter(newTag => !faq.faqtags.some(existingTag => existingTag.tag === newTag));

//     await myDataSource.manager.transaction(async (transactionalEntityManager) => {
//         for (const tagToDelete of tagsToDelete) {
//             await transactionalEntityManager.remove(tagToDelete);
//         }

//         for (const newTag of tagsToAdd) {
//             const tag = new FaqTag();
//             tag.faq = faq;
//             tag.tag = newTag;
//             await transactionalEntityManager.save(tag);
//         }
//     })
//     .then(async () => {
//         const updatedFaq = await faqRepository.save(faq);
//         const message = `La faq ${updatedFaq.id} a bien été modifiée.`;
//         return success(res, 200, updatedFaq, message);
//     })
//     .catch(error => {
//         if (error instanceof ValidationError || error.code === "ER_DUP_ENTRY") {
//             return generateServerErrorCode(res, 400, error, 'Cette faq existe déjà');
//         }
//         const message = `La faq n'a pas pu être modifiée. Réessayez dans quelques instants.`;
//         return generateServerErrorCode(res, 500, error, message);
//     });
// }


export const deleteFaq = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('FaqTag', parseInt(req.params.id));
    await myDataSource.getRepository(Faq)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        },
        relations:{
            faqtags: true,
            categorieFaq:true,
        }
        })
    .then(faq => {        
        if(faq === null) {
          const message = `La faq demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cette faq est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette faq est liée à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Faq).softRemove(faq)
            .then(_ => {
                const message = `La faq avec l'identifiant n°${faq.id} a bien été supprimée.`;
                return success(res,200, faq,message);
            })
        }
    }).catch(error => {
        const message = `La faq n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}

// export const getFaqByCat = async (req: Request, res: Response) => {
//     let faqsByCategory; // Déclaration de la variable pour stocker les données retournées

//     await myDataSource.getRepository(CategorieFaq).findOne({
//         where: {
//             id: parseInt(req.params.id),
//         },
//         relations: ['faqs'],
//     })
//     .then(categorieFaq => {
//         if(categorieFaq === null) {
//             const message = `La catégorie de FAQ demandée n'existe pas. Réessayez avec un autre identifiant.`;
//             return generateServerErrorCode(res, 400, "Catégorie introuvable", message);
//         }
//         faqsByCategory = categorieFaq.faqs; // Assignation des données retournées à la variable faqsByCategory
//         const message = `La catégorie de FAQ a bien été trouvée.`;
//         return success(res, 200, {data:faqsByCategory}, message);
//     })
//     .catch(error => {
//         const message = `La catégorie de FAQ n'a pas pu être récupérée. Réessayez dans quelques instants.`;
//         return generateServerErrorCode(res, 500, error, message);
//     });
// };

export const getFaqByCat = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, CategorieFaq);
    const categoryId = parseInt(req.params.id);

    try {
        const queryBuilder = myDataSource.getRepository(CategorieFaq)
            .createQueryBuilder('categorieFaq')
            .leftJoinAndSelect('categorieFaq.faqs', 'faqs')
            .where('categorieFaq.id = :categoryId', { categoryId });

        if (searchQueries.length > 0) {
            queryBuilder.andWhere(new Brackets(qb => {
                qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` });
            }));
        }

        const categorieFaq = await queryBuilder.getOne();

        if (!categorieFaq) {
            const message = `Aucune catégorie trouvée pour l'ID fourni.`;
            return res.status(404).json({ message });
        }

        const faqs = categorieFaq.faqs.slice(startIndex, startIndex + limit);
        const totalElements = categorieFaq.faqs.length;
        const totalPages = Math.ceil(totalElements / limit);
        const message = 'La liste des faqs a bien été récupérée.';

        return success(res, 200, { data: faqs, totalPages, totalElements, limit }, message);
    } catch (error) {
        const message = `La liste des faqs n'a pas pu être récupérée. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    }
};


// export const getFaqByTag = async (req: Request, res: Response) => {
//     console.log('faqretour idddds', req.params.id);
//     await myDataSource.getRepository(FaqTag).find({
//         where: {
//             tag: {
//                 id: parseInt(req.params.id),
//             },
//         },
//         relations: {
//             faq: {
//                 categorieFaq:true
//             },
//             tag: true
//         },
//     })
//     .then(faqtag => {
//         if(faqtag === null) {
//             const message = `Le tag demandé n'existe pas. Réessayez avec un autre identifiant.`;
//             return generateServerErrorCode(res, 400, "Catégorie introuvable", message);
//         }
//         const message = `Le(s) faq(s) a bien été trouvé.`;
//         return success(res, 200, faqtag, message);
//     })
//     .catch(error => {
//         const message = `Le faq n'a pas pu être récupéré. Réessayez dans quelques instants.`;
//         return generateServerErrorCode(res, 500, error, message);
//     });
// };

export const getFaqByTag = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, FaqTag);
    let reque = await myDataSource.getRepository(FaqTag)
    .createQueryBuilder('faqtag')
    .leftJoinAndSelect('faqtag.faq', 'faq')
    .leftJoinAndSelect('faq.categorieFaq', 'categorieFaq')
    .leftJoinAndSelect('faqtag.tag', 'tag')
    .where("faqtag.deletedAt IS NULL")
    .andWhere("faqtag.tag.id = :id", { id: parseInt(req.params.id) });
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des faqs a bien été récupéré.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des faqs n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getFaqByTagOnly = async (req: Request, res: Response) => {
    console.log('faqretour idddds', req.params.id);
    await myDataSource.getRepository(FaqTag).find({
        where: {
            tag: {
                id: parseInt(req.params.id),
            },
            faq:{
                categorieFaq:{
                    id: 3
                }
            }
        },
        relations: {
            faq: {
                categorieFaq:true
            },
            tag: true
        },
    })
    .then(tag => {
        if(tag === null) {
            const message = `Le tag demandé n'existe pas. Réessayez avec un autre identifiant.`;
            return generateServerErrorCode(res, 400, "Catégorie introuvable", message);
        }
        const message = `Le(s) faq(s) a bien été trouvé.`;
        return success(res, 200, tag, message);
    })
    .catch(error => {
        const message = `Le faq n'a pas pu être récupéré. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    });
};  