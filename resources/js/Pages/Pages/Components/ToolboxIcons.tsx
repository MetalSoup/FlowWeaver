import React from 'react';
import {
  Square2StackIcon as SquareStackSolid,
  Squares2X2Icon as Squares2X2Solid,
  LinkIcon as LinkSolid,
  RectangleStackIcon as RectangleStackSolid,
  ArrowUturnRightIcon as ArrowUturnRightSolid,
  ArrowUturnLeftIcon as ArrowUturnLeftSolid,
  DocumentTextIcon as DocumentTextSolid,
  PlayIcon as PlaySolid,
} from '@heroicons/react/24/solid';

export const ButtonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <SquareStackSolid {...(props as any)} />
);

export const ContainerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Squares2X2Solid {...(props as any)} />
);

export const LinkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <LinkSolid {...(props as any)} />
);

export const RectangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <RectangleStackSolid {...(props as any)} />
);

export const RedoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <ArrowUturnRightSolid {...(props as any)} />
);

export const TextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <DocumentTextSolid {...(props as any)} />
);

export const TextFillIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <DocumentTextSolid {...(props as any)} />
);

export const UndoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <ArrowUturnLeftSolid {...(props as any)} />
);

export const VideoFillIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <PlaySolid {...(props as any)} />
);

export const VideoLineIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <PlaySolid {...(props as any)} />
);

export const YoutubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <PlaySolid {...(props as any)} />
);
