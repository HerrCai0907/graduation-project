import { Octokit } from "octokit";
import { GITHUB_TOKEN } from "../secret/token";
import { logSuccess } from "./log";
import { neo4jCreateNode } from "./neo4j";

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

export type Issue = {
  name: string;
  title: string;
  submitter: string | null;
  state: string;
  created_at: string;
  closed_at: string | null;
};

export async function createIssueList() {
  let pageIndex = 0;
  for (;;) {
    const { data } = await octokit.rest.issues.listForRepo({
      owner: "AssemblyScript",
      repo: "assemblyscript",
      state: "all",
      per_page: 100,
      page: pageIndex++,
    });
    let nodes: Issue[] = [];
    for (const d of data) {
      nodes.push({
        name: `issue-${d.number}`,
        title: d.title,
        submitter: d.user?.login ?? null,
        state: d.state,
        created_at: d.created_at,
        closed_at: d.closed_at,
      });
    }
    if (nodes.length == 0) {
      break;
    }
    logSuccess(`fetch ${nodes.length} issues from github`);
    await neo4jCreateNode(
      nodes.map(
        (n) =>
          `:Issue {name:"${n.name}", submitter:"${n.submitter}", state:"${n.state}", create_time:"${n.created_at}", close_time:"${n.closed_at}"}  `
      )
    );
  }
}
