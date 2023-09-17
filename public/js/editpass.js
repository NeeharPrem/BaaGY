var passError = document.getElementById("passError");
var submitError = document.getElementById("submit-error");
function validatepass() {
    var password1 = document.getElementById("newpass").value;
    var password2 = document.getElementById("confirmpass").value;
    var alphabetRegex = /[a-zA-Z]/;
    if (!password1) {
        passError.innerHTML = "Password is required";
        return false;
    }

    if (!alphabetRegex.test(password1)) {
        passError.innerHTML = "Password should contain at least one alphabet";
        return false;
    }

    if (password1.length < 6) {
        passError.innerHTML = "Password should be at least 6 characters long";
        return false;
    }

    if (password1 !== password2) {
        passError.innerHTML = "Passwords not matching"
        return false;
    }

    passError.innerHTML = "";
    return true;
}
function validateForm() {
    if (!validatepass()) {
        submitError.style.display = "block";
        submitError.innerHTML = "Please fill the form correctly";
        setTimeout(function () {
            submitError.style.display = "none";
        }, 3000);
        return false;
    }
    return true;
}