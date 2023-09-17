var emailError = document.getElementById("emailError");
            var nameError = document.getElementById("nameError");
var submitError = document.getElementById("submit-error");
            function validatename() {
                    var name1 = document.getElementById("name").value.replace(/\s/g, "");

                    if (name1.length === 0) {
                        nameError.innerHTML = "Name is required";
                        return false;
                    }

                    var numberRegex = /^\d+$/;
                    if (numberRegex.test(name1)) {
                        nameError.innerHTML = "Name cannot be a number";
                        return false;
                    }

                    nameError.innerHTML = "";
                    return true;
                }

                function validateEmail() {
                        var email1 = document.getElementById("email").value;

                        if (email1.length === 0) {
                            emailError.innerHTML = "Email is required";
                            return false;
                        }

                      if (email1 =='admin@gmail.com') {
                        emailError.innerHTML = "Enter valid email";
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
function validateForm() {
    if (!validatename() || !validateEmail()) {
        submitError.style.display = "block";
        submitError.innerHTML = "Please fill the form correctly";
        setTimeout(function () {
            submitError.style.display = "none";
        }, 3000);
        return false;
    }
    return true;
}