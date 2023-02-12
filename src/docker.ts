import { spawnSync } from "child_process";
import { resolve } from "path";
import { logSuccess } from "./log";

const dockerName = "graduation_project_neo4j";
const projectRoot = resolve(__dirname, "..");

export function start() {
  spawnSync(
    "docker",
    [
      "run",
      "-d",
      `--name=${dockerName}`,
      "--publish=7474:7474",
      "--publish=7687:7687",
      `--volume=${projectRoot}/data:/data`,
      `--volume=${projectRoot}/logs:/logs`,
      `--volume=${projectRoot}/conf:/var/lib/neo4j/conf`,
      `--env=NEO4J_AUTH=neo4j/password`,
      "neo4j",
    ],
    { stdio: "inherit" }
  );
  logSuccess(`success start docker container ${dockerName}`);
}
export function restart() {
  spawnSync("docker", ["restart", `${dockerName}`], { stdio: "inherit" });
  logSuccess(`success restart docker container ${dockerName}`);
}
