import { Router } from "express";
const router = Router();
import driver from "./modules/driver/router";

router.use('/salary',driver)

export default router