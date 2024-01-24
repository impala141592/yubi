import React, { useState } from "react";

const ImageOptimizer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState("png");
  const [optimizedDataURL, setOptimizedDataURL] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleFormatChange = (event) => {
    setSelectedFormat(event.target.value);
  };

  const handleOptimize = () => {
    if (selectedFile) {
      setIsOptimizing(true);
      optimizeImage(selectedFile, selectedFormat);
    } else {
      console.log("No file selected.");
    }
  };

  const optimizeImage = (file, format) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Resize the image (adjust dimensions as needed)
        const maxWidth = 800;
        const maxHeight = 600;
        let newWidth = img.width;
        let newHeight = img.height;

        if (img.width > maxWidth) {
          newWidth = maxWidth;
          newHeight = (img.height * maxWidth) / img.width;
        }

        if (img.height > maxHeight) {
          newHeight = maxHeight;
          newWidth = (img.width * maxHeight) / img.height;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Convert the canvas content to a data URL with the selected format
        const optimizedDataURL =
          format === "jpg"
            ? canvas.toDataURL("image/jpeg", 0.8) // Adjust quality as needed
            : canvas.toDataURL("image/png");

        // Set the optimized data URL in state
        setOptimizedDataURL(optimizedDataURL);
        setIsOptimizing(false);
      };
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (event) => {
    if (!selectedFile) {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleSelectImageClick = () => {
    // Trigger click on the hidden file input
    if (!selectedFile) {
      fileInputRef.current.click();
    }
  };

  const fileInputRef = React.createRef();

  const handleDownload = () => {
    if (optimizedDataURL) {
      // Create a temporary anchor element
      const downloadLink = document.createElement("a");
      downloadLink.href = optimizedDataURL;

      // Modify the downloaded file name to be URL-friendly
      const originalFileName = selectedFile.name;
      const fileExtension = originalFileName.split(".").pop(); // Get the file extension
      const fileNameWithoutExtension = originalFileName.replace(
        /\.[^/.]+$/,
        ""
      ); // Remove the file extension
      const sanitizedFileName = fileNameWithoutExtension
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-") // Replace non-alphanumeric characters with hyphens
        .replace(/-+/g, "-") // Replace consecutive hyphens with a single hyphen
        .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens

      const yubiFileName = `yubi-${sanitizedFileName}.${fileExtension}`;
      downloadLink.download = yubiFileName;

      // Trigger a click on the anchor element to start the download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      console.log("No optimized image available for download.");
    }
  };

  const handleChooseDifferentFile = (event) => {
    event.preventDefault(); // Prevent the default behavior (opening file selection window)
    setSelectedFile(null);
    setOptimizedDataURL(null);
  };

  return (
    <div>
      <h1>Image Optimizer</h1>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: "2px dashed #aaaaaa",
          borderRadius: "8px",
          padding: "20px",
          textAlign: "center",
          cursor: "pointer",
        }}
        onClick={handleSelectImageClick}
      >
        {selectedFile ? (
          <div>
            <p>Selected File: {selectedFile.name}</p>
            <button onClick={handleChooseDifferentFile}>
              Choose Different File
            </button>
          </div>
        ) : (
          <p>Drag and drop an image here or click to select one.</p>
        )}
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: "none" }}
          ref={fileInputRef}
        />
      </div>
      {selectedFile && (
        <div>
          {/* <p>Selected File: {selectedFile.name}</p> */}
          <label>
            Output Format:
            <select value={selectedFormat} onChange={handleFormatChange}>
              <option value="png">PNG</option>
              <option value="jpg">JPEG</option>
            </select>
          </label>
          <button onClick={handleOptimize} disabled={isOptimizing}>
            Optimize Image
          </button>
          {isOptimizing && (
            <p>Optimizing image... (show loading icon or progress bar)</p>
          )}
          {optimizedDataURL && !isOptimizing && (
            <div>
              <p>Image Optimized!</p>
              <button onClick={handleDownload} disabled={!optimizedDataURL}>
                Download Optimized Image
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageOptimizer;
