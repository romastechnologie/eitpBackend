import * as express from 'express';
export  const  getDatePlusXDays = (x: number)=>{
    const currentDate = new Date();
    const futureDate = new Date();
    
    futureDate.setDate(currentDate.getDate() + x);
    // Obtenez les composants de la date
    const year = futureDate.getFullYear();
    const month = (futureDate.getMonth() + 1).toString().padStart(2, '0'); // Les mois commencent à 0
    const day = futureDate.getDate().toString().padStart(2, '0');

    // Formattez la date comme "YYYY-MM-DD"
    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
}

export const now = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const seconds = currentDate.getSeconds().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
}


// Utilisation de la fonction pour obtenir la date actuelle + 5 jours
const dateInFiveDays = getDatePlusXDays(5);
console.log(`La date actuelle plus 5 jours est : ${dateInFiveDays}`);

//COnvertir les string en boolean
export const convertStringToBoolean = (obj: any, key: string)=> {
    if (obj[key] === 'true') {
        obj[key] = true;
    } else if (obj[key] === 'false') {
        obj[key] = false;
    }
}

export const genereMotDePasse = (): string =>{
    let charactersArray = 'a-z,A-Z,0-9,#'.split(',')
    let CharacterSet = '';
    let password = '';
    let size = 12;
    /* switch (this.strengthLevel) {
      case 12:
          size = 10
          charactersArray = 'a-z,A-Z'.split(',')
          break
      case 24:
          size = 12
          charactersArray = 'a-z,A-Z,0-9'.split(',')
          break
      case 36:
          size = 14
          charactersArray = 'a-z,A-Z,0-9,#'.split(',')
          break
      case 48:
          size = 16
          charactersArray = 'a-z,A-Z,0-9,#'.split(',')
      break
    }*/

    if (charactersArray.indexOf('a-z') >= 0) {
      CharacterSet += 'abcdefghijklmnopqrstuvwxyz'
    }

    if (charactersArray.indexOf('A-Z') >= 0) {
      CharacterSet += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    }

    if (charactersArray.indexOf('0-9') >= 0) {
      CharacterSet += '0123456789'
    }

    if (charactersArray.indexOf('#') >= 0) {
      CharacterSet += '@$!%*?&#'
    }

    for (let i = 0; i < size; i++) {
      password += CharacterSet.charAt(Math.floor(Math.random() * CharacterSet.length))
    }

    return password
  }