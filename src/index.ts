#!/usr/bin/env node
import minimist from "minimist";
import chalk from "chalk";
import VerifyError from "./error";
import verify from "./verify";

const argv = minimist(process.argv.splice(2));

async function stdin() {
  let res = "";
  process.stdin.setEncoding("utf8");
  for await (let chunk of process.stdin) {
    res += chunk;
  }
  return res;
}

(async () => {
  if (!argv.rule) {
    console.log('Add at least one rule, --rule="# Potato"');
    process.exit(1);
  }

  if (argv.rule && typeof argv.rule === "string") {
    argv.rule = [argv.rule];
  }

  try {
    verify(await stdin(), argv.rule);
    // passed rules
    console.log(chalk.green("Rules Passed ✅"));
    for (let i = 0; i < argv.rule.length; i++) {
      console.log(`${i + 1}.`, argv.rule[i]);
    }
    process.exit(0);
  } catch (e: any) {
    let { errors } = e as VerifyError;
    for (const error of errors) {
      console.log(`
Rule: ${chalk.bold.blue(error.rule)}
Message: ${chalk.bold.red(error.msg)}`);
    }

    // get passed and failed rules
    let failed = Array.from(new Set(errors.map((e) => e.rule)));
    let passed = argv.rule.filter((r: string) => !failed.includes(r));

    console.log(chalk.green("Rules Passed ✅"));
    for (let i = 0; i < passed.length; i++) {
      console.log(`${i + 1}.`, passed[i]);
    }

    console.log(chalk.red("Rules Failed ❌"));
    for (let i = 0; i < failed.length; i++) {
      console.log(`${i + 1}.`, failed[i]);
    }
    process.exit(1);
  }
})();
