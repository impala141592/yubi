import React from "react";

const ChooseFilesInput = ({ fileRef, changeFile }) => {
  return (
    <label className="custom-file-select button">
      <span className="material-symbols-outlined">upload</span>
      Upload files from your computer
      <input
        type="file"
        onChange={changeFile}
        accept="image/*"
        style={{ display: "none" }}
        ref={fileRef}
        multiple
      />
    </label>
  );
};

const FileDropZone = ({
  dropFiles,
  chooseDifferentFiles,
  changeFile,
  selectedFiles,
  fileRef,
  maxFileSize,
  uploadErrorMessage,
  maxFileLimit,
}) => {
  return (
    <div
      className="file-drop-zone"
      onDragOver={(event) => event.preventDefault()}
      onDrop={dropFiles}
    >
      {selectedFiles.length > 0 ? (
        <>
          <span className="title">Selected files:</span>
          <ul className="uploaded-file-list">
            {selectedFiles.map((file, index) => (
              <li key={index}>
                <span className="material-symbols-outlined icon">image</span>
                <span className="name">{file.name}</span>
                <span className="size">
                  {(file.size / (1024 * 1024)).toFixed(2)}MB
                </span>
              </li>
            ))}
          </ul>
          {uploadErrorMessage && (
            <p className="error-message">{uploadErrorMessage}</p>
          )}
          <button className="outline" onClick={chooseDifferentFiles}>
            Choose Different Files
          </button>
        </>
      ) : (
        <>
          <span className="title">
            Drag and drop images here or click to select up to {maxFileLimit}{" "}
            files.
          </span>
          <ChooseFilesInput fileRef={fileRef} changeFile={changeFile} />
          {uploadErrorMessage ? (
            <p className="error-message">{uploadErrorMessage}</p>
          ) : (
            <span className="info">Max file size {maxFileSize}MB</span>
          )}
        </>
      )}
    </div>
  );
};

export default FileDropZone;
