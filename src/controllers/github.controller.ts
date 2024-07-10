import simpleGit from "simple-git"
import { basename } from "path"

export async function getRepoInfo(url: string) {}

export async function pullRepo(
  url: string,
  path: string,
  branch: string,
  onError: (reason: string) => void
) {
  const repo = await simpleGit(path).pull(url, branch).catch(onError)
}

export async function cloneRepo(
  url: string,
  path: string,
  branch: string,
  onError: (reason: string) => void
) {
  const repo = await simpleGit()
    .clone(url, path, {
      "--branch": branch,
    })
    .catch(onError)

  console.log(`Cloned ${basename(url)} (${branch}) to ${repo}`)
}
