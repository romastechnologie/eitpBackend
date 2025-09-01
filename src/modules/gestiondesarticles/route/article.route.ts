import * as express from 'express';
import { createArticle,activerDesactiverAlaUne, createArticleTag, deleteArticle, deleteArticleTag, getAllArticle, getAllMediaInArticle, getAllMediaInArticlePreview, getArticle, getArticles, getTagsNotIn, getTreeArticle, previewArticle, switchArticle, updateArticle } from '../controller/article.controller';
import { checkPermission } from '../../../middlewares/auth.middleware';
import { listen } from '../../../configs/uploads';
import { deleteMedia } from '../controller/media.controller';

export  const articlesRoutes =  (router: express.Router) => {
  router.post('/api/articles',checkPermission('AddArticle'), listen.fields([{ name: 'urlImage', maxCount: 1 },{ name: 'icone', maxCount: 1 },{name:"autreFichier[]", maxCount: 1000000}]), createArticle);
  //router.get('/api/articles',checkPermission('ListArticle'), getAllArticle);
  
  //router.get('/api/tree/articles/:categorieId',checkPermission('ListTreeArticle'), getTreeArticle);
  router.post('/api/articles/tags/:id',checkPermission('AddArticleTag'), createArticleTag);
  router.delete("/api/delete/:key/media",checkPermission('DeleteMedia'),deleteMedia);
  router.get('/api/articles',checkPermission('ListArticle'), getAllArticle);
  router.get('/api/articles/medias/:id', checkPermission('ListMediaInArticle'),getAllMediaInArticle);
  //router.get('/api/previewarticle/medias/:alias',checkPermission('ListMediaInArticlePreview'), getAllMediaInArticlePreview);
  router.put('/api/articles/:id',checkPermission('EditArticle'), listen.fields([{ name: 'urlImage', maxCount: 1 },{ name: 'icone', maxCount: 1 },{name:"autreFichier[]", maxCount: 1000000}]), updateArticle);
  router.put('/api/alUne/articles/:id',activerDesactiverAlaUne);
  router.put('/api/article/publie/:id',checkPermission('SwitchArticle'), switchArticle);

  router.get('/api/resteante/tags/:articleId', checkPermission('ListArticleTagsNotIn'),getTagsNotIn);
  router.get('/api/articles/:id',checkPermission('ViewArticle'), getArticle);
  //router.get('/api/preview/article/:alias', checkPermission('PreviewArticle'), previewArticle);
  router.delete('/api/articles/:id',checkPermission('DeleteArticle'),deleteArticle);
  router.delete('/api/articletag/:id',checkPermission('DeleteArticleTag'), deleteArticleTag);
};