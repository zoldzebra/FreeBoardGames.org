import * as React from 'react';

interface IShapeProps {
  x: number;
  y: number;
}

const boldLineStyle = {
  strokeWidth: 0.1,
};

export const Circle = (props: IShapeProps) => {
  return (
    <circle
      key={`circle${props.x},${props.y}`}
      r=".25"
      fill="red"
      stroke="lime"
      style={boldLineStyle}
    />
  );
};
