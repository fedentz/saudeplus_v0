export const log = (
  file: string,
  method: string,
  tag: string,
  message: string,
) => {
  console.log(`
-------------------- (${file} > ${method}) --------------------
[${tag}] ${message}
-----------------------------------------------------------------------
`);
};

export const createLogger = (file: string) =>
  (method: string, tag: string, message: string) =>
    log(file, method, tag, message);
