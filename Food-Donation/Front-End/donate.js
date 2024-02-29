var donate = document.getElementById("donate-submit");
let donationForm = document.getElementById("donation-form");

async function donation() {
  var getName = document.getElementById("name");
  var getNumber = document.getElementById("number");
  var getAmount = document.getElementById("amount");
  var getMessage = document.getElementById("message");
  var getState = document.getElementById("state");
  var status = document.getElementById("donation-status");
  let name = getName.value;
  let number = getNumber.value;
  let amount = getAmount.value;
  let message = getMessage.value;
  let state = getState.value;
  if (name == "") {
    return (status.textContent = "❌ Please Fill all the Parameters!!!");
  }
  if (number == "") {
    return (status.textContent = "❌ Please Fill all the Parameters!!!");
  }
  if (amount == "") {
    return (status.textContent = "❌ Please Fill all the Parameters!!!");
  }
  if (message == "") {
    return (status.textContent = "❌ Please Fill all the Parameters!!!");
  }
  if (state == "select") {
    return (status.textContent = "❌ Please Fill all the Parameters!!!");
  }
  donationForm.reset();
  response = await fetch(
    `http://159.89.40.19:3030/api/certificate/${name}/${number}/${amount}/${message}/${state}`
  );
  let result = await response.json();
  if (result.success == true) {
    status.style.color = "#00FF00";
    status.textContent = `💖 Thanks For Donation`;
    setTimeout(async () => {
      const response = await fetch(
        `http://159.89.40.19:3030/api/certificates/${name}.png`
      );
      const fileBlob = await response.blob();

      const fileUrl = URL.createObjectURL(fileBlob);

      window.open(fileUrl, "_blank");
    }, 10000);
  } else {
  }
}
