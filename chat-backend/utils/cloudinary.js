const{v2:cloudinary}=require('cloudinary')
const fs=require('fs');
require('dotenv').config()
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})
const  uploadOnCloudinary=async(localfilepath)=>{
    try{
          const response= await cloudinary.uploader.upload(localfilepath,{
            resource_type:'auto'
           });
            console.log("Uploaded on cloudinary:", response.secure_url);
           return response;
    }
    catch(err){
        console.log(err.message);
        return null;
    }
    finally{
        if(fs.existsSync(localfilepath)){
            await fs.promises.unlink(localfilepath);
        }
    }
}
module.exports={uploadOnCloudinary}