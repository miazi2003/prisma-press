import jwt, { JwtPayload, SignOptions } from "jsonwebtoken"


const  createToken = (payload : JwtPayload , secret : string , expiresIn : SignOptions) =>{
const token = jwt.sign(payload , secret , {expiresIn} as SignOptions )

return token
}

const verifyToken = (accessToken : string , secret : string ) =>{
try{
    const verifiedToken =  jwt.verify(accessToken, secret)

return verifiedToken;
}catch(error){
    console.log("Token verification failed" , error)
throw new Error("Invalid Token")
}
}



export const jwtUtils = {
    createToken,
    verifyToken
}