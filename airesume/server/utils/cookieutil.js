const accessTokenMaxAge = 15 * 60 * 1000; // 15 minutes
const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

const baseOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
});

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    ...baseOptions(),
    path: '/',
    maxAge: accessTokenMaxAge,
  });
  res.cookie('refreshToken', refreshToken, {
    ...baseOptions(),
    path: '/auth',
    maxAge: refreshTokenMaxAge,
  });
};

const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', { ...baseOptions(), path: '/' });
  res.clearCookie('refreshToken', { ...baseOptions(), path: '/auth' });
};

module.exports = { setAuthCookies, clearAuthCookies };