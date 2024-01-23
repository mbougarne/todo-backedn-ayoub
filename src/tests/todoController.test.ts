/* eslint-disable no-undef */
/* eslint-disable import/no-extraneous-dependencies */
import { execSync, exec } from "child_process";
import path from "path";
import supertest from "supertest";
import app from "../app";

jest.setTimeout(7500);

const request = supertest(app);

const fakeUser = {
  fullName: "Mourad Bougarne",
  username: "userOne",
  email: "user.one@example.org",
  password: "secretPa0@",
};

const authenticateUser = async () => {
  const loginRes = await request.post("/api/v1/users/login").send(fakeUser);

  return loginRes.body.data;
};
const createAndAuthenticateUser = async () => {
  await request.post("/api/v1/users/signup").send(fakeUser);
  const { token, refreshToken } = await authenticateUser();

  return {
    token,
    refreshToken,
  };
};

const createBasicFakeTodo = async () => {
  const todoThumbnail = path.join(
    __dirname,
    "../static/fake/mailchimp-mpwF3Mv2UaU-unsplash.jpg"
  );

  const { refreshToken, token } = await createAndAuthenticateUser();
  const res = await request
    .post("/api/v1/todos/create")
    .set("Authorization", `Bearer ${token}`)
    .set("x-auth-refresh", `${refreshToken}`)
    .attach("thumbnail", todoThumbnail)
    .field("title", "Testing todo with fake data")
    .field("content", "This is a fake todo to test");

  return res;
};

beforeAll(() => {
  execSync("yarn db:migrate");
});

afterAll(() => {
  // eslint-disable-next-line no-unused-vars
  exec("yarn db:drop", (error, stdout, stderr) => {});
});

describe("Testing the Todo Controller", () => {
  it("Should not get todos without being authenticated", async () => {
    const res = await request.post("/api/v1/todos").send();

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toEqual("Please login to access this resource");
  });

  it("User should create todo when it is authenticated", async () => {
    const res = await createBasicFakeTodo();

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.todo).toBeDefined();
    expect(res.body.data.todo.todoId).toBeDefined();
    expect(res.body.data.todo.isDone).toBeFalsy();
    expect(res.body.data.todo.ownerId).not.toBeNull();
    expect(res.body.data.todo.title).toEqual("Testing todo with fake data");
    expect(res.body.data.todo.body).toEqual("This is a fake todo to test");
  });

  it("User should get its todos if there's any", async () => {
    const authUser = await authenticateUser();

    expect(authUser.todos).toBeDefined();
    expect(authUser.todos.length).toBe(1);
  });

  it("User should update todo", async () => {
    const authUser = await authenticateUser();
    const updatedTodo = {
      title: "Updated Todo Title",
      body: "Updated todo content",
      isDone: true,
    };
    const { refreshToken, token } = authUser;
    const { todoId } = authUser.todos[0];
    const res = await request
      .put(`/api/v1/todos/update/${todoId}`)
      .set("Authorization", `Bearer ${token}`)
      .set("x-auth-refresh", `${refreshToken}`)
      .send(updatedTodo);

    expect(res.statusCode).toBe(204);
  });

  it("User should delete todo", async () => {
    const authUser = await authenticateUser();
    const { refreshToken, token } = authUser;
    const { todoId } = authUser.todos[0];
    const res = await request
      .delete(`/api/v1/todos/destroy/${todoId}`)
      .set("Authorization", `Bearer ${token}`)
      .set("x-auth-refresh", `${refreshToken}`)
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body.data.message).toEqual("Todo deleted!");
  });
});
