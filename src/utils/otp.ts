export const genrateNumperOtp = (): number => {
  return Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
};
