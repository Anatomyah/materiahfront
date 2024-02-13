import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

/**
 * HTMLEditor component implementing the react-quill package
 * @param {Object} props - Props object
 * @param {string} props.template - The initial HTML template
 * @param {function} props.setTemplate - Function to update the HTML template
 * @returns {React.Element} - React element representing the HTMLEditor component
 */
const HTMLEditor = ({ template, setTemplate }) => {
  const toolbarOptions = [
    ["bold", "italic", "underline", "strike"], // toggled buttons
    ["blockquote", "code-block"],

    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }], // superscript/subscript
    [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
    [{ direction: "rtl" }], // text direction

    [{ size: ["small", false, "large", "huge"] }], // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [{ font: [] }],
    [{ align: [] }],

    ["clean"],
    ["link", "image"],
  ];
  const modules = {
    toolbar: toolbarOptions,
  };

  return (
    <ReactQuill
      modules={modules}
      theme="snow"
      value={template}
      onChange={setTemplate}
    />
  );
};

export default HTMLEditor;
