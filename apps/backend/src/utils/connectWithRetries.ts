/*
 * Function to handle the race condition between services that on depend on the other, by repeating
 * retries to connect until to work */
export default async function connectWithRetries<T>(name: string, connectFn: () => Promise<T>, attempts : number = 10, intervalMs: number = 1500): Promise<T> {
  
  for(let i = 0; i < attempts; i++){

    try{
      const result = await connectFn();
      console.log(`${name} connnected`);
      return result;

    }catch(err){
      console.log(`${i + 1} attempt to connect to ${name} server failed. Retrying...`);
      if (err  instanceof AggregateError){
        console.log()
        console.log("Aggregate errors: ", err.errors)
      }else
        console.log("Error: ", err)
      await new Promise((res) => setTimeout(res, intervalMs));

    }
  }
  throw new Error(`Failed to connect to ${name} after ${attempts}`)
}
