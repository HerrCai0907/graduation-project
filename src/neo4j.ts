import assert from "assert";
import neo4j from "neo4j-driver";
import { logError, logSuccess } from "./log";

const driver = neo4j.driver(
  "bolt://127.0.0.1:7687",
  neo4j.auth.basic("neo4j", "password")
);

export async function neo4jCreateNode(node: string | string[]) {
  node = [node].flat();
  assert(node.length > 0);
  const cmd = "CREATE " + node.map((n) => `(${n})`).join(",");
  await _neo4jRun(cmd);
}

export async function clear() {
  await _neo4jRun("match (r) detach delete r");
}

async function _neo4jRun(cmd: string) {
  const session = driver.session();
  try {
    await session.run(cmd);
    // logSuccess(cmd);
    return true;
  } catch (e) {
    logError(cmd);
    logError(`${e}`);
    return false;
  } finally {
    await session.close();
  }
}

export async function neo4jExit() {
  await driver.close();
}
