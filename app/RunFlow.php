<?php

namespace App;

use App\Models\Field;
use App\Models\Page;
use Illuminate\Support\Collection;

class RunFlow
{
    static array $loop = [];
    static array $customVariables = [];
    static array $nodeOutputs = [];
    static Collection $edges;
    static Collection $nodes;
    static ?Collection $data;
    static array $returnData;

    protected Collection $first_node;

    public function __construct(
        Collection $first_node,
        Collection $edges,
        Collection $nodes,
        ?Collection $data = null
    )
    {
        $this->first_node = $first_node;
        self::$edges = $edges;
        self::$nodes = $nodes;
        self::$data = $data ?? collect();
        // do NOT automatically run in constructor; provide explicit run() so callers can get return data
    }

    /**
     * Execute the flow and return collected outputs and data.
     *
     * @return array{nodeOutputs: array, data: ?Collection, customVariables: array}
     */
    public function run(): array
    {
        // start execution from the provided first node
        self::runNodeFunction($this->first_node);

        return self::$returnData;
    }

    /**
     *
     *
     * <h1>runNode function</h1>
     * This function runs the function associated with the node passed to it, if the function exists.
     * It also checks if the node is in a loop, and if so, exits the function if it has looped too many times.
     *
     *
     *
     *
     **/

    public static function runNodeFunction($node): void
    {
        if (!$node) {
            self::$returnData[] = ['error' => 'no node specified'];
        }
        // exit if node is in loop array more than 10 times
        self::$loop[] = self::nodeID($node);

        if (count(array_keys(self::$loop, self::nodeID($node))) > 10) {
            echo "Loop detected - exiting";
            self::$returnData['errors'][] = ['error' => 'loop detected'];
        }


        if (!empty($node->first()['type'])) {

            //if node type is form and data is set, use doFormSubmit
            if($node->first()['type'] == 'Form' && !empty(self::$data)){
                echo "running form submit function: ".self::nodeID($node)."<br>";
                $function = "do".$node->first()['type']."Submit";
            }
            else
            {
                $function = "do".$node->first()['type'];
                echo "running function: ".$node->first()['type']." - ".self::nodeID($node)."<br>";
            }


            //$function = "do".$node->first()['type'];

            if (method_exists(self::class, $function)) {
                self::$function($node);
            } else {
                self::$returnData['errors'][] = 'function '.$function.' does not exist';
            }
        } else {
            self::$returnData['errors'][] = ['error' => 'no function to run'];
        }
    }


    /**
     *
     *
     * <h1>runReturnFunction</h1>
     * This function runs the function associated with the node passed to it, if the function exists and returns the result
     *
     *
     *
     *
     **/
    public static function runReturnFunction($node): mixed
    {
        echo "running return function: ".$node->first()['type']." - ".self::nodeID($node)."<br>";
        $function = "return".$node->first()['type'];
        if (method_exists('App\RunFlow', $function)) {
            return self::$function($node);
        } else {
            return "Function ".$function." doesn't exist";
            //return null;

        }
    }


    static function doFormSubmit($node): void
    {
        $request = self::$data->get('request');
        $submission = self::$data->get('submission');

        $existing = $submission->data ?? [];
        $incoming = $request['data'] ?? [];
        if (!is_array($existing)) $existing = [];
        if (!is_array($incoming)) $incoming = [];

        $merged = array_merge($existing, $incoming);

        $submission->data = $merged;
        if (isset($request['step'])) {
            $submission->step = $request['step'];
        }
        if (isset($request['flow_id'])) {
            $submission->flow_id = $request['flow_id'];
        }
        // If email/phone provided at top-level or inside data, update them on the submission.
        $upEmail = $request['email'] ?? ($request['data']['email'] ?? null);
        $upPhone = $request['phone'] ?? ($request['data']['phone'] ?? null);
        if ($upEmail !== null) {
            $submission->email = $upEmail;
        }
        if ($upPhone !== null) {
            $submission->phone = $upPhone;
        }
        $submission->save();

        // Refresh session submission_id in case it wasn't already present or to extend its life
        session()->put('submission_id', $submission->id);

        self::$returnData = [
            'success' => true, 'submission_id' => $submission->id,'submission' => $submission];

        self::$data = null;




        $next_edge = self::getNextEdge($node);
        if ($next_node = self::getNextNode($next_edge)) {
            self::runNodeFunction($next_node);
        }

    }


    static function doForm($node): void
    {

            self::$returnData['nextStep'] = $node->first()['id'] ?? null;

    }


    static function doRawHtml ($node): void
    {
        // do form will just return which form to show next.

            self::$returnData['nextStep'] = $node->first()['id'] ?? null;

    }


