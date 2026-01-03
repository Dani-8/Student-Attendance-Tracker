export let renderLoginForm = () => {
    return `
        <div class="login-cont">
            <h1>Teacher Login</h1>

            <form action="" id="login-form" class="form">
                <div>
                    <label for="email">Email</label>
                    <input type="text" id="email" value="teacher@meow.edu" placeholder="Enter your email" required>
                </div>
                <div>
                    <label for="password">Password</label>
                    <input type="password" id="password" value="password123" placeholder="Enter your password" required>
                </div>
                <p id="login-error" class="login-error"></p>
                <button type="submit" class="login-btn">Login</button>
            </form>
        </div>
    `
}


export let handleLogin = (e) => {
    e.preventDefault()
    let email = document.getElementById("email").value
    let password = document.getElementById("password").value

    if(email && password){
        navigateTo("dashboard")
    }else{
        document.getElementById("login-error").innerText = "Please enter both email and password."
    }
} 




