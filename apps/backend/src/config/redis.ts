import {createClient} from 'redis';
import "dotenv/config"

const REDIS_PORT = process.env.REDIS_PORT!;

const redisUrl = `redis://localhost:${REDIS_PORT}`
const redis = createClient({
  url: redisUrl,
}) 

redis.on("error", (err: Error) => console.error("Redis Client Error ", err));

export async function connectRedis(){
  await redis.connect();
  console.log("Redis connected")
}
export default redis;

