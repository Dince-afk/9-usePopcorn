import { useState } from "react";

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const starStyle = {
  cursor: "pointer",
};

const ratingNumberStyle = {
  padding: "0px 20px",
  width: "25px",
};

export default function StarRating({
  handleSelectRatingValue,
  fontSize = "100px",
  color = "gold",
}) {
  const [selectedStar, setSelectedStar] = useState(0);
  const [tempStar, setTempStar] = useState(0);

  function handleSelectStar(starID) {
    setSelectedStar(starID);
    handleSelectRatingValue(starID + 1);
  }

  function handleTempHoverStar(starID) {
    setTempStar(starID);
  }

  function handleTempLeaveStar() {
    setTempStar(null);
  }

  const style = {};

  return (
    <div style={{ ...containerStyle, color, fontSize }}>
      {Array.from({ length: 10 }).map((_, starNumber) => {
        return (
          <span
            style={starStyle}
            key={starNumber}
            onClick={() => handleSelectStar(starNumber)}
            onMouseEnter={() => handleTempHoverStar(starNumber)}
            onMouseLeave={handleTempLeaveStar}
          >
            {/* 2605: full star, u2606: empty star */}
            {starNumber <= (tempStar ?? selectedStar) ? "\u2605" : "\u2606"}
          </span>
        );
      })}
      <span style={ratingNumberStyle}>{(tempStar ?? selectedStar) + 1}</span>
    </div>
  );
}
