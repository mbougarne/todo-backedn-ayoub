import { Router } from "express";

import { TodoController } from "../controllers";

export const router = Router();
const todoController = new TodoController();

router.get("/", todoController.all);
router.get("/:todoId", todoController.single);
router.post("/create", todoController.create);
router.put("/update/:todoId", todoController.update);
router.put("/completed/:todoId", todoController.completed);
router.delete("/destroy/:todoId", todoController.destroy);
