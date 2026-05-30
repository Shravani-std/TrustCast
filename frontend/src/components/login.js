async function login() {

    const payload = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        two_factor_code: document.getElementById("otp").value
    };

    const response = await fetch(
        "http://localhost:8000/login",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }
    );

    const data = await response.json();

    if(response.ok){

        localStorage.setItem(
            "token",
            data.access_token
        );

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        window.location.href =
            "/dashboard";
    }
} 