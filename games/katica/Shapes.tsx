import * as React from 'react';

interface IShapeProps {
  x: number;
  y: number;
}

interface FieldProps {
  id: number;
  x: number;
  y: number;
  onClick?: (id: number) => void;
  isSelected: boolean;
}

const boldLineStyle = {
  strokeWidth: 0.1,
};

const lineStyle = {
  stroke: 'white',
  strokeWidth: 0.025,
};

export const Cross = (props: IShapeProps) => {
  return (
    <g className="cross" key={`cross${props.x},${props.y}`}>
      <line
        x1={props.x + 0.25}
        y1={props.y + 0.25}
        x2={props.x + 0.75}
        y2={props.y + 0.75}
        stroke="red"
        style={boldLineStyle}
      />
      ,
      <line
        x1={props.x + 0.75}
        y1={props.y + 0.25}
        x2={props.x + 0.25}
        y2={props.y + 0.75}
        stroke="red"
        style={boldLineStyle}
      />
    </g>
  );
};

export const Circle = (props: IShapeProps) => {
  return (
    <circle
      key={`circle${props.x},${props.y}`}
      cx={props.x + 0.5}
      cy={props.y + 0.5}
      r=".25"
      fill="none"
      stroke="lime"
      style={boldLineStyle}
    />
  );
};

export const Field = (props: FieldProps) => {
  if (props.isSelected) {
    return (
      <rect
        x={props.x}
        y={props.y}
        width="1"
        height="1"
        fill="gray"
        onClick={() => {
          return props.onClick(props.id);
        }}
      />
    );
  }
  return (
    <rect
      x={props.x}
      y={props.y}
      width="1"
      height="1"
      fill="green"
      onClick={() => {
        return props.onClick(props.id);
      }}
    />
  );
};

const createLines = () => {
  const Lines = [];
  for (let i = 0; i <= 6; i++) {
    const keyX = `lineX${i + 1}`;
    const keyY = `lineY${i + 1}`;
    Lines.push(
      <line
        key={keyX}
        x1={i}
        y1={0}
        x2={i}
        y2={7}
        style={lineStyle}
      />,
      <line
        key={keyY}
        x1={0}
        y1={i}
        x2={6}
        y2={i}
        style={lineStyle}
      />
    );
  };
  Lines.push(
    <line
      key='lineY8'
      x1={0}
      y1={7}
      x2={6}
      y2={7}
      style={lineStyle}
    />
  )
  return Lines;
};

export const Lines = createLines();
