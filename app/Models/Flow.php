<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\AsCollection;
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

    // Ensure sequence is automatically cast to an array by Eloquent
    protected $casts = [
        'sequence' => 'array',
    ];




    static function doRawHtml($node, $edges, $nodes): void
    {

        $htmlOverride = $edges->where('target', $node->first()['id'])->where('targetHandle', $node->first()['id'] . '-html-override');
        dump($htmlOverride);


        if (!empty($htmlOverride->first()['source'])) {
            $sourceNode = $nodes->where('id', $htmlOverride->first()['source']);
            dump($sourceNode);
        } else {

            echo $node->first()['data']['html'] ?? "";
        }


        $next_edge = self::getNext_edge($edges, $node);
        if (!empty($next_edge->first()['target'])) {
            $next_node = $nodes->where('id', $next_edge->first()['target']);
            self::runNodeFunction($next_node, $edges, $nodes);
        }
    }

    /**
     * @param $edges
     * @param $node
     * @return mixed
     */
    public static function getNext_edge($edges, $node)
    {
        $next_edge = $edges->where('source', $node->first()['id'])->where('sourceHandle', $node->first()['id'].'-next');
        return $next_edge;
    }


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

        $booleanOverride = $edges->where('target', $node->first()['id'])->where('targetHandle', $node->first()['id'] . '-boolean-override');

        if (!empty($booleanOverride->first()['source'])) {
            //dd($booleanOverride->first()['source']);
            $comparisonNode = $nodes->where('id', $booleanOverride->first()['source']);
            //dd($comparisonNode);

            $branch_condition = self::runReturnFunction($comparisonNode) ?? false;
            dd($branch_condition);
            //self::doComparison($comparisonNode, $edges, $nodes);
        } else {


            $branch_condition = $node->first()['data']['isTrue'];
        }

        if ($branch_condition) {

            $next_edge = $edges->where('source', $node->first()['id'])->where('sourceHandle', $node->first()['id'] . '-trueNext');
        } else {
            $next_edge = $edges->where('source', $node->first()['id'])->where('sourceHandle', $node->first()['id'] . '-falseNext');
        }

        if (!empty($next_edge->first()['target'])) {
            $next_node = $nodes->where('id', $next_edge->first()['target']);
            self::runNodeFunction($next_node, $edges, $nodes);
        }
    }




    static function getVariable($name): mixed
    {
        // check variable in session first.
        if (\Session::has('customVariables')) {
            self::$customVariables = \Session::get('customVariables');
        }
        return self::$customVariables[$name];
    }




    public static function runReturnFunction($connected_node, $edges,$nodes): mixed
    {
        $function = "return" . $connected_node->first()['type'];
        if (method_exists('App\Models\Flow', $function)) {
            return self::$function($connected_node);
        } else {
            return null;
        }
    }


    function branch($sequence, $position = 0): void
    {
        if ($sequence[$position]['branchCondition']) {
            self::runNext($sequence, $sequence[$position]['trueRunFunction']);
        } else {
            self::runNext($sequence, $sequence[$position]['falseRunFunction']);
        }


    }


    public function instance(): BelongsTo
    {
        return $this->belongsTo(Instance::class);
    }

}
