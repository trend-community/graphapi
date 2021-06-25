import https from "https";
import http from "http";
import qs from "querystring";
import util from "util";
import url from "url";

import {
  LoginParams,
  NodeType,
  FacebookLimits,
  FacebookLoginResult,
  FacebookGraphResult,
  FacebookResponse,
  Group,
  Post,
  Comment,
  GroupAppInstalledFor,
} from "./types";

export * from "./types";

// API version
const OAUTH_VERSION = "/v5.0";
const VERSION = "/v10.0";

// reactions
// NONE, LIKE, LOVE, WOW, HAHA, SAD, ANGRY, THANKFUL, PRIDE, CARE
const reactions = [
  "reactions.type(NONE).limit(0).summary(total_count).as(reactions_none)",
  "reactions.type(LIKE).limit(0).summary(total_count).as(reactions_like)",
  "reactions.type(LOVE).limit(0).summary(total_count).as(reactions_love)",
  "reactions.type(WOW).limit(0).summary(total_count).as(reactions_wow)",
  "reactions.type(HAHA).limit(0).summary(total_count).as(reactions_haha)",
  "reactions.type(SAD).limit(0).summary(total_count).as(reactions_sad)",
  "reactions.type(ANGRY).limit(0).summary(total_count).as(reactions_angry)",
  "reactions.type(THANKFUL).limit(0).summary(total_count).as(reactions_thankful)",
  "reactions.type(PRIDE).limit(0).summary(total_count).as(reactions_pride)",
  "reactions.type(CARE).limit(0).summary(total_count).as(reactions_care)",
].join(",");

const group = [
  "id",
  "archived",
  "description",
  "cover.fields(id,source)",
  "icon",
  "created_time",
  "email",
  "member_count",
  "member_request_count",
  "name",
  "picture.fields(height,width,is_silhouette,url)",
  "privacy",
  "parent",
];

const groupField = [
  ...group,
].join(",");

const groupFields = [
  ...group,
  "administrator",
].join(",");

const postFields = [
  "id",
  "created_time",
  "updated_time",
  "permalink_url",
  "full_picture",
  "type",
  "name",
  "message",
  "link",
  "shares",
  "story",
  reactions,
  "comments.limit(1).fields(id).summary(true).filter(stream)",
].join(",");

const commentFields = [
  "id",
  "created_time",
  "message",
  "permalink_url",
  "attachment.fields(description,media,target,title,type,url)",
  "parent.fields(id,created_time)",
  reactions,
].join(",");

const groupAppInstalledForFields = ["id", "name"].join(",");

function graphRequest<A>(path: string): Promise<FacebookResponse<A>> {
  const opts: https.RequestOptions = {
    hostname: "graph.facebook.com",
    port: 443,
    path,
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  };
  return new Promise((resolve, reject) => {
    function handleResp(res: http.IncomingMessage): void {
      res.setEncoding("utf8");
      let data = "";
      res.on("error", reject);
      res.on("data", chunk => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error)
            resolve({
              ok: false,
              message: parsed,
            });
          else {
            let limits: FacebookLimits | null = null;
            if (res.headers["x-app-usage"]) {
              limits = JSON.parse(res.headers["x-app-usage"] as string);
            }
            resolve({
              ok: true,
              limits,
              message: parsed,
            });
          }
        } catch (err) {
          reject(err);
        }
      });
    }
    const req = https.request(opts, handleResp);
    req.on("error", reject);
    req.end();
  });
}

export function login(
  params: LoginParams
): Promise<FacebookResponse<FacebookLoginResult>> {
  const path = `${OAUTH_VERSION}/oauth/access_token?${qs.stringify(params)}`;
  return graphRequest<FacebookLoginResult>(path);
}

export class FacebookGraphAPI {
  constructor(
    private accessToken: string // long-lived or short-lived
  ) {}

  private userGroupPath(): string {
    return (
      `${VERSION}/%s?` +
      `${qs.stringify({
        fields: groupField,
        access_token: this.accessToken,
      })}`
    );
  }

  private userGroupsPath(): string {
    return (
      `${VERSION}/me/groups?` +
      `${qs.stringify({
        fields: groupFields,
        admin_only: true,
        access_token: this.accessToken,
      })}`
    );
  }

  private groupFeedPath(limit: number = 20): string {
    return (
      `${VERSION}/%s/feed?` +
      `${qs.stringify({
        fields: postFields,
        access_token: this.accessToken,
        limit,
      })}`
    );
  }

  private nodeCommentsPath(limit: number = 20): string {
    return (
      `${VERSION}/%s/comments?` +
      `${qs.stringify({
        fields: commentFields,
        filter: "stream",
        access_token: this.accessToken,
        limit,
      })}`
    );
  }

  private groupsAppInstalledForPath(): string {
    return (
      `${VERSION}/%s/app_installed_groups?` +
      `${qs.stringify({
        fields: groupAppInstalledForFields,
        filter: "stream",
        access_token: this.accessToken,
      })}`
    );
  }

  getUserGroup(groupId: string): Promise<FacebookResponse<Group>> {
    return graphRequest<Group>(util.format(this.userGroupPath(), groupId));
  }

  getUserGroups(): Promise<FacebookResponse<FacebookGraphResult<Group>>> {
    return graphRequest<FacebookGraphResult<Group>>(this.userGroupsPath());
  }

  getGroupsAppInstalledFor(
    clientId: string
  ): Promise<FacebookResponse<FacebookGraphResult<GroupAppInstalledFor>>> {
    const path = util.format(this.groupsAppInstalledForPath(), clientId);
    return graphRequest<FacebookGraphResult<GroupAppInstalledFor>>(path);
  }

  getNodeFeed(
    id: string,
    nodeType: Exclude<NodeType, "Post">,
    limit?: number
  ): Promise<FacebookResponse<FacebookGraphResult<Post>>> {
    let path: string;
    switch (nodeType) {
      case "Group":
        path = util.format(this.groupFeedPath(limit), id);
        break;
    }
    return graphRequest<FacebookGraphResult<Post>>(path);
  }

  getNodeComments(
    id: string,
    limit?: number
  ): Promise<FacebookResponse<FacebookGraphResult<Comment>>> {
    const path = util.format(this.nodeCommentsPath(limit), id);
    return graphRequest<FacebookGraphResult<Comment>>(path);
  }

  getNextPage<A>(
    nextURL: string,
    forceLimit?: number
  ): Promise<FacebookResponse<FacebookGraphResult<A>>> {
    let urlObj = new url.URL(nextURL);
    if (forceLimit) urlObj.searchParams.set("limit", `${forceLimit}`);
    return graphRequest<FacebookGraphResult<A>>(
      urlObj.pathname + urlObj.search
    );
  }
}
