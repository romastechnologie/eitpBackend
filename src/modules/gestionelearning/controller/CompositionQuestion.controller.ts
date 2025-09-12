import { Request, Response } from "express";
import { myDataSource } from "../../../configs/data-source";
import { CompositionQuestion } from "../entity/CompositionQuestion";
import { Composition } from "../entity/Composition";
import { Question } from "../entity/Question";
import { success, generateServerErrorCode } from "../../../configs/response";

export const createCompositionQuestion = async (req: Request, res: Response) => {
  const { compositionId, questionId } = req.body;

  try {
    const composition = await myDataSource.getRepository(Composition).findOne({ where: { id: compositionId } });
    const question = await myDataSource.getRepository(Question).findOne({ where: { id: questionId } });

    if (!composition || !question) {
      return generateServerErrorCode(res, 400, null, "Composition ou Question introuvable.");
    }

    const compoQuestion = myDataSource.getRepository(CompositionQuestion).create({
      composition,
      question,
      estActif: true
    });

    await myDataSource.getRepository(CompositionQuestion).save(compoQuestion);

    return success(res, 201, compoQuestion, "CompositionQuestion créée avec succès.");
  } catch (error) {
    return generateServerErrorCode(res, 500, error, "Impossible de créer la CompositionQuestion.");
  }
};
