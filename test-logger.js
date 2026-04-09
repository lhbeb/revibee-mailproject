import { logEmail, getLogs } from './src/utils/logger.js';

async function test() {
  await logEmail({
    type: 'Recovery',
    templateName: 'Recovery — Last Chance',
    senderEmail: 'test@deeldepot.com',
    recipientEmail: 'test1@example.com',
    recipientName: 'Test Recipient',
    productName: 'Test Phone',
    status: 'Success'
  });
  console.log('Insert complete.');
  
  const logs = await getLogs();
  console.log('Latest log type/template:', logs[0].type, logs[0].templateName);
}

test();
