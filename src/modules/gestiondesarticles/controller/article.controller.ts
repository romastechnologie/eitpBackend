import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets, Connection, EntityManager, createConnection, getConnection, getConnectionManager, getManager, getRepository } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Article } from "../entity/Article";
import { ArticleTag } from "../entity/ArticleTag";
import { Media } from "../entity/Media";
import { Tag } from "../../gestiondesfaqs/entity/Tag";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { convertStringToBoolean } from "../../function.ts/function";

// export const createArticle = async (req: Request, res: Response) => {
//     console.log("RETTTTT == > ", req);
//     if(req["files"]){
//         for(let i in req["files"]){
//             console.log("IIIIIIII",req["files"][i]);
//             req.body[i] = req["files"][i][0].originalname;
//         }
//     }
//     console.log("req 000 ===> ",  req["files"]);
//     convertStringToBoolean(req.body, 'estPublie')
//     const article = myDataSource.getRepository(Article).create(req.body);
//     // console.log("req.body", req.body);
//     //return 0;
//     const errors = await validate(article)
//     if (errors.length > 0) {

//         const message = validateMessage(errors);
//         return generateServerErrorCode(res,400,errors,message)
//     }
//     await myDataSource.manager.transaction(async (transactionalEntityManager) => {
//         const artic = await transactionalEntityManager.save(article);
//         var art = null;
//         var boitePostale;
//         var abonne;
//         if(isArray(artic)) {
//             //tagId = abo[0].id
//         } else {
//             const resultrol = artic as Article
//             art = resultrol;
//         }
//         for(let i=0 ; i<req.body.tags.length ; i++ ){
//             const tag = new ArticleTag();
//             tag.articleId = art;
//             tag.tagId = req.body.tags[i];
//             await transactionalEntityManager.save(tag);
//         }
//         if(req["files"] && req["files"]["autreFichier[]"]){
//             console.log()
//             for(let i=0; i < (req["files"]["autreFichier[]"]).length ; i++){
//                 console.log("CCCCC ===> ", req["files"]["autreFichier[]"][i]);
//                 const media = new Media();
//                 media.article =  art;
//                 media.type = req["files"]["autreFichier[]"][i].originalname; //
//                 media.description = req["files"]["autreFichier[]"][i].originalname;
//                 await transactionalEntityManager.save(media);
//             }
//         }
//     }).then(article => {
//         const message = `L'article a bien été créée.`
//         return success(res,201, article,message);
//     })
//     .catch(error => {
//         if(error instanceof ValidationError) {
//             return generateServerErrorCode(res,400,error,'Cet article existe déjà.')
//         }
//         if(error.code == "ER_DUP_ENTRY") {
//             return generateServerErrorCode(res,400,error,'Cet article existe déjà.')
//         }
//         const message = `L'article n'a pas pu être ajouté. Réessayez dans quelques instants.`
//         return generateServerErrorCode(res,500,error,message)
//     })
// }

export const createArticle = async (req: Request, res: Response) => {

    if (req["files"]) {
        for (let i in req["files"]) {
            req.body[i] = req["files"][i][0].originalname;
        }
    }
    console.log("req 000 ===> ", req["files"]);
    convertStringToBoolean(req.body, 'estPublie');
    const article = myDataSource.getRepository(Article).create(req.body);

    const errors = await validate(article);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res, 400, errors, message);
    }

    try {
        const articleSave = await myDataSource.manager.transaction(async (transactionalEntityManager) => {
            const artic = await transactionalEntityManager.save(article);
            var art = null;

            if (!isArray(artic)) {
                art = artic as Article;
            }

            for (let i = 0; i < req.body.tags.length; i++) {
                const tag = new ArticleTag();
                tag.articleId = art.id;
                tag.tagId = req.body.tags[i];
                await transactionalEntityManager.save(tag);
            }

            if (req["files"] && req["files"]["autreFichier[]"]) {
                for (let i = 0; i < req["files"]["autreFichier[]"].length; i++) {
                    const media = new Media();
                    media.article = art;
                    media.type = req["files"]["autreFichier[]"][i].originalname;
                    media.description = req["files"]["autreFichier[]"][i].originalname;
                    await transactionalEntityManager.save(media);
                }
            }
            return art; // Return the saved article
        });

        const message = `L'article a bien été créée.`;
        return success(res, 201, articleSave, message);

    } catch (error) {
        if (error instanceof ValidationError) {
            return generateServerErrorCode(res, 400, error, 'Cet article existe déjà.');
        }
        if (error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res, 400, error, 'Cet article existe déjà.');
        }
        const message = `L'article n'a pas pu être ajouté. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    }
}

export const getTreeArticle = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Article).find({
        relations: {
            article: true,
        },
        where: {
            categorieArticle: {
                id: parseInt(req.params.categorieId)
            }
        },
        order: {
            datePublication: "DESC"
        },

        take: 3

    })
        .then((data) => {
            const message = 'La liste des articles a bien été récupérée.';
            return success(res, 200, { data: data }, message);
        }).catch(error => {
            const message = `La liste des articles n'a pas pu être récupérée. Réessayez dans quelques instants.`
            //res.status(500).json({ message, data: error })
            return generateServerErrorCode(res, 500, error, message)
        })
};

