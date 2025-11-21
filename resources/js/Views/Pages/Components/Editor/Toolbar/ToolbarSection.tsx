import { useNode } from '@craftjs/core';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid as Grid,
} from '@mui/material';
import React from 'react';

export const ToolbarSection = ({ title, props, summary, children, expanded = false }: any) => {
  const { nodeProps } = useNode((node) => ({
    nodeProps:
      props &&
      props.reduce((res: any, key: any) => {
        res[key] = node.data.props[key] || null;
        return res;
      }, {}),
  }));
  return (
    <Accordion sx={{ boxShadow: 'none', backgroundColor: 'transparent', color: 'inherit' }} defaultExpanded={expanded} >
      <AccordionSummary>
        <div className="w-full">
          <Grid container direction="row" alignItems="center" spacing={3}>
            <Grid>
              <h4 className="">
                {title}
              </h4>
            </Grid>
            {summary && props ? (
              <Grid size={{ xs: 8 }}>
                <h5 className="text-sm text-right">
                  {summary(
                    props.reduce((acc: any, key: any) => {
                      acc[key] = nodeProps[key];
                      return acc;
                    }, {})
                  )}
                </h5>
              </Grid>
            ) : null}
          </Grid>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <div>
          {children}
        </div>
      </AccordionDetails>
    </Accordion>
  );
};
