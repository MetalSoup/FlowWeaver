<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

/**
 * Base application controller.
 *
 * @mixin \Illuminate\Foundation\Auth\Access\AuthorizesRequests
 */
class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    /**
     * Tell static analysis that authorize() is available (provided by the AuthorizesRequests trait).
     *
     * @method mixed authorize(string $ability, array|mixed $arguments = [])
     */
    // rely on the AuthorizesRequests trait's authorize() method at runtime
}
