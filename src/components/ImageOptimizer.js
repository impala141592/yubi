import React, { useState } from "react";

const ImageOptimizer = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState("png");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedDataURLs, setOptimizedDataURLs] = useState([]);
  const [uploadErrorMessage, setUploadErrorMessage] = useState(null);
  const [originalFileSizes, setOriginalFileSizes] = useState([]);

  const bytesToMB = (bytes) => {
    const megabytes = bytes / (1024 * 1024);
    return megabytes.toFixed(2) + "MB";
  };

  const isFileTypeUnsupported = (file) => {
    const unsupportedTypes = ["image/svg+xml", "image/tiff", "image/tif"];
    return unsupportedTypes.includes(file.type);
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    const newSelectedFiles = [];

    setUploadErrorMessage(null);

    if (selectedFiles.length + files.length > 5) {
      setUploadErrorMessage("Too many files. Please upload up to 5 files.");
      return;
    }

    for (const file of files) {
      // Check if the file type is unsupported
      if (isFileTypeUnsupported(file)) {
        setUploadErrorMessage(
          `Unsupported file type. Can't optimize ${
            file.type.match(/\/([^+/]+)/)[1]
          }`
        );
      } else {
        const maxSizeInMB = 2.2;
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024; // 5MB
        if (file.size > maxSizeInBytes) {
          setUploadErrorMessage(
            `File size exceeds the limit. Please upload files up to ${maxSizeInMB}MB.`
          );
        } else {
          newSelectedFiles.push(file);
        }
      }
    }
    setSelectedFiles((prevSelectedFiles) => [
      ...prevSelectedFiles,
      ...newSelectedFiles,
    ]);
  };

  const handleFormatChange = (event) => {
    setSelectedFormat(event.target.value);
  };

  const handleOptimize = () => {
    if (selectedFiles.length > 0) {
      setIsOptimizing(true);
      setOriginalFileSizes([]);

      // Optimize each selected file
      for (const file of selectedFiles) {
        setOriginalFileSizes((prevOriginalFileSizes) => [
          ...prevOriginalFileSizes,
          file.size,
        ]);
        optimizeImage(file, selectedFormat);
      }
    } else {
      setUploadErrorMessage("No files selected.");
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

        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        const optimizedDataURL =
          format === "jpg"
            ? canvas.toDataURL("image/jpeg", 0.8)
            : canvas.toDataURL("image/png");

        setOptimizedDataURLs((prevOptimizedDataURLs) => [
          ...prevOptimizedDataURLs,
          optimizedDataURL,
        ]);

        setIsOptimizing(false);
      };
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    const newSelectedFiles = [];

    for (const file of files) {
      if (!isFileTypeUnsupported(file)) {
        newSelectedFiles.push(file);
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleSelectImageClick = () => {
    if (selectedFiles.length === 0) {
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

  const handleDownload = (index) => {
    if (optimizedDataURLs[index]) {
      const downloadLink = document.createElement("a");
      const fileExtension = selectedFormat === "jpg" ? "jpeg" : selectedFormat;

      const sanitizedFileName = getSanitizedFileName(selectedFiles[index].name);
      const yubiFileName = `yubi-${sanitizedFileName}.${fileExtension}`;

      downloadLink.download = yubiFileName;
      downloadLink.href = optimizedDataURLs[index];
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      console.log(
        `No optimized image available for download: Image ${index + 1}`
      );
    }
  };

  const handleDownloadAll = () => {
    if (optimizedDataURLs.length > 0) {
      for (let i = 0; i < optimizedDataURLs.length; i++) {
        handleDownload(i);
      }
    } else {
      console.log("No optimized images available for download.");
    }
  };

  const handleChooseDifferentFile = (event) => {
    event.preventDefault();
    setSelectedFiles([]);
    setOptimizedDataURLs([]);
    setUploadErrorMessage(null);
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
        {uploadErrorMessage && (
          <p style={{ color: "red" }}>{uploadErrorMessage}</p>
        )}
        {selectedFiles.length > 0 ? (
          <div>
            <p>Selected Files:</p>
            <ul>
              {selectedFiles.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
            <button onClick={handleChooseDifferentFile}>
              Choose Different Files
            </button>
          </div>
        ) : (
          <p>Drag and drop images here or click to select them.</p>
        )}
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: "none" }}
          ref={fileInputRef}
          multiple
        />
      </div>
      {selectedFiles.length > 0 && (
        <div>
          <label>
            Output Format:
            <select value={selectedFormat} onChange={handleFormatChange}>
              <option value="png">PNG</option>
              <option value="jpg">JPEG</option>
            </select>
          </label>
          <button onClick={handleOptimize} disabled={isOptimizing}>
            Optimize Images
          </button>
          {isOptimizing && (
            <p>Optimizing images... (show loading icon or progress bar)</p>
          )}
          {optimizedDataURLs.length > 0 && !isOptimizing && (
            <div>
              <p>Images Optimized!</p>
              {optimizedDataURLs.map((optimizedDataURL, index) => (
                <div key={index}>
                  <img
                    src={optimizedDataURL}
                    alt={`Optimized ${selectedFiles[index].name}`}
                    style={{ maxWidth: "10%" }}
                  />
                  <p>
                    Original Size: {bytesToMB(originalFileSizes[index])} | New
                    Size: {bytesToMB(optimizedDataURL.length)}
                  </p>
                  <button
                    onClick={() => handleDownload(index)}
                    disabled={!optimizedDataURL}
                  >
                    Download Optimized Image
                  </button>
                </div>
              ))}
              {optimizedDataURLs.length > 1 && (
                <button onClick={handleDownloadAll}>Download All Images</button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default ImageOptimizer;
