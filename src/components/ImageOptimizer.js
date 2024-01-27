import React, { useState } from "react";

const ImageOptimizer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState("png");
  const [optimizedDataURL, setOptimizedDataURL] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [unsupportedFiles, setUnsupportedFiles] = useState([]);

  //Check if the file type is supported
  const isFileTypeUnsupported = (file) => {
    const unsupportedTypes = ["image/svg+xml", "image/tiff", "image/tif"];
    return unsupportedTypes.includes(file.type);
  };

  // Handles the change event when a user selects a file. Checks if the file type is unsupported and updates state accordingly.
  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (isFileTypeUnsupported(file)) {
      setUnsupportedFiles([file.name]);
      setSelectedFile(null);
      setOptimizedDataURL(null);
    } else {
      setSelectedFile(file);
      setUnsupportedFiles([]);
    }
  };

  const handleFormatChange = (event) => {
    setSelectedFormat(event.target.value);
  };

  // Initiates the optimization process if a file is selected, setting the optimization flag to true and calling the optimizeImage function.
  // Displays a console message if no file is selected.
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

  const getSanitizedFileName = (fileName) => {
    return fileName
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleDownload = () => {
    if (optimizedDataURL) {
      const downloadLink = document.createElement("a");
      const fileExtension = selectedFormat === "jpg" ? "jpeg" : selectedFormat;
      const sanitizedFileName = getSanitizedFileName(selectedFile.name);
      const yubiFileName = `yubi-${sanitizedFileName}.${fileExtension}`;

      downloadLink.download = yubiFileName;
      downloadLink.href = optimizedDataURL;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      console.log("No optimized image available for download.");
    }
  };

  const handleChooseDifferentFile = (event) => {
    event.preventDefault();
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
      {unsupportedFiles.length > 0 && (
        <div>
          <p>Unsupported Files:</p>
          <ul>
            {unsupportedFiles.map((fileName) => (
              <li key={fileName}>{fileName}</li>
            ))}
          </ul>
          <p>Please choose a different file.</p>
        </div>
      )}
      {selectedFile && (
        <div>
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
              <img
                src={optimizedDataURL}
                alt="Optimized"
                style={{ maxWidth: "100%" }}
              />

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
