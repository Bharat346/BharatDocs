import axios from "axios";

const GITHUB_API = "https://api.github.com";
const token = import.meta.env.VITE_GITHUB_TOKEN;
const owner = import.meta.env.VITE_GITHUB_OWNER;
const repo = import.meta.env.VITE_GITHUB_REPO;
const branch = import.meta.env.VITE_GITHUB_BRANCH;

// 🔓 No-token instance for reading
const githubRead = axios.create({
  baseURL: GITHUB_API,
  headers: {
    Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
  },
});

// 🔐 Token instance for writing
const githubWrite = axios.create({
  baseURL: GITHUB_API,
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
  },
});

const encodeContent = (str) => btoa(unescape(encodeURIComponent(str)));

// 🟢 READ FILE
export const getFileContent = async (path) => {
  try {
    const response = await githubRead.get(
      `/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting file content:", error);
    throw error;
  }
};

// 🟢 READ FOLDER
export const getFolderContents = async (path = "Notes") => {
  try {
    const response = await githubRead.get(
      `/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting folder contents:", error);
    throw error;
  }
};

// 🔴 WRITE OR UPDATE FILE
export const createOrUpdateFile = async (path, content, message) => {
  try {
    let sha = "";
    try {
      const existingFile = await getFileContent(path); // still safe to use read-only call
      sha = existingFile.sha;
    } catch (e) {
      if (e.response?.status !== 404) throw e;
    }

    const response = await githubWrite.put(
      `/repos/${owner}/${repo}/contents/${path}`,
      {
        message,
        content: encodeContent(content),
        sha,
        branch,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating/updating file:", error);
    throw error;
  }
};

// 🔴 DELETE FILE
export const deleteFile = async (path, message) => {
  try {
    const existingFile = await getFileContent(path); // still safe to use read-only call
    const response = await githubWrite.delete(
      `/repos/${owner}/${repo}/contents/${path}`,
      {
        data: {
          message,
          sha: existingFile.sha,
          branch,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

// 🟡 Ensure Notes directory
export const ensureNotesDirectory = async (dir) => {
  try {
    await getFolderContents(dir); // read-only
  } catch (error) {
    if (error.response?.status === 404) {
      // Folder doesn't exist — create .gitkeep via write call
      await createOrUpdateFile(
        `${dir}/.gitkeep`,
        "",
        "Initialize Notes directory with .gitkeep"
      );
    } else {
      throw error;
    }
  }
};
