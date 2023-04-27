export const configuration = () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
  },
});
