import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const HeaderContainer = styled.header`
  color: #ffffff;
  padding: 2px;
  text-align: center;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
`;

const SignupButton = styled(Link)`
  display: inline-block;
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #e91e63;
  color: #ffffff;
  text-decoration: none;
  border-radius: 5px;
  font-size: 1em;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ff4081;
  }
`;

const Header = () => {
  return (
    <HeaderContainer>
      <SignupButton to="/signup">Showcase your work / login</SignupButton>
    </HeaderContainer>
  );
};

export default Header;
