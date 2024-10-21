<?php

namespace App;

use App\Models\Page;
use Illuminate\Support\Collection;

class RunFlow
{
    static array $loop = [];
    static array $customVariables = [];
    static array $nodeOutputs = [];
    static Collection $edges;
    static Collection $nodes;

    public function __construct(
        protected Collection $first_node,
        Collection           $edges,
        Collection           $nodes
    )
    {
        self::$edges = $edges;
        self::$nodes = $nodes;
        self::runNodeFunction($first_node);
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
        // exit if node is in loop array more than 10 times
        self::$loop[] = self::nodeID($node);

        if (count(array_keys(self::$loop, self::nodeID($node))) > 10)
        {
            echo "Loop detected - exiting";
            return;
        }

        echo "running node function: " . $node->first()['type'] . " - " . self::nodeID($node) . "<br>";

        if (!empty($node->first()['type']))
        {
            $function = "do" . $node->first()['type'];

            if (method_exists(self::class, $function))
            {
                self::$function($node);
            }
            else
            {
                echo "Function " . $function . " doesn't exist";
            }
        }
        else
        {
            echo "no function to run";
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
        echo "running return function: " . $node->first()['type'] . " - " . self::nodeID($node) . "<br>";
        $function = "return" . $node->first()['type'];
        if (method_exists('App\RunFlow', $function)) {
            return self::$function($node);
        } else {
            return "Function " . $function . " doesn't exist";
            //return null;

        }
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

        foreach ($fields as $key => $field)
        {
            $connectedEdges = $edges->where('targetHandle', self::nodeID($node) . '-value_' . $key) ?? false;
            if ($connectedEdges)
            {
                $source = $connectedEdges->first()['sourceHandle'] ?? false;
                if ($source)
                {
                    if (empty(self::$nodeOutputs[$source]))
                    {
                        $sourceNode = $nodes->where('id', $connectedEdges->first()['source']);
                        if ($sourceNode->first()['type'] == 'GetVariable')
                        {
                            $variable = $sourceNode->first()['data']['variableName'];
                            $data[$field['key']] = self::getVariable($variable);
                        }
                    }
                    else
                    {
                        $data[$field['key']] = self::$nodeOutputs[$source];
                    }
                }
                else
                {
                    $data[$field['key']] = $field['value'];
                }
            }
        }

        $client = new \GuzzleHttp\Client(['verify' => false]);
        $headers_array = [];
        foreach ($headers as $header)
        {
            if(!empty($header['key']))
            {
                $headers_array[$header['key']] = $header['value'];
            }

        }

        if ($isSoap)
        {
            $soapBody = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>';
            foreach ($data as $key => $value)
            {
                $soapBody .= "<$key>$value</$key>";
            }
            $soapBody .= '</soap:Body></soap:Envelope>';

            $headers_array['Content-Type'] = 'text/xml; charset=utf-8';
            $parameters = ['headers' => $headers_array, 'body' => $soapBody];
        }
        else
        {
            if ($method == 'GET')
            {
                $parameters = ['headers' => $headers_array, 'query' => $data];
            }
            else
            {
                if ($sendAsJson)
                {
                    $parameters = ['headers' => $headers_array, 'json' => $data];
                }
                else
                {
                    $parameters = ['headers' => $headers_array, 'form_params' => $data];
                }
            }
        }

        try
        {
            $res = $client->request($method, $url, $parameters);
            $result = $res->getBody()->getContents();
        } catch (\GuzzleHttp\Exception\GuzzleException $e)
        {
            $result = "error:" . $e->getMessage();
        }

        if (str_starts_with($result, '<?xml'))
        {
            $xml = simplexml_load_string($result);
            $result = json_encode($xml);
        }

        if (json_decode($result))
        {
            $result = json_decode($result);
        }

        self::$nodeOutputs[$node->first()['id'] . '-response'] = $result;
        $output_edges = $edges->where('source', self::nodeID($node))->where('sourceHandle', self::nodeID($node) . '-response');
        if (!empty($output_edges->first()['target']))
        {
            foreach ($output_edges as $output_edge)
            {
                $output_node = $nodes->where('id', $output_edge['target']);
                if ($output_node->first()['type'] == 'SetVariable')
                {
                    self::setVariable($output_node->first()['data']['variableName'], $result);
                }
            }
        }

        $next_edge = self::getNextEdge($node);
        if ($next_node = self::getNextNode($next_edge))
        {
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
    public static function getNextEdge($node)
    {
        return self::$edges->where('source', self::nodeID($node))->where('sourceHandle', self::nodeID($node) . '-next');

    }



    /**
     *
     *
     * <h1>getOverrodeEdge function</h1>
     * This function returns the edge that is connected to the "override" handle of a variable.
     *
     *
     **/
    public static function getOverrideEdge($node, $targetHandle) : Collection
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
    public static function getNextNode($nextEdge) : ?Collection
    {

        if (!empty($nextEdge->first()['target']))
        {
            return self::$nodes->where('id', $nextEdge->first()['target']);
        }
        else
        {
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

        if($OverrideEdge = self::getOverrideEdge($node, "boolean-override")->first())
        {
            $overrideNode = self::$nodes->where('id', $OverrideEdge['source']);
            $booleanOverride = self::runReturnFunction($overrideNode);
            //dd($booleanOverride);
            $branch_condition = $booleanOverride;


        }
        else
        {
            $branch_condition = $node->first()['data']['isTrue'];
        }

        if ($branch_condition)
        {
            $next_edge = self::$edges->where('source', self::nodeID($node))->where('sourceHandle', self::nodeID($node) . '-trueNext');
        }
        else
        {
            $next_edge = self::$edges->where('source', self::nodeID($node))->where('sourceHandle', self::nodeID($node) . '-falseNext');
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



    static function doSetVariable($node): void
    {
        $variableName = $node->first()['data']['variableName'];


        //check if there is an override edge for value
        if($valueOverrideEdge = self::getOverrideEdge($node, 'variableValue-override')->first())
        {
            $valueOverrideNode = self::$nodes->where('id', $valueOverrideEdge['source']);
            $valueOverride = self::runReturnFunction($valueOverrideNode);
            $value = $valueOverride;
        }
        else
        {
            $value = $node->first()['data']['variableValue'];
        }

        \Session::put($variableName, $value);


        $next_edge = self::getNextEdge($node);
        if ($next_node = self::getNextNode($next_edge))
        {
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

        if($leftComparandOverrideEdge = self::getOverrideEdge($node, 'leftComparand-override')->first())
        {
            $leftComparandOverrideNode = self::$nodes->where('id', $leftComparandOverrideEdge['source']);
            $leftComparandOverride = self::runReturnFunction($leftComparandOverrideNode);
            $leftComparand = $leftComparandOverride;
        }
        else
        {
            $leftComparand = $nodeData['leftComparand'];
        }

        if($rightComparandOverrideEdge = self::getOverrideEdge($node, 'rightComparand-override')->first())
        {
            $rightComparandOverrideNode = self::$nodes->where('id', $rightComparandOverrideEdge['source']);
            $rightComparandOverride = self::runReturnFunction($rightComparandOverrideNode);
            $rightComparand = $rightComparandOverride;
        }
        else
        {
            $rightComparand = $nodeData['rightComparand'];
        }


        dump($leftComparand);
        dump($rightComparand);



        $operator = $nodeData['operator'];


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






    /**
     * @param $node
     * @return mixed
     */
    public static function nodeID($node): mixed
    {
        return $node->first()['id'];
    }


}
