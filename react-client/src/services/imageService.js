import axios from 'axios';

export default async function imageService(imageFile) {
    const idata = new FormData();
    idata.append('imgfile', imageFile);
    try {
        const { data } = await axios.post("http://localhost:3000/images/upload", idata);
        return data.url;
    } catch(e) {
        console.log(e)
    }
    
    
}