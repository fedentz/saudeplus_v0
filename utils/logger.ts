export const logEvent = (tag: string, message: string) => {
  console.log(`\uD83E\uDEA5 [${tag}] ${message}`);
};

export const logDebug = (message: string) => {
  console.log(`\uD83D\uDD27 ${message}`);
};
