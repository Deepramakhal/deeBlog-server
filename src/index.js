import dotenv from 'dotenv'
import connectDB from './db/index.js'
import { app } from './app.js'

dotenv.config(
    {
        path:'./.env'   
    }
)

connectDB()
.then(()=>{
    const PORT = process.env.PORT || 5001
    app.listen(PORT,()=>{
        console.log(`Server connected at ${PORT}`)
    })
})
.catch((err)=>{
    console.log("Database connection FAILED",err);
})