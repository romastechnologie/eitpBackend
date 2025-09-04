import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { FiliereNiveauMatiere } from "../entity/FiliereNiveauMatiere";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";

export const createFiliereNiveauMatiere = async (req: Request, res: Response) => {
    const filiereNiveauMatiere = myDataSource.getRepository(FiliereNiveauMatiere).create(req.body);

    console.log(req.body, "hellooooo")
    const errors = await validate(filiereNiveauMatiere)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(FiliereNiveauMatiere).save(filiereNiveauMatiere)
    .then((filiereNiveauMatiere_ : FiliereNiveauMatiere | FiliereNiveauMatiere[]) => {
        const id = !isArray(filiereNiveauMatiere_) ? filiereNiveauMatiere_.id : '';
        const message = `La filière par niveau ${id} a bien été créé.`
        return success(res,201, filiereNiveauMatiere,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette filière par niveau existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette filière par niveau existe déjà.')
        }
        const message = `La filière par niveau n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}


export const getAllFiliereNiveauMatiere = async (req: Request, res: Response) => {
  const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, FiliereNiveauMatiere);
  const { filiere, niveau, matiere } = req.query; // Récupérer les paramètres de requête

  let query = myDataSource.getRepository(FiliereNiveauMatiere)
    .createQueryBuilder('filiereNiveauMatiere')
    .leftJoinAndSelect('filiereNiveauMatiere.filiere', 'filiere')
    .leftJoinAndSelect('filiereNiveauMatiere.matiere', 'matiere')
    .leftJoinAndSelect('filiereNiveauMatiere.niveau', 'niveau')
    .where('filiereNiveauMatiere.deletedAt IS NULL');

  // Ajouter des filtres pour filiere, niveau, et matiere si présents
  if (filiere) {
    query = query.andWhere('filiereNiveauMatiere.filiere.id = :filiere', { filiere });
  }
  if (niveau) {
    query = query.andWhere('filiereNiveauMatiere.niveau.id = :niveau', { niveau });
  }
  if (matiere) {
    query = query.andWhere('filiereNiveauMatiere.matiere.id = :matiere', { matiere });
  }

  // Ajouter la recherche par mot-clé si searchTerm est fourni
  if (searchQueries.length > 0) {
    query.andWhere(
      new Brackets(qb => {
        qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` });
      })
    );
  }

  try {
    const [data, totalElements] = await query
      .skip(startIndex)
      .take(limit)
      .getManyAndCount();

    const message = 'La liste des filières par niveau a bien été récupérée.';
    const totalPages = Math.ceil(totalElements / limit);
    return success(res, 200, { data, totalPages, totalElements, limit }, message);
  } catch (error) {
    const message = `La liste des filières par niveau n'a pas pu être récupérée. Réessayez dans quelques instants.`;
    return generateServerErrorCode(res, 500, error, message);
  }
};

export const getFiliereNiveauMatiere = async (req: Request, res: Response) => {
    await myDataSource.getRepository(FiliereNiveauMatiere).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //professeur:true,
    },
    })
    .then(filiereNiveauMatiere => {
        if(filiereNiveauMatiere === null) {
          const message = `La filière par niveau demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `La filière par niveau de méda a bien été trouvé.`
        return success(res,200, filiereNiveauMatiere,message);
    })
    .catch(error => {
        const message = `La filière par niveau n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};


export const updateFiliereNiveauMatiere = async (req: Request, res: Response) => {
    const filiereNiveauMatiere = await myDataSource.getRepository(FiliereNiveauMatiere).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //professeur:true,
        },
    }
    )
    if (!filiereNiveauMatiere) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet article existe déjà')
    }
    myDataSource.getRepository(FiliereNiveauMatiere).merge(filiereNiveauMatiere,req.body);
    const errors = await validate(filiereNiveauMatiere);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(FiliereNiveauMatiere).save(filiereNiveauMatiere).then(filiereNiveauMatiere => {
        const message = `La filière par niveau ${filiereNiveauMatiere.id} a bien été modifié.`
        return success(res,200, filiereNiveauMatiere,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Cette filière par niveau de média existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Cette filière par niveau de média existe déjà')
        }
        const message = `La filière par niveau n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteFiliereNiveauMatiere = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('FiliereNiveauMatiere', parseInt(req.params.id));
    await myDataSource.getRepository(FiliereNiveauMatiere)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(filiereNiveauMatiere => {        
        if(filiereNiveauMatiere === null) {
          const message = `La filière par niveau demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Cette filière par niveau de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Cette filière par niveau de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(FiliereNiveauMatiere).softRemove(filiereNiveauMatiere)
            .then(_ => {
                const message = `La filière par niveau avec l'identifiant n°${filiereNiveauMatiere.id} a bien été supprimé.`;
                return success(res,200, filiereNiveauMatiere,message);
            })
        }
    }).catch(error => {
        const message = `La filière par niveau n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
export const getAllFiliereNiveauMatieres= async (req: Request, res: Response) => {
    await myDataSource.getRepository(FiliereNiveauMatiere).find({
       
    })
    .then((retour) => {
        const message = 'La liste des filières par niveau a bien été récupérée.';
        return success(res,200,{data:retour}, message);
    }).catch(error => {
        const message = `La liste des filières par niveau n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};