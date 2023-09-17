var nameError = document.getElementById("nameError");
var submitError = document.getElementById("submit-error");

function validatename() {
    var name = document.getElementById("category").value.replace(/\s/g, "");

    if (name.length === 0) {
        nameError.innerHTML = "Category name is required";
        return false;
    }

    var numberRegex = /^\d+$/;
    if (numberRegex.test(name)) {
        nameError.innerHTML = "Name cannot be a number";
        return false;
    }

    nameError.innerHTML = "";
    return true;
}
function validateForm() {
    if (!validatename()) {
        submitError.style.display = "block";
        submitError.innerHTML = "Please fill the form correctly";
        setTimeout(function () {
            submitError.style.display = "none";
        }, 3000);
        return false;
    }
    return true;
}