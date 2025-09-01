import * as dotenv from "dotenv";
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
import { myDataSource } from "../../../configs/data-source";
import { Contact } from "../entity/Contact";

dotenv.config();
const host = "mail.nostests.com";

export const sendEmail = async (
  subject,
  nomComplet,
  email,
  telephone,
  service,
  message
) => {
  console.error("Je suis là");
  try {
    let transporter = nodemailer.createTransport({
      host: "mail.laposte.bj",
      port: 465,
      secure: true,
      auth: {
        user: "bp@laposte.bj",
        pass: "@Laposte2024",
      },
    });

    let mailOptions = {
      from: '" POSTE BENIN | E-BOITE POSTAL TEST " <bp@laposte.bj>',
      to: email,
      subject: subject,
      html: "",
    };

    let data = {
      message: message,
      nomComplet: nomComplet,
      email: email,
      telephone: telephone,
      service: service,
    };

    ejs.renderFile(
      path.join(__dirname, "../template/emailTemplate.ejs"),
      data,
      function (err, data) {
        if (err) {
          console.error("Je viens", err);
        } else {
          console.error("Je viens 2");
          mailOptions.html = data;
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.error(
                "Erreur survenue lors de l’envoi de courrier:",
                error
              );
            } else {
              console.error("Courrié envoyé avec succès", error);
            }
          });
        }
      }
    );
  } catch (error) {
    console.error("Erreur survenue lors de l’envoi de courrier:", error);
  }
};

export const mailOrderComplete = async (donnees) => {
  console.error("Je suis là");
  try {
    let transporter = nodemailer.createTransport({
      host: "mail.nostests.com",
      port: 465,
      secure: true,
      auth: {
        user: "laposte@nostests.com",
        pass: "Alafia@12345",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    let mailOptions = {
      from: '" POSTE BENIN | E-BOITE POSTAL TEST " <laposte@nostests.com>',
      to: donnees.email,
      subject: donnees.subject,
      html: "",
    };

    let data = donnees;

    ejs.renderFile(
      path.join(__dirname, "../template/commande_complete.ejs"),
      data,
      function (err, data) {
        if (err) {
          console.error("Je viens", err);
        } else {
          console.error("Je viens 2");
          mailOptions.html = data;
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.error("Erreur survenue lors de l’envoi du mail:", error);
            } else {
              console.error("Courrié envoyé avec succès");
            }
          });
        }
      }
    );
  } catch (error) {
    console.error("Erreur survenue lors de l’envoi de courrier:", error);
  }
};

export const mailConfirm = async (donnees) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "mail.nostests.com",
      port: 465,
      secure: true,
      auth: {
        user: "laposte@nostests.com",
        pass: "Alafia@12345",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    let mailOptions = {
      from: '" POSTE BENIN | E-BOITE POSTAL TEST " <laposte@nostests.com>',
      to: donnees.email,
      subject: donnees.subject,
      html: "",
    };

    let data = donnees;

    ejs.renderFile(
      path.join(__dirname, "../template/confirme_mail.ejs"),
      data,
      function (err, data) {
        if (err) {
          console.error("Je viens", err);
        } else {
          mailOptions.html = data;
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.error("Erreur survenue lors de l’envoi du mail:", error);
            } else {
              console.error(
                "Courrié envoyé avec succès pour confirmation du mail"
              );
            }
          });
        }
      }
    );
  } catch (error) {
    console.error("Erreur survenue lors de l’envoi de courrier:", error);
  }
};
