async function register() {
    const userName = document.getElementById('userName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    if (!userName || !email || !password) {
      document.getElementById('registration-error').innerText = 'Please fill in all fields';
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      document.getElementById('registration-error').innerText = 'Invalid email format';
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userName, email, password, role: 'member' })
      });
      
      if (response.ok) {
        alert('Registration successful!');
        showLogin();
      } else {
        const errorData = await response.json();
        console.error('Registration failed:', errorData);
        document.getElementById('registration-error').innerText = errorData.message || 'Registration failed';
      }
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('registration-error').innerText = 'An error occurred during registration';
    }
  }
    