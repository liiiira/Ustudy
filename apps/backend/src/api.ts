import {Router} from 'express';
import userRouter from './features/users/user.route.ts'
import authRouter from './features/auth/auth.route.ts';
import communityRouter from "./features/communities/community.route.ts"
import postRouter from "./features/posts/post.route.ts"
import commentRouter from "./features/comments/comment.router.ts" 

const router = Router();

router.use("/users", userRouter);
router.use("/auth", authRouter);
router.use("/communities", communityRouter)
router.use("/communities/:communityId/posts", postRouter)
router.use("/communities/:communityId/posts/postId/comments", commentRouter);

export default router;
