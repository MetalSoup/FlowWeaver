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

    static array $loop = [];
    static array $customVariables = [];
    static array $nodeOutputs = [];


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
            $comparisonNode = $nodes->where('id', $booleanOverride->first()['source']);
            $branch_condition = self::doComparison($comparisonNode, $edges, $nodes);
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
            'regex' => preg_match('/' . trim($rightComparand, '/') . '/', $leftComparand), // todo make sure this works as expected
            default => false,
        };


    }

    static function setVariable($name, $value): void
    {
        self::$customVariables[$name] = $value;
        \Session::put('customVariables', self::$customVariables);

    }

    static function getVariable($name): mixed
    {
        // check variable in session first.
        if (\Session::has('customVariables')) {
            self::$customVariables = \Session::get('customVariables');
        }
        return self::$customVariables[$name];
    }


    static function doWebhook($node, $edges, $nodes): void
    {
        //do webhook stuff
        $url = $node->first()['data']['url'] ?? "";
        $method = $node->first()['data']['method'] ?? 'POST';
        $fields = $node->first()['data']['fields'];
        $headers = $node->first()['data']['headers'] ?? [];
        $sendAsJson = $node->first()['data']['sendAsJson'] ?? false;

        $data = [];

        foreach ($fields as $key => $field) {
            $connectedEdges = $edges->where('targetHandle', $node->first()['id'] . '-value_' . $key) ?? false;
            if ($connectedEdges) {
                //dump($connectedEdges);
                $source = $connectedEdges->first()['sourceHandle'] ?? false;
                //dump($source);





                if ($source) {
                    if (empty(self::$nodeOutputs[$source])) {
                        $sourceNode = $nodes->where('id', $connectedEdges->first()['source']);
                        if($sourceNode->first()['type'] == 'GetVariable')
                        {
                            $variable = $sourceNode->first()['data']['variableName'];
                            $data[$field['name']] = self::getVariable($variable);
                        }
                    }
                    else
                    {

                        $data[$field['name']] = self::$nodeOutputs[$source];
                    }
                }
                else {
                    $data[$field['name']] = $field['value'];
                }

            }
        }
       // dump($data);


        //ignore security certificate

        $client = new \GuzzleHttp\Client(['verify' => false]);
        $headers_array = [];
        foreach($headers as $header)
        {
            $headers_array[$header['name']] = $header['value'];
        }
        dump($data);

        if ($method == 'GET') {
            $parameters = ['headers' => $headers_array, 'query' => $data];
        } else {
            if($sendAsJson)
            {
                $parameters = ['headers' => $headers_array, 'json' => $data];
            }
            else
            {
                $parameters = ['headers' => $headers_array, 'form_params' => $data];
            }

        }


        try {
            $res = $client->request($method, $url, $parameters);
            $result = $res->getBody()->getContents();
        } catch (\GuzzleHttp\Exception\GuzzleException $e) {

            $result = "error:".$e->getMessage();
        }
        // if result is xml convert it to json
        if (str_starts_with($result, '<?xml')) {
            $xml = simplexml_load_string($result);
            $result = json_encode($xml);
        }
        //if result is json, decode it
        if (json_decode($result)) {
            $result = json_decode($result);
        }

        dump($result);


        // find out what the output handle is connected to
        $output_edges = $edges->where('source', $node->first()['id'])->where('sourceHandle', $node->first()['id'] . '-response');
        //check if output edges has content

        self::$nodeOutputs[$node->first()['id'] . '-response'] = $result;
        if (!empty($output_edges->first()['target'])) {
            foreach ($output_edges as $output_edge) {
                $output_node = $nodes->where('id', $output_edge['target']);

                if ($output_node->first()['type'] == 'SetVariable') {
                    self::setVariable($output_node->first()['data']['variableName'], $result);
                }
            }
        }

        //dump(self::$nodeOutputs);


        //find next edge and run next node function
        $next_edge = self::getNext_edge($edges, $node);
        if (!empty($next_edge->first()['target'])) {
            $next_node = $nodes->where('id', $next_edge->first()['target']);
            self::runNodeFunction($next_node, $edges, $nodes);
        }
    }


    public static function runNodeFunction($node, $edges, $nodes): void
    {

        // exit if node is in loop array more than 10 times
        self::$loop[] = $node->first()['id'];

        if (count(array_keys(self::$loop, $node->first()['id'])) > 10) {

            echo "Loop detected - exiting";
            return;
        }


        //dump($node->first()['type']);
        echo "running node function: " . $node->first()['type'] . $node->first()['id'] . "<br>";

        if (!empty($node->first()['type'])) {
            //echo $node->first()['type'] . "<br>";
            $function = "do" . $node->first()['type'];
            //check if function exists before running it
            if (method_exists('App\Models\Flow', $function)) {
                self::$function($node, $edges, $nodes);
            } else {
                echo "Function " . $function . " doesn't exist";
            }


        } else {
            echo "no function to run";
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

    protected function casts(): array
    {
        return [
            'sequence' => 'array',
        ];
    }
}
