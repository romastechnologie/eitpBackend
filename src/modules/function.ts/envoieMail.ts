import * as dotenv from "dotenv";
import nodemailer from 'nodemailer';
const ejs = require('ejs');
const path = require('path');
// import { myDataSource } from "../../../configs/data-source";
import { replaceVariable } from "./envoieSMS";
import { text } from "express";
import { myDataSource } from "../../configs/data-source";
const fs = require('fs');
dotenv.config();


export const sendEmail = async (subject, email, code, attachements = null, options = null) => {
    console.log(subject,"< === >", email,"< === >", code, "< === >",attachements, "< === >",options)
    try {
        let transporter = nodemailer.createTransport({
            host: 'mail.laposte.bj',
            port: 465,
            secure: true,
            auth: {
                user: 'bp@laposte.bj',
                pass: '@Laposte2024'
            },
        });

        let contenu = `Bienvenu à LA POSTE DU BENIN. Votre mot de passe de connexion est le suivant : ${code} `;
        let mailOptions = {
            from: '" POSTE BENIN | E-BOITE POSTAL TEST " <bp@laposte.bj>',
            to: email,
            subject: subject,
            html: '',
            attachments: attachements
        };


        let data = {
            contenu: contenu,
            imageUrl: `http://${process.env.SERVEUR_URL}/uploads/logo.png`,
        };

        ejs.renderFile(path.join(__dirname, '../template/emailTemplate.ejs'), data, function (err, data) {
            if (err) {
                //
            } else {
                mailOptions.html = data;
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.error('Erreur lors de l’envoi du mail:', error);
                    } else {
                        console.log('Email envoyé: ' + info.response);
                    }
                });
            }
        });
    } catch (error) {
        console.error('Erreur survenue lors de l’envoi de courrier:', error);
    }

}

// Fonction pour attendre que le fichier existe

export const waitForFile = (filePath, timeout = 30000, interval = 1000) => {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const checkFile = () => {
            if (fs.existsSync(filePath)) {
                resolve(true);
            } else if (Date.now() - startTime >= timeout) {
                reject(new Error('Le fichier n\'existe toujours pas après le délai imparti.'));
            } else {
                setTimeout(checkFile, interval);
            }
        };

        checkFile();
    });
};

export const sendEmail2 = async (IdTypeNotification, subject, email, entity, attachments = null, options = null) => {
    console.log("Début de l'envoi de mail ===>");
    try {
        let transporter = nodemailer.createTransport({
            host: 'mail.laposte.bj',
            port: 465,
            secure: true,
            auth: {
                user: 'bp@laposte.bj',
                pass: '@Laposte2024'
            },
        });

        let contenu = '';
        let mailOptions = {
            from: '"POSTE BENIN | E-BOITE POSTAL TEST" <bp@laposte.bj>',
            to: email,
            subject: subject,
            html: '',
            attachments: attachments || []
        };

        const filePath = path.join(__dirname, `../../../../uploads/Recu/${entity.refPaiement}.pdf`);
        console.log("Chemin du fichier PDF:", filePath);

        try {
            // Attendre que le fichier soit disponible (timeout de 30 secondes)
            await waitForFile(filePath, 30000, 500); // 30 secondes max, vérification chaque seconde

            // Une fois que le fichier est disponible, on l'ajoute aux pièces jointes
            mailOptions.attachments.push({
                filename: entity.refPaiement + '.pdf',
                path: filePath,
                contentType: 'application/pdf'
            });
        } catch (err) {
            console.error('Erreur : le fichier PDF n\'a pas été trouvé dans le délai imparti.', err);
            return; // Sortir de la fonction si le fichier n'est pas trouvé après le délai imparti
        }

        let data = {
            contenu: (contenu + ' ' + (options == null ? '' : options)),
            imageUrl: `http://${process.env.SERVEUR_URL}/uploads/logo.png`,
        };

        ejs.renderFile(path.join(__dirname, '../template/emailTemplate.ejs'), data, function (err, data) {
            if (err) {
                console.error('Erreur lors du rendu du template EJS:', err);
            } else {
                mailOptions.html = data;
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.error('Erreur lors de l’envoi du mail:', error);
                    } else {
                        console.log('Email envoyé: ' + info.response);
                    }
                });
            }
        });
    } catch (error) {
        console.error('Erreur survenue lors de l’envoi de courrier:', error);
    }
};

export const sendEmailOtp = async (email, contenu, options = null) => {
    try {
        let transporter = nodemailer.createTransport({
            host: 'mail.laposte.bj',
            port: 465,
            secure: true,
            auth: {
                user: 'bp@laposte.bj',
                pass: '@Laposte2024'
            },
        });

        let mailOptions = {
            from: '" POSTE BENIN | E-BOITE POSTAL " <bp@laposte.bj>',
            to: email,
            subject: "Vérification OTP",
            //text:contenu,
            html: "<h3>Bonjour,</h3><p>Heureux de vous revoir</p><p>" + contenu + "</p><p>Ce code expirera dans 5 min </p><p> Si vous n\'êtes pas à l'origine de cette action, veuillez ignorer ce message.</p>"
        };


        transporter.sendMail(mailOptions, function (error, info) {
            console.log('Email envoyé : ' + info.response);
            if (error) {
                console.log(error, "errorerrorerrorerrorerror")
            }
        });
        return true
    } catch (error) {
        console.error('Erreur survenue lors de l’envoi de courrier:', error);
        return false
    }

}