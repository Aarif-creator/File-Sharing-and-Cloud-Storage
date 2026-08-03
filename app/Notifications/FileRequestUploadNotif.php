<?php

namespace App\Notifications;

use App\Models\User;
use Common\Notifications\GetsUserPreferredChannels;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;

class FileRequestUploadNotif extends Notification implements ShouldQueue
{
    use Queueable, GetsUserPreferredChannels;

    public const NOTIF_ID = 'A02';

    public function __construct(
        public string $requestTitle,
        public string $folderHash,
        public string $uploaderName,
        public string $fileName,
    ) {}

    public function toMail(User $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject(
                __('New file uploaded to :title', [
                    'title' => $this->requestTitle,
                ]),
            )
            ->line($this->getFirstLine())
            ->line('- ' . $this->fileName)
            ->action(__('View now'), url("drive/folders/{$this->folderHash}"));
    }

    public function toFcm($notifiable)
    {
        return FcmMessage::create()
            ->setData([
                'notifId' => self::NOTIF_ID,
                'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
            ])
            ->setNotification(
                FcmNotification::create()
                    ->setTitle($this->getFirstLine())
                    ->setBody($this->fileName),
            );
    }

    public function toArray(User $notifiable): array
    {
        return [
            'mainAction' => [
                'action' => "/drive/folders/{$this->folderHash}",
            ],
            'lines' => [
                [
                    'content' => $this->getFirstLine(),
                ],
                [
                    'icon' => 'file',
                    'content' => $this->fileName,
                    'action' => [
                        'action' => "/drive/folders/{$this->folderHash}",
                    ],
                ],
            ],
        ];
    }

    private function getFirstLine(): string
    {
        return __(':username uploaded a file to ":title"', [
            'username' => $this->uploaderName,
            'title' => $this->requestTitle,
        ]);
    }
}
