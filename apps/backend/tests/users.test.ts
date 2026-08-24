import { describe, it, expect , beforeEach, afterAll} from 'vitest';
import  request  from 'supertest';
import app from '../src/app';
import pool from '../src/config/postgres';

// To guarantee independence of tests
beforeEach(async() => {
  pool.query('TRUNCATE TABLE users CASCADE');
})

describe("POST /users/", () => {
  it("should register a user with JSON", async () =>{
    const response = await request(app)
      .post("/api/v1/users")
      .set("Content-Type", "application/json")
      .send({
        username: "kirakira",
        password: "12345678",
        email: "kira@gmail.com"
      })
    //Created successfuly 
    expect(response.status).toBe(201);

    // Response is a json 
    expect(response.headers['content-type']).toMatch(/json/);

      // the json object contains the exact data we need
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("User Created Successfuly")
    expect(response.body.user).toMatchObject({
      username: "kirakira",
      email: "kira@gmail.com",
    })

  });


  it("should reject an invalid email format", async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .send({
        username: "validuser",
        password: "12345678",
        email: "not-an-email"
      });

    expect(response.status).toBe(400);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body.status).toBe("error");
  });

  it("should reject a username longer than 25 characters", async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .send({
        username: "a".repeat(26),
        password: "12345678",
        email: "longusername@gmail.com"
      });

    expect(response.status).toBe(400);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body.status).toBe("error");
  });


  it("should reject a username shorter than 3 characters", async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .send({
        username: "ab",
        password: "12345678",
        email: "shortusername@gmail.com"
      });

    expect(response.status).toBe(400);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body.status).toBe("error");
  });

  it("should reject a username that already exists", async () => {

    // Create a user
    await request(app)
      .post("/api/v1/users")
      .send({
        username: "existinguser",
        password: "12345678",
        email: "first@gmail.com"
      });

    // Try creating another user with the same username
    const response = await request(app)
      .post("/api/v1/users")
      .send({
        username: "existinguser",
        password: "87654321",
        email: "second@gmail.com"
      });

    expect(response.status).toBe(409);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body.status).toBe("error");
  });


  it("should reject an email that already exists", async () => {
    
    //Create a user
    await request(app)
      .post("/api/v1/users")
      .send({
        username: "firstuser",
        password: "12345678",
        email: "existing@gmail.com"
      });
    
    //Create a user with same email
    const response = await request(app)
      .post("/api/v1/users")
      .send({
        username: "seconduser",
        password: "87654321",
        email: "existing@gmail.com"
      });

    expect(response.status).toBe(409);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body.status).toBe("error");
  });

});

describe("GET /users/", () => {

  it("should return all users", async () => {
    // Create users first
    await request(app)
      .post("/api/v1/users")
      .send({
        username: "userone",
        password: "12345678",
        email: "userone@gmail.com",
      });

    await request(app)
      .post("/api/v1/users")
      .send({
        username: "usertwo",
        password: "12345678",
        email: "usertwo@gmail.com",
      });

    const response = await request(app)
      .get("/api/v1/users");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.body.status).toBe("success");
    expect(response.body.users).toHaveLength(2);

    expect(response.body.users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          username: "userone",
          email: "userone@gmail.com",
        }),
        expect.objectContaining({
          username: "usertwo",
          email: "usertwo@gmail.com",
        }),
      ])
    );
  });


  it("should return an empty array when there are no users", async () => {
    const response = await request(app)
      .get("/api/v1/users");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.body.status).toBe("success");
    expect(response.body.users).toEqual([]);
  });

});

afterAll(async() => {
  await pool.end();
})
