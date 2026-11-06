// Copia el contrato oficial (contrato/contrato.ts) a cada repo de código, o
// revisa que las copias coincidan. Sin dependencias: solo Node.
//
//   node scripts/contrato.mjs copiar [repo...]    (sin repos: los tres)
//   node scripts/contrato.mjs revisar [repo...]

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPOS = ["brote_backend_express", "brote_web_react", "brote_mobile_expo"];
const DESTINO = join("src", "tipos", "contrato.ts");

// En Windows, git puede dejar los archivos con \r\n: se comparan y se escriben con \n
function leerTexto(ruta) {
  return readFileSync(ruta, "utf8").replace(/\r\n/g, "\n");
}

function copiaEsperada() {
  const version = readFileSync(join(RAIZ, "contrato", "VERSION"), "utf8").trim();
  const contrato = leerTexto(join(RAIZ, "contrato", "contrato.ts"));
  const encabezado =
    `// GENERADO desde brote_specs/contrato/contrato.ts (versión ${version}).\n` +
    "// No editar a mano: cambia la copia oficial y corre `npm run contrato:copiar` en brote_specs.\n\n";
  return { version, texto: encabezado + contrato };
}

function rutaEnRepo(repo) {
  return join(RAIZ, "..", repo, DESTINO);
}

function elegirRepos(nombres) {
  if (nombres.length === 0) return REPOS;
  const desconocidos = nombres.filter((n) => !REPOS.includes(n));
  if (desconocidos.length > 0) {
    console.error(`Repos desconocidos: ${desconocidos.join(", ")}. Opciones: ${REPOS.join(", ")}`);
    process.exit(2);
  }
  return nombres;
}

function copiar(repos) {
  const { version, texto } = copiaEsperada();
  for (const repo of repos) {
    if (!existsSync(join(RAIZ, "..", repo))) {
      console.warn(`- ${repo}: no está clonado junto a brote_specs, se omite`);
      continue;
    }
    const ruta = rutaEnRepo(repo);
    mkdirSync(dirname(ruta), { recursive: true });
    writeFileSync(ruta, texto);
    console.log(`✓ ${repo}: ${DESTINO} (v${version})`);
  }
}

function revisar(repos) {
  const { version, texto } = copiaEsperada();
  let diferencias = 0;
  for (const repo of repos) {
    const ruta = rutaEnRepo(repo);
    if (!existsSync(ruta)) {
      console.error(`✗ ${repo}: falta ${DESTINO}`);
      diferencias++;
    } else if (leerTexto(ruta) !== texto) {
      console.error(`✗ ${repo}: ${DESTINO} no coincide con la v${version} oficial`);
      diferencias++;
    } else {
      console.log(`✓ ${repo}: al día (v${version})`);
    }
  }
  // código de salida distinto de 0 para que se note en scripts y en CI
  process.exit(diferencias === 0 ? 0 : 1);
}

const [comando, ...nombres] = process.argv.slice(2);
if (comando === "copiar") copiar(elegirRepos(nombres));
else if (comando === "revisar") revisar(elegirRepos(nombres));
else {
  console.error("Uso: node scripts/contrato.mjs <copiar|revisar> [repo...]");
  process.exit(2);
}
