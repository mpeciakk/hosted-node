const logs: Record<string, string> = {}

export function appendLog(deploymentId: string, message: string) {
  if (!logs[deploymentId]) logs[deploymentId] = ""

  logs[deploymentId] += message + (!message.endsWith("\n") ? "\n" : "")
}

export function getLogs(deploymentId: string) {
  return logs[deploymentId]
}
