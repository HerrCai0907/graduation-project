import { HttpsProxyAgent } from "hpagent";
import { Octokit } from "octokit";
import { env } from "process";
import { GITHUB_TOKEN } from "../secret/token";
import { logSuccess } from "./log";
import { neo4jCreateNode, neo4jRun } from "./neo4j";

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
  request: {
    agent:
      env["https_proxy"] != undefined
        ? new HttpsProxyAgent({
            keepAlive: true,
            proxy: env["https_proxy"],
          })
        : undefined,
  },
});

type Issue = {
  name: string;
  submitter: string;
  state: string;
  totalTime: number;
};

type Submitter = {
  name: string;
};

export async function createIssueList() {
  let pageIndex = 0;
  let submitterNodes = new Map<string, Submitter>();
  for (;;) {
    const { data } = await octokit.rest.issues.listForRepo({
      owner: "AssemblyScript",
      repo: "assemblyscript",
      state: "all",
      per_page: 100,
      page: pageIndex++,
    });
    let issueNodes = new Array<Issue>();
    for (const d of data) {
      const endDate = new Date(d.closed_at ?? Date.now());
      const startDate = new Date(d.created_at);
      const deltaDate = endDate.getTime() - startDate.getTime();
      issueNodes.push({
        name: `issue-${d.number}`,
        submitter: d.user?.login ?? "unknown",
        state: d.state,
        totalTime: Math.ceil(deltaDate / 1000 / 60 / 60 / 24),
      });
      if (d.user != undefined && !submitterNodes.has(d.user.login)) {
        submitterNodes.set(d.user.login, { name: d.user.login });
      }
    }
    if (issueNodes.length == 0) {
      break;
    }
    logSuccess(`fetch ${issueNodes.length} issues from github`);
    await neo4jCreateNode("Issue", issueNodes);
  }
  await neo4jCreateNode("Person", [...submitterNodes.values()]);
  await neo4jRun(
    "match (n:Issue),(b:Person) where n.submitter=b.name create (b)-[r:Submit]->(n)"
  );
}
