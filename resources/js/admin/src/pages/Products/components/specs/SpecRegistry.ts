import type React from 'react';
import type { SpecFormProps } from '../../../../types/product';
import { DiamondSpecs } from './DiamondSpecs';
import { JewelrySpecs } from './JewelrySpecs';
import { WatchSpecs } from './WatchSpecs';

// The single source of truth for routing product types to UI components
export const SpecFormRegistry: Record<string, React.FC<SpecFormProps>> = {
    jewelry: JewelrySpecs,
    watch: WatchSpecs,
    diamond: DiamondSpecs,
};
