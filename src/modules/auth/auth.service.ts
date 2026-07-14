import { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { ILoginUser } from "./auth.interface"
import bcrypt from "bcrypt"

const loginUser = async (payload: ILoginUser) => {
    console.log(payload)

    const { email, password } = payload;

    const user = await prisma.user.findUniqueOrThrow({
        where: { email }
    })

    const ispasswordMatched = await bcrypt.compare(password, user.password)

    if (!ispasswordMatched) {
        throw new Error("Password is incorrect")
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }
    const accessToken = jwtUtils.createToken(jwtPayload, config.jwt_access_secret, config.jwt_access_expires_in as SignOptions)
    const refreshToken = jwtUtils.createToken(jwtPayload, config.jwt_refersh_secret, config.jwt_refersh_expires_in as SignOptions)



    return {
        accessToken,
        refreshToken
    }
}

const refreshToken = async (refreshToken: string) => {

    const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, config.jwt_refersh_secret)


    if (!verifiedRefreshToken.success) {
        throw new Error(verifiedRefreshToken.error)
    }

    const { id } = verifiedRefreshToken.data as JwtPayload;


    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id
        }
    })


    if (user.activeStatus === "BLOOCKED") {
        throw new Error("Your account has been blocked")
    }

    const jwtPayload = {
        id,
        name: user.name,
        email: user.email,
        role: user.role
    }


    const accessToken = jwtUtils.createToken(jwtPayload, config.jwt_access_secret, config.jwt_refersh_expires_in as SignOptions);

    return {
        accessToken
    };




}

export const authService = {
    loginUser,
    refreshToken
}