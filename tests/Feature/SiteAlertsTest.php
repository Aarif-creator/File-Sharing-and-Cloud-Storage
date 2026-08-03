<?php

namespace Tests\Feature;

use Common\Admin\SiteAlertsController;
use Tests\TestCase;

class SiteAlertsTest extends TestCase
{
    public function test_site_alerts_do_not_include_missing_license_warning(): void
    {
        config()->set('app.demo', false);
        config()->set('app.envato_purchase_code', null);
        config()->set('modules', []);

        $response = (new SiteAlertsController())->index();

        $this->assertSame([], $response->getData(true)['alerts']);
    }
}
