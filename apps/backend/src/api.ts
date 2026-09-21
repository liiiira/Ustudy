import { Router } from "express";
import userRouter from "./features/users/user.route.ts";
import authRouter from "./features/auth/auth.route.ts";
import communityRouter from "./features/communities/community.route.ts";
import postRouter from "./features/posts/post.route.ts";
import commentRouter from "./features/comments/comment.route.ts";
import uploadRouter from "./features/uploads/uploads.route.ts";
import conversationRouter from "./features/conversations/conversation.route.ts";
import messageRouter from "./features/messages/message.route.ts";

const router = Router();

router.use("/users", userRouter);
router.use("/auth", authRouter);
router.use("/communities", communityRouter);
router.use("/uploads", uploadRouter);
router.use("/conversations", conversationRouter);
router.use("/conversations/:conversationId/messages", messageRouter);
router.use("/communities/:communityId/posts", postRouter);
router.use("/communities/:communityId/posts/:postId/comments", commentRouter);

export default router;
