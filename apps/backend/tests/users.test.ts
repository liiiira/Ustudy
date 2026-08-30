import { describe, it, expect , beforeEach, afterAll} from 'vitest';
import  request  from 'supertest';
import app from '../src/app';
import pool from '../src/config/postgres';

// To guarantee independence of tests



describe("POST /users/", () => {

  beforeEach(async() => {
   await  pool.query('TRUNCATE TABLE users CASCADE');
  })
  
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

  beforeEach(async() => {
   await  pool.query('TRUNCATE TABLE users CASCADE');
  })

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
   beforeEach(async() => {
      await  pool.query('TRUNCATE TABLE users CASCADE');
    })
    const response = await request(app)
      .get("/api/v1/users");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.body.status).toBe("success");
    expect(response.body.users).toEqual([]);
  });

});

describe("GET /users/:id", () => {
  
  it("should return a user by id", async () => {
    const createResponse = await request(app)
      .post("/api/v1/users")
      .send({
        username: "lyeslyes",
        password: "12345678",
        email: "lyes@gmail.com",
      });

    const userId = createResponse.body.user.id;

    const response = await request(app)
      .get(`/api/v1/users/${userId}`);
  
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.body.status).toBe("success");
    expect(response.body.user).toMatchObject({
      id: userId,
      username: "lyeslyes",
      email: "lyes@gmail.com",
    });
  });


  it("should return 404 when the user does not exist", async () => {
    const userId = "e0cb88ea-87cf-4f45-9b86-4171e6a6e729";

    const response = await request(app)
      .get(`/api/v1/users/${userId}`);

    expect(response.status).toBe(404);
    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.body.status).toBe("error");
  });


  it("should return 400 when the id is invalid", async () => {
    const response = await request(app)
      .get("/api/v1/users/not-a-valid-uuid");

    expect(response.status).toBe(400);
    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.body.status).toBe("error");
  });
});




describe("PATCH /users/:id/", () => {
  let userId: string;

  beforeEach(async () => {
    await pool.query(`TRUNCATE TABLE users CASCADE`)
    const response = await request(app)
      .post("/api/v1/users")
      .set("Content-Type", "application/json")
      .send({
        username: "kirakira",
        password: "12345678",
        email: "kira@gmail.com",
      });

    expect(response.status).toBe(201);

    userId = response.body.user.id;
  });

  it("should update a user with JSON", async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${userId}`)
      .set("Content-Type", "application/json")
      .send({
        username: "newname",
      });

    // Updated successfully
    expect(response.status).toBe(200);

    // Response is JSON
    expect(response.headers["content-type"]).toMatch(/json/);

    // Response contains expected data
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("User Updated Successfully");

    expect(response.body.user).toMatchObject({
      id: userId,
      username: "newname",
      email: "kira@gmail.com",
    });
  });

  it("should update multiple fields", async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${userId}`)
      .set("Content-Type", "application/json")
      .send({
        username: "newname",
        email: "newemail@gmail.com",
      });

    expect(response.status).toBe(200);

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.body.status).toBe("success");

    expect(response.body.user).toMatchObject({
      id: userId,
      username: "newname",
      email: "newemail@gmail.com",
    });
  });

  it("should update only the provided email ", async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${userId}`)
      .set("Content-Type", "application/json")
      .send({
        username: "newname",
      });

    expect(response.status).toBe(200);

    expect(response.body.user).toMatchObject({
      id: userId,
      username: "newname",
      email: "kira@gmail.com",
    });
  });

  it("should return 204 when nothing actually changes", async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${userId}`)
      .set("Content-Type", "application/json")
      .send({
        username: "kirakira",
        email: "kira@gmail.com",
      });

    // Request was valid, but nothing changed
    expect(response.status).toBe(204);

    // 204 must not contain a response body
    expect(response.body).toEqual({});
  });

  it("should return 404 when the user does not exist", async () => {
    const response = await request(app)
      .patch("/api/v1/users/00000000-0000-0000-0000-000000000000")
      .set("Content-Type", "application/json")
      .send({
        username: "newname",
      });

    expect(response.status).toBe(404);

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.body.status).toBe("error");
  });

  it("should return 400 when the request body is invalid", async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${userId}`)
      .set("Content-Type", "application/json")
      .send({
        username: "ab",
      });

    expect(response.status).toBe(400);

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.body.status).toBe("error");
  });

  it("should return 400 when the request body is empty", async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${userId}`)
      .set("Content-Type", "application/json")
      .send({});

    expect(response.status).toBe(400);

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.body.status).toBe("error");
  });
});




describe("DELETE /api/v1/users/:id", () => {
  let userId: string;

  beforeEach(async () => {
    await pool.query(`TRUNCATE TABLE users CASCADE`)
    const response = await request(app)
      .post("/api/v1/users")
      .send({
        username: "kirakira",
        password: "12345678",
        email: "kira@gmail.com",
      });

    userId = response.body.user.id;
  });

  it("should delete an existing user", async () => {
    const response = await request(app)
      .delete(`/api/v1/users/${userId}`);

    expect(response.status).toBe(200);
  });

  it("should return the deleted user's id only", async () => {
    const response = await request(app)
      .delete(`/api/v1/users/${userId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "success",
      message: "User Deleted Successfully",
      user: {
        id: userId,
        
      },
    });
  });

  it("should actually delete the user", async () => {
    await request(app)
      .delete(`/api/v1/users/${userId}`);

    const response = await request(app)
      .get(`/api/v1/users/${userId}`);

    expect(response.status).toBe(404);
  });

  it("should return 404 when the user does not exist", async () => {
    const response = await request(app)
      .delete("/api/v1/users/00000000-0000-0000-0000-000000000000");

    expect(response.status).toBe(404);
  });

  it("should return 400 for an invalid user id", async () => {
    const response = await request(app)
      .delete("/api/v1/users/not-a-valid-uuid");

    expect(response.status).toBe(400);
  });
})


