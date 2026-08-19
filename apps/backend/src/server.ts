import {connectRedis} from './config/redis.ts';
import {connectPostgres} from './config/postgres.ts';
import app from './app.ts' ;

const PORT: number = parseInt(process.env.PORT!);

async function connectWithRetries<T>(name: string, connectFn: () => Promise<T>, attempts : number = 10, intervalMs: number = 1500): Promise<T> {
  for(let i = 0; i < attempts; i++){
    try{
      const result = await connectFn();
      console.log(`${name} connnected`);
      return result;
    }catch(err){
      console.log(`${i + 1} attempt to connect to ${name} sever failed. Retrying`);
      await new Promise((res) => setTimeout(res, intervalMs));
    }
  }
  throw new Error(`Failed to connect to ${name} after ${attempts}`)
}

async function  startServer(){
  try{
    await connectWithRetries("postgres", connectPostgres);
    await connectWithRetries("redis", connectRedis);
    app.listen(PORT, () => console.log("Backend Listening on port ", PORT))
  }catch(error){
    console.error("Failed to start server: ", error);
    process.exit(1);
  }
}

startServer();
