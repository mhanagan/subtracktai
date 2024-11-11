async function testCron() {
  try {
    console.log('Testing cron job...');
    const response = await fetch('https://your-vercel-url/api/check-renewals', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      }
    });
    
    const data = await response.json();
    console.log('Cron job response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error testing cron:', error);
  }
}

testCron(); 