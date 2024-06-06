document.addEventListener("DOMContentLoaded", function () {
    let currentSlide = 0;
    const slidesContainer = document.querySelector(".slides");
    const slides = document.querySelectorAll(".slide");
    const totalSlides = slides.length;

    function showSlide(index) {
      slidesContainer.style.transform = `translateX(${-index * 100}%)`;
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % totalSlides;
      showSlide(currentSlide);
    }

    function prevSlide() {
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
      showSlide(currentSlide);
    }

    // Initial setup
    showSlide(currentSlide);

    // Automatic slide change every 5 seconds
    setInterval(nextSlide, 4000);
  });

  // js for category
  document.addEventListener("DOMContentLoaded", function () {
    const categoryContainers = document.querySelectorAll(
      ".category-container"
    );
    const nxtBtn = document.querySelectorAll(".nxt-btn");
    const preBtn = document.querySelectorAll(".pre-btn");

    categoryContainers.forEach((container, i) => {
      let containerWidth = container.offsetWidth;

      nxtBtn[i].addEventListener("click", () => {
        container.scrollLeft += containerWidth;
      });

      preBtn[i].addEventListener("click", () => {
        container.scrollLeft -= containerWidth;
      });
    });

    // Optional: Add transition to the sliding effect
    categoryContainers.forEach((container) => {
      container.style.scrollBehavior = "smooth";
    });
  });