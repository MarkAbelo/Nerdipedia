import { ObjectId } from "mongodb";
import validationFunctions from "./validation";

const idValidationFunctions = {
    async validObjectId(id,type){
        if(!id) throw (`No id provided for ${type}`);
        if(typeof id!== 'string') throw (`Id for ${type} must be a string`);
        id=id.trim();
        if(id.length===0) throw (`Id for ${type} must not be an empty string`);
        if(!ObjectId.isValid(id)) throw (`Invalid id provided for ${type}`);
        return id; 
    }
}
export default idValidationFunctions;