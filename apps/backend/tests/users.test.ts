import { describe, it, expect } from 'vitest';
import  request  from 'supertest';
import app from '../src/app';

describe("POST /users/", () => {
  it("should register a user with JSON", async () =>{
    const response = await request(app)
      .post("/api/v1/users")
      .set("Content-Type", "application/json")
      .send({
        username: "lyeslyes",
        password: "12345678",
        email: "lyes@gmail.com"
      })
    //Created successfuly 
    expect(response.status).toBe(201);
    // Response is a json 
    expect(response.headers['content-type']).toMatch(/json/);

    // the json object contains the exact data we need
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("User Created Successfuly")
    expect(response.body.user).toMatchObject({
      username: "lyeslyes",
      email: "lyes@gmail.com",
    })
  }
)});
