import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt"
import config from "../../config";
import { createTracing } from "node:trace_events";
import { createUserPayload } from "./user.interface";



const createUserIntoDB = async (payload: createUserPayload) => {

    const { name, email, password, profilePhoto } = payload;

    const isUserExist = await prisma.user.findUnique({
        where: { email }
    })

    if (isUserExist) {
        throw new Error("User with this email already exists")
    }


    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds))


    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,

            profileId: {
                create: {
                    profilePhoto
                }
            }
        }
    })

    //    await prisma.profile.create({
    //         data : {
    //             userID : createdUser.id,
    //             profilePhoto,

    //         }
    //     })

    const user = await prisma.user.findUnique({
        where: {
            id: createdUser.id,
            email: createdUser.email || email
        }, omit: {
            password: true
        },
        include: {
            profileId: true
        }
    })
    return user;

}

export const userServiceDB = {
    createUserIntoDB
}