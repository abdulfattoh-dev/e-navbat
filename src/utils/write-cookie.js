export const refTokenWriteToCookie = (res, key, value) => {
  res.cookie(key, value, {
    httpOnly: true,
    secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};
