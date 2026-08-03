<?php

use App\Services\Entries\DriveUploadHandler;

return [
    'upload_types' => [
        'bedrive' => [
            'visibility' => 'private',
            'dont_clean' => true,
            'supports_folders' => true,
            'supports_max_space_usage' => true,
            'max_space_usage_setting' => 'drive.default_available_space',
            'label' => 'Bedrive uploads',
            'description' => 'All files uploaded by users in Bedrive.',
            'defaults' => [
                'max_file_size' => '5242880',
            ],
            'handler' => DriveUploadHandler::class,
        ],
    ],
];
