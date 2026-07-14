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

const getMyProfileFromDB = async (userId: string) => {

    const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        omit: { password: true },
        include: { profileId: true }
    })


    return user
}


const updatemyProfileIntoDB = async (userId: string, payload: any) => {
    const { name, email, profilePhoto, bio } = payload;

    const updatedProfile = await prisma.user.update({
        where: { id: userId },
        data :{
            name,
            email,
            profileId : {
           
                    update : {
                        profilePhoto,
                        bio
                    }
                }
            
        },
        omit : {
            password : true
        },
        include : {
            profileId : true
        }

    })

    return updatedProfile;
}

export const userServiceDB = {
    createUserIntoDB,
    getMyProfileFromDB,
    updatemyProfileIntoDB
}