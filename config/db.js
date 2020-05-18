const mongoose = require("mongoose")
const config = require('config')
const db = config.get('mongoURI')


const connectDB = async ()=>{
    try{
      await  mongoose.connect(db,{
          useNewUrlParser:true,
          useCreateIndex:true,
           useUnifiedTopology: true 
      })

      console.log("mongoDB Connected...")

    }
    catch(err)
    {
        console.log(err.message)
        //exit process with falier
        process.exit(1)
    }

}

module.exports = connectDB;