import React from "react";

// Komponen Card yang reusable
const Card = ({ title, children }) => {
  return (
    <div
      className="card"
      style={{
        backgroundColor: "#FFFFFF",
        color: "#000",
        fontWeight: "bold",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
      }}
    >
      <div
        className="card-header"
        style={{
          backgroundColor: "#EEEEEE",
          color: "#000",
          fontWeight: "bold",
          borderTopLeftRadius: "10px",
          borderTopRightRadius: "10px",
        }}
      >
        {title}
      </div>
      <div className="card-body p-4">{children}</div>
    </div>
  );
};

export default Card;
