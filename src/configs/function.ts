const CryptoJS = require("crypto-js");
import { unlink } from 'fs';
import { join } from 'path';
import fs from 'fs';

const cleSecrete = process.env.MOT_CLE; // "?C-8H[r8X6R5F{5(M4a2}P/]h_2p%iTRu7vkq5x4EX9YjzC2Tc6=z;cw~8.64KkZ*@aM6$";
console.log("LE MOT CLES SECRET EST ==> ", cleSecrete);
export function cryptage(lemot = "") {
    let motCrypter = "";
    do {
        // Chiffrer la chaîne de caractères
        motCrypter = CryptoJS.AES.encrypt(lemot, cleSecrete).toString();
    } while (motCrypter.includes('/')); // Vérifier s'il contient "/"

    return motCrypter;
}

export function decryptage(lemot = "") {
    const bytes = CryptoJS.AES.decrypt(lemot, cleSecrete);
    return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Supprime un fichier du dossier uploads/Produits
 * @param folderPath Le chemin du dossier, par exemple "uploads/Produits"
 * @param fileName Le nom du fichier à supprimer, par exemple "fichier.jpg"
 * @returns Une promesse qui est résolue si le fichier est supprimé avec succès, ou rejetée en cas d'erreur
 */
export const deleteFile = (folderPath: string, fileName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
      const filePath = join(folderPath, fileName);
      unlink(filePath, (err) => {
          if (err) {
              return reject(`Erreur lors de la suppression du fichier : ${err.message}`);
          }
          resolve();
      });
  });
};

export function supprimeFichier(chemin: string, fichier: string): Promise<string> {
  console.log("Début de la suppression du fichier dans son répertoire")
    return new Promise((resolve, reject) => {
      const filePath = path.join(chemin, fichier);
  
      console.log("Emplacement ===> ",filePath )
      // Vérifier si le fichier existe
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          return reject(new Error('Fichier non trouvé'));
        }
        // Supprimer le fichier
        fs.unlink(filePath, (err) => {
          if (err) {
            return reject(new Error('Erreur lors de la suppression du fichier'));
          }
          resolve('Fichier supprimé avec succès');
        });
      });
    });
  }