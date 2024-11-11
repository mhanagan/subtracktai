async function testCron() {
  try {
    console.log('Testing cron job...');
    
    // Check if CRON_SECRET exists
    if (!process.env.CRON_SECRET) {
      throw new Error('CRON_SECRET is not set in environment variables');
    }

    const response = await fetch('http://localhost:3000/api/check-renewals', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      }
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.error('Error response:', {
        status: response.status,
        statusText: response.statusText,
        body: text
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Cron job response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error testing cron:', error);
  }
}

testCron(); 