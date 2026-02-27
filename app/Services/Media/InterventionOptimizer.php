<?php

namespace App\Services\Media;

use App\Contracts\ImageOptimizerInterface;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class InterventionOptimizer implements ImageOptimizerInterface
{
    public function optimize(string $absolutePath): array
    {
        $manager = new ImageManager(new Driver());
        $image = $manager->read($absolutePath);

        // 1. Resize if wider than 1600px to save massive amounts of space
        if ($image->width() > 1600) {
            $image->scaleDown(width: 1600);
        }

        // 2. Generate a unique new path for the WebP file
        // e.g., /var/www/html/storage/app/public/uploads/image.jpg -> .../image_654321.webp
        $newPath = preg_replace('/\.[^.]+$/', '_' . uniqid() . '.webp', $absolutePath);

        // 3. Encode to WebP at 80% quality and save
        $image->toWebp(80)->save($newPath);

        return [
            'path' => $newPath,
            'size' => filesize($newPath),
            'mime_type' => 'image/webp'
        ];
    }
}
