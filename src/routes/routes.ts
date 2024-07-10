import { Router, Request } from "express"
import { getLogs } from "../controllers/logs.controller"
import {
  deploy,
  getDeploymentStatus,
} from "../controllers/deployment.controller"

const router = Router()

router.get("/", (req, res) => {
  res.send({
    status: 200,
  })
})

export type EnvironmentVariable = {
  key: string
  value: string
}

type DeployData = {
  url: string
  branch: string
  composeFile: string
  variables: EnvironmentVariable[]
}

router.post("/deploy", async (req: Request<{}, {}, DeployData>, res) => {
  const { url, branch, composeFile, variables } = req.body

  const id = deploy(url, branch, composeFile, variables)

  res.status(200).json({
    status: "ok",
    id: id
  })
})

router.get("/status/:id", async (req, res) => {
  const id = req.params.id

  res.status(200).json({
    status: getDeploymentStatus(id),
    log: getLogs(id),
  })
})

export default router
