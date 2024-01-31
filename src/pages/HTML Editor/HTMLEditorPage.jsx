import React from "react";
import HTMLEditor from "../../components/Generic/HTMLEditor";
import { largeLogo } from "../../config_and_helpers/config";
import Image from "react-bootstrap/Image";

const initialHTML = `<div>Your initial HTML template here</div>`;

const HtmlEditorPage = () => {
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center", // This line centers the children horizontally
          marginBottom: "20px",
          marginTop: "20px",
        }}
      >
        <Image src={largeLogo} style={{ width: "30%", marginBottom: "10px" }} />
        <h1 style={{ textAlign: "center" }}>Email Template Editor</h1>
        {/* The textAlign style on h1 is technically not necessary here because of alignItems, but it's useful if the text wraps to a new line. */}
      </div>
      <HTMLEditor initialTemplate={initialHTML} />
    </div>
  );
};
export default HtmlEditorPage;
