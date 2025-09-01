import * as dotenv from "dotenv";
import twilio from "twilio";
// import twilio = require('twilio');
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { myDataSource } from "../../configs/data-source";
dotenv.config();
// import { myDataSource } from "../../../configs/data-source";

/**
 * 
 * @param contenu du modele de notification
 * @param element l'entity qui contient les données
 * @returns la notification avec les variables remplacées
 */
export const replaceVariable = async (contenu, element) => {

    let contenuTempon;
    let variables = contenu.match(/\[\[(.*?)\]\]/g);
    if (variables) {
        for (let i = 0; i < variables.length; i++) {
            const variable = variables[i];
            let variableNames = variable.replace(/\[\[(.*?)\]\]/g, '$1');
            variableNames = variableNames.split(':');
            if (variableNames.length > 1) {

                if (variableNames.length === 2) {

                    if (typeof element[variableNames[0]] != 'object') {

                        const relationName0 = variableNames[0];
                        const relationName1 = variableNames[1];
                        const a = await myDataSource.getRepository(variableNames[0]).findOne({ where: { id: (element[variableNames[0]]) } });
                        contenuTempon = a[relationName0][relationName1];

                    } else {
                        contenuTempon = (element[variableNames[0]])[variableNames[1]];
                    }
                }

                if (variableNames.length === 3) {

                    if (typeof element[variableNames[0]] != 'object') {

                        const relationName1 = variableNames[1];
                        const relationName2 = variableNames[2];
                        const a = await myDataSource.getRepository(variableNames[0]).findOne({ where: { id: element[variableNames[0]] }, relations: { [relationName1]: true } });
                        contenuTempon = a[relationName1][relationName2];

                    }
                    else if (typeof element[variableNames[1]] != 'object') {

                        const relationName2 = variableNames[2];
                        const a = await myDataSource.getRepository(variableNames[1]).findOne({ where: { id: (element[variableNames[0]])[variableNames[1]] } });
                        contenuTempon = a[relationName2];
                    } else {
                        contenuTempon = ((element[variableNames[0]])[variableNames[1]])[variableNames[2]];
                    }
                }

                //
            } else {
                contenuTempon = element[variableNames[0]];
            }

            contenu = contenu.replace(variable, contenuTempon);
        }
    }
    return contenu;
}

export const replaceAndSend = async (IdTypeNotification, element, numero, options = null) => {
    const send = sendSMS(numero, "Message", options);
    return send;
}



export const sendSMS = async (numero: string, message: string, options = null) => {
    console.log("");
    console.log("###########################################################");
    console.log("####                                                  #####");
    console.log("####                      ENVOIE D'SMS                #####");
    console.log("numero: ", numero.replace(/\s+/g,''));
    console.log("message: ", message);
    console.log("####                                                  #####");
    console.log("###########################################################");
    console.log("");


    const url = encodeURI(`${process.env.TEXTO_BASE_URL}/messages/send?from=${process.env.TEXTO_SENDER}&to=${numero.replace(/\s+/g,'')}& content=${ message }& token=${ process.env.TEXTO_TOKEN } `,)
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {},
        })
        const data = await response.json()
        console.log(JSON.stringify(data))
        return true
    } catch (error) {
        console.log(JSON.stringify(error))
        return false
    }

}

export function sendverificationcode(numero: string) {
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
    return client.verify.v2.services(process.env.SERVICE_ID)
        .verifications
        .create({ locale: 'fr', to: numero, channel: 'sms' })
        .then(data => {
            var message = "Le code vérification est envoyé !";
            return { message, data }
        }).catch(e => {
            return { message: "Le code n'a pas été envoyé", numero, data: e.data };
        })
}


export function verification(numero: string, code: string) {
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
    return client.verify.v2.services(process.env.SERVICE_ID).verificationChecks.create({ to: numero, code: code }).then(data => {
        return data;
    }).catch(e => {
        return e.data;
    })
}




