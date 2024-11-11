async function testCron() {
  try {
    const response = await fetch('http://localhost:3000/api/check-renewals', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      }
    });
    
    const data = await response.json();
    console.log('Cron job response:', data);
  } catch (error) {
    console.error('Error testing cron:', error);
  }
}

testCron(); 