// export const getTreeArticle = async (req: Request, res: Response) => {
//     const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Article);

//     try {
//         let reque = await myDataSource.getRepository(Article)
//             .createQueryBuilder('article')
//             .leftJoinAndSelect('article.articles', 'articles')
//             .where("article.deletedAt IS NULL");

//         if (req.params.categorieId) {
//             reque.andWhere("article.categorieArticleId = :categorieId", { categorieId: parseInt(req.params.categorieId) });
//         }

//         if (searchQueries.length > 0) {
//             reque.andWhere(new Brackets(qb => {
//                 qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
//             }));
//         }

//         reque.orderBy("article.id", "DESC");

//         const [data, totalElements] = await reque
//             .skip(startIndex)
//             .take(limit)
//             .getManyAndCount();

//         const totalPages = Math.ceil(totalElements / limit);
//         const message = 'La liste des articles a bien été récupérée.';

//         return success(res, 200, { data, totalPages, totalElements, limit }, message);
//     } catch (error) {
//         const message = `La liste des articles n'a pas pu être récupérée. Réessayez dans quelques instants.`;
//         return generateServerErrorCode(res, 500, error, message);
//     }
// };

export const getAllMediaInArticle = async (req: Request, res: Response) => {
    const articleId = parseInt(req.params.id);

    if (isNaN(articleId)) {
        return res.status(400).json({ message: "L'ID de l'article fourni n'est pas valide." });
    }

    try {
        const articleWithMedias = await myDataSource.getRepository(Article).findOne({
            where: { id: articleId },
            relations: { medias: true },
        });

        if (!articleWithMedias) {
            return res.status(404).json({ message: "Article non trouvé." });
        }

        const medias = articleWithMedias.medias;
        const message = 'La liste des médias a bien été récupérée.';
        return res.status(200).json({ data: medias, message });
    } catch (error) {
        const message = `La liste des médias n'a pas pu être récupérée. Réessayez dans quelques instants.`;
        return res.status(500).json({ message, data: error.toString() });
    }
};

export const getAllMediaInArticlePreview = async (req: Request, res: Response) => {
    const articleAlias = req.params.alias

    try {
        const articleWithMedias = await myDataSource.getRepository(Article).findOne({
            where: { alias: articleAlias },
            relations: { medias: true },
        });

        if (!articleWithMedias) {
            return res.status(404).json({ message: "Article non trouvé." });
        }

        const medias = articleWithMedias.medias;
        const message = 'La liste des médias a bien été récupérée.';
        return res.status(200).json({ data: medias, message });
    } catch (error) {
        const message = `La liste des médias n'a pas pu être récupérée. Réessayez dans quelques instants.`;
        return res.status(500).json({ message, data: error.toString() });
    }

}
// export const getArticles= async (req: Request, res: Response) => {
//     await myDataSource.getRepository(Article).find({
//         relations:{
//             article:true,
//         },
//         order:{
//             id:"DESC"
//         },
//         where:{
//             categorieArticle:{
//                 id: parseInt(req.params.categorieId)
//             }
//         }
//     })
//     .then((data) => {
//         const message = 'La liste des articles a bien été récupérée.';
//         return success(res,200,{data:data}, message);
//     }).catch(error => {
//         const message = `La liste des articles n'a pas pu être récupérée. Réessayez dans quelques instants.`
//         //res.status(500).json({ message, data: error })
//         return generateServerErrorCode(res,500,error,message)
//     })
// };

