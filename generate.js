#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs-extra";
import ignore from "ignore";
import inquirer from "inquirer";
import { fileURLToPath } from "node:url";
import path from "path";
import { generateIcons } from "./logo.js";
import pkg from "./package.json" with { type: "json" };

const program = new Command();

program
  .version(pkg.version)
  .command("logo")
  .description("Generate logo icons")
  .argument("<svg_path>", "path to svg icon")
  .action((svgPath) => generateIcons(svgPath));

program.action(() => generateProject().catch(console.error));
program.parse(process.argv);

async function generateProject() {
  const { name, version, description, author, logo } = await inquirer.prompt([
    { name: "name", message: "Project name:", default: "my-crx-app" },
    { name: "version", message: "Version:", default: "0.0.0" },
    { name: "description", message: "Description:", default: "" },
    { name: "author", message: "Author:", default: "" },
    { name: "logo", message: "Logo (SVG path, optional):", default: "" },
  ]);

  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "..",
    "template"
  );
  const outputDir = path.join(process.cwd(), name);

  const gitignorePath = path.join(templateDir, ".gitignore");
  const ig = fs.existsSync(gitignorePath)
    ? ignore().add(fs.readFileSync(gitignorePath, "utf8"))
    : ignore();

  await fs.copy(templateDir, outputDir, {
    filter: (src) => {
      const rel = path.relative(templateDir, src);
      return !rel || !ig.ignores(rel);
    },
  });

  const pkgPath = path.join(outputDir, "package.json");
  const projectPkg = JSON.parse(await fs.readFile(pkgPath, "utf-8"));
  projectPkg.name = projectPkg.displayName = name;
  projectPkg.version = version;
  projectPkg.description = description;
  projectPkg.author = author;
  await fs.writeFile(pkgPath, JSON.stringify(projectPkg, null, 2));

  const fileReplacer = (file) =>
    fs
      .readFile(file, "utf8")
      .then((c) => fs.writeFile(file, c.replace(/my-crx-app/g, name)));

  const files = [
    "README.md",
    "devtools.html",
    "newtab.html",
    "options.html",
    "popup.html",
    "sidepanel.html",
  ].map((f) => path.join(outputDir, f));
  await Promise.all(files.map(fileReplacer));

  if (logo) {
    await generateIcons(logo, outputDir);
  }

  console.log(`Project "${name}" created. Next steps:
  1. cd ${name}
  2. yarn install
  3. Open chrome://extensions/ → Developer mode → Load unpacked → select build/`);
}
