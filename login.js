function showRegister() {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("register-section").style.display = "block";
  }
  
  function showLogin() {
    document.getElementById("register-section").style.display = "none";
    document.getElementById("login-section").style.display = "block";
  }
  

// login function
document.getElementById('login-form').addEventListener('submit', async function (event) {
    event.preventDefault(); 
    login();
});

async function login() {
    const email = document.getElementById('email').value; 
    const password = document.getElementById('password').value; 
  
    
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
  
    try {
        // Send the login request
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
  
        // Check if response is successful
        if (response.ok) {
            const data = await response.json();
  
            // Check if token is in the response data
            if (data.token) {
                
                localStorage.setItem('accessToken', data.token);
  
                // Redirect to homepage
                window.location.replace('index.html');
  
                // Optionally clear the login form
                document.getElementById('email').value = '';
                document.getElementById('password').value = '';
            } else {
                alert('Login failed: No token received');
            }
        } else {
            const errorData = await response.json();
            alert(`Login failed: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
  
        // Handle specific error types
        alert(`An error occurred: ${error.message}`);
    }
}