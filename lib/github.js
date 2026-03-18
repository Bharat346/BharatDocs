export async function saveToGitHub(
  content,
  path,
  message = "Update MDX content",
) {
  const GITHUB_TOKEN = process.env.github_AT;
  const REPO_OWNER = "Bharat346";
  const REPO_NAME = "docs-storage";

  if (!GITHUB_TOKEN) {
    throw new Error("GitHub token is missing");
  }

  // First, get the current file SHA if it exists
  const getUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
  let sha;
  try {
    const getRes = await fetch(getUrl, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;
    }
  } catch (e) {
    console.log("File not found, creating new one");
  }

  const putRes = await fetch(getUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString("base64"),
      sha, // Required if updating
    }),
  });

  if (!putRes.ok) {
    const errorData = await putRes.json();
    throw new Error(`GitHub Error: ${errorData.message}`);
  }

  return await putRes.json();
}

/**
 * Fetch all unique folder paths from the GitHub repository.
 */
export async function getGitHubFolders() {
  const GITHUB_TOKEN = process.env.github_AT;
  const REPO_OWNER = "Bharat346";
  const REPO_NAME = "docs-storage";

  if (!GITHUB_TOKEN) {
    throw new Error("GitHub token is missing");
  }

  // Get the default branch first to find the root tree
  const repoUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
  const repoRes = await fetch(repoUrl, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!repoRes.ok) return [];
  const repoData = await repoRes.json();
  const defaultBranch = repoData.default_branch || "main";

  // Efficient recursive tree listing
  const treeUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${defaultBranch}?recursive=1`;
  const treeRes = await fetch(treeUrl, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!treeRes.ok) return [];
  const treeData = await treeRes.json();

  // Extract paths where type is 'tree' (which means directory)
  const folders = treeData.tree
    .filter((item) => item.type === "tree")
    .map((item) => item.path);

  return folders;
}
