import { NextFunction, Request, Response } from "express";
import { Role, SubscriptionStatus } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { createAsync } from "../utils/catchAsync";

export const subscriptionGuard = () => {
    return createAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const user = req.user;

            if (!user) {
                throw new Error("You are not logged In");
            }

            if (user.role === Role.ADMIN) {
                return next();
            }

            const subscription = await prisma.subscription.findUnique({
                where: {
                    userId: user.id
                }
            });

            if (!subscription) {
                throw new Error("Please subscribe to get access to Premium Contents");
            }

            const isExpired = subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) <= new Date();

            if (subscription.status !== SubscriptionStatus.ACTIVE || isExpired) {
                throw new Error("Please subscribe again to get access to Premium Contents");
            }

            next();
        }
    );
};