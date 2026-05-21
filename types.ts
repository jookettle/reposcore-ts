// reposcore-ts 도메인 공용 타입.
// github-service.ts(데이터 생산)와 score-calculator.ts(점수 계산)가
// 동일한 shape을 직접 공유하기 위해 한 곳에 모읍니다.

export type ContributionKind = 'feature' | 'bug' | 'doc' | 'typo';

// 인식되지 않는 라벨은 'none'으로 표현합니다.
export type ContributionLabel = ContributionKind | 'none';

export interface PRRecord {
  number: number;
  title: string;
  url: string;
  isMerged: boolean;
  labels: string[];
  category: ContributionLabel;
  additions?: number;
  deletions?: number;
  mergedAt?: string;
  author?: string;
}

export interface IssueRecord {
  number: number;
  title: string;
  url: string;
  labels: string[];
  category: ContributionLabel;
  state: string;
  author?: string;
  createdAt?: string;
  closedAt?: string;
}

export interface DetailedRepoData {
  prs: PRRecord[];
  issues: IssueRecord[];
}
