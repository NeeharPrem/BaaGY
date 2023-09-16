
    // Variable to track if timer has reached 0
    var timerReachedZero = false;

    // Function to start the countdown timer
    function startTimer(duration, display) {
        var timer = duration, minutes, seconds;
        var timerInterval = setInterval(function () {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            display.textContent = minutes + ":" + seconds;

            if (timer <= 0) {
                // Send a notification
                display.textContent = "Time's up!";
                // Hide the countdown container
                document.getElementById("countdown-container").style.display = "none";
                // Disable the Verify button
                document.querySelector(".btn-warning").disabled = true;
                // Show the resend button
                document.getElementById("resend-container").style.display = "block";
                // Set the variable to true
                timerReachedZero = true;
                clearInterval(timerInterval);
            } else {
                timer--;
            }
        }, 1000);
    }

    // Start the countdown when the page loads
    window.onload = function () {
            var oneMinute = 30, // 30 seconds
                display = document.querySelector('#countdown');
                document.querySelector(".btn-warning").disabled = false;

            // Check if the URL contains status=success
            var urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('status') === 'success') {
                // Display the "Resend OTP" option instead of the timer
                document.getElementById("countdown-container").style.display = "none";
                document.getElementById("resend-container").style.display = "block";
            } else {
                // Start the countdown timer
                startTimer(oneMinute, display);
            }
    };

    // Function to enable/disable the submit button based on OTP input
    function validateOTP() {
        var urlParams = new URLSearchParams(window.location.search);
        var otpInput = document.querySelector('input[name="inputotp"]');
        var verifyButton = document.querySelector('.btn-warning');

        if (otpInput.value.match(/^\d{6}$/)) {
            // The input is a 6-digit number, enable the submit button
            verifyButton.disabled = false;
        } else if (urlParams.get('status') === 'success') {
                verifyButton.disabled = true;
        }else{
            verifyButton.disabled = true;
        }
    }

    // Add an event listener to the OTP input field to validate on input
    document.querySelector('input[name="inputotp"]').addEventListener('input', validateOTP);

function validateOTP1() {
    var urlParams = new URLSearchParams(window.location.search);
    var otpInput = document.querySelector('input[name="userotp"]');
    var verifyButton = document.querySelector('.btn-warning');

    if (otpInput.value.match(/^\d{6}$/)) {
        // The input is a 6-digit number, enable the submit button
        verifyButton.disabled = false;
    } else if (urlParams.get('status') === 'success') {
        verifyButton.disabled = true;
    } else {
        verifyButton.disabled = true;
    }
}

// Add an event listener to the OTP input field to validate on input
document.querySelector('input[name="userotp"]').addEventListener('input', validateOTP1);
