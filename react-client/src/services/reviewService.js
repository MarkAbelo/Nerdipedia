import axios from 'axios';
import validationFunctions from '../../../data-server/validation/validation.js';

const reviewService={
    async createReview(reviewObject){
        try{
            if(!reviewObject.hasOwnProperty(reviewObject.posterID)) throw "Poster Id must be provided"
            if(!reviewObject.hasOwnProperty(reviewObject.body)) throw "Body must be provided"
            if(!reviewObject.hasOwnProperty(reviewObject.rating)) throw "Poster rating must be provided"
            if(!reviewObject.hasOwnProperty(reviewObject.section)) throw "Section must be provided"
            if(!reviewObject.hasOwnProperty(reviewObject.forID)) throw "ForID must be provided"
            reviewObject.body=await validationFunctions.validString(reviewObject.body, "Body")
            
        }
        catch(e){

        }
        try{

        }
        catch(e){

        }
    }
}
export default reviewService