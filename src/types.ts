export type NodeType = "Group" | "Post";

/**
 * retry errors:
 * API Unknown (code = 1)
 * API Service (code = 2)
 * Temporarily blocked for policies violations (368)
 *
 * rate limit errors:
 * API Too Many Calls (code = 4)
 * API User Too Many Calls (code = 17)
 * Application limit reached (code = 341)
 *
 * renew access token:
 * Access token has expired (code = 190)
 */

export type LoginParams =
  | {
      // user access token
      grant_type: "fb_exchange_token";
      client_id: string;
      client_secret: string;
      fb_exchange_token: string;
    }
  | {
      // app access token
      grant_type: "client_credentials";
      client_id: string;
      client_secret: string;
    };

export interface FacebookError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}

export interface FacebookLimits {
  call_count: number;
  total_time: number;
  total_cputime: number;
}

export interface FacebookLoginResult {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface Group {
  id: string;
  archived: boolean;
  description: string;
  cover: {
    id: string;
    source: string;
  };
  icon: string;
  created_time: string; // fmt: 2021-04-05T19:59:49+0000
  email: string;
  member_count: number;
  member_request_count: number;
  name: string;
  picture: {
    data: {
      height: number;
      width: number;
      is_silhouette: boolean;
      url: string;
    };
  };
  privacy: string;
  parent: any;
  administrator: boolean;
}

export interface GroupAppInstalledFor {
  id: string;
  name: string;
}

export interface Reactions {
  reactions_none: {
    summary: { total_count: number };
  };
  reactions_like: {
    summary: { total_count: number };
  };
  reactions_love: {
    summary: { total_count: number };
  };
  reactions_wow: {
    summary: { total_count: number };
  };
  reactions_haha: {
    summary: { total_count: number };
  };
  reactions_sad: {
    summary: { total_count: number };
  };
  reactions_angry: {
    summary: { total_count: number };
  };
  reactions_thankful: {
    summary: { total_count: number };
  };
  reactions_pride: {
    summary: { total_count: number };
  };
  reactions_care: {
    summary: { total_count: number };
  };
}

export interface Post extends Reactions {
  id: string;
  created_time: string; // fmt: 2021-05-06T19:29:03+0000
  updated_time: string;
  permalink_url: string;
  type: string;
  full_picture?: string;
  name?: string;
  message?: string;
  link?: string;
  shares?: any;
  story?: string;
  comments?: {
    data: Array<{ id: string }>;
    paging: any; // ignore, query comments in another route
    summary: {
      order: string;
      total_count: number;
      can_comment: boolean;
    };
  };
}

export interface Comment extends Reactions {
  id: string;
  created_time: string; // fmt: 2021-04-05T21:31:59+0000
  message: string;
  permalink_url: string;
  attachment?: {
    description: string;
    media: {
      image: {
        height: number;
        width: number;
        src: string;
      };
    };
    target: {
      url: string;
    };
    title: string;
    type: string;
    url: string;
  };
  parent?: {
    id: string;
    created_time: string;
  };
}

export interface FacebookGraphResult<A> {
  data: A[];
  paging?: {
    cursors?: {
      after: string;
      before: string;
    };
    previous?: string;
    next?: string;
  };
}

export type FacebookResponse<A> =
  | { ok: true; limits: FacebookLimits | null; message: A }
  | { ok: false; message: FacebookError };

export interface GroupInstallWebhook {
  field: string;
  value: {
    group_id: string;
    update_time: string; // time of update
    verb: string; // type of action taken
    actor_id: string; // admin who installed/uninstalled app
  };
}

export interface WebhookResponse<A> {
  entry: Array<{
    time: number;
    changes: A[];
    id: string;
    uid: string;
  }>;
  object: string;
}
