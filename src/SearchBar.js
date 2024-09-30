import React, { useState } from "react";
import styled from "styled-components";

const SearchContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 20px auto;
  display: flex;
  justify-content: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px 15px;
  border-radius: 25px 0 0 25px; /* Rounded on the left */
  border: 1px solid #e91e63;
  font-size: 1em;
  background-color: #1e1e1e;
  color: #ffffff;
  transition: border-color 0.3s, background-color 0.3s;

  &:focus {
    outline: none;
    border-color: #ff4081;
    background-color: #121212;
  }

  &::placeholder {
    color: #b0bec5;
  }
`;

const Button = styled.button`
  padding: 10px 15px;
  background-color: #e91e63;
  color: white;
  border: 1px solid #e91e63;
  border-radius: 0 25px 25px 0; /* Rounded on the right */
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
  }
`;

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleInputChange = (e) => {
    setLocalSearchTerm(e.target.value); // Update input field immediately
  };

  const handleSearchClick = () => {
    setSearchTerm(localSearchTerm); // Trigger search with the current input
  };

  return (
    <SearchContainer>
      <Input
        type="text"
        placeholder="Search by name, style, zip, city"
        value={localSearchTerm}
        onChange={handleInputChange}
      />
      <Button onClick={handleSearchClick} disabled={!localSearchTerm.trim()}>
        Search
      </Button>
    </SearchContainer>
  );
};

export default SearchBar;
