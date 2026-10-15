const { signToken } = require('../src/middleware/auth');

const userToken = () => signToken({ id: 2, rola: 'user' });
const adminToken = () => signToken({ id: 1, rola: 'admin' });
const bearer = (t) => ({ Authorization: `Bearer ${t}` });

module.exports = { userToken, adminToken, bearer };
