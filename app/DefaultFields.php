<?php
namespace App;

use App\Models\Page;
use Illuminate\Support\Collection;

class DefaultFields
{

    static array $Fields = [
        ['id' => 2, 'name' => 'first_name', 'label' => 'First Name', 'type' => 'text'],
        ['id' => 3, 'name' => 'last_name', 'label' => 'Last Name', 'type' => 'text'],
        ['id' => 4, 'name' => 'email', 'label' => 'Email', 'type' => 'email'],
        ['id' => 5, 'name' => 'phone', 'label' => 'Phone', 'type' => 'tel'],
        ['id' => 6, 'name' => 'address', 'label' => 'Address', 'type' => 'text'],
        ['id' => 7, 'name' => 'street', 'label' => 'Street', 'type' => 'text'],
        ['id' => 8, 'name' => 'city', 'label' => 'City', 'type' => 'text'],
        ['id' => 9, 'name' => 'state', 'label' => 'State', 'type' => 'text'],
        ['id' => 10, 'name' => 'zip', 'label' => 'Zip', 'type' => 'text'],
        ['id' => 11, 'name' => 'country', 'label' => 'Country', 'type' => 'text'],
        ['id' => 12, 'name' => 'company', 'label' => 'Company', 'type' => 'text'],
        ['id' => 13, 'name' => 'title', 'label' => 'Title', 'type' => 'text'],
        ['id' => 14, 'name' => 'website', 'label' => 'Website', 'type' => 'url'],
        ['id' => 15, 'name' => 'dob', 'label' => 'Date of Birth', 'type' => 'date'],
        ];

    public static function getFields(): Collection
    {
        return collect(self::$Fields);
    }
}

