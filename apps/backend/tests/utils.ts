import pool from "../src/config/postgres.ts";
import {createAccessToken} from "../src/utils/token.ts"
import app from "../src/app.ts";
import request from "supertest";


export async function createUser(userData: {email: string, username: string, password: string}): Promise<string>{

  const BASE_URL = "/api/v1/users"
  const {email, username, password} = userData;

  const res = await request(app)
    .post(BASE_URL)
    .send({email, username, password});

  return res.body.user.id;
}

export async function loginUser (userData: {email: string, password: string}){

  const BASE_URL = "/api/v1/auth/login"
  const {email, password} = userData;

  const res = await request(app)
    .post(BASE_URL)
    .send({email, password})

  return res.body.accessToken;
}

export async function createCommunity(accessToken: string, communityData: {name: string, description: string}) {

  const BASE_URL = "/api/v1/communities";
  const {name, description} = communityData;

  const res = await request(app)
    .post(BASE_URL)
    .set("Authorization", `Bearer ${accessToken}`)
    .send({
      name: name ,
      description: description,
    });

  return res.body.community;
}

export async function createPost(communityId: string, accessToken: string, data: {title: string, textContent: string}) {

  const BASE_URL = "/api/v1/communities";
  const res = await request(app)
    .post(`${BASE_URL}/${communityId}/posts`)
    .set("Authorization", `Bearer ${accessToken}`)
    .send(data);

  return res.body.post;
}



export async function resetTables() {
  await pool.query(`TRUNCATE posts, communities, users CASCADE`);
}

export async function resetPostsTables(){
  await pool.query("TRUNCATE posts CASCADE") 
}

export function tokenFor(userId: string) {
  return createAccessToken(userId);
}
