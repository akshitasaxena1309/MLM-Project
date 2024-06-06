async function confirmDelete(productId) {
  const shouldDelete = window.confirm(
    "Are you sure you want to delete this product?"
  );

  if (shouldDelete) {
    try {
      const response = await fetch(`/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Reload the page or update the UI as needed
        window.location.reload();
      } else {
        console.error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  window.location.reload();
}

// function editProduct(productId) {
//   // Make a fetch request to the backend endpoint to handle product editing
//   fetch(`/admin/product/edit/${productId}`, {
//       method: 'GET',
//   })
//   .then(response => {
//       if (!response.ok) {
//           throw new Error('Network response was not ok');
//       }
//       // Redirect to the edit product page
//       window.location.href = `/edit-product/${productId}`;
//   })
//   .catch(error => {
//       console.error('Error:', error);
//   });
// }
// Add this JavaScript to your script.js file
// function viewDetailsHandler(leadId) {
//   // Assuming you're using fetch API for the AJAX request
//   fetch(`/admin/viewdetails/${leadId}`)
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
//       return response.json();
//     })
//     .then((productDetails) => {
//       // Handle the product details
//       displayProductModal(productDetails);
//     })
//     .catch((error) => {
//       console.error('Error fetching product details:', error);
//     });
// }

// Updated JavaScript functions
// function displayProductModal(productDetails) {
//   // Populate modal content with product details
//   document.getElementById('modalTitle').innerText = productDetails.title;
//   document.getElementById('modalImage').src = productDetails.img;
//   document.getElementById('modalDescription').innerText =
//     productDetails.description;
//   document.getElementById(
//     'modalStockQuantity'
//   ).innerText = `Stock Quantity: ${productDetails.stockQuantity}`;
//   document.getElementById(
//     'modalMRP'
//   ).innerText = `MRP: ${productDetails.mrp}`;
//   document.getElementById(
//     'modalBV'
//   ).innerText = `BV: ${productDetails.bv}`;
//   document.getElementById(
//     'modalDP'
//   ).innerText = `DP: ${productDetails.dp}`;
//   // Add more lines to populate other modal content
//   document.getElementById(
//     'modalCategory'
//   ).innerText = `Category: ${productDetails.category}`;
//   // Show the modal
//   document.getElementById('productModal').style.display = 'block';
// }

// function closeModal() {
//   // Hide the modal
//   document.getElementById('productModal').style.display = 'none';
// }

// document.addEventListener("DOMContentLoaded", function () {
//   const editFormContainer = document.getElementById("editFormContainer");
//   const closeBtn = document.getElementById("closeBtn");
//   const editIcons = document.querySelectorAll(
//     ".material-symbols-outlined.edit"
//   );

//   editIcons.forEach((icon) => {
//     icon.addEventListener("click", function () {
//       editFormContainer.classList.add("active");
//     });
//   });

//   closeBtn.addEventListener("click", function () {
//     editFormContainer.classList.remove("active");
//   });
// });
