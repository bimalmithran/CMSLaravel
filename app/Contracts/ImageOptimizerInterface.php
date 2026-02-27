<?php

namespace App\Contracts;

interface ImageOptimizerInterface
{
    /**
     * Optimizes an image and returns the new file details.
     *
     * @param string $absolutePath The absolute path to the original file
     * @return array{path: string, size: int, mime_type: string}
     */
    public function optimize(string $absolutePath): array;
}
