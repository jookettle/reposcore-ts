import {mkdir} from 'node:fs/promises';
import {countByCategory} from './github-service';
import type {DetailedRepoData} from './types';
import type {UserScore} from './score-calculator';

const DEFAULT_OUTPUT_DIR = 'output';
const CSV_FILENAME = 'scores.csv';
const TXT_FILENAME = 'scores.txt';

export interface RepoSummary {
  repoPath: string;
  mergedPrFeatureBug: number;
  mergedPrDocs: number;
  mergedPrTypo: number;
  closedIssueFeatureBug: number;
  closedIssueDocs: number;
}

export interface OutputPaths {
  csv: string;
  txt: string;
}

// 향후 --output 옵션이 추가되어도 경로 조합 로직이 한곳에 모이도록 분리합니다.
export const getOutputPaths = (
  outputDir: string = DEFAULT_OUTPUT_DIR,
  subDir?: string,
): OutputPaths => {
  const targetDir = subDir ? `${outputDir}/${subDir}` : outputDir;
  return {
    csv: `${targetDir}/${CSV_FILENAME}`,
    txt: `${targetDir}/${TXT_FILENAME}`,
  };
};

// DetailedRepoData를 저장소별 카테고리 요약(RepoSummary)으로 변환합니다.
// TXT 파일에서 가독성 있는 저장소별 블록을 생성하는 데 사용됩니다.
export const summarizeRepo = (
  repoPath: string,
  detailed: DetailedRepoData,
): RepoSummary => {
  const prCounts = countByCategory(detailed.prs);
  const issueCounts = countByCategory(detailed.issues);
  return {
    repoPath,
    mergedPrFeatureBug: prCounts.feature + prCounts.bug,
    mergedPrDocs: prCounts.doc,
    mergedPrTypo: prCounts.typo,
    closedIssueFeatureBug: issueCounts.feature + issueCounts.bug,
    closedIssueDocs: issueCounts.doc,
  };
};

const USER_CSV_HEADERS = [
  'userId',
  'prFeatureBug',
  'prDocs',
  'prTypo',
  'issueFeatureBug',
  'issueDocs',
  'totalScore',
] as const;

// 사용자별 집계 점수를 CSV 텍스트로 만듭니다.
// 헤더와 행 스키마는 README.md의 안내(기본 실행 시 사용자별 점수 CSV)와 동일합니다.
export const buildUserScoresCsv = (users: ReadonlyArray<UserScore>): string => {
  const rows = users.map(user => {
    let prFeatureBug = 0;
    let prDocs = 0;
    let prTypo = 0;
    let issueFeatureBug = 0;
    let issueDocs = 0;
    for (const repo of user.repoScores) {
      for (const data of repo.scoreData) {
        prFeatureBug += data.prFeatureBug;
        prDocs += data.prDocs;
        prTypo += data.prTypo;
        issueFeatureBug += data.issueFeatureBug;
        issueDocs += data.issueDocs;
      }
    }
    return [
      user.userId,
      prFeatureBug,
      prDocs,
      prTypo,
      issueFeatureBug,
      issueDocs,
      user.totalScore,
    ].join(',');
  });
  return [USER_CSV_HEADERS.join(','), ...rows].join('\n') + '\n';
};

// 저장소별 카테고리 요약을 사람이 읽기 좋은 TXT 블록으로 만듭니다.
export const buildRepoSummariesTxt = (
  summaries: ReadonlyArray<RepoSummary>,
): string => {
  const blocks = summaries.map(s =>
    [
      `[${s.repoPath}]`,
      `Merged PRs - feature: ${s.mergedPrFeatureBug}, docs: ${s.mergedPrDocs}, typo: ${s.mergedPrTypo}`,
      `Closed Issues - feature: ${s.closedIssueFeatureBug}, docs: ${s.closedIssueDocs}`,
    ].join('\n'),
  );
  return blocks.join('\n\n') + '\n';
};

// 💡 추가된 함수: 사용자별 점수 집계 결과를 사람이 읽기 쉬운 TXT 블록으로 변환합니다.
export const buildUserScoresTxt = (users: ReadonlyArray<UserScore>): string => {
  const lines = users.map(user => {
    let prFeatureBug = 0;
    let prDocs = 0;
    let prTypo = 0;
    let issueFeatureBug = 0;
    let issueDocs = 0;
    for (const repo of user.repoScores) {
      for (const data of repo.scoreData) {
        prFeatureBug += data.prFeatureBug;
        prDocs += data.prDocs;
        prTypo += data.prTypo;
        issueFeatureBug += data.issueFeatureBug;
        issueDocs += data.issueDocs;
      }
    }
    return `- ${user.userId}: totalScore=${user.totalScore}, PR(feature/bug)=${prFeatureBug}, PR(docs)=${prDocs}, PR(typo)=${prTypo}, Issue(feature/bug)=${issueFeatureBug}, Issue(docs)=${issueDocs}`;
  });

  return ['User Scores', ...lines].join('\n') + '\n';
};

export interface ScoreOutputData {
  userScores: ReadonlyArray<UserScore>;
  repoSummaries: ReadonlyArray<RepoSummary>;
}

// CSV는 항상 생성하고, format이 'txt'인 경우 TXT를 추가로 생성합니다.
// reposcore-cs와 동일한 사양을 따릅니다.
export const writeOutputFiles = async (
  format: 'csv' | 'txt',
  data: ScoreOutputData,
  outputDir: string = DEFAULT_OUTPUT_DIR,
  subDir?: string,
): Promise<OutputPaths | {csv: string}> => {
  const paths = getOutputPaths(outputDir, subDir);

  const targetDir = subDir ? `${outputDir}/${subDir}` : outputDir;
  await mkdir(targetDir, {recursive: true});

  await Bun.write(paths.csv, buildUserScoresCsv(data.userScores));

  if (format === 'txt') {
    // 💡 기존 저장소 요약 하단에 사용자별 점수 요약본을 개행('\n')으로 결합하여 저장합니다.
    const repoSummariesTxt = buildRepoSummariesTxt(data.repoSummaries);
    const userScoresTxt = buildUserScoresTxt(data.userScores);

    await Bun.write(paths.txt, repoSummariesTxt + '\n' + userScoresTxt);
    return paths;
  }

  return {csv: paths.csv};
};
