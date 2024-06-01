import express,{Request, Response, NextFunction} from'express';
import cors from'cors';
import morgan from 'morgan';
import { createServer } from 'http'
import 'dotenv/config'
import routing from './index'

const app = express()
const server = createServer(app)

app.use(morgan('dev'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/v1', routing);

app.use((_req: Request, res: Response, _next: NextFunction) => {
	res.status(404).json({ status: '404', message: "URL Not Found" });
})

const port = process.env.PORT || 8080
server.listen(port, () => {
	console.log(`telah tersambung pada port : ${port}`)
});
