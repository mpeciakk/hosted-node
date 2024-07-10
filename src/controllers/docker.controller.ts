import * as compose from "docker-compose"
import { appendLog } from "./logs.controller"

export async function composePull(
  deploymentId: string,
  composeFile: string,
  onError: (reason: string) => void
) {
  const lastIndex = composeFile.lastIndexOf("/")
  const path = composeFile.substring(0, lastIndex)
  const file = composeFile.substring(lastIndex).replace("/", "")

  await compose
    .pullAll({
      log: true,
      cwd: path,
      config: file,
      callback(chunk, streamSource) {
        appendLog(deploymentId, chunk.toString())
      },
    })
    .catch(onError)
}

export async function composeUp(
  deploymentId: string,
  composeFile: string,
  envPath: string,
  onError: (reason: string) => void
) {
  const lastIndex = composeFile.lastIndexOf("/")
  const path = composeFile.substring(0, lastIndex)
  const file = composeFile.substring(lastIndex).replace("/", "")

  console.log(path)

  await compose
    .upAll({
      log: true,
      cwd: path,
      config: file,
      composeOptions: [["--env-file", envPath]],
      callback(chunk, streamSource) {
        console.log(chunk.toString())
        appendLog(deploymentId, chunk.toString())
      },
    })
    .catch(onError)
}
