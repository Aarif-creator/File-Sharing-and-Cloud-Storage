<?php

namespace App\Http\Controllers;

use Common\API\ExcludeRoutesFromPublicDocs;
use Common\Billing\Models\Product;
use Common\Billing\Products\ProductResource;
use Common\Core\Rendering\RendersClientSideApp;
use Illuminate\Routing\Controller;

/**
 * @tags Landing Page
 */
#[ExcludeRoutesFromPublicDocs]
class LandingPageController extends Controller
{
    use RendersClientSideApp;

    /**
     * Show the landing page.
     *
     * @operationId showLandingPage
     */
    public function __invoke()
    {
        $products = Product::query()
            ->with(['permissions', 'prices'])
            ->orderBy('position', 'asc')
            ->simplePaginate(15);

        return $this->clientSideOrPrerenderedResponse([
            'pageName' => 'landing-page',
            'loader' => 'landingPage',
            'data' => [
                'sections' => settings('landingPage.sections'),
                'products' => ProductResource::collection($products)
                    ->response(request())
                    ->getData(true),
            ],
        ]);
    }
}
