import React from "react";
import styled from "styled-components";

const SearchContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 20px auto;
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px 15px;
  border-radius: 25px;
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

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <SearchContainer>
      <Input
        type="text"
        placeholder="Search by name, style, or city"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </SearchContainer>
  );
};

export default SearchBar;
