import React, { useEffect, useRef } from 'react';
import { GatsbyImage } from 'gatsby-plugin-image';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';
import { graphql, useStaticQuery } from 'gatsby';
import PropTypes from 'prop-types';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

const MyGallery = props => (
  <>
    <Lightbox
      index={props.index}
      open={props.open}
      close={() => props.setOpen(false)}
      slides={props.images}
    />
  </>
);

MyGallery.propTypes = {
  index: PropTypes.number,
  setOpen: PropTypes.func,
  open: PropTypes.bool,
  images: PropTypes.array,
};

const StyledPortfolioSection = styled.section`
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .inner {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-gap: 50px;

    @media (max-width: 768px) {
      display: block;
    }
  }
  .more-button {
    ${({ theme }) => theme.mixins.button};
    margin: 80px auto 0;
  }
`;
const StyledPic = styled.div`
  position: relative;
  max-width: 300px;

  @media (max-width: 768px) {
    margin: 50px auto 0;
    width: 70%;
  }

  .wrapper {
    ${({ theme }) => theme.mixins.boxShadow};
    display: block;
    position: relative;
    width: 100%;
    border-radius: var(--border-radius);
    background-color: var(--green);

    &:hover,
    &:focus {
      outline: 0;

      &:after {
        top: 15px;
        left: 15px;
      }

      .img {
        filter: none;
        mix-blend-mode: normal;
      }
    }

    .img {
      position: relative;
      border-radius: var(--border-radius);
      filter: grayscale(100%) contrast(1);
      transition: var(--transition);
    }

    &:before,
    &:after {
      content: '';
      display: block;
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: var(--border-radius);
      transition: var(--transition);
    }

    &:before {
      top: 0;
      left: 0;
      background-color: var(--navy);
      mix-blend-mode: screen;
    }

    &:after {
      border: 2px solid var(--green);
      top: 20px;
      left: 20px;
      z-index: -1;
    }
  }
`;

const Portfolio = () => {
  const data = useStaticQuery(graphql`
    {
      allFile(filter: { relativeDirectory: { eq: "portfolio" } }) {
        edges {
          node {
            id
            name
            absolutePath
            relativePath
            childImageSharp {
              gatsbyImageData
              fluid(maxWidth: 800) {
                ...GatsbyImageSharpFluid
              }
            }
          }
        }
      }
    }
  `);

  const certificates = data.allFile.edges.filter(({ node }) => node);
  const images = certificates.map(({ node }) => ({
    src: node.childImageSharp.fluid.src,
    alt: node.name,
  }));
  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [open, setOpen] = React.useState(false);
  const [showMore, setShowMore] = React.useState(false);
  const [idx, setIdx] = React.useState(0);
  const GRID_LIMIT = 4;
  const firstFour = certificates.slice(0, GRID_LIMIT);
  const certsToShow = showMore ? certificates : firstFour;
  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealContainer.current, srConfig());
  }, []);
  return (
    <StyledPortfolioSection id="portfolio" ref={revealContainer}>
      <h2 className="numbered-heading">Work Samples</h2>

      <div className="inner">
        {certsToShow.map(({ node }, i) => {
          const path = node.childImageSharp.gatsbyImageData;
          return (
            <StyledPic key={node.id}>
              <div className="wrapper">
                <GatsbyImage
                  onClick={() => {
                    setOpen(true);
                    setIdx(i);
                  }}
                  className="img"
                  image={path}
                  width={500}
                  quality={55}
                  formats={['AUTO', 'WEBP', 'AVIF']}
                  alt="Headshot"
                />
              </div>
            </StyledPic>
          );
        })}
      </div>
      <MyGallery index={idx} open={open} images={images} setOpen={setOpen} />
      <button className="more-button" onClick={() => setShowMore(!showMore)}>
        Show {showMore ? 'Less' : 'More'}
      </button>
    </StyledPortfolioSection>
  );
};

export default Portfolio;
