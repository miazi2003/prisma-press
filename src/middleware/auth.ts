import { NextFunction,Request,Response } from "express";
import { createAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import config from "../config";
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";

declare global {
    namespace Express {
        interface Request {
            user?: {
                name: string,
                email: string,
                id: string,
                role: Role
            }
        }
    }
}

const auth = (...requiredRoles: Role[]) => {
    return createAsync(async (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies?.accessToken ?
            req.cookies.accessToken :
            req.headers.authorization?.startsWith("Bearer ") ?
                req.headers.authorization?.split(" ")[1] :
                req.headers.authorization;

        if (!token) {
            if (requiredRoles.length === 0) {
                return next();
            }
            throw new Error("You are not logged In");
        }


        const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret)

        if (!verifiedToken.success) {
            if (requiredRoles.length === 0) {
                return next();
            }
            throw new Error(verifiedToken.error)
        }

        const { name, email, id, role } = verifiedToken.data as JwtPayload;


        if (requiredRoles.length && !requiredRoles.includes(role)) {
            throw new Error("Forbidden, you dont have permission to access this resources")
        }


        const user = await prisma.user.findUnique({
            where: {
                id
            }
        })


        if (!user) {
            throw new Error("user Not Found")
        }


        if (user.activeStatus === "BLOOCKED") {
            throw new Error("Your account has been blocked")
        }


        req.user = {
            name: user.name,
            id: user.id,
            email: user.email,
            role: user.role
        }

        next()

    })
}


export default auth