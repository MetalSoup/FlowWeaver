<?php

namespace App\Helpers;

class SiteContext
{
    protected static ?int $siteId = null;

    public static function set(?int $siteId): void
    {
        self::$siteId = $siteId;
    }

    public static function get(): ?int
    {
        return self::$siteId;
    }

    public static function clear(): void
    {
        self::$siteId = null;
    }
}

