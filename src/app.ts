import express from "express"
import routes from "./routes/routes"
import morgan from "morgan"

const app = express()

app.use(express.json())
app.use(morgan(":method :url :status :res[content-length] - :response-time ms"))

app.use("/", routes)

export default app
