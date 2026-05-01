require('dotenv').config({path:'./config/config.env'});
const mongoose=require('mongoose');

const connectDb=async()=>{

try{

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB");
}
catch(err){
console.log("Error connecting database ",err);

}


}
module.exports=connectDb;
