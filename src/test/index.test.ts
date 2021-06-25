import nock from "nock";

import { FacebookGraphAPI, login } from "../index";

beforeAll(function () {
  nock.disableNetConnect();
});

describe("facebook login", function () {
  describe("user access token", function () {
    let scope: nock.Scope;
    beforeEach(function () {
      scope = nock("https://graph.facebook.com")
        .get(/\/oauth\/access_token\?/)
        .reply(200, { access_token: "", token_type: "", expires_in: 0 });
    });

    afterEach(function () {
      nock.cleanAll();
    });

    test("should login the user with application info and user access token", async function () {
      expect.assertions(2);
      const result = await login({
        grant_type: "fb_exchange_token",
        client_id: "appId",
        client_secret: "appSecret",
        fb_exchange_token: "userAccessToken",
      });
      expect(result.ok).toEqual(true);
      expect(scope.isDone()).toEqual(true);
    });
  });

  describe("app access token", function () {
    let scope: nock.Scope;
    beforeEach(function () {
      scope = nock("https://graph.facebook.com")
        .get(/\/oauth\/access_token\?/)
        .reply(200, { access_token: "", token_type: "" });
    });

    afterEach(function () {
      nock.cleanAll();
    });

    test("should login the user with application info and user access token", async function () {
      expect.assertions(2);
      const result = await login({
        grant_type: "client_credentials",
        client_id: "appId",
        client_secret: "appSecret",
      });
      expect(result.ok).toEqual(true);
      expect(scope.isDone()).toEqual(true);
    });
  });
});

describe("facebook graph", function () {
  let api: FacebookGraphAPI;

  beforeAll(function () {
    api = new FacebookGraphAPI("secretAccessToken");
  });

  describe("successful call to get node feed, node = 'group'", function () {
    let scope: nock.Scope;
    beforeEach(function () {
      scope = nock("https://graph.facebook.com")
        .defaultReplyHeaders({
          "x-app-usage": JSON.stringify({
            call_count: 0,
            total_time: 0,
            total_cputime: 0,
          }),
        })
        .get(/\/1\/feed\?/)
        .reply(200, { data: [], paging: {} });
    });

    afterEach(function () {
      nock.cleanAll();
    });

    test("should make a successfull call", async function () {
      expect.assertions(2);
      const result = await api.getNodeFeed("1", "Group");
      expect(result.ok).toEqual(true);
      expect(scope.isDone()).toEqual(true);
    });
  });

  describe("error call to get node feed, node = 'group'", function () {
    let scope: nock.Scope;
    beforeEach(function () {
      scope = nock("https://graph.facebook.com")
        .get(/\/1\/feed\?/)
        .reply(400, { error: {} });
    });

    afterEach(function () {
      nock.cleanAll();
    });

    test("should make an error call", async function () {
      expect.assertions(2);
      const result = await api.getNodeFeed("1", "Group");
      expect(result.ok).toEqual(false);
      expect(scope.isDone()).toEqual(true);
    });
  });

  describe("get error when problem with underlying req for get node feed, node = 'group'", function () {
    beforeEach(function () {
      nock("https://graph.facebook.com")
        .get(/\/1\/feed\?/)
        .replyWithError("error making request");
    });

    afterEach(function () {
      nock.cleanAll();
    });

    test("should make an error call", async function () {
      expect.assertions(1);
      return expect(api.getNodeFeed("1", "Group")).rejects.toThrowError(
        "error making request"
      );
    });
  });

  describe("successful call to get node comments", function () {
    let scope: nock.Scope;
    beforeEach(function () {
      scope = nock("https://graph.facebook.com")
        .defaultReplyHeaders({
          "x-app-usage": JSON.stringify({
            call_count: 0,
            total_time: 0,
            total_cputime: 0,
          }),
        })
        .get(/\/1\/comments\?/)
        .reply(200, { data: [], paging: {} });
    });

    afterEach(function () {
      nock.cleanAll();
    });

    test("should make a successfull call", async function () {
      expect.assertions(2);
      const result = await api.getNodeComments("1");
      expect(result.ok).toEqual(true);
      expect(scope.isDone()).toEqual(true);
    });
  });

  describe("successful call to get next page of results", function () {
    let scope: nock.Scope;
    beforeEach(function () {
      scope = nock("https://graph.facebook.com")
        .defaultReplyHeaders({
          "x-app-usage": JSON.stringify({
            call_count: 0,
            total_time: 0,
            total_cputime: 0,
          }),
        })
        .get(/\/1\/feed\?/)
        .reply(200, { data: [], paging: {} });
    });

    afterEach(function () {
      nock.cleanAll();
    });

    test("should make a successfull call", async function () {
      expect.assertions(2);
      const url =
        "https://graph.facebook.com/v10.0/1/feed?fields=id%2Ccreated_time%2Cupdated_time%2Cpermalink_url%2Cfull_picture%2Ctype%2Cname%2Cmessage%2Clink%2Cshares%2Cstory%2Creactions.fields(id%2Ctype).summary(true)%2Ccomments.limit(1).fields(id).summary(true).filter(stream)&limit=50&access_token=secretAccessToken";
      const result = await api.getNextPage(url);
      expect(result.ok).toEqual(true);
      expect(scope.isDone()).toEqual(true);
    });
  });

  describe("successful call to get user's group by id", function () {
    let scope: nock.Scope;
    beforeEach(function () {
      scope = nock("https://graph.facebook.com")
        .defaultReplyHeaders({
          "x-app-usage": JSON.stringify({
            call_count: 0,
            total_time: 0,
            total_cputime: 0,
          }),
        })
        .get(/\/12345\?/)
        .reply(200, { id: "12345" });
    });

    afterEach(function () {
      nock.cleanAll();
    });

    test("should make a successfull call", async function () {
      expect.assertions(2);
      const result = await api.getUserGroup("12345");
      expect(result.ok).toEqual(true);
      expect(scope.isDone()).toEqual(true);
    });
  });

  describe("successful call to get user's groups", function () {
    let scope: nock.Scope;
    beforeEach(function () {
      scope = nock("https://graph.facebook.com")
        .defaultReplyHeaders({
          "x-app-usage": JSON.stringify({
            call_count: 0,
            total_time: 0,
            total_cputime: 0,
          }),
        })
        .get(/\/me\/groups\?/)
        .reply(200, { data: [], paging: {} });
    });

    afterEach(function () {
      nock.cleanAll();
    });

    test("should make a successfull call", async function () {
      expect.assertions(2);
      const result = await api.getUserGroups();
      expect(result.ok).toEqual(true);
      expect(scope.isDone()).toEqual(true);
    });
  });

  describe("successful call to get groups app is installed for", function () {
    let scope: nock.Scope;
    beforeEach(function () {
      scope = nock("https://graph.facebook.com")
        .defaultReplyHeaders({
          "x-app-usage": JSON.stringify({
            call_count: 0,
            total_time: 0,
            total_cputime: 0,
          }),
        })
        .get(/\/appId\/app_installed_groups\?/)
        .reply(200, { data: [], paging: {} });
    });

    afterEach(function () {
      nock.cleanAll();
    });

    test("should make a successfull call", async function () {
      expect.assertions(2);
      const result = await api.getGroupsAppInstalledFor("appId");
      expect(result.ok).toEqual(true);
      expect(scope.isDone()).toEqual(true);
    });
  });
});
