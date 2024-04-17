
import mongoose from "mongoose"

const databaseConnection=async(url)=>{
    try {
        await mongoose.connect(url)
        console.log(`db connection successfully `)
        
    } catch (error) {
        console.log(`db connection failed ${error}`)
    }
}

export default databaseConnection