    /**
     *
     *
     * <h1>doWebhook function</h1>
     *
     *
     **/
    static function doWebhook($node): void
    {
        $edges = self::$edges;
        $nodes = self::$nodes;

        $url = $node->first()['data']['url'] ?? "";
        $method = $node->first()['data']['method'] ?? 'POST';
        $fields = $node->first()['data']['fields'];
        $headers = $node->first()['data']['headers'] ?? [];
        $sendAsJson = $node->first()['data']['sendAsJson'] ?? false;
        $isSoap = $node->first()['data']['isSoap'] ?? false;

        $data = [];

        foreach ($fields as $key => $field) {
            $connectedEdges = $edges->where('targetHandle', self::nodeID($node).'-value_'.$key) ?? false;
            if ($connectedEdges) {
                $source = $connectedEdges->first()['sourceHandle'] ?? false;
                if ($source) {
                    if (empty(self::$nodeOutputs[$source])) {
                        $sourceNode = $nodes->where('id', $connectedEdges->first()['source']);
                        if ($sourceNode->first()['type'] == 'GetVariable') {
                            $variable = $sourceNode->first()['data']['variableName'];
                            $data[$field['key']] = self::getVariable($variable);
                        }
                    } else {
                        $data[$field['key']] = self::$nodeOutputs[$source];
                    }
                } else {
                    $data[$field['key']] = $field['value'];
                }
            }
        }

        $client = new \GuzzleHttp\Client(['verify' => false]);
        $headers_array = [];
        foreach ($headers as $header) {
            if (!empty($header['key'])) {
                $headers_array[$header['key']] = $header['value'];
            }

        }

        if ($isSoap) {
            $soapBody = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>';
            foreach ($data as $key => $value) {
                $soapBody .= "<$key>$value</$key>";
            }
            $soapBody .= '</soap:Body></soap:Envelope>';

            $headers_array['Content-Type'] = 'text/xml; charset=utf-8';
            $parameters = ['headers' => $headers_array, 'body' => $soapBody];
        } else {
            if ($method == 'GET') {
                $parameters = ['headers' => $headers_array, 'query' => $data];
            } else {
                if ($sendAsJson) {
                    $parameters = ['headers' => $headers_array, 'json' => $data];
                } else {
                    $parameters = ['headers' => $headers_array, 'form_params' => $data];
                }
            }
        }

        try {
            $res = $client->request($method, $url, $parameters);
            $result = $res->getBody()->getContents();
        } catch (\GuzzleHttp\Exception\GuzzleException $e) {
            $result = "error:".$e->getMessage();
        }

        if (str_starts_with($result, '<?xml')) {
            $xml = simplexml_load_string($result);
            $result = json_encode($xml);
        }

        if (json_decode($result)) {
            $result = json_decode($result);
        }

        self::$nodeOutputs[$node->first()['id'].'-response'] = $result;
        $output_edges = $edges->where('source', self::nodeID($node))->where('sourceHandle',
            self::nodeID($node).'-response');
        if (!empty($output_edges->first()['target'])) {
            foreach ($output_edges as $output_edge) {
                $output_node = $nodes->where('id', $output_edge['target']);
                if ($output_node->first()['type'] == 'SetVariable') {
                    self::setVariable($output_node->first()['data']['variableName'], $result);
                }
            }
        }

        $next_edge = self::getNextEdge($node);
        if ($next_node = self::getNextNode($next_edge)) {
            self::runNodeFunction($next_node);
        }
    }


    /**
     *
     *
     * <h1>getNextEdge function</h1>
     * This function returns the edge that is connected to the "next" handle in the node.
     *
     *
     **/
    public static function getNextEdge($node): Collection
    {

      /*  dump("getting next edge for node: ".self::nodeID($node));
        dump(self::nodeID($node).'-next');
        dd(self::$edges);*/
        return self::$edges->where('source', self::nodeID($node))->whereIn('sourceHandle', [self::nodeID($node).'-next' , 'next']);

    }


    /**
     *
     *
     * <h1>getOverrodeEdge function</h1>
     * This function returns the edge that is connected to the "override" handle of a variable.
     *
     *
     **/
    public static function getOverrideEdge($node, $targetHandle): Collection
    {
        return self::$edges->where('target', self::nodeID($node))->where('targetHandle', $targetHandle);
    }
    /*    {
            return self::$edges->where('source', $node->first()['id'])->where('sourceHandle', $node->first()['id'] . '-next');

        }*/


    /**
     *
     *
     * <h1>getNextNode function</h1>
     * This function returns the node that is connected to the "nextEdge".
     *
     *
     **/
    public static function getNextNode($nextEdge): ?Collection
    {

        if (!empty($nextEdge->first()['target'])) {
            return self::$nodes->where('id', $nextEdge->first()['target']);
        } else {
            return null;
        }


    }


