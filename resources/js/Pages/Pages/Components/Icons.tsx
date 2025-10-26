import React from 'react';
import {
  CheckIcon as CheckIconSolid,
  Cog6ToothIcon as CogSolid,
  TrashIcon as TrashSolid,
  PencilSquareIcon as PencilSolid,
  Squares2X2Icon as SquaresSolid,
  ArrowsRightLeftIcon as ArrowsRightLeftSolid,
  Square2StackIcon as SquareStackSolid,
  DocumentTextIcon as DocumentTextSolid,
  PlayIcon as PlaySolid,
  ChevronDownIcon as ChevronDownSolid,
  ArrowUpIcon as ArrowUpSolid,
} from '@heroicons/react/24/solid';

// Keep the same exported names so existing imports in the repo don't need changes
export const Arrow: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <ChevronDownSolid {...(props as any)} />
);

export const ArrowIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <ArrowUpSolid {...(props as any)} />
);

export const ArrowUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <ArrowUpSolid {...(props as any)} />
);

export const ButtonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SquareStackSolid {...(props as any)} />
);

export const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <CheckIconSolid {...(props as any)} />
);

export const CustomizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <CogSolid {...(props as any)} />
);

export const DeleteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <TrashSolid {...(props as any)} />
);

export const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <PencilSolid {...(props as any)} />
);

export const LayersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SquaresSolid {...(props as any)} />
);

export const MoveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <ArrowsRightLeftSolid {...(props as any)} />
);

export const SquareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SquareStackSolid {...(props as any)} />
);

export const TypeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <DocumentTextSolid {...(props as any)} />
);

export const YoutubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <PlaySolid {...(props as any)} />
);
