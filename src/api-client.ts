import * as githubUtils from "@actions/github/lib/utils";
import * as retry from "@octokit/plugin-retry";
import consoleLogLevel from "console-log-level";

import { getRequiredInput } from "./actions-util";
import { getRequiredEnvParam } from "./util";

export enum DisallowedAPIVersionReason {
  ACTION_TOO_OLD,
  ACTION_TOO_NEW,
}

export type GitHubApiCombinedDetails = GitHubApiDetails &
  GitHubApiExternalRepoDetails;

export interface GitHubApiDetails {
  auth: string;
  url: string;
}

export interface GitHubApiExternalRepoDetails {
  externalRepoAuth?: string;
  url: string;
}

export const getApiClient = function (
  apiDetails: GitHubApiCombinedDetails,
  { allowExternal = false } = {}
) {
  const auth =
    (allowExternal && apiDetails.externalRepoAuth) || apiDetails.auth;
  const retryingOctokit = githubUtils.GitHub.plugin(retry.retry);
  return new retryingOctokit(
    githubUtils.getOctokitOptions(auth, {
      baseUrl: "https://chrisgavin.review-lab.github.com/api/v3",
      userAgent: "080905da0e3b3b1e2af41cf7357851187ed982e9",
      log: consoleLogLevel({ level: "debug" }),
    })
  );
};

// Temporary function to aid in the transition to running on and off of github actions.
// Once all code has been converted this function should be removed or made canonical
// and called only from the action entrypoints.
export function getActionsApiClient() {
  const apiDetails = {
    auth: getRequiredInput("token"),
    url: getRequiredEnvParam("GITHUB_SERVER_URL"),
  };

  return getApiClient(apiDetails);
}
