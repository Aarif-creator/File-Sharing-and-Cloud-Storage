<?php

namespace App\Notifications;

use App\Models\FileRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FileRequestLinkNotif extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public FileRequest $fileRequest,
        public string $senderName,
    ) {}

    /**
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * @param  mixed  $notifiable
     */
    public function toMail($notifiable): MailMessage
    {
        $data = [
            'sender' => ucfirst($this->senderName),
            'title' => $this->fileRequest->title,
            'siteName' => config('app.name'),
        ];

        $message = (new MailMessage())
            ->subject(__(':sender requested files from you', $data))
            ->line(
                __(
                    ':sender asked you to upload files for ":title" on :siteName.',
                    $data,
                ),
            );

        if ($this->fileRequest->description) {
            $message->line($this->fileRequest->description);
        }

        $message->action(
            __('Upload files'),
            url("drive/r/{$this->fileRequest->hash}"),
        );

        if ($this->fileRequest->password !== null) {
            $message->line(
                __(
                    'This request is password protected. The sender will share the password with you separately.',
                ),
            );
        }

        if ($this->fileRequest->deadline) {
            $message->line(
                __('Please upload your files before :deadline.', [
                    'deadline' => $this->fileRequest->deadline->toFormattedDateString(),
                ]),
            );
        }

        return $message;
    }
}
