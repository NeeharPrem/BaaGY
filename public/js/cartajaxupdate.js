// Your JavaScript code for updating the cart goes here

function updateCart(operation, productId, spanID) {
    let quantity = document.getElementById(spanID);

    let parsedQuantity = parseInt(quantity.innerText);
    let minQuantity = 1;
    let maxQuantity = parseInt(quantity.dataset.maxQuantity);

    maxQuantity = Math.min(maxQuantity, 10);
    let messageElement = document.getElementById(`${spanID}__message`);

    if (operation == 1 && parsedQuantity < maxQuantity) {
        parsedQuantity++;
    } else if (operation == -1 && parsedQuantity > 1) {
        parsedQuantity--;
    }


    quantity.innerText = parsedQuantity;
    ajaxConnection(parsedQuantity, productId, spanID);
    var plusBtn = document.getElementById(`${spanID}plus`)
    var minusBtn = document.getElementById(`${spanID}minus`)
    plusBtn.disabled = true
    minusBtn.disabled = true

    if (parsedQuantity === 1) {
        minusBtn.disabled = true;
    } else {
        minusBtn.disabled = false;
    }

    if (parsedQuantity == 10 || parsedQuantity == maxQuantity) {
        plusBtn.disabled = true;
    } else {
        plusBtn.disabled = false;
    }


    if (parsedQuantity == 10) {
        messageElement.innerText = "Max quantity reached";
    } else if (parsedQuantity == maxQuantity) {
        messageElement.innerText = "Stock limit reached";
    } else {
        messageElement.innerText = ""
    }
}


function ajaxConnection(amt, productId, spanID) {
    $.ajax({
        method: 'put',
        url: '/newcart',
        data: {
            amt,
            productId
        },
        success: (res) => {
            console.log(res)
            if (res.status == true && res.loadcart == false) {
                console.log("no")
                $('#cartTotal').html(`₹ ${res.data.Total}`);
                $(`#${spanID}y`).html(`₹ ${res.data.price}`)
                document.getElementById(`${spanID}plus`).disabled = false
                document.getElementById(`${spanID}minus`).disabled = false
            } else if (res.status == true && res.loadcart == true) {
                window.location.href = '/loadcart';
            } else if (res.status == false) {
                $('#msg').html(res.data);
            }
        },
        error: (error) => {
            console.log('Error updating cart:', error);
        },
    });
}