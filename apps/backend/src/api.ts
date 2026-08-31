import {Router} from 'express';
import userRouter from './features/users/user.route.ts'
import authRouter from './features/auth/auth.route.ts';
import communityRouter from "./features/communities/community.route.ts"


const router = Router();

router.use("/users", userRouter);
router.use("/auth", authRouter);
router.use("/communities", communityRouter)

export default router;
