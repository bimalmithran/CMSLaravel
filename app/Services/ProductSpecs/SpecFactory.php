<?php

namespace App\Services\ProductSpecs;

use InvalidArgumentException;

class SpecFactory
{
    public static function make(string $typeSlug): SpecStrategyInterface
    {
        return match ($typeSlug) {
            'jewelry' => new JewelryStrategy(),
            'watch' => new WatchStrategy(),
            'diamond' => new DiamondStrategy(),
            default => throw new InvalidArgumentException("No specification strategy found for type: {$typeSlug}"),
        };
    }
}
