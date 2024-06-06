const fetchData = async () => {
  try {
    const response = await fetch("/user/navprofile");
    if (response.ok) {
      const data = await response.json();
      console.log("Server response:", data.message);
      console.log(data.cartCount);
      const cart = data.cartCount;
      const cartBadge = document.querySelector("#cartbadge");
      cartBadge.dataset.count = cart;
      loginLink.style.display = "none";
      signupLink.style.display = "none";
      profileLink.style.display = "inline";
    } else {
      console.log("Token not found on the server");
      // console.log(cartCount);
      const cart = 0;
      const cartBadge = document.querySelector("#cartbadge");
      cartBadge.dataset.count = cart;
      loginLink.style.display = "inline";
      signupLink.style.display = "inline";
      profileLink.style.display = "none";
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    const cart = 0;
    const cartBadge = document.querySelector("#cartbadge");
    cartBadge.dataset.count = cart;
  }
};
fetchData();
function toggleNav() {
  var nav = document.querySelector("nav");
  nav.classList.toggle("menu-open");
}
