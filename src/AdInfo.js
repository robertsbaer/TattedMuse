import React from "react";
import styled from "styled-components";

const AdInfoContainer = styled.div`
  padding: 40px;
  background-color: #121212;
  color: #ffffff;
  min-height: 100vh;
  font-family: "Arial", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    padding: 20px; /* Reduce padding for mobile */
    margin-top: 70px; /* Add some margin at the top on mobile */
  }
`;

const Header = styled.h1`
  font-size: 3rem;
  margin-bottom: 20px;
  color: #e91e63;

  @media (max-width: 768px) {
    font-size: 2rem; /* Adjust font size for mobile */
  }
`;

const Section = styled.section`
  width: 80%;
  max-width: 900px;
  margin: 20px 0;
  background-color: #1e1e1e;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    width: 100%; /* Full width on mobile */
    padding: 15px; /* Reduce padding for mobile */
  }
`;

const SectionHeader = styled.h2`
  font-size: 2rem;
  margin-bottom: 15px;
  color: #ff4081;

  @media (max-width: 768px) {
    font-size: 1.5rem; /* Adjust font size for mobile */
  }
`;

const Paragraph = styled.p`
  font-size: 1.2rem;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem; /* Adjust font size for mobile */
  }
`;

const AdFormats = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  @media (max-width: 768px) {
    flex-direction: column; /* Stack elements vertically on mobile */
  }
`;

const AdFormatBox = styled.div`
  width: 45%;
  background-color: #333333;
  margin: 10px 0;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: #444444;
  }

  @media (max-width: 768px) {
    width: 100%; /* Full width on mobile */
    margin: 10px 0; /* Adjust margin for spacing on mobile */
  }
`;

const AdFormatTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #ff4081;

  @media (max-width: 768px) {
    font-size: 1.3rem; /* Adjust font size for mobile */
  }
`;

const ContactButton = styled.a`
  display: inline-block;
  padding: 15px 30px;
  margin-top: 20px;
  background-color: #e91e63;
  color: #ffffff;
  text-transform: uppercase;
  font-weight: bold;
  text-decoration: none;
  border-radius: 5px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ff4081;
  }

  @media (max-width: 768px) {
    padding: 12px 25px; /* Adjust padding for mobile */
    font-size: 1rem; /* Adjust font size for mobile */
  }
`;

const AdInfo = () => {
  return (
    <AdInfoContainer>
      <Header>Advertise with Us</Header>

      <Section>
        <SectionHeader>Why Advertise with Us?</SectionHeader>
        <Paragraph>
          Our website connects your business with a highly targeted audience of
          tattoo artists, enthusiasts, and professionals. By advertising here,
          you'll reach customers who are passionate about tattoos and related
          products. Whether you offer tattoo equipment, body art products, or
          events, we provide the ideal platform to promote your brand.
        </Paragraph>
      </Section>

      <Section>
        <SectionHeader>Ad Formats We Offer</SectionHeader>
        <AdFormats>
          <AdFormatBox>
            <AdFormatTitle>Banner Ads</AdFormatTitle>
            <Paragraph>
              Showcase your brand with eye-catching banners that appear at the
              top of every page. A great way to increase visibility and attract
              clicks.
            </Paragraph>
          </AdFormatBox>

          <AdFormatBox>
            <AdFormatTitle>Post Ads</AdFormatTitle>
            <Paragraph>
              Our post ads are ideal for reaching users while they browse
              through tattoo artist profiles.
            </Paragraph>
          </AdFormatBox>
        </AdFormats>
      </Section>

      <Section>
        <SectionHeader>Contact Us</SectionHeader>
        <Paragraph>
          Interested in advertising with us? Contact us for detailed information
          on rates and packages. We offer flexible options tailored to your
          needs.
        </Paragraph>
        <ContactButton href="mailto:advertise@tattedmuse.com">
          Get in Touch
        </ContactButton>
      </Section>
    </AdInfoContainer>
  );
};

export default AdInfo;
