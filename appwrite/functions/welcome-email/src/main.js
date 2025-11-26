import { Client, Users } from 'node-appwrite';

// This function is executed when a user is created (Event: users.*.create)
export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY); // Need to set this env var in Function Settings

  const users = new Users(client);

  try {
    // The event payload is in req.body (if triggered by event)
    // For Appwrite 1.4+, req.body is the event payload directly if content-type is json?
    // Or req.body is a string.
    
    let user;
    if (req.body) {
        try {
            user = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        } catch (e) {
            user = {};
        }
    }

    // If triggered manually or testing, user might be missing
    if (!user || !user.$id || !user.email) {
        log('No user data found in payload.');
        return res.json({ success: false, message: 'No user data' });
    }

    const name = user.name || 'User';
    const email = user.email;

    log(`Sending welcome email to ${name} (${email})...`);

    // Here you would integrate with an SMTP provider (SendGrid, Mailgun, etc.)
    // Since we don't have one configured, we will just log it.
    // If Appwrite's SMTP is configured, we could use a Messaging API if available, 
    // but usually we use an external provider in functions.
    
    // Example with console log (simulating email)
    log(`
      Subject: Welcome to Recursive To-Do!
      To: ${email}
      Body:
      Hi ${name},
      
      Welcome to Recursive To-Do! We are excited to have you on board.
      Start organizing your tasks with infinite depth today.
      
      Best,
      The Team
    `);

    return res.json({ success: true, message: 'Email sent (simulated)' });

  } catch (err) {
    error('Failed to send email: ' + err.message);
    return res.json({ success: false, error: err.message });
  }
};
