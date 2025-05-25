import fs from "fs/promises";
import path from "path";

const BASE_PATH = path.resolve(__dirname);

export async function getRoles() {
  const data = await fs.readFile(path.join(BASE_PATH, "roles.json"), "utf-8");
  return JSON.parse(data);
}

export async function getUserRoles() {
  const data = await fs.readFile(
    path.join(BASE_PATH, "user-roles.json"),
    "utf-8"
  );
  return JSON.parse(data);
}

export async function writeUserRoles(data: any) {
  await fs.writeFile(
    path.join(BASE_PATH, "user-roles.json"),
    JSON.stringify(data, null, 2)
  );
}

export async function writeRoles(data: any) {
  await fs.writeFile(
    path.join(BASE_PATH, "roles.json"),
    JSON.stringify(data, null, 2)
  );
}

export async function getCapabilities() {
  const data = await fs.readFile(
    path.join(BASE_PATH, "capabilities.json"),
    "utf-8"
  );
  return JSON.parse(data);
}

export async function getRoleCapabilities() {
  const data = await fs.readFile(
    path.join(BASE_PATH, "role-capabilities.json"),
    "utf-8"
  );
  return JSON.parse(data);
}

export async function writeRoleCapabilities(data: any) {
  await fs.writeFile(
    path.join(BASE_PATH, "role-capabilities.json"),
    JSON.stringify(data, null, 2)
  );
}
