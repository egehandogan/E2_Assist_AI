import { prisma } from '../src/lib/prisma';

async function run() {
  try {
    const acc = await prisma.account.findMany();
    console.log("Accounts in DB:");
    console.log(JSON.stringify(acc.map(a => ({
      userId: a.userId,
      provider: a.provider,
      hasToken: !!a.access_token,
      tokenStart: a.access_token?.slice(0, 15)
    })), null, 2));

    const users = await prisma.user.findMany();
    console.log("Users in DB:", users.map(u => ({ id: u.id, email: u.email })));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
