import {connectRedis} from './config/redis.ts';
import {connectPostgres} from './config/postgres.ts';
import app from './app.ts' ;
import connectWithRetries from '../utils/connectWithRetries.ts';

const PORT: number = parseInt(process.env.PORT!);

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
