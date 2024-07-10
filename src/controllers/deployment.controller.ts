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
  const name = basename(url)
  const path = `${process.env.DEPLOY_DIR}${name}-${branch}`

  log(name, `Deploying repo ${url} as ${name} to ${path}`)

  deployments[name] = "in progress"

  function onError(reason: string) {
    log(name, `ERROR ${reason}`)
    deployments[name] = "errored"
  }

  if (await Bun.file(`${path}/${composeFile}`).exists()) {
    log(name, "Pulling repo")
    await pullRepo(url, path, branch, onError)
  } else {
    log(name, "Cloning repo")
    await cloneRepo(url, path, branch, onError)
  }

  const envPath = `${path}/.env`
  prepareEnvFile(envPath, variables)

  log(name, "Compose pull")
  await composePull(name, `${path}/${composeFile}`, onError)

  log(name, "Compose up")
  await composeUp(name, `${path}/${composeFile}`, envPath, onError)

  deployments[name] = "deployed"
}
