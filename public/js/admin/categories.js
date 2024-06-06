async function confirmDelete(categoryId) {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (shouldDelete) {
      try {
        const response = await fetch(`/admin/categories/${categoryId}`, {
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
  function editCategory(categoryId, name, image) {
    document.getElementById("category-id").value=categoryId
    const editFormContainer = document.getElementById("editFormContainer");
    const closeBtn = document.getElementById("closeBtn");
    const editIcons = document.querySelectorAll(
      ".material-symbols-outlined.edit"
    );

    editIcons.forEach((icon) => {
      icon.addEventListener("click", function () {
        editFormContainer.classList.add("active");
      });
    });
    document.getElementById("categoryName").value = name;
    document.getElementById("categoryImage").value = image;
    closeBtn.addEventListener("click", function () {
      editFormContainer.classList.remove("active");
    });
  }