    /**
     *
     *
     * <h1>doBranch function</h1>
     *
     *
     **/
    static function doBranch($node): void
    {

        if ($OverrideEdge = self::getOverrideEdge($node, "boolean-override")->first()) {
            $overrideNode = self::$nodes->where('id', $OverrideEdge['source']);
            $booleanOverride = self::runReturnFunction($overrideNode);
            //dd($booleanOverride);
            $branch_condition = $booleanOverride;


        } else {
            $branch_condition = $node->first()['data']['isTrue'];
        }

        if ($branch_condition) {
            $next_edge = self::$edges->where('source', self::nodeID($node))->where('sourceHandle', 'trueNext');
        } else {
            $next_edge = self::$edges->where('source', self::nodeID($node))->where('sourceHandle', 'falseNext');
        }

        $next_node = self::getNextNode($next_edge);
        self::runNodeFunction($next_node);

        /*     dd($next_edge);


             //dd($overrideNode);
             $booleanOverride = self::$edges->where('target', self::nodeID($node))->where('targetHandle', self::nodeID($node) . '-boolean-override');
             dd($booleanOverride);

             if (!empty($booleanOverride->first()['source']))
             {
                 //dd($booleanOverride->first()['source']);
                 $comparisonNode = self::$nodes->where('id', $booleanOverride->first()['source']);
                 //dd($comparisonNode);

                 $branch_condition = self::runReturnFunction($comparisonNode) ?? false;
                 dd($branch_condition);
                 //self::doComparison($comparisonNode, $edges, $nodes);
             }
             else
             {


                 $branch_condition = $node->first()['data']['isTrue'];
             }

             if ($branch_condition)
             {

                 $next_edge = $edges->where('source', self::nodeID($node))->where('sourceHandle', self::nodeID($node) . '-trueNext');
             }
             else
             {
                 $next_edge = $edges->where('source', self::nodeID($node))->where('sourceHandle', self::nodeID($node) . '-falseNext');
             }

             if (!empty($next_edge->first()['target']))
             {
                 $next_node = $nodes->where('id', $next_edge->first()['target']);
                 self::runNodeFunction($next_node, $edges, $nodes);
             }*/
    }


    static function returnGetVariable($node): mixed
    {
        $variableName = ($node->first()['data']['variableName']);
        if (\Session::has($variableName)) {
            return \Session::get($variableName);
        }
        return null;
    }

    // convenience wrapper for getting variables by name (used by webhooks etc)
    public static function getVariable(string $name): mixed
    {
        return \Session::get($name);
    }

    // convenience wrapper for setting variables by name
    public static function setVariable(string $name, mixed $value): void
    {
        \Session::put($name, $value);
    }


    static function doSetVariable($node): void
    {
        $variableName = $node->first()['data']['variableName'];


        //check if there is an override edge for value
        if ($valueOverrideEdge = self::getOverrideEdge($node, 'variableValue-override')->first()) {
            $valueOverrideNode = self::$nodes->where('id', $valueOverrideEdge['source']);
            $valueOverride = self::runReturnFunction($valueOverrideNode);
            $value = $valueOverride;
        } else {
            $value = $node['data']['variableValue'] ?? null;
        }

        \Session::put($variableName, $value);


        $next_edge = self::getNextEdge($node);
        if ($next_node = self::getNextNode($next_edge)) {
            self::runNodeFunction($next_node);
        }

    }


    /**
     *
     *
     * <h1>returnComparison function</h1>
     *
     *
     **/
    static function returnComparison($node): bool
    {
        $nodeData = $node->first()['data'] ?? [];

        if ($leftComparandOverrideEdge = self::getOverrideEdge($node, 'leftComparand-override')->first()) {
            $leftComparandOverrideNode = self::$nodes->where('id', $leftComparandOverrideEdge['source']);
            $leftComparandOverride = self::runReturnFunction($leftComparandOverrideNode);
            $leftComparand = $leftComparandOverride;
        } else {
            $leftComparand = $nodeData['leftComparand'];
        }

        if ($rightComparandOverrideEdge = self::getOverrideEdge($node, 'rightComparand-override')->first()) {
            $rightComparandOverrideNode = self::$nodes->where('id', $rightComparandOverrideEdge['source']);
            $rightComparandOverride = self::runReturnFunction($rightComparandOverrideNode);
            $rightComparand = $rightComparandOverride;
        } else {
            $rightComparand = $nodeData['rightComparand'];
        }


        /*dump($leftComparand);
        dump($rightComparand);*/


        $operator = $nodeData['operator'];


        return match ($operator) {
            '==' => $leftComparand == $rightComparand,
            '!=' => $leftComparand != $rightComparand,
            '>' => $leftComparand > $rightComparand,
            '<' => $leftComparand < $rightComparand,
            '>=' => $leftComparand >= $rightComparand,
            '<=' => $leftComparand <= $rightComparand,
            'regex' => preg_match('/'.trim($rightComparand, '/').'/',
                $leftComparand), // todo make sure this works as expected
            default => false,
        };


    }


    /**
     * @param $node
     * @return mixed
     */
    public static function nodeID($node): mixed
    {
        //dump($node);
        if ($node) {
            return $node->first()['id'];
        } else {
            return null;
        }

    }


}
