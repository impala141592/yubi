import React, { useState } from "react";
import FileDropZone from "./FileDropZone";

const ImageOptimizer = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState("png");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedDataURLs, setOptimizedDataURLs] = useState([]);
  const [uploadErrorMessage, setUploadErrorMessage] = useState(null);
  const [originalFileSizes, setOriginalFileSizes] = useState([]);
  const [oversizedFiles, setOversizedFiles] = useState([]);

  const maxFileSize = 2.2;
  const maxFileLimit = 5;
  const fileInputRef = React.createRef();

  const sanitizeFileName = (fileName) => {
    return fileName
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const isFileTypeUnsupported = (file) => {
    const unsupportedTypes = ["image/svg+xml", "image/tiff", "image/tif"];
    return unsupportedTypes.includes(file.type);
  };

  const handleFileUpload = (event, operationType) => {
    event.preventDefault();
    let files;

    if (operationType === "change") {
      files = event.target.files;
    } else if (operationType === "drop") {
      files = event.dataTransfer.files;
    }

    const newSelectedFiles = [];
    const duplicateFiles = [];
    setUploadErrorMessage(null);

    if (selectedFiles.length + files.length > 5) {
      setUploadErrorMessage(
        `Too many files. Please upload up to ${maxFileLimit} files.`
      );
      return;
    }

    for (const file of files) {
      if (
        selectedFiles.some((selectedFile) => selectedFile.name === file.name)
      ) {
        duplicateFiles.push(file.name);
      } else {
        if (isFileTypeUnsupported(file)) {
          setUploadErrorMessage(
            `Unsupported file type. Can't optimize .${
              file.type.match(/\/([^+/]+)/)[1]
            } files.`
          );
        } else {
          const maxSizeInBytes = maxFileSize * 1024 * 1024;
          if (file.size > maxSizeInBytes) {
            setOversizedFiles((prevOversizedFiles) => [
              ...prevOversizedFiles,
              file.name,
            ]);
            // TODO: fix error message to display all oversized file names
            setUploadErrorMessage(
              `File "${file.name}" exceeds the file size limit. Please upload files up to ${maxFileSize}MB.`
            );
          } else {
            newSelectedFiles.push(file);
          }
        }
      }
    }

    setSelectedFiles((prevSelectedFiles) => [
      ...prevSelectedFiles,
      ...newSelectedFiles,
    ]);

    if (duplicateFiles.length > 0) {
      setUploadErrorMessage(
        `File "${duplicateFiles.join(", ")}" is already uploaded.`
      );
    }
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

  const handleDownload = (index) => {
    if (optimizedDataURLs[index]) {
      const downloadLink = document.createElement("a");
      const fileExtension = selectedFormat === "jpg" ? "jpeg" : selectedFormat;

      const sanitizedFileName = sanitizeFileName(selectedFiles[index].name);
      const yubiFileName = `yubi-${sanitizedFileName}.${fileExtension}`;

      downloadLink.download = yubiFileName;
      downloadLink.href = optimizedDataURLs[index];
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      setUploadErrorMessage("No optimized images available for download.");
    }
  };

  const handleDownloadAll = () => {
    if (optimizedDataURLs.length > 0) {
      for (let i = 0; i < optimizedDataURLs.length; i++) {
        handleDownload(i);
      }
    } else {
      setUploadErrorMessage("No optimized images available for download.");
    }
  };

  const handleChooseDifferentFile = (event) => {
    event.preventDefault();
    setSelectedFiles([]);
    setOptimizedDataURLs([]);
    setUploadErrorMessage(null);
  };

  console.log("oversizedFiles", oversizedFiles);

  return (
    <div className="optimizer">
      <FileDropZone
        dropFiles={(event) => handleFileUpload(event, "drop")}
        selectedFiles={selectedFiles}
        chooseDifferentFiles={handleChooseDifferentFile}
        changeFile={(event) => handleFileUpload(event, "change")}
        fileRef={fileInputRef}
        maxFileSize={maxFileSize}
        maxFileLimit={maxFileLimit}
        uploadErrorMessage={uploadErrorMessage}
      />

      {/* {uploadErrorMessage && (
        <p style={{ color: "red" }}>{uploadErrorMessage}</p>
      )} */}

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
                    Original Size:
                    {(originalFileSizes[index] / (1024 * 1024)).toFixed(2) +
                      "MB"}
                    | New Size:
                    {(optimizedDataURLs.length / (1024 * 1024)).toFixed(2) +
                      "MB"}
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
