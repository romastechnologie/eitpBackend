import { myDataSource } from "../../../configs/data-source";
import { generateServerErrorCode, success, validateMessage } from "../../../configs/response";
import { Request, Response } from "express";
import { ValidationError, isArray, validate } from "class-validator";
import { Brackets, DeepPartial } from "typeorm";
import { checkRelationsOneToMany } from "../../../configs/checkRelationsOneToManyBeforDelete";
import { Parent } from "../entity/Parent";
import { paginationAndRechercheInit } from "../../../configs/paginationAndRechercheInit";
import { ParentEtudiant } from "../entity/ParentEtudiant";
import { Etudiant } from "../entity/Etudiant";


/* export const createParent = async (req: Request, res: Response) => {
    const parent = myDataSource.getRepository(Parent).create(req.body);
    const errors = await validate(parent)
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Parent).save(parent)
    .then((parent_ : Parent | Parent[]) => {
        const prenom = !isArray(parent_) ? parent_.prenom : '';
        const message = `Le parent ${prenom} a bien été créé.`
        return success(res,201, parent,message);
    })
    .catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce parent existe déjà.')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce parent existe déjà.')
        }
        const message = `Le parent n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
} */




export const createParent = async (req: Request, res: Response) => {
  const { parentetudiant, quartierId, ...parentData } = req.body;

  console.log("req.body:", JSON.stringify(req.body, null, 2)); // Journal pour déboguer

  // Vérifier que parentData est un objet valide
  if (!parentData || typeof parentData !== "object") {
    return generateServerErrorCode(res, 400, null, "Les données du parent sont invalides.");
  }

  // Vérifier que parentetudiant est fourni et valide
  if (!parentetudiant || typeof parentetudiant.etudiantId !== "number") {
    return generateServerErrorCode(res, 400, null, "Aucun étudiant valide fourni.");
  }

  // Création du parent
  const parent = myDataSource.getRepository(Parent).create({
    ...parentData,
    quartier: quartierId ? { id: quartierId } : undefined,
  } as DeepPartial<Parent>);

  // Validation du parent
  const parentErrors = await validate(parent);
  if (parentErrors.length > 0) {
    const message = parentErrors.map((err) => Object.values(err.constraints)).join(", ");
    return generateServerErrorCode(res, 400, parentErrors, message);
  }

  try {
    const savedParent = await myDataSource.transaction(async (transactionalEntityManager) => {
      // Sauvegarde du parent
      const savedParent = await transactionalEntityManager.getRepository(Parent).save(parent);

      // Vérifier si l'étudiant existe
      const etudiant = await transactionalEntityManager
        .getRepository(Etudiant)
        .findOne({ where: { id: parentetudiant.etudiantId } });

      if (!etudiant) {
        throw new Error(`L'étudiant avec l'ID ${parentetudiant.etudiantId} n'existe pas.`);
      }

      // Créer la relation ParentEtudiant
      const parentEtudiant = transactionalEntityManager.getRepository(ParentEtudiant).create({
        parent: savedParent,
        etudiant,
      });

      await transactionalEntityManager.getRepository(ParentEtudiant).save(parentEtudiant);

      return savedParent;
    });

    const message = `Le parent ${req.body.nom} ${req.body.prenom} a bien été créé et lié à l'étudiant ${parentetudiant.etudiantId}.`;
    return success(res, 201, { parent: savedParent, parentetudiant }, message);
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return generateServerErrorCode(res, 400, error, "Une erreur de validation est survenue.");
    }
    if (error.code === "ER_DUP_ENTRY") {
      return generateServerErrorCode(res, 400, error, "Ce parent ou cette relation existe déjà.");
    }
    const message = `Le parent et sa relation n'ont pas pu être ajoutés. Réessayez dans quelques instants.`;
    return generateServerErrorCode(res, 500, error, message);
  }
};





