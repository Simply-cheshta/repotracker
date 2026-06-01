export interface CommitData {
  sha: string;
  author: string;
  date: string;
  message: string;
  filesChanged: { filename: string; additions: number; deletions: number; patch?: string }[];
}

export async function fetchCommitHistory(repoUrl: string): Promise<CommitData[]> {
  const cleanedUrl = repoUrl.replace(/\/$/, "");
  const parts = cleanedUrl.split("/");
  const repoName = parts.pop();
  const owner = parts.pop();

  if (!owner || !repoName) throw new Error("Invalid GitHub repository URL.");

  const token = process.env.GITHUB_ACCESS_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    ...(token && { Authorization: `token ${token}` }),
  };

  const res = await fetch(`https://api.github.com/repos/${owner}/${repoName}/commits?per_page=15`, { headers });
  if (!res.ok) throw new Error(`GitHub metadata fetch failed: ${res.statusText}`);
  const rawCommits = await res.json();

  const enrichedHistory: CommitData[] = [];

  for (const item of rawCommits) {
    const detailsRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/commits/${item.sha}`, { headers });
    if (detailsRes.ok) {
      const details = await detailsRes.json();
      const filesChanged = details.files?.map((f: any) => ({
        filename: f.filename,
        additions: f.additions,
        deletions: f.deletions,
        patch: f.patch
      })) || [];

      enrichedHistory.push({
        sha: item.sha,
        author: item.commit.author.name,
        date: item.commit.author.date,
        message: item.commit.message,
        filesChanged
      });
    }
  }

  return enrichedHistory;
}