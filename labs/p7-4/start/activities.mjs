// The only activity: print a line in the worker's terminal, so you can see what the runs do.
export const say = async (line) => {
  console.log(`${new Date().toTimeString().slice(0, 8)}  ${line}`);
};
