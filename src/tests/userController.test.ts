/* eslint-disable no-undef */
/* eslint-disable import/no-extraneous-dependencies */
import { execSync, exec } from "child_process";
import supertest from "supertest";
import app from "../app";

jest.setTimeout(7500);

const request = supertest(app);

beforeAll(() => {
  execSync("yarn db:migrate");
});

afterAll(() => {
  // eslint-disable-next-line no-unused-vars
  exec("yarn db:drop", (error, stdout, stderr) => {});
});

describe("Testing the User Controller", () => {
  it("User should not create with invalid email", async () => {
    const fakeUser = {
      fullName: "Mourad Bougarne",
      username: "userOne",
      email: "user.one.org",
      password: "secretPa0@",
    };

    const res = await request.post("/api/v1/users/signup").send(fakeUser);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.statusText).toEqual("Bad Request");
    expect(res.body.message).toEqual("The email is not valid email");
  });

  it("User should not create with invalid password", async () => {
    const fakeUser = {
      fullName: "Mourad Bougarne",
      username: "userOne",
      email: "user.one@example.org",
      password: "weakPas",
    };

    const res = await request.post("/api/v1/users/signup").send(fakeUser);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.statusText).toEqual("Bad Request");
    expect(res.body.message.includes("The password is not valid")).toBeTruthy();
  });

  it("User should not create if the fullName not exists", async () => {
    const fakeUser = {
      username: "userOne",
      email: "user.one@example.org",
      password: "secretPa0@",
    };

    const res = await request.post("/api/v1/users/signup").send(fakeUser);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.statusText).toEqual("Bad Request");
    expect(
      res.body.message.includes(
        "The request missing all or some required fields"
      )
    ).toBeTruthy();
  });

  it("User should create with valid data", async () => {
    const fakeUser = {
      fullName: "Mourad Bougarne",
      username: "userOne",
      email: "user.one@example.org",
      password: "secretPa0@",
    };

    const res = await request.post("/api/v1/users/signup").send(fakeUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("success");
    expect(res.body).toHaveProperty("statusCode");
    expect(res.body).toHaveProperty("statusText");
    expect(res.body).toHaveProperty("data");

    expect(res.body.success).toBeTruthy();
    expect(res.body.statusText).toEqual("Created");

    expect(res.body.data.userId).toBeDefined();
    expect(res.body.data.name).toBeDefined();
    expect(res.body.data.username).toBeDefined();
    expect(res.body.data.email).toBeDefined();
  });

  it("User should not create with an existing username", async () => {
    const fakeUser = {
      fullName: "Mourad Bougarne",
      username: "userOne",
      email: "user.two@example.org",
      password: "secretPa0@",
    };

    const res = await request.post("/api/v1/users/signup").send(fakeUser);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toEqual("The username or email already taken");
  });

  it("User should not create with an existing email", async () => {
    const fakeUser = {
      fullName: "Mourad Bougarne",
      username: "userTwo",
      email: "user.one@example.org",
      password: "secretPa0@",
    };

    const res = await request.post("/api/v1/users/signup").send(fakeUser);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toEqual("The username or email already taken");
  });

  it("User should login with its data", async () => {
    const fakeUser = {
      email: "user.one@example.org",
      password: "secretPa0@",
    };

    const res = await request.post("/api/v1/users/login").send(fakeUser);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it("User should not login with missing email", async () => {
    const fakeUser = {
      password: "secretPa0@",
    };

    const res = await request.post("/api/v1/users/login").send(fakeUser);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toEqual("The email and password are required");
  });

  it("User should not login with missing password", async () => {
    const fakeUser = {
      email: "user.one@example.org",
    };

    const res = await request.post("/api/v1/users/login").send(fakeUser);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toEqual("The email and password are required");
  });

  it("User should not login with wrong email", async () => {
    const fakeUser = {
      email: "user.not.exists@example.org",
      password: "secretPa0@",
    };

    const res = await request.post("/api/v1/users/login").send(fakeUser);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toEqual(
      "There is no user with the provided email"
    );
  });

  it("User should not login with wrong password", async () => {
    const fakeUser = {
      email: "user.one@example.org",
      password: "wrongPassword",
    };

    const res = await request.post("/api/v1/users/login").send(fakeUser);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toEqual("The password is wrong");
  });

  it("User should be authenticated before accessing protected routes", async () => {
    const fakeUser = {
      email: "user.one@example.org",
      password: "secretPa0@",
    };

    const res = await request.post("/api/v1/users/update").send(fakeUser);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toEqual("Please login to access this resource");
  });

  it("User should generate new token based on valid refreshToken", async () => {
    const fakeUser = {
      email: "user.one@example.org",
      password: "secretPa0@",
    };
    const loginRes = await request.post("/api/v1/users/login").send(fakeUser);
    const { token, refreshToken } = loginRes.body.data;
    // eslint-disable-next-line no-promise-executor-return
    await new Promise((resolve) => setTimeout(resolve, 3500));

    const updateUser = {
      username: "userTwo",
      email: "user.two@example.org",
      password: "secretPa0@",
    };

    const res = await request
      .put("/api/v1/users/update")
      .set("Authorization", `Bearer ${token}`)
      .set("x-auth-refresh", `${refreshToken}`)
      .send(updateUser);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.newToken).toBeDefined();
  });

  it("User should update its data", async () => {
    const loginDetails = {
      email: "user.one@example.org",
      password: "secretPa0@",
    };
    const updateUser = {
      username: "userTwo",
      email: "user.two@example.org",
      password: "secretPa0@",
    };
    const loginRes = await request
      .post("/api/v1/users/login")
      .send(loginDetails);
    const res = await request
      .put("/api/v1/users/update")
      .set("Authorization", `Bearer ${loginRes.body.data.token}`)
      .set("x-auth-refresh", `${loginRes.body.data.refreshToken}`)
      .send(updateUser);

    expect(res.statusCode).toBe(204);
  });

  it("User should delete its account", async () => {
    const loginDetails = {
      email: "user.two@example.org",
      password: "secretPa0@",
    };

    const loginRes = await request
      .post("/api/v1/users/login")
      .send(loginDetails);
    const res = await request
      .delete("/api/v1/users/destroy")
      .set("Authorization", `Bearer ${loginRes.body.data.token}`)
      .set("x-auth-refresh", `${loginRes.body.data.refreshToken}`)
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body.data.message).toEqual("User deleted");
  });
});
