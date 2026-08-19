export default async function connectWithRetries<T>(name: string, connectFn: () => Promise<T>, attempts : number = 10, intervalMs: number = 1500): Promise<T> {
  for(let i = 0; i < attempts; i++){
    try{
      const result = await connectFn();
      console.log(`${name} connnected`);
      return result;
    }catch(err){
      console.log(`${i + 1} attempt to connect to ${name} sever failed. Retrying: ${err}`);
      await new Promise((res) => setTimeout(res, intervalMs));
    }
  }
  throw new Error(`Failed to connect to ${name} after ${attempts}`)
}
