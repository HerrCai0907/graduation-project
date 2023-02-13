import assert from "assert";
import neo4j from "neo4j-driver";
import { logError, logSuccess } from "./log";

const driver = neo4j.driver(
  "bolt://127.0.0.1:7687",
  neo4j.auth.basic("neo4j", "password")
);

export async function neo4jCreateNode<
  T extends Record<string, string | number>
>(label: string, props: T[]) {
  const cmds = new Array<string>();
  for (const prop of props) {
    let propsStrings = new Array<string>();
    for (const k in prop) {
      const v = prop[k];
      if (typeof v == "string") {
        propsStrings.push(`${k}:"${v}"`);
      } else {
        propsStrings.push(`${k}:${v}`);
      }
    }
    cmds.push(`(:${label} {${propsStrings.join(",")}})`);
  }
  let cmd = "CREATE " + cmds.join(",");
  await neo4jRun(cmd);
}

export async function clear() {
  await neo4jRun("match (r) detach delete r");
}

export async function neo4jRun(cmd: string) {
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
