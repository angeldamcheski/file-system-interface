import { delay, fileSystem } from "./fakeApi";

export async function fetchFolders(path = "root") {
  await delay();

  const data = fileSystem[path];

  if (!data) {
    throw new Error("Folder not found");
  }

  return data.folders.map((name) => ({
    name,
    path: path === "root" ? name : `${path}/${name}`,
    type: "folder",
  }));
}
export async function fetchFiles(path = "root") {
  await delay();

  const data = fileSystem[path];

  if (!data) {
    throw new Error("Folder not found");
  }

  return data.files.map((name) => ({
    name,
    path: `${path}/${name}`,
    type: "file",
    size: Math.floor(Math.random() * 5000) + "kb",
    modified: new Date().toISOString(),
  }));
}
export async function fetchFolderContent(path = "root") {
  await delay();

  const data = fileSystem[path];

  if (!data) {
    throw new Error("Folder not found");
  }

  return {
    folders: data.folders,
    files: data.files,
  };
}
