<?php
namespace App;

use App\Models\Page;
use Illuminate\Support\Collection;

class DefaultFields
{

    static array $Fields = [
        ['id' => 2, 'name' => 'first_name', 'label' => 'First Name'],
        ['id' => 3, 'name' => 'last_name', 'label' => 'Last Name'],
        ['id' => 4, 'name' => 'email', 'label' => 'Email'],
        ['id' => 5, 'name' => 'phone', 'label' => 'Phone'],
        ['id' => 6, 'name' => 'address', 'label' => 'Address'],
        ['id' => 7, 'name' => 'street', 'label' => 'Street'],
        ['id' => 8, 'name' => 'city', 'label' => 'City'],
        ['id' => 9, 'name' => 'state', 'label' => 'State'],
        ['id' => 10, 'name' => 'zip', 'label' => 'Zip'],
        ['id' => 11, 'name' => 'country', 'label' => 'Country'],
        ['id' => 12, 'name' => 'company', 'label' => 'Company'],
        ['id' => 13, 'name' => 'title', 'label' => 'Title'],
        ['id' => 14, 'name' => 'website', 'label' => 'Website'],
        ['id' => 15, 'name' => 'dob', 'label' => 'Date of Birth'],
        ];

    public static function getFields(): Collection
    {
        return collect(self::$Fields);
    }
}

