import { ObjectId } from "mongodb";
import validationFunctions from "./validation.js";

const idValidationFunctions = {
    async validObjectId(id,type){
        if(!id) throw (`No id provided for ${type}`);
        if(typeof id!== 'string') throw (`Id for ${type} must be a string`);
        id=id.trim();
        if(id.length===0) throw (`Id for ${type} must not be an empty string`);
        if(!ObjectId.isValid(id)) throw (`Invalid id provided for ${type}`);
        return id; 
    },
    async validString(string, type){
        if(!string) throw (`No string provided for ${type}`);
        if(typeof string !== 'string') throw (`String must be type string`);
        string= string.trim();
        if(string.length===0) throw (`String for ${type} must not be an empty string`);
        return string;
    },
    async validPositiveNumber(number, type) {
        if(!number) throw (`No number provided for ${type}`);
        if (typeof number !== 'number') throw (`${type} must be type number`);
        if (number < 1) throw (`${type} must be greater than 0`);
        return number;
    }
}
export default idValidationFunctions;