export const getAllParent = async (req: Request, res: Response) => {
    const { page, limit, searchTerm, startIndex, searchQueries } = paginationAndRechercheInit(req, Parent);
    let reque = await myDataSource.getRepository(Parent)
    .createQueryBuilder('parent')
    .leftJoinAndSelect("parent.quartier", "quartier")
    .where("parent.deletedAt IS NULL");
    if (searchQueries.length > 0) {
        reque.andWhere(new Brackets(qb => {
            qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` })
        }));
    }
    reque.skip(startIndex)
    .take(limit)
    .getManyAndCount()
    .then(([data, totalElements]) => {
        const message = 'La liste des parents a bien été récupérée.';
        const totalPages = Math.ceil(totalElements / limit);
        return success(res,200,{data, totalPages, totalElements, limit}, message);
    }).catch(error => {
        const message = `La liste des parents n'a pas pu être récupérée. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

/*export const getAllParents= async (req: Request, res: Response) => {
    await myDataSource.getRepository(Parent).find({
        
    })
    .then((retour) => {
        const message = 'La liste des parents a bien été récupérée.';
        return success(res,200,{data:retour}, message);
    }).catch(error => {
        const message = `La liste des parents n'a pas pu être récupérée. Réessayez dans quelques instants.`
        //res.status(500).json({ message, data: error })
        return generateServerErrorCode(res,500,error,message)
    })
};*/

export const getParent = async (req: Request, res: Response) => {
    await myDataSource.getRepository(Parent).findOne({
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //parent:true,
    },
    })
    .then(parent => {
        if(parent === null) {
          const message = `Le parent demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message)
        }
        const message = `Le parent a bien été trouvé.`
        return success(res,200, parent,message);
    })
    .catch(error => {
        const message = `Le parent n'a pas pu être récupéré. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
};

export const getAllParents = async (req: Request, res: Response) => {
  const { searchTerm, searchQueries } = paginationAndRechercheInit(req, Parent);

  try {
    let reque = myDataSource.getRepository(Parent)
      .createQueryBuilder('parent')
      .where("parent.deletedAt IS NULL");

    if (searchQueries.length > 0) {
      reque.andWhere(new Brackets(qb => {
        qb.where(searchQueries.join(' OR '), { keyword: `%${searchTerm}%` });
      }));
    }

    const data = await reque.getMany();

    const message = 'La liste des parents a bien été récupérée.';
    return success(res, 200, { data }, message);
  } catch (error) {
    const message = `La liste des parents n'a pas pu être récupérée. Réessayez dans quelques instants.`;
    return generateServerErrorCode(res, 500, error, message);
  }
};

export const updateParent = async (req: Request, res: Response) => {
    const parent = await myDataSource.getRepository(Parent).findOne(
       { 
        where: {
            id: parseInt(req.params.id),
        },
        relations: {
            //parent:true,
        },
    }
    )
    if (!parent) {
        return generateServerErrorCode(res,400,"L'id n'existe pas",'Cet article existe déjà')
    }
    myDataSource.getRepository(Parent).merge(parent,req.body);
    const errors = await validate(parent);
    if (errors.length > 0) {
        const message = validateMessage(errors);
        return generateServerErrorCode(res,400,errors,message)
    }
    await myDataSource.getRepository(Parent).save(parent).then(parent => {
        const message = `Le parent ${parent.id} a bien été modifié.`
        return success(res,200, parent,message);
    }).catch(error => {
        if(error instanceof ValidationError) {
            return generateServerErrorCode(res,400,error,'Ce parent de média existe déjà')
        }
        if(error.code == "ER_DUP_ENTRY") {
            return generateServerErrorCode(res,400,error,'Ce parent de média existe déjà')
        }
        const message = `Le parent n'a pas pu être ajouté. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
        // res.status(500).json({ message, data: error }) 
    })
}

export const deleteParent = async (req: Request, res: Response) => {
    const resultat = await checkRelationsOneToMany('Parent', parseInt(req.params.id));
    await myDataSource.getRepository(Parent)
    .findOne({
        where: {
            id: parseInt(req.params.id)
        }
        })
    .then(parent => {        
        if(parent === null) {
          const message = `Le parent demandé n'existe pas. Réessayez avec un autre identifiant.`
          return generateServerErrorCode(res,400,"L'id n'existe pas",message);
        }

        if(resultat){
            const message = `Ce parent de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.`
            return generateServerErrorCode(res,400,"Ce parent de média est lié à d'autres enregistrements. Vous ne pouvez pas le supprimer.",message);
        }else{
            myDataSource.getRepository(Parent).softRemove(parent)
            .then(_ => {
                const message = `Le parent avec l'identifiant n°${parent.id} a bien été supprimé.`;
                return success(res,200, parent,message);
            })
        }
    }).catch(error => {
        const message = `Le parent n'a pas pu être supprimé. Réessayez dans quelques instants.`
        return generateServerErrorCode(res,500,error,message)
    })
}
