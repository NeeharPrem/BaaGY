var emailError = document.getElementById("emailError");
var name1Error = document.getElementById("fnameError");
var name2Error = document.getElementById("lnameError");
var passError = document.getElementById("passError");
var mobileError = document.getElementById("mobileError");
var confirmPassError = document.getElementById("passError2");
var submitError = document.getElementById("submit-error");

function validatePasswordMatch() {
    var password = document.getElementById("pass1").value;
    var confirmPass = document.getElementById("pass2").value;

    if (password !== confirmPass) {
        confirmPassError.innerHTML = "Passwords do not match";
        return false;
    }

    confirmPassError.innerHTML = "";
    return true;
}

function validateMobile() {
    var mobile = document.getElementById("mobile").value;

    if (mobile.length === 0) {
        mobileError.innerHTML = "Mobile number is required";
        return false;
    }

    var mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
        mobileError.innerHTML = "Mobile number is invalid";
        return false;
    }

    mobileError.innerHTML = "";
    return true;
}

function validatefname() {
    var name1 = document.getElementById("name1").value.replace(/\s/g, "");

    if (name1.length === 0) {
        name1Error.innerHTML = "First name is required";
        return false;
    }

    var numberRegex = /^\d+$/;
    if (numberRegex.test(name1)) {
        name1Error.innerHTML = "Name cannot be a number";
        return false;
    }

    name1Error.innerHTML = "";
    return true;
}

function validatelname() {
    var name2 = document.getElementById("name2").value.replace(/\s/g, "");

    if (name2.length === 0) {
        name2Error.innerHTML = "Last name is required";
        return false;
    }

    var numberRegex = /^\d+$/;
    if (numberRegex.test(name2)) {
        name2Error.innerHTML = "Name cannot be a number";
        return false;
    }

    name2Error.innerHTML = "";
    return true;
}


function validateEmail() {
    var email1 = document.getElementById("email1").value;

    if (email1.length === 0) {
        emailError.innerHTML = "Email is required";
        return false;
    }

    var emailParts = email1.split(".");
    if (emailParts.length < 2 || emailParts[emailParts.length - 1].length < 2) {
        emailError.innerHTML = "Email is invalid";
        return false;
    }

    if (email1.indexOf("@") === -1 || email1.indexOf(".") === -1) {
        emailError.innerHTML = "Email is invalid";
        return false;
    }

    emailError.innerHTML = "";
    return true;
}

function validatepass() {
    var password1 = document.getElementById("pass1").value;
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
    passError.innerHTML = "";
    return true;
}

function validateForm() {
    if (!validatelname() || !validatefname() || !validateEmail() || !validatepass() || !validateMobile() || !validatePasswordMatch()) {
        submitError.style.display = "block";
        submitError.innerHTML = "Please fill the form correctly";
        setTimeout(function () {
            submitError.style.display = "none";
        }, 3000);
        return false;
    }
    return true;
}