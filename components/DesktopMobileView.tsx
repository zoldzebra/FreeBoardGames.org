import React from 'react';
import useWindowDimensions from 'hooks/useWindowDimensions';

interface DesktopMobileViewProps {
  children: React.ReactNode;
}

const THRESHOLD_HEIGHT = 900;
const THRESHOLD_WIDTH = 450;

function isDesktop() {
  if (!process.browser) {
    return true;
  }
  const { height, width } = useWindowDimensions();
  return height >= THRESHOLD_HEIGHT && width >= THRESHOLD_WIDTH;
}

export const DesktopView = (props: DesktopMobileViewProps) => {
  if (!isDesktop()) {
    return <React.Fragment>{props.children}</React.Fragment>;
  } else {
    return null;
  }
};

export const MobileView = (props: DesktopMobileViewProps) => {
  console.log('mv');
  if (!isDesktop()) {
    return <React.Fragment>{props.children}</React.Fragment>;
  } else {
    return null;
  }
};
