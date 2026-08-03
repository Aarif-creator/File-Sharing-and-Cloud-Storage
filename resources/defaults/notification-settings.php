<?php

use App\Notifications\FileEntrySharedNotif;
use App\Notifications\FileRequestUploadNotif;
use Common\Workspaces\Notifications\WorkspaceInvitation;

return [
    'available_channels' => ['email', 'browser', 'mobile'],
    'subscriptions' => [
        [
            'group_name' => 'Notify me when…',
            'subscriptions' => [
                [
                    'name' => 'I am invited to workspace',
                    'notif_id' => WorkspaceInvitation::NOTIF_ID,
                ],
                [
                    'name' => 'A file or folder is shared with me',
                    'notif_id' => FileEntrySharedNotif::NOTIF_ID,
                ],
                [
                    'name' => 'Someone uploads a file to my file request',
                    'notif_id' => FileRequestUploadNotif::NOTIF_ID,
                ],
            ],
        ],
    ],
];