export const getAllArticleAlaUne = async (req: Request, res: Response) => {
    try {
        let reque = await myDataSource.getRepository(Article)
            .createQueryBuilder('article')
            .leftJoinAndSelect('article.articles', 'articles')
            .leftJoinAndSelect('article.medias', 'medias')
            .leftJoinAndSelect('article.categorieArticle', 'categorieArticle')
            .andWhere('article.alaUne = :alaUne', { alaUne: true })
            .andWhere('article.estPublie = :estPublie', { estPublie: 1 });
        if (req.params.categorieId) {
            reque.andWhere("categorieArticle.id = :categorieId", { categorieId: parseInt(req.params.categorieId) });
        }
        reque.orderBy('article.datePublication', "DESC")
        const data = await reque.getMany();
        const message = 'La liste des articles a bien été récupérée.';

        return success(res, 200, data, message);
    } catch (error) {
        const message = `La liste des articles n'a pas pu être récupérée. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    }
};

export const getArticles = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Article);
    try {
        let reque = await myDataSource.getRepository(Article)
            .createQueryBuilder('article')
            .leftJoinAndSelect('article.articles', 'articles')
            .leftJoinAndSelect('article.medias', 'medias')
            .leftJoinAndSelect('article.categorieArticle', 'categorieArticle')
            .andWhere('article.estPublie = :estPublie', { estPublie: 1 });
        if (req.params.categorieId) {
            reque.andWhere("categorieArticle.id = :categorieId", { categorieId: parseInt(req.params.categorieId) });
        }

        if (searchQueries.length > 0) {
            reque.andWhere(new Brackets(qb => {
                qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
            }));
        }


        reque.orderBy('article.datePublication', "DESC")
        // reque.orderBy("article.id", "DESC");
        const [data, totalElements] = await reque
            .skip(startIndex)
            .take(limit)
            .getManyAndCount();

        const totalPages = Math.ceil(totalElements / limit);
        const message = 'La liste des articles a bien été récupérée.';

        return success(res, 200, { data, totalPages, totalElements, limit }, message);
    } catch (error) {
        const message = `La liste des articles n'a pas pu être récupérée. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    }
};

export const getAllArticle = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Article);
    let reque = await myDataSource.getRepository(Article)
        .createQueryBuilder('article')
        .leftJoinAndSelect('article.medias', 'medias')
        .leftJoinAndSelect('article.articles', 'articles')
        .leftJoinAndSelect('article.categorieArticle', 'categorieArticle')
        .leftJoinAndSelect('article.articletags', 'articletags')
        .leftJoinAndSelect('articletags.tag', 'tag')
        .where("article.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.orderBy('article.datePublication', "DESC")
        .skip(startIndex)
        .take(limit)
        .getManyAndCount()
        .then(([data, totalElements]) => {
            const message = 'La liste des articles a bien été récupéré.';
            const totalPages = Math.ceil(totalElements / limit);
            return success(res, 200, { data, totalPages, totalElements, limit }, message);
        }).catch(error => {
            const message = `La liste des articles n'a pas pu être récupéré. Réessayez dans quelques instants.`
            return generateServerErrorCode(res, 500, error, message)
        })
};

export const getArticle = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Article).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            medias: true,
            articles: true,
            categorieArticle: true,
            article: true,
            articletags: {
                tag: true,
            },
        },
    })
        .then(article => {
            if (article === null) {
                const message = `L'article demandé n'existe pas. Réessayez avec un autre identifiant.`
                return generateServerErrorCode(res, 400, "L'id n'existe pas", message)
            }
            const message = `L'article a bien été trouvé.`
            return success(res, 200, article, message);
        })
        .catch(error => {
            const message = `L'article n'a pas pu être récupéré. Réessayez dans quelques instants.`
            return generateServerErrorCode(res, 500, error, message)
        })
};

export const previewArticle = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Article).findOne({
        where: {
            alias: req.params.alias,
        },
        relations: {
            medias: true,
            articles: true,
            categorieArticle: true,
            article: true,
            articletags: {
                tag: true,
            },
        },
    })
        .then(article => {
            if (article === null) {
                const message = `L'article demandé n'existe pas. Réessayez avec un autre identifiant.`
                return generateServerErrorCode(res, 400, "L'id n'existe pas", message)
            }
            const message = `L'article a bien été trouvé.`
            return success(res, 200, article, message);
        })
        .catch(error => {
            const message = `L'article n'a pas pu être récupéré. Réessayez dans quelques instants.`
            return generateServerErrorCode(res, 500, error, message)
        })
};

