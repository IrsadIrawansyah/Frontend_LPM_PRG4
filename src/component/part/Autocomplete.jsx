import React, { useState, forwardRef, useImperativeHandle } from "react";
import "../../index.css";

const Autocomplete = forwardRef(
  (
    {
      placeholder = "Search...",
      fetchData,
      onSelect,
      renderLabel = (item) => item.label,
      resetInput, // Tambahkan prop ini
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
      const value = e.target.value;
      setInputValue(value);

      if (value.trim() === "") {
        setFilteredData([]);
        setIsDropdownVisible(false);
      } else {
        setIsLoading(true);
        fetchData(value)
          .then((data) => {
            setFilteredData(data);
            setIsDropdownVisible(true);
          })
          .finally(() => setIsLoading(false));
      }
    };

    // Expose resetInput function to parent via ref
    useImperativeHandle(ref, () => ({
      resetInput: () => setInputValue(""), // Fungsi untuk mereset input
    }));

    const handleSelect = (item) => {
      setInputValue(renderLabel(item));
      setIsDropdownVisible(false);
      if (onSelect) onSelect(item);
    };

    return (
      <div className="autocomplete-container">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="autocomplete-input"
          ref={ref} // Forwarded ref here
        />
        {isLoading && <div className="loading">Loading...</div>}
        {isDropdownVisible && (
          <ul className="autocomplete-dropdown">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <li
                  key={index}
                  onClick={() => handleSelect(item)}
                  className="autocomplete-item"
                >
                  {renderLabel(item)}
                </li>
              ))
            ) : (
              <li className="autocomplete-item no-results">No results found</li>
            )}
          </ul>
        )}
      </div>
    );
  }
);

export default Autocomplete;
