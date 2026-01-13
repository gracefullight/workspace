import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { input } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";
import tiged from "tiged";

const TEMPLATE_REPO = "first-fluke/fullstack-starter";

const program = new Command();

program
  .name("create-fullstack-starter")
  .description("Scaffold a fullstack-starter template from GitHub")
  .version("0.1.0", "-v, --version")
  .argument("[directory]", "Target directory for the project")
  .action(async (directory?: string) => {
    await main(directory);
  });

async function main(directory?: string) {
  console.log(
    chalk.cyan.bold("\n  Fullstack Starter - Production-ready fullstack monorepo template\n"),
  );

  let targetDir = directory;

  if (!targetDir) {
    targetDir = await input({
      message: "Project directory:",
      default: ".",
      validate: (value) => {
        if (!value.trim()) {
          return "Directory name cannot be empty";
        }
        return true;
      },
    });
  }

  const resolvedPath = path.resolve(process.cwd(), targetDir);
  const isCurrentDir = targetDir === ".";

  if (existsSync(resolvedPath)) {
    const files = readdirSync(resolvedPath);
    const hasFiles = files.filter((f) => !f.startsWith(".")).length > 0;

    if (hasFiles && !isCurrentDir) {
      console.error(chalk.red(`\n  Error: Directory "${targetDir}" is not empty.\n`));
      process.exit(1);
    }
  }

  console.log(chalk.gray(`  Cloning template from ${TEMPLATE_REPO}...\n`));

  try {
    const emitter = tiged(TEMPLATE_REPO, {
      disableCache: true,
      force: isCurrentDir,
      verbose: false,
    });

    emitter.on("info", (info) => {
      if (info.code === "SUCCESS") {
        console.log(chalk.green(`  ${info.message}`));
      }
    });

    await emitter.clone(resolvedPath);

    console.log(chalk.green.bold("\n  Success! Your project is ready.\n"));
    console.log(chalk.white("  Next steps:\n"));

    if (!isCurrentDir) {
      console.log(chalk.cyan(`    cd ${targetDir}`));
    }

    console.log(chalk.cyan("    mise install        # Install runtimes"));
    console.log(chalk.cyan("    mise run install    # Install dependencies"));
    console.log(chalk.cyan("    mise infra:up       # Start local infrastructure"));
    console.log(chalk.cyan("    mise dev            # Start development servers\n"));

    console.log(chalk.gray("  Documentation: https://github.com/first-fluke/fullstack-starter\n"));
    console.log(chalk.gray("  If you like this template, please leave a star:\n"));
    console.log(
      chalk.gray("    gh api --method PUT /user/starred/first-fluke/fullstack-starter\n"),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(chalk.red(`\n  Error: Failed to clone template.\n  ${message}\n`));
    process.exit(1);
  }
}

program.parse();
