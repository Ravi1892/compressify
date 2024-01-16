let selectedFileName = null;

function displayFileNameAndPreview() {
  const fileInput = document.getElementById("imageInput");
  const fileNameDisplay = document.getElementById("fileNameDisplay");
  selectedFileName = fileInput.files[0].name;
  fileNameDisplay.textContent = `Selected File: ${selectedFileName}`;

  // Display the preview of the selected image
  const originalImage = document.getElementById("originalImage");
  originalImage.innerHTML = "";

  const imageElement = document.createElement("img");
  imageElement.src = URL.createObjectURL(fileInput.files[0]);
  originalImage.appendChild(imageElement);

  // Hide the "Resize with Custom Size" button after selecting a file
  const customSizeButton = document.getElementById("customSizeButton");
  customSizeButton.style.display = "none";
}

function showCustomSizeInput() {
  // Show the "Resize with Custom Size" button when the "Custom Size" button is clicked
  const customSizeInputWrapper = document.getElementById(
    "customSizeInputWrapper"
  );
  customSizeInputWrapper.style.display = "block";

  // Hide the "Resize with Custom Size" button when "Custom Size" is clicked
  const customSizeButton = document.getElementById("customSizeButton");
  customSizeButton.style.display = "block";
}

async function resizeImage(sizeLimit) {
  const fileInput = document.getElementById("imageInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select an image file.");
    return;
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(
      `http://localhost:3000/resize?sizeLimit=${sizeLimit}&originalFileName=${selectedFileName}`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (response.ok) {
      const resizedImage = document.getElementById("resizedImage");
      resizedImage.innerHTML = "";

      const blob = await response.blob();
      const imageURL = URL.createObjectURL(blob);

      const resizedImageElement = document.createElement("img");
      resizedImageElement.src = imageURL;
      resizedImage.appendChild(resizedImageElement);

      // Add download link with the original filename
      const downloadLink = document.createElement("a");
      downloadLink.href = imageURL;
      downloadLink.download = selectedFileName; // Use the original filename
      downloadLink.innerText = "Download Resized Image";

      // Display download link
      const downloadSection = document.getElementById("downloadSection");
      downloadSection.innerHTML = "";
      downloadSection.appendChild(downloadLink);
      downloadSection.style.display = "flex";

      // Show the "Resize with Custom Size" button after resizing
      //  const customSizeButton = document.getElementById('customSizeButton');
      // customSizeButton.style.display = 'block';
    } else {
      alert("Error resizing image.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error resizing image.");
  }
}

function resizeImageCustom() {
  const customSizeInput = document.getElementById("customSizeInput");
  const customSizeValue = parseInt(customSizeInput.value);

  if (isNaN(customSizeValue) || customSizeValue <= 0) {
    alert("Please enter a valid positive number for custom size.");
    return;
  }

  resizeImage(customSizeValue);
}
