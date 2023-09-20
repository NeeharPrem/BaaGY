var nameError = document.getElementById("nameError");
var brandError = document.getElementById("brandError");
var quantityError = document.getElementById("quantityError");
var actualError = document.getElementById("actualError");
var priceError = document.getElementById("priceError");
var discountError = document.getElementById("discountError");
var materialError = document.getElementById("materialError");
var descriptionError = document.getElementById("descriptionError");
var submitError = document.getElementById("submit-error");

function validatedescription() {
    var name1 = document.getElementById("description").value.replace(/\s/g, "");

    if (name1.length === 0) {
        descriptionError.innerHTML = "Description required";
        return false;
    }

    var numberRegex = /^\d+$/;
    if (numberRegex.test(name1)) {
        descriptionError.innerHTML = "This cannot be a number";
        return false;
    }

    descriptionError.innerHTML = "";
    return true;

}
function validatematerial() {
    var name1 = document.getElementById("material").value.replace(/\s/g, "");

    if (name1.length === 0) {
        materialError.innerHTML = "Material is required";
        return false;
    }

    var numberRegex = /^\d+$/;
    if (numberRegex.test(name1)) {
        materialError.innerHTML = "This cannot be a number";
        return false;
    }

    materialError.innerHTML = "";
    return true;
}

function validatediscount() {
    var name1 = document.getElementById("discount").value.replace(/\s/g, "");

    if (name1.length < 0) {
        discountError.innerHTML = "Fill discount";
        return false;
    }

    if (name1 == -1) {
        discountError.innerHTML = "This cant be negative";
        return false;
    }

    discountError.innerHTML = "";
    return true;
}

function validateprice() {
    var name1 = document.getElementById("price").value.replace(/\s/g, "");

    if (name1.length < 0) {
        priceError.innerHTML = "Fill price";
        return false;
    }

    if (name1.length === 0) {
        priceError.innerHTML = "Fill price";
        return false;
    }

    if (name1 == -1) {
        priceError.innerHTML = "This cant be negative";
        return false;
    }

    priceError.innerHTML = "";
    return true;
}

function validateactual() {
    var name1 = document.getElementById("actual").value.replace(/\s/g, "");

    if (name1.length < 0) {
        actualError.innerHTML = "Fill actual price";
        return false;
    }

    if (name1 == 0) {
        actualError.innerHTML = "Fill actual price";
        return false;
    }

    if (name1 == -1) {
        actualError.innerHTML = "This cant be negative";
        return false;
    }

    actualError.innerHTML = "";
    return true;
}

function validatename() {
    var name1 = document.getElementById("pname").value.trim()

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

function validatebrand() {
    var name1 = document.getElementById("brand").value.replace(/\s/g, "");

    if (name1.length === 0) {
        brandError.innerHTML = "Brand name";
        return false;
    }

    var numberRegex = /^\d+$/;
    if (numberRegex.test(name1)) {
        brandError.innerHTML = "Name cannot be a number";
        return false;
    }

    brandError.innerHTML = "";
    return true;
}

function validatequantity() {
    var name1 = document.getElementById("quantity").value

    if (name1.length === 0) {
        quantityError.innerHTML = "Quantity is required";
        return false;
    }

    // Convert the input to a numeric value
    var quantityValue = parseInt(name1);

    if (isNaN(quantityValue)) {
        quantityError.innerHTML = "Please enter a valid number";
        return false;
    }

    // Check if the value is less than 0
    if (quantityValue < 0) {
        quantityError.innerHTML = "Quantity cannot be negative";
        return false;
    }

    if (quantityValue === 0) {
        quantityError.innerHTML = "Least add one product";
        return false;
    }

    quantityError.innerHTML = "";
    return true;
}

function validateForm() {
    if (
        !validatename() ||
        !validatebrand() ||
        !validatequantity() ||
        !validateactual() ||
        !validateprice() ||
        !validatediscount() ||
        !validatematerial() ||
        !validatedescription()
    ) {
        submitError.style.display = "block";
        submitError.innerHTML = "Please fill the form correctly";
        setTimeout(function () {
            submitError.style.display = "none";
        }, 3000);
        return false;
    }
    return true;
}