import { getGoogleApis } from '../src/lib/google';

async function test() {
  try {
    const g = await getGoogleApis('ONHeHqWWbZhUKpVOUzb79gPkmLR2');
    console.log('Got APIs for user. Fetching messages...');
    const res = await g?.gmail.users.messages.list({ userId: 'me', maxResults: 1 });
    console.log('Result:', JSON.stringify(res?.data, null, 2));

    const driveRes = await g?.drive.files.list({ pageSize: 1 });
    console.log('Drive Result:', JSON.stringify(driveRes?.data, null, 2));
  } catch (e) {
    console.error('API ERROR:', e);
  }
  process.exit(0);
}
test();
