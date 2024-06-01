import Controller from './controller'
import { Router } from "express";
const router = Router();

router.get('/driver/list', Controller.list)

export default router