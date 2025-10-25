import { useNode } from '@craftjs/core';
import { Grid as Grid, Slider, RadioGroup } from '@mui/material';
import * as React from 'react';

import { ToolbarDropdown } from './ToolbarDropdown';
import { ToolbarTextInput } from './ToolbarTextInput';

export type ToolbarItemProps = {
  prefix?: string;
  label?: string;
  full?: boolean;
  propKey?: string;
  index?: number;
  children?: React.ReactNode;
  type: string;
  onChange?: (value: any) => any;
};
export const ToolbarItem = ({
  full = false,
  propKey,
  type,
  onChange,
  index,
  ...props
}: ToolbarItemProps) => {
  const {
    actions: { setProp },
    propValue,
  } = useNode((node) => ({
    // guard against undefined propKey when selecting from node.data.props
    propValue: propKey ? node.data.props[propKey] : undefined,
  }));
  const value = Array.isArray(propValue) && index != null ? propValue[index] : propValue;

  return (
    <Grid size={{ xs: full ? 12 : 6 }}>
      <div className="mb-2">
        {['text', 'color', 'bg', 'number'].includes(type) ? (
          <ToolbarTextInput
            {...props}
            type={type}
            value={value}
            onChange={(value) => {
              if (!propKey) return;
              setProp((props: any) => {
                if (Array.isArray(propValue)) {
                  props[propKey][index] = onChange ? onChange(value) : value;
                } else {
                  props[propKey] = onChange ? onChange(value) : value;
                }
              }, 500);
            }}
          />
        ) : type === 'slider' ? (
          <>
            {props.label ? (
              <h4 className="text-sm text-light-gray-2">{props.label}</h4>
            ) : null}
            <Slider
              sx={{
                color: '#3880ff',
                height: 2,
                padding: '5px 0',
                width: '100%',
                '& .MuiSlider-track': {
                  height: 2,
                },
                '& .MuiSlider-thumb': {
                  height: 12,
                  width: 12,
                },
              }}
              value={parseInt(value) || 0}
              onChange={
                ((_: any, sliderValue: number | number[]) => {
                  if (!propKey) return;
                  const actualValue = Array.isArray(sliderValue)
                    ? (sliderValue as any)[index]
                    : sliderValue;
                  setProp((props: any) => {
                    if (Array.isArray(propValue)) {
                      props[propKey][index] = onChange
                        ? onChange(actualValue)
                        : actualValue;
                    } else {
                      props[propKey] = onChange ? onChange(actualValue) : actualValue;
                    }
                  }, 1000);
                }) as any
              }
            />
          </>
        ) : type === 'radio' ? (
          <>
            {props.label ? (
              <h4 className="text-sm text-light-gray-2">{props.label}</h4>
            ) : null}
            <RadioGroup
              value={value || 0}
              onChange={(e) => {
                if (!propKey) return;
                const v = e.target.value;
                setProp((props: any) => {
                  props[propKey] = onChange ? onChange(v) : v;
                });
              }}
            >
              {props.children}
            </RadioGroup>
          </>
        ) : type === 'select' ? (
          <ToolbarDropdown
            value={value || ''}
            onChange={(value) =>
              {
                if (!propKey) return;
                setProp((props: any) => (props[propKey] = onChange ? onChange(value) : value));
              }
            }
            {...props}
          />
        ) : null}
      </div>
    </Grid>
  );
};
