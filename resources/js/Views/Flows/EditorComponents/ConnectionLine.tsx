import React from 'react';
import {useConnection} from '@xyflow/react';
import {PlayIcon} from "@phosphor-icons/react";

export default ({fromX, fromY, toX, toY}) => {
    const {fromHandle} = useConnection();

    console.log('fromHandle', fromHandle);

    return (
        <g>
            <path
                fill="none"
                stroke={"white"}
                strokeWidth={1.5}
                className="animated"
                /*d={`M${fromX},${fromY} C ${fromX} ${toY} ${fromX} ${toY} ${toX},${toY}`}*/
                d={`M${fromX},${fromY} C ${toX} ${fromY} ${fromX} ${toY} ${toX},${toY}`}
            />

            <circle
                cx={toX}
                cy={toY}
                fill="#fff"
                r={10}
                stroke={fromHandle.id}
                strokeWidth={1.5}
            />
            <PlayIcon size={50}/>
        </g>
    );
};
