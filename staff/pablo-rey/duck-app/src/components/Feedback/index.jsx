import React from 'react'

function Feedback ( {cssClass, errorMessage }) {
  return (
      <div className={cssClass + "__error"}>
        <p className={cssClass + "__error-message"}>{errorMessage}</p>
      </div>
  );
}

export default Feedback;