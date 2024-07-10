import { cloneRepo, pullRepo } from "../controllers/github.controller"
import { basename } from "path"
import { composePull, composeUp } from "../controllers/docker.controller"
import { appendLog } from "./logs.controller"
import { prepareEnvFile } from "./env.controller"
import { EnvironmentVariable } from "../routes/routes"

type DeploymentStatus = "in progress" | "deployed" | "exited" | "errored"

const deployments: Record<string, DeploymentStatus> = {}

function log(deploymentId: string, message: string) {
  console.log(`[${deploymentId}] ${message}`)
  appendLog(deploymentId, message)
}

export async function getDeploymentStatus(deploymentId: string) {
  return deployments[deploymentId]
}

export async function deploy(url: string, branch: string, composeFile: string, variables: EnvironmentVariable[]) {
  const id = Date.now().toString()
  const name = basename(url)
  const path = `${process.env.DEPLOY_DIR}${name}-${branch}`

  log(id, `Deploying repo ${url} as ${name} (${id}) to ${path}`)

  deployments[id] = "in progress"

  function onError(reason: string) {
    log(id, `ERROR ${reason}`)
    deployments[id] = "errored"
  }

  if (await Bun.file(`${path}/${composeFile}`).exists()) {
    log(id, "Pulling repo")
    await pullRepo(url, path, branch, onError)
  } else {
    log(id, "Cloning repo")
    await cloneRepo(url, path, branch, onError)
  }

  const envPath = `${path}/.env`
  prepareEnvFile(envPath, variables)

  log(id, "Compose pull")
  await composePull(id, `${path}/${composeFile}`, onError)

  log(id, "Compose up")
  await composeUp(id, `${path}/${composeFile}`, envPath, onError)

  deployments[id] = "deployed"

  return id
}
