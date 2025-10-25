import React from 'react';




export const Arrow: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <title>ChevronDownMedium</title>
        <rect id="ToDelete" fill="#ff13dc" opacity="0" /><path d="M9.99,1.01A.9999.9999,0,0,0,8.28266.30327L5,3.58594,1.71734.30327A.9999.9999,0,1,0,.30327,1.71734L4.29266,5.69673a.99965.99965,0,0,0,1.41468,0L9.69673,1.71734A.99669.99669,0,0,0,9.99,1.01Z" />
    </svg>
);
export const ArrowIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...props}>
        <title>Arrow Up</title>
        <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"></path>
    </svg>
);

export const ArrowUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
        <path fill="#707070" d="M9 1.5l7.5 7.5-1.06 1.06L10.5 5.56V16.5h-3V5.56L2.56 10.06 1.5 9z" />
    </svg>
    );

export const ButtonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
        <path fill="#707070" d="M2.5 5A1.5 1.5 0 0 0 1 6.5v5A1.5 1.5 0 0 0 2.5 13h13a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 15.5 5h-13zm0 1h13a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-5a.5.5 0 0 1 .5-.5z"/>
    </svg>
    );


export const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
        <path fill="#707070" d="M6.61 13.58 2.53 9.5l1.06-1.06 3.02 3.03 7.78-7.78L15.39 5z"/>
    </svg>
    );

export const CustomizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
        <path fill="#707070" d="M9 1.5A7.5 7.5 0 1 0 16.5 9 7.51 7.51 0 0 0 9 1.5zm0 13A5.5 5.5 0 1 1 14.5 9 5.51 5.51 0 0 1 9 14.5z"/>
    </svg>
    );

export const DeleteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
        <path fill="#707070" d="M5.5 4.5v-1a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v1h3v1h-1.5v9a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 4.5 14.5v-9H3V4.5zm2-1v1h5v-1zm-2.5 3h1v7h-1zm4 0h1v7h-1z"/>
    </svg>
    );


export const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18" {...props}>


        <rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18" /><path className="a" d="M16.7835,4.1,13.9,1.216a.60751.60751,0,0,0-.433-.1765H13.45a.6855.6855,0,0,0-.4635.203L2.542,11.686a.49494.49494,0,0,0-.1255.211L1.0275,16.55c-.057.1885.2295.4255.3915.4255a.12544.12544,0,0,0,.031-.0035c.138-.0315,3.933-1.172,4.6555-1.389a.486.486,0,0,0,.207-.1245L16.7565,5.014a.686.686,0,0,0,.2-.4415A.61049.61049,0,0,0,16.7835,4.1ZM5.7,14.658c-1.0805.3245-2.431.7325-3.3645,1.011L3.34,12.304Z" />
    </svg>
);


export const LayersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
        <path fill="#707070" d="M9 1.5L1.5 6l7.5 4.5L16.5 6zm0 2.25L13.5 6l-4.5 2.7L4.5 6zm0 4.5L1.5 10.5l7.5 4.5 7.5-4.5zm0 2.25L13.5 10.5l-4.5 2.7-4.5-2.7z"/>
    </svg>
    );

export const MoveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
        <path fill="#707070" d="M9 1.5l2.12 2.12-1.06 1.06L10.5 5.56V16.5h-3V5.56L6.94 4.68l-1.06-1.06L9 1.5zm0 15l2.12-2.12 1.06 1.06L10.5 12.44V1.5h-3v10.94L6.94 13.32l-1.06-1.06L9 16.5z"/>
    </svg>
    );

export const SquareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
        <path fill="#707070" d="M2.5 2.5A1.5 1.5 0 0 0 1 4v10a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 17 14V4a1.5 1.5 0 0 0-1.5-1.5h-13zm0 1h13a.5.5 0 0 1 .5.5v10a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5z"/>
    </svg>
    );

export const TypeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
        <path fill="#707070" d="M3 2.5a.5.5 0 0 0 0 1h5.5v13a.5.5 0 0 0 1 0v-13H15a.5.5 0 0 0 0-1H3z"/>
    </svg>
    );

export const YoutubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path fill="#707070" d="M10 9.5v5l4-2.5-4-2.5zM21 7.5s-.2-1.4-.8-2c-.8-.8-1.7-.8-2.1-.9C16.7 4.4 12 4.4 12 4.4s-4.7 0-5.9.2c-.4 0-1.3.1-2.1.9-.6.6-.8 2-.8 2S2 9.1 2 10.6v2.8C2 15.9 2.2 17.3 2.2 17.3s.2 1.4.8 2c.8.8 1.9.8 2.4.9 1.7.1 7.6.2 7.6.2s4.7 0 6-.2c.4 0 1.3.1 2.1-.9.6-.6.8-2 .8-2s.2-1.4.2-2.9v-2.8c0-1.5-.2-2.9-.2-2.9z" />
    </svg>
);

