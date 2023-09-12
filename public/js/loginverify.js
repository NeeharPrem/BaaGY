
        var emailError = document.getElementById("emailError");
        var passError = document.getElementById("passError");
        var submitError = document.getElementById("submit-error");

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
            if (!validateEmail() || !validatepass()) {
                submitError.style.display = "block";
                submitError.innerHTML = "Please fill the form correctly";
                setTimeout(function () {
                    submitError.style.display = "none";
                }, 3000);
                return false;
            }

            // Additional check for empty fields
            var email1 = document.getElementById("email1").value;
            var password1 = document.getElementById("pass1").value;

            if (email1.trim() === "" || password1.trim() === "") {
                submitError.style.display = "block";
                submitError.innerHTML = "Email and password cannot be empty";
                setTimeout(function () {
                    submitError.style.display = "none";
                }, 3000);
                return false;
            }

            return true;
        }