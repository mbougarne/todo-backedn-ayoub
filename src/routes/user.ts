import { Router } from "express";

import { UserController } from "../controllers";

export const router = Router();
const userController = new UserController();

router.post("/login", userController.login);
router.post("/signup", userController.signup);
router.put("/update", userController.update);
router.delete("/destroy", userController.destroy);