export const getTagsNotIn = async (req: Request, res: Response) => {
    try {
        const articleId = req.params.articleId;

        // Récupérer les tags que l'article possède
        const articletags = await myDataSource.getRepository(Tag)
            .createQueryBuilder("tag")
            .select("tag.id")
            .leftJoinAndSelect("tag.articletags", "articletag")
            .leftJoinAndSelect("articletag.article", "article")
            .where("article.id = :id", { id: articleId })
            .getMany();

        // Récupérer les tags que l'utilisateur n'a pas
        const articlesNotIn = await myDataSource.getRepository(Tag)
            .createQueryBuilder("tag")
            .where(`tag.id NOT IN (:...ids)`, { ids: articletags.map(tag => tag.id) })
            .getMany();

        const message = 'Les tags non attribués ont été récupérés avec succès.';
        return success(res, 200, articlesNotIn, message);
    } catch (error) {
        const message = `Les tags non attribués n'ont pas pu être récupérés. Réessayez dans quelques instants.`;
        return generateServerErrorCode(res, 500, error, message);
    }
};

//   export const createArticleTag = async (req: Request, res: Response, transactionalEntityManager: EntityManager) => {
//       if (!req.body.tags || req.body.tags.length === 0) {
//           return generateServerErrorCode(res, 400, 'Aucune liste de tags', 'Aucune liste de tags');
//       }

//       try {
//           const tags = req.body.tags;
//           const articleId = req.body.articleId;
//           let articleRoles = [];
//           if (tags && articleId) {
//               for (let index = 0; index < tags.length; index++) {
//                   articleRoles.push({
//                       articleId: articleId,
//                       tagId: tags[index]
//                   });
//               }
//           }
//           await transactionalEntityManager.save('article_tags', articleRoles);

//           return success(res, 200, null, 'Les rôles ont été ajoutés avec succès');
//       } catch (error) {
//           if (error instanceof ValidationError || error.code === 'ER_DUP_ENTRY') {
//               return generateServerErrorCode(res, 400, error, 'Certains rôles sont déjà attribués à cet utilisateur');
//           }
//           return generateServerErrorCode(res, 500, error, 'Une erreur est survenue lors de l\'ajout des rôles');
//       }
//   };  

// export const createArticleTag = async (req: Request, res: Response) => {
//     if (!req.body.tags && req.body.tags.length < 0) {
//         return generateServerErrorCode(res,400,"Aucune liste de tags","Aucune liste de tags")
//     }

//     await myDataSource.manager.transaction(async (transactionalEntityManager) => {

//         const tags = req.body.tags;
//         const articleId = req.body.articleId;
//         let articletags = [];
//         if(tags && articleId) {
//             for (let index = 0; index < tags.length; index++) {
//                 const articletag = new ArticleTag()
//                 articletag.articleId = articleId;
//                 articletag.tagId = tags[index];
//                 articletags.push(articletag);
//             }
//         await transactionalEntityManager.save(articletags);
//         }
//     }).then(tag=>{
//         const message = `Le tag a été mis à jour avec succès`
//         return success(res,200, tag,message);
//     }).catch(error => {
//         if(error instanceof ValidationError) {
//             return generateServerErrorCode(res,400,error,'Ce tag existe déjà')
//         }
//         if(error.code == "ER_DUP_ENTRY") {
//             return generateServerErrorCode(res,400,error,'Ce tag existe déjà')
//         }
//         const message = `Le tag n'a pas pu être ajouté. Réessayez dans quelques instants.`
//         return generateServerErrorCode(res,500,error,message)
//     })
// }

// export const createArticleTag = async (req: Request, res: Response) => {
//     if (req.body.tags.length < 1) {
//         return generateServerErrorCode(res,400,"Aucune liste de tag","Aucune liste de tag")
//     }

//     await myDataSource.manager.transaction(async (transactionalEntityManager) => {
//         const tag = req.body.tags;
//         let articletags = [];
//         if(tag && req.body.idArticle) {
//             console.log('tag',tag)
//             console.log('idArticle',req.body.idArticle)
//             for (let index = 0; index < tag.length; index++) {
//                 const element = new ArticleTag()
//                 element.tagId = parseInt(tag[index]);
//                 element.articleId = req.body.idArticle;
//                 articletags.push(element);
//             console.log('tagId', element.tagId)
//             console.log('articleId', element.articleId)

