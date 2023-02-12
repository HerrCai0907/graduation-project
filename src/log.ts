import chalk from "chalk";

export function logSuccess(message: string) {
  console.log(chalk.green(message));
}

export function logWarn(message: string) {
  console.log(chalk.yellow(message));
}

export function logError(message: string) {
  console.log(chalk.redBright(message));
}
