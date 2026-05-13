import type {RepoStats} from './github-service';

export interface RepoData {
  owner: string;
  repo: string;
  stats: RepoStats;
}

export class IssuePrCounter {
  static countIssues(repoData: RepoData): number {
    return repoData.stats.issues;
  }

  static countPullRequests(repoData: RepoData): number {
    return repoData.stats.pullRequests;
  }
}

export class RepositoryScore {
  private score: number;

  constructor(private repoData: RepoData) {
    this.score = ScoreCalculator.calculateRepositoryScore(repoData);
  }

  getScore(): number {
    return this.score;
  }

  getNormalizedScore(): number {
    return ScoreCalculator.normalizeScore(this.score);
  }

  getRepoData(): RepoData {
    return this.repoData;
  }
}

export class ScoreCalculator {
  static calculateRepositoryScore(repoData: RepoData): number {
    const issues = IssuePrCounter.countIssues(repoData);
    const prs = IssuePrCounter.countPullRequests(repoData);
    // 간단한 점수 계산: issues + prs * 2
    return issues + prs * 2;
  }

  static calculateTotalScore(repos: RepoData[]): number {
    return repos.reduce(
      (total, repo) => total + this.calculateRepositoryScore(repo),
      0,
    );
  }

  static normalizeScore(rawScore: number): number {
    // 예시: 최대 점수를 100으로 가정하고 0-1 사이로 정규화
    const maxScore = 100;
    return Math.min(rawScore / maxScore, 1);
  }
}
