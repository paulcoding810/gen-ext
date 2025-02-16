#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs-extra";
import ignore from "ignore";
import inquirer from "inquirer";
import { fileURLToPath } from "node:url";
import path from "path";
import { generateIcons } from "./logo.js";

const program = new Command();

program
  .command("logo")
  .description("Generate logo icons")
  .argument("<svg_path>", "path to svg icon")
  .action((path) => {
    generateIcons(path);
  });

program.action(() => generateProject().catch(console.error));

program.parse(process.argv);

async function generateProject() {
  const answers = await inquirer.prompt([
    { name: "name", message: "Project name:", default: "my-crx-app" },
    { name: "version", message: "Version:", default: "0.0.0" },
    { name: "description", message: "Description:", default: "" },
    { name: "author", message: "Author:", default: "" },
  ]);

  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "..",
    "template"
  );

  const outputDir = path.join(process.cwd(), answers.name);

  // await fs.copy(templateDir, outputDir);
  // console.log(`Copied template to ${outputDir}`);

  // Load .gitignore rules
  const gitignorePath = path.join(templateDir, ".gitignore");
  let ig = ignore();
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
    ig = ignore().add(gitignoreContent);
  }

  // Copy template with .gitignore filtering
  await fs.copy(templateDir, outputDir, {
    filter: (src) => {
      const relativePath = path.relative(templateDir, src);
      return relativePath === "" || !ig.ignores(relativePath);
    },
  });

  // Update package.json
  const packageJsonPath = path.join(outputDir, "package.json");
  let packageJson = await fs.readFile(packageJsonPath, "utf-8");

  const pkg = JSON.parse(packageJson, "utf-8");
  pkg.name = answers.name;
  pkg.displayName = answers.name;
  pkg.version = answers.version;
  pkg.description = answers.description;
  pkg.author = answers.author;

  await fs.writeFile(packageJsonPath, JSON.stringify(pkg, null, 2));

  // Update README.md
  const readmePath = path.join(outputDir, "README.md");
  let readmeContent = await fs.readFile(readmePath, "utf8");
  readmeContent = readmeContent.replace(/my-crx-app/g, answers.name);
  await fs.writeFile(readmePath, readmeContent);

  console.log(`
   Suggest you next step:
    1. cd ${path.relative(process.cwd(), outputDir)}
    2. Run yarn install
    3. Open chrome://extensions/ in your browser
    4. Check the box for Developer mode in the top right.
    5. Click the Load unpacked extension button.
    6. Select the build/ directory that was created.
  `);
}
