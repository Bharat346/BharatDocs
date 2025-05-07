const GITHUB_API_URL = `https://api.github.com/repos/${
  import.meta.env.VITE_GITHUB_OWNER
}/${import.meta.env.VITE_GITHUB_REPO}/contents/Notes`;


export const fetchMainFolders = async (path = "/") => {
  try {
    let github_path = GITHUB_API_URL + path;
    const response = await fetch(github_path, {
      headers: {
        Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
        // Removed Authorization
      }
    });

    if (!response.ok) throw new Error("Failed to fetch main folders");

    const data = await response.json();
    return data
      .filter((item) => item.type === "dir")
      .map((folder) => folder.name);
  } catch (error) {
    console.error("Error fetching main folders:", error);
    throw error;
  }
};

export const fetchNotesData = async (folderPath = "") => {
  try {
    const url = `${GITHUB_API_URL}/${folderPath ? `${folderPath}/` : ""}index.json`;

    const response = await fetch(url, {
      headers: {
        Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
        // Removed Authorization
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          type: "Folder",
          title: folderPath.split("/").pop() || "Notes",
          date: new Date().toISOString().split("T")[0],
          baseName: folderPath.split("/").pop() || "Notes",
          parent: folderPath.split("/").slice(0, -1).join("/") || "",
          children: [],
          subfolders: {},
        };
      }
      throw new Error("Failed to fetch notes data");
    }

    const data = await response.json();
    const decodedContent = atob(data.content);
    return JSON.parse(decodedContent);
  } catch (error) {
    console.error("Error fetching notes data:", error);
    throw error;
  }
};

export const updateNotesData = async (folderPath, newData) => {
  try {
    const url = `${GITHUB_API_URL}/${folderPath}/index.json`;
    const sha = await getFileSha(folderPath);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Update ${folderPath}/index.json`,
        content: btoa(JSON.stringify(newData, null, 2)),
        sha: sha,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating notes data:", error);
    throw error;
  }
};

export const deleteNoteItem = async (folderPath, item) => {
  try {
    const currentData = await fetchNotesData(folderPath);
    let updatedData = JSON.parse(JSON.stringify(currentData));

    if (item.type === "Folder") {
      if (updatedData.subfolders && updatedData.subfolders[item.baseName]) {
        delete updatedData.subfolders[item.baseName];
      }
    } else {
      if (updatedData.children) {
        updatedData.children = updatedData.children.filter(
          (child) => child.name !== item.name
        );
      }
    }

    return await updateNotesData(folderPath, updatedData);
  } catch (error) {
    console.error("Error deleting note item:", error);
    throw error;
  }
};

// 🔄 SHA fetching - token not required unless accessing private repos
const getFileSha = async (folderPath) => {
  try {
    const url = `${GITHUB_API_URL}/${folderPath}/index.json`;
    const response = await fetch(url, {
      headers: {
        Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
        // Removed Authorization
      }
    });
    if (!response.ok) throw new Error("File not found");
    const data = await response.json();
    return data.sha;
  } catch (error) {
    return null;
  }
};
