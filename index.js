
import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import databaseConnection from './db/database.js'
import CustomErrorMiddle from './utility/customError.urility.js'
import authRouter from './routes/auth.route.js'
import userRouter from './routes/user.route.js'
import cookieParser from 'cookie-parser'
import propertyRouter from './routes/property.route.js'
import cors from 'cors'
import pgRouter from './routes/pg.route.js'
import rentRouter from './routes/rent.route.js'
import GuestRouter from './routes/guestUser.route.js'
import contactusRouter from './routes/contactus.route.js'


const app=express()

const PORT=process.env.PORT || 3000
const URL=process.env.DATABASE_URL

// middlewares--
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cookieParser())
app.use(cors({
    origin: ['http://localhost:5173','http://localhost:5173/contact','https://rental-wave.vercel.app','https://rental-wave-h6depmlxn-farhan-ansaris-projects.vercel.app'], // Allows all origins
    credentials: true // Allows cookies to be sent cross-origin
  }))


// routes load
app.use('/api/auth',authRouter)
app.use('/api/user',userRouter)
app.use('/api/property',propertyRouter)
app.use('/api/pg',pgRouter)
app.use('/api/rent',rentRouter)
app.use('/api/guest',GuestRouter)
app.use('/api/contactus',contactusRouter)


// error handle--
app.use(CustomErrorMiddle);

app.listen(PORT,()=>{
    console.log(`server running on ${PORT}`)
    databaseConnection(URL)
})