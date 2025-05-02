import validSections from './validSections.js';

const validationFunctions= {
    async validString(string, type){
        if(!string) throw (`No string provided for ${type}`);
        if(typeof string !== 'string') throw (`String must be type string`);
        string= string.trim();
        if(string.length===0) throw (`String for ${type} cannot be empty or just spaces`);
        return string;
    },

    async validEmail(email){
        email = await this.validString(email, 'Email');
        //pattern matches on email
        const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if(!pattern.test(email)) throw 'Email is not valid';
        return email;
    },

    async validPassword(password) {
        //password must be at least 8 characters long
        password = await this.validString(password, 'Password');
        if (password.length < 8) throw 'Password must be at least 8 characters long';
        return password;
    },

    async validSection(section) {
        // ensures section is a string of one of the established valid sections
        section = await this.validString(section, 'Section');
        section = section.toLowerCase();
        if(!validSections.includes(section)) throw `${section} is not a valid section`;
        return section;
    },

    async validPostBody(body){
        body = await this.validString(body, 'Post body');
        if(body.length===0) throw 'Post body cannot be empty!';
        if(body.length > 1000) throw 'Post body is too long, please keep it under 1000 characters!'
        return body;
    },

    async validURL(url, type) {
        url = await this.validString(url, type)
        // try to make url into a URL object
        try{
            new URL (url);
            return url
        } catch(e){
            throw `${type} is invalid`;
        }
    },

    async validPositiveNumber(number, type) {
        if(!number) throw (`No number provided for ${type}`);
        if (typeof number !== 'number') throw (`${type} must be type number`);
        if (number < 1) throw (`${type} must be greater than 0`);
        return number;
    }
}
export default validationFunctions;