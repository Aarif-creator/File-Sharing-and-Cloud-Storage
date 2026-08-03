<?php

use App\Notifications\FileRequestUploadNotif;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Ramsey\Uuid\Uuid;

return new class extends Migration {
    public function up(): void
    {
        $notifId = FileRequestUploadNotif::NOTIF_ID;

        $config = require resource_path('defaults/notification-settings.php');

        $channels = json_encode(
            collect($config['available_channels'])->mapWithKeys(
                fn($channel) => [$channel => true],
            ),
        );

        DB::table('users')
            ->select('id')
            ->orderBy('id')
            ->chunk(500, function ($users) use ($notifId, $channels) {
                $alreadySubscribed = DB::table('notification_subscriptions')
                    ->where('notif_id', $notifId)
                    ->whereIn('user_id', $users->pluck('id'))
                    ->pluck('user_id')
                    ->flip();

                $rows = $users
                    ->reject(fn($user) => $alreadySubscribed->has($user->id))
                    ->map(
                        fn($user) => [
                            'id' => Uuid::uuid4(),
                            'notif_id' => $notifId,
                            'channels' => $channels,
                            'user_id' => $user->id,
                        ],
                    )
                    ->values()
                    ->all();

                if ($rows) {
                    DB::table('notification_subscriptions')->insert($rows);
                }
            });
    }

    public function down(): void
    {
        DB::table('notification_subscriptions')
            ->where('notif_id', FileRequestUploadNotif::NOTIF_ID)
            ->delete();
    }
};
