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
/***  PASSWORD STRENGTH CODE  ***/

// Select all show/hide icons
const showHideIcons = document.querySelectorAll(".show_hide");

// Show/Hide Password Functionality
showHideIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
        // Get the input element that is the previous sibling of the icon
        const input = icon.previousElementSibling;
        if (input.type === "password") {
            input.type = "text";
            icon.classList.replace("fa-eye-slash", "fa-eye");
        } else {
            input.type = "password";
            icon.classList.replace("fa-eye", "fa-eye-slash");
        }
    });
});

// Password Strength Checker for Register Page
if (document.querySelector("#regPassword")) {
    const regPasswordInput = document.querySelector("#regPassword");
    const indicator = document.querySelector(".indicator");
    const text = document.querySelector(".text");

    let alphabet = /[a-zA-Z]/,
        numbers = /[0-9]/,
        scharacters = /[!,@,#,$,%,^,&,*,?,_,(,),-,+,=,~]/;

    regPasswordInput.addEventListener("keyup", () => {
        indicator.classList.add("active");
        let val = regPasswordInput.value;

        if (val.match(alphabet) || val.match(numbers) || val.match(scharacters)) {
            text.textContent = "Password is weak";
            regPasswordInput.style.borderColor = "#FF6333";
        }
        if (val.match(alphabet) && val.match(numbers) && val.length >= 6) {
            text.textContent = "Password is medium";
            regPasswordInput.style.borderColor = "#cc8500";
        }
        if (val.match(alphabet) && val.match(numbers) && val.match(scharacters) && val.length >= 8) {
            text.textContent = "Password is strong";
            regPasswordInput.style.borderColor = "#22C32A";
        }
        if (val === "") {
            indicator.classList.remove("active");
            regPasswordInput.style.borderColor = "#A6A6A6";
        }
    });
}