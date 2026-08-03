<?php

return [
    'roles' => [
        [
            'name' => 'Users',
            'internal' => true,
            'default' => true,
            'type' => 'users',
            'permissions' => [
                'files.create',
                'api.access',
                'links.view',
                'links.create',
                'file_requests.view',
                'file_requests.create',
                'workspaces.create',
            ],
        ],
        [
            'name' => 'Guests',
            'internal' => true,
            'type' => 'users',
            'guests' => true,
            'permissions' => ['links.view', 'file_requests.view'],
        ],
        [
            'name' => 'Admin',
            'type' => 'workspace',
            'description' =>
                'Manage workspace content, members, settings and invite new members.',
            'permissions' => [
                'workspace_members.invite',
                'workspace_members.update',
                'workspace_members.delete',
                'files.download',
                'files.create',
                'files.update',
                'files.delete',
            ],
        ],
        [
            'name' => 'Editor',
            'type' => 'workspace',
            'description' => 'Add, edit, move and delete workspace files.',
            'permissions' => [
                'files.download',
                'files.create',
                'files.update',
                'files.delete',
            ],
        ],
        [
            'name' => 'Contributor',
            'type' => 'workspace',
            'description' => 'View files and add new files to the workspace.',
            'permissions' => ['files.download', 'files.create'],
        ],
    ],
    'all' => [
        'files' => [
            [
                'name' => 'files.create',
                'role_types' => ['users'],
                'display_name' => 'Upload files',
                'description' =>
                    'Allow user to upload files into personal workspace.',
                'restrictions' => [
                    [
                        'name' => 'max_space_usage',
                        'display_name' => 'Maximum storage space',
                        'type' => 'number',
                        'description' =>
                            'Maximum storage space all user uploads are allowed to take up (in bytes).',
                    ],
                ],
            ],
        ],

        'Shareable links' => [
            'links.view' => [
                'name' => 'links.view',
                'display_name' => 'View shareable links',
                'role_types' => ['users'],
                'description' => 'Allows viewing shareable links.',
            ],
            'links.create' => [
                'name' => 'links.create',
                'display_name' => 'Create shareable links',
                'role_types' => ['users'],
                'description' =>
                    'Allows creating shareable links from drive page.',
            ],
        ],

        'File requests' => [
            'file_requests.view' => [
                'name' => 'file_requests.view',
                'display_name' => 'View file requests',
                'role_types' => ['users'],
                'description' =>
                    'Allows viewing file requests and their public upload pages.',
            ],
            'file_requests.create' => [
                'name' => 'file_requests.create',
                'display_name' => 'Create file requests',
                'role_types' => ['users'],
                'description' =>
                    'Allows requesting files from other people via a public link.',
            ],
        ],

        'Workspaces' => [
            [
                'name' => 'workspaces.create',
                'display_name' => 'Create workspaces',
                'role_types' => ['users'],
                'description' =>
                    'Allow creating new workspaces from drive page.',
                'restrictions' => [
                    [
                        'name' => 'count',
                        'display_name' => 'Count',
                        'type' => 'number',
                        'description' => __('policies.count_description', [
                            'resources' => 'workspaces',
                        ]),
                    ],
                    [
                        'name' => 'member_count',
                        'display_name' => 'Member count',
                        'type' => 'number',
                        'description' =>
                            'Maximum number of members workspace is allowed to have.',
                    ],
                ],
            ],
        ],

        'REST API' => [
            [
                'name' => 'api.access',
                'display_name' => 'REST API',
                'role_types' => ['users'],
                'description' =>
                    'Allow usage of REST API and accessing API section in account settings page.',
            ],
        ],

        'Admin' => [
            [
                'name' => 'admin.access',
                'display_name' => 'Access admin area',
                'role_types' => ['users'],
                'description' =>
                    'Required in order to access any admin area page.',
            ],
            [
                'name' => 'admin',
                'display_name' => 'Super admin',
                'role_types' => ['users'],
                'description' => 'Gives full permissions.',
            ],
            [
                'name' => 'reports.view',
                'display_name' => 'View reports',
                'role_types' => ['users'],
                'description' => 'Allow viewing reports.',
            ],
            [
                'name' => 'settings.update',
                'display_name' => 'Manage settings',
                'role_types' => ['users'],
                'description' => 'Allow settings management from admin area.',
            ],
            [
                'name' => 'roles.update',
                'display_name' => 'Role management',
                'role_types' => ['users'],
                'description' => 'Allow role management from admin area.',
            ],
            [
                'name' => 'subscriptions.update',
                'display_name' => 'Manage subscriptions',
                'description' =>
                    'Allow subscription and plan management from admin area.',
                'role_types' => ['users'],
            ],
            [
                'name' => 'localizations.update',
                'display_name' => 'Manage localizations',
                'description' =>
                    'Allow localization management from admin area.',
                'role_types' => ['users'],
            ],
            [
                'name' => 'files.update',
                'display_name' => 'Manage files',
                'role_types' => ['users'],
                'description' => 'Allow file management from admin area.',
            ],
            [
                'name' => 'tags.update',
                'display_name' => 'Manage tags',
                'role_types' => ['users'],
                'description' => 'Allow tag management from admin area.',
            ],
            [
                'name' => 'users.update',
                'display_name' => 'Manage users',
                'role_types' => ['users'],
                'description' => 'Allow user management from admin area.',
            ],
            [
                'name' => 'workspaces.update',
                'display_name' => 'Manage workspaces',
                'role_types' => ['users'],
                'description' => 'Allow workspace management from admin area.',
            ],
            [
                'name' => 'custom_pages.update',
                'display_name' => 'Manage custom pages',
                'role_types' => ['users'],
                'description' =>
                    'Allow custom page management from admin area.',
            ],
        ],

        'Workspace members' => [
            [
                'name' => 'workspace_members.invite',
                'display_name' => 'Invite Members',
                'role_types' => ['workspace'],
                'description' =>
                    'Allow user to invite new members into a workspace.',
            ],
            [
                'name' => 'workspace_members.update',
                'display_name' => 'Update Members',
                'role_types' => ['workspace'],
                'description' => 'Allow user to change role of other members.',
            ],
            [
                'name' => 'workspace_members.delete',
                'display_name' => 'Delete Members',
                'role_types' => ['workspace'],
                'description' => 'Allow user to remove members from workspace.',
            ],
        ],

        'Workspace files' => [
            [
                'name' => 'files.view',
                'display_name' => 'View files',
                'role_types' => ['workspace'],
                'description' => 'Allow user to view workspace files.',
            ],
            [
                'name' => 'files.create',
                'display_name' => 'Upload files',
                'role_types' => ['workspace'],
                'description' => 'Allow user to upload files into a workspace.',
            ],
            [
                'name' => 'files.download',
                'display_name' => 'Download files',
                'role_types' => ['workspace'],
                'description' =>
                    'Allow user to download workspace files uploaded by other members.',
            ],
            [
                'name' => 'files.update',
                'display_name' => 'Edit files',
                'role_types' => ['workspace'],
                'description' =>
                    'Allow user to edit workspace files uploaded by other members.',
            ],
            [
                'name' => 'files.delete',
                'display_name' => 'Delete files',
                'role_types' => ['workspace'],
                'description' =>
                    'Allow user to delete workspace files uploaded by other members.',
            ],
        ],
    ],
];
