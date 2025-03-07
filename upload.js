document.getElementById("upload-button").addEventListener("click", function () {
    document.getElementById("image-upload").click();
  });
  
  // Preview the uploaded image
  function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const preview = document.getElementById("preview-image");
        preview.src = e.target.result;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  }
  // Handle category selection changes
function handleCategoryChange() {
    const category = document.getElementById("category-select").value;
    const tagBox = document.getElementById("tag-box");
    const tagSelect = document.getElementById("tag-select");
    const submitButton = document.getElementById("submit-button");
  
    tagSelect.innerHTML = "";
  
    if (category === "Bottoms") {
      tagBox.style.display = "block";
      const options = ["Jeans", "Skirt", "Leather", "Cargo"];
      options.forEach((option) => {
        const opt = document.createElement("option");
        opt.value = option;
        opt.textContent = option;
        tagSelect.appendChild(opt);
      });
    } else if (category === "Accessories") {
      tagBox.style.display = "block";
      const options = ["Sunglasses", "Jewelry", "Headwear"];
      options.forEach((option) => {
        const opt = document.createElement("option");
        opt.value = option;
        opt.textContent = option;
        tagSelect.appendChild(opt);
      });
    } else {
      tagBox.style.display = "none";
    }
  
    // Display submit button if valid
    submitButton.style.display = category ? "block" : "none";
  }
  
  document.getElementById("category-select").addEventListener("change", handleCategoryChange);
  
  document.getElementById("tag-select").addEventListener("change", function () {
    const submitButton = document.getElementById("submit-button");
    submitButton.style.display = "block";
  });
  
  // Submit the form and upload the image
  document.getElementById("submit-button").addEventListener("click", async () => {
    const category = document.getElementById("category-select").value;
    const type = document.getElementById("tag-select").value || "";
    const file = document.getElementById("image-upload").files[0];
  
    if (!category || !file) {
      alert("Please fill all required fields.");
      return;
    }
  
    const formData = new FormData();
    formData.append("category", category);
    formData.append("type", type);
    formData.append("clothingImage", file);
  
    const token = localStorage.getItem("token") || "";
    console.log("Token sent in request:", token);
  
    try {
      const response = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        alert(errorText || "Failed to upload image.");
        return;
      }
  
      const responseData = await response.json();
      alert("Upload successful!");
      window.location.href = "closet.html"; 
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("An error occurred while uploading the image.");
    }
  });
  
  document.getElementById("image-upload").addEventListener("change", previewImage);
  
  function redirectToHomepage() {
    window.location.href = "homepage.html";
  }