import { EnvironmentVariable } from "../routes/routes";

export async function prepareEnvFile(path: string, variables: EnvironmentVariable[]) {
  let env = ""

  for (const variable of variables) {
    env += `${variable.key}=${variable.value}\n`
  }

  await Bun.write(path, env)
}