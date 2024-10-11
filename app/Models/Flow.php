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


    //first check if branch condition has an override.
/*        dump($node->first()['id']);
        dump($edges);*/



        $booleanOverride = $edges->where('target', $node->first()['id'])->where('targetHandle', $node->first()['id'].'-boolean-override');

        if (!empty($booleanOverride->first()['source']))
        {
            $comparisonNode = $nodes->where('id', $booleanOverride->first()['source']);
            $branch_condition = self::doComparison($comparisonNode, $edges, $nodes);
        }

         else {
            // dd($node->first()['data']);

             $branch_condition = $node->first()['data']['isTrue'];
         }


         if($branch_condition){
             $next_edge = $edges->where('source', $node->first()['id'])->where('sourceHandle', 'trueNext');
         }
         else {
             $next_edge = $edges->where('source', $node->first()['id'])->where('sourceHandle', 'falseNext');
         }
        if (!empty($next_edge->first()['target']))
        {
            $next_node = $nodes->where('id', $next_edge->first()['target']);
            self::runNodeFunction($next_node, $edges, $nodes);
        }
    }

    static function doComparison($node, $edges, $nodes): bool
    {
        //do comparison stuff

        //todo: get left and right overrides. If not set, get from node data as below



        $leftComparand = $node->first()['data']['leftComparand'];
        $rightComparand = $node->first()['data']['rightComparand'];
        $operator = $node->first()['data']['operator'];
        // do comparison and return true or false
        return match ($operator) {
            '==' => $leftComparand == $rightComparand,
            '!=' => $leftComparand != $rightComparand,
            '>' => $leftComparand > $rightComparand,
            '<' => $leftComparand < $rightComparand,
            '>=' => $leftComparand >= $rightComparand,
            '<=' => $leftComparand <= $rightComparand,
            'regex' => preg_match('/'.trim($rightComparand,'/').'/', $leftComparand), // todo make sure this works as expected
            default => false,
        };


    }


    static function doWebhook($node, $edges, $nodes): void
    {
        //do webhook stuff





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
        echo "running node function: " . $node->first()['type'] . $node->first()['id'] ."<br>";

        if(!empty($node->first()['type'])){
            //echo $node->first()['type'] . "<br>";
            $function = "do" . $node->first()['type'];
            //check if function exists before running it
            if (method_exists('App\Models\Flow', $function)) {
                self::$function($node, $edges, $nodes);
            }
            else {
                echo "Function ".$function." doesn't exist";
            }


        }
        else {
            echo "no function to run";
        }




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
