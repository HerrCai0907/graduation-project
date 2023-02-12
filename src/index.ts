import { Command } from "commander";
import { restart, start } from "./docker";
import { createIssueList } from "./github";
import { neo4jExit } from "./neo4j";

const program = new Command();

program.command("start").action(() => {
  start();
});
program.command("restart").action(() => {
  restart();
});
program.command("fetch_issue").action(async () => {
  await createIssueList();
  await neo4jExit();
});

program.parse(process.argv);
