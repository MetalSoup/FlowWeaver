<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Flow extends Model
{
    use SoftDeletes, HasFactory;

    protected $fillable = [
        'name',
        'instance_id',
        'sequence',
    ];


    public function runNext($sequence, mixed $position): void
    {

        if (!empty($sequence[$position]['runFunction'])) {
            $sequence[$position]['runFunction']($sequence, $position);
        } else {
            echo 'nothing to do<br>';
        }
    }


    static function doBranch($node, $edges, $nodes): void
    {
        //do branch stuff
        echo "running branch " . $node->first()['id'] . "<br>";

        //find next edge and run next node function
        $next_edge = $edges->where('source', $node->first()['id'])->where('sourceHandle', 'next');
        if (!empty($next_edge->first()['target']))
        {
            $next_node = $nodes->where('id', $next_edge->first()['target']);
            self::runNodeFunction($next_node, $edges, $nodes);
        }
    }

    static function doComparison($node, $edges, $nodes): bool
    {
        //do comparison stuff
        dump($node);


        echo "running comparison " . $node->first()['id'] . "<br>";
        return true;

        //comparison should only return true or false

    }


    static function doWebhook($node, $edges, $nodes): void
    {
        //do webhook stuff


        echo "running webhook: " . $node->first()['data']['url'] . "<br>";



        //find next edge and run next node function
        $next_edge = $edges->where('source', $node->first()['id'])->where('sourceHandle', 'next');
        if (!empty($next_edge->first()['target']))
        {
            $next_node = $nodes->where('id', $next_edge->first()['target']);
            self::runNodeFunction($next_node, $edges, $nodes);
        }
    }


    public static function runNodeFunction($node, $edges, $nodes): void
    {

        //dump($node->first()['type']);

        if(!empty($node->first()['type'])){
            //echo $node->first()['type'] . "<br>";
            $function = "do" . $node->first()['type'];
            self::$function($node, $edges, $nodes);
        }
        else {
            echo "no function to runlkl";
        };




    }


    function branch($sequence, $position = 0): void
    {
        if ($sequence[$position]['branchCondition']) {
            runNext($sequence, $sequence[$position]['trueRunFunction']);
        } else {
            runNext($sequence, $sequence[$position]['falseRunFunction']);
        }


    }


    public function instance(): BelongsTo
    {
        return $this->belongsTo(Instance::class);
    }

    protected function casts()
    {
        return [
            'sequence' => 'array',
        ];
    }
}