//             }
//         await transactionalEntityManager.save(articletags);
//         console.log('demfmke', articletags)
//         }
//     }).then(tag=>{
//         const message = `Le tag a été mis à jour avec succès`
//         return success(res,200, tag,message);
//     }).catch(error => {
//         if(error instanceof ValidationError) {
//             return generateServerErrorCode(res,400,error,'Ce tag existe déjà')
//         }
//         if(error.code == "ER_DUP_ENTRY") {
//             return generateServerErrorCode(res,400,error,'Ce tag existe déjà')
//         }
//         const message = `Le tag n'a pas pu être ajouté. Réessayez dans quelques instants.`
//         return generateServerErrorCode(res,500,error,message)
//     })
// }

export const createArticleTag = async (req: Request, res: Response) => {
    if (req.body.tags.length < 1) {
        return generateServerErrorCode(res, 400, "Aucune liste de tag", "Aucune liste de tag");
    }

    console.log('Données reçues depuis le frontend :', req.body);

    await myDataSource.manager.transaction(async (transactionalEntityManager) => {
        const tag = req.body.tags;
        let articletags = [];
        if (tag && req.body.articleId) {
            console.log('articleId reçu:', req.body.articleId);
            console.log('tags reçus:', tag);
            for (let index = 0; index < tag.length; index++) {
                const element = new ArticleTag();
                element.tagId = parseInt(tag[index]);
                element.articleId = req.body.articleId;
                articletags.push(element);
                console.log('Tag ID ajouté:', element.tagId);
                console.log('Article ID associé:', element.articleId);
            }
            await transactionalEntityManager.save(articletags);
            console.log('Les articletags ont été sauvegardés avec succès :', articletags);
        }
    }).then(tag => {
        const message = `Le tag (s) de l'article a été mis à jour avec succès`;
        console.log('Réponse envoyée au frontend :', { code: 200, message: message });
        return success(res, 200, tag, message);
    }).catch(error => {
        console.error('Une erreur s\'est produite lors de la sauvegarde des articletags :', error);
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

export const activerDesactiverAlaUne = async (req: Request, res: Response) => {
    try {
        const articleId = parseInt(req.params.id);
        console.log("1")
        const updateResult = await myDataSource
            .getRepository(Article)
            .createQueryBuilder()
            .update(Article)
            .set({ alaUne: () => "NOT alaUne" }) // Inverse la valeur actuelle
            .where("id = :id", { id: articleId })
            .execute();
        console.log("2")
        if (updateResult.affected === 0) {
            const message = "L'article demandé n'existe pas. Réessayez avec un autre identifiant.";
            return generateServerErrorCode(res, 400, "L'id n'existe pas", message);
        }
        console.log("3")

        const message = "L'article a été mis à jour avec succès.";
        return success(res, 200, updateResult, message);
    } catch (error) {
        const message = "L'article n'a pas pu être mis à jour. Réessayez dans quelques instants.";
        return generateServerErrorCode(res, 500, error, message);
    }
};

export const deleteArticleTag = async (req: Request, res: Response) => {
    //const resultat = await checkRelationsOneToMany('Role', parseInt(req.params.id));
    await myDataSource.getRepository(ArticleTag).findOneBy({ id: parseInt(req.params.id) }).then(tag => {
        if (tag === null) {
            const message = `Le tag demandé n'existe pas. Réessayez avec un autre identifiant.`
            return generateServerErrorCode(res, 400, "L'id n'existe pas", message);
        }
        myDataSource.getRepository(ArticleTag).softRemove(tag)
            .then(_ => {
                const message = `Le tag avec l'identifiant n°${tag.id} a bien été supprimé.`;
                return success(res, 200, tag, message);
            })
    })
        .catch(error => {
            const message = `Le tag n'a pas pu être supprimé. Réessayez dans quelques instants.`
            return generateServerErrorCode(res, 500, error, message)
        })
}

// export const updateArticle = async (req: Request, res: Response) => {
//     const article = await myDataSource.getRepository(Article).findOne(
//        { 
//         where: {
//             id: parseInt(req.params.id),
//         },
//         // relations: {
//         //     medias:true,
//         //     articles:true,
//         //     article:true,
//         // },
//     }
//     )
//     if (!article) {
//         return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet article existe déjà')
//     }

//     myDataSource.getRepository(Article).merge(article,req.body);
//     if(req["files"]){
//         for(let i in req["files"]){
//             console.log("IIIIIIII",req["files"][i]);
//             req.body[i] = req["files"][i][0].originalname;
//         }
//     }
//     const errors = await validate(article);
//     if (errors.length > 0) {
//         const message = validateMessage(errors);
//         return generateServerErrorCode(res,400,errors,message)
//     }
//     await myDataSource.getRepository(Article).save(article).then(Article => {
//         const message = `L'article ${article.id} a bien été modifié.`
//         return success(res,200, Article,message);
//     }).catch(error => {
//         if(error instanceof ValidationError) {
//             return generateServerErrorCode(res,400,error,'Cet article existe déjà')
//         }
//         if(error.code == "ER_DUP_ENTRY") {
//             return generateServerErrorCode(res,400,error,'Cet article existe déjà')
//         }
//         const message = `L'article n'a pas pu être ajouté. Réessayez dans quelques instants.`
//         return generateServerErrorCode(res,500,error,message)
//         // res.status(500).json({ message, data: error }) 
//     })
// }

export const updateArticle = async (req: Request, res: Response) => {
    try {
        const article = await myDataSource.getRepository(Article).findOne({
            where: {
                id: parseInt(req.params.id),
            },
        });

        if (!article) {
            return generateServerErrorCode(res, 400, "L'id n'existe pas", 'Cet article existe déjà');
        }

        if (req["files"]) {
            for (let i in req["files"]) {
                console.log("IIIIIIII", req["files"][i]);
                req.body[i] = req["files"][i][0].originalname;
            }
        }

        convertStringToBoolean(req.body, 'estPublie')

        myDataSource.getRepository(Article).merge(article, req.body);

        const errors = await validate(article);
        if (errors.length > 0) {
            const message = validateMessage(errors);
            return generateServerErrorCode(res, 400, errors, message);
        }

        await myDataSource.getRepository(Article).update(article.id, article);

        const successMessage = `L'article ${article.id} a bien été modifié.`;
        return success(res, 200, article, successMessage);
    } catch (error) {
        return generateServerErrorCode(res, 500, error, `L'article n'a pas pu être modifié. Réessayez dans quelques instants.`);
    }
}


export const deleteArticle = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Article', parseInt(req.params.id));
    await myDataSource.getRepository(Article)
        .findOne({
            where: {
                id: parseInt(req.params.id)
            },
            relations: {
                medias: true,
                articles: true,
                article: true,
                articletags: true,
            }
        })
        .then(article => {
            if (article === null) {
                const message = `L'article demandé n'existe pas. Réessayez avec un autre identifiant.`
                return generateServerErrorCode(res, 400, "L'id n'existe pas", message);
            }

            if (resultat) {
                const message = `Cet article est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
                return generateServerErrorCode(res, 400, "Cet article est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.", message);
            } else {
                myDataSource.getRepository(Article).softRemove(article)
                    .then(_ => {
                        const message = `L'article avec l'identifiant n°${article.id} a bien été supprimé.`;
                        return success(res, 200, article, message);
                    })
            }
        }).catch(error => {
            const message = `L'article n'a pas pu être supprimé. Réessayez dans quelques instants.`
            return generateServerErrorCode(res, 500, error, message)
        })
}

export const switchArticle = async (req: Request, res: Response) => {
    try {
        const articleId = parseInt(req.params.id);
        const articleToUpdate = await myDataSource.getRepository(Article).findOneBy({ id: articleId });

        if (!articleToUpdate) {
            return generateServerErrorCode(res, 400, "L'id n'existe pas", 'Cet article nexiste pas');
        }

        articleToUpdate.estPublie = !articleToUpdate.estPublie;
        await myDataSource.getRepository(Article).save(articleToUpdate);

        const statusMessage = articleToUpdate.estPublie ? 'publié' : 'dépublié';
        const successMessage = `L'article a bien été ${statusMessage}.`;
        return success(res, 200, articleToUpdate, successMessage);
    } catch (error) {
        return generateServerErrorCode(res, 500, error, `L'article n'a pas pu être mis à jour. Réessayez dans quelques instants.`);
    }
}