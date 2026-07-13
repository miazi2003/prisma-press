import { prisma } from "../../lib/prisma";
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


    return user
}

export const authService = {
    loginUser
}