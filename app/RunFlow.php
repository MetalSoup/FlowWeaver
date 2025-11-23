<?php

namespace App;

use App\Models\Field;
use App\Models\Page;
use App\Models\Action;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;

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

        if(!$node){
            self::$returnData['errors'][] = ['error' => 'no node found'];
            return;
        }
        if (!empty($node->first()['type'])) {
            $type = $node->first()['type'];

            // Special handling for Form submit when runtime data is present
            if ($type === 'Form' && !empty(self::$data)) {
                $candidates = ["do{$type}Submit", "do".ucfirst(strtolower($type))."Submit"];
            } else {
                // build a list of candidate function names to tolerate different casing/wording
                $candidates = [];
                $candidates[] = "do{$type}"; // direct
                $candidates[] = "do".strtolower($type);
                $candidates[] = "do".ucfirst(strtolower($type));
                // Word-case (e.g. WebHook -> Webhook)
                $candidates[] = "do" . str_replace(' ', '', ucwords(str_replace(['_', '-'], ' ', $type)));
                // all-lower and capitalized
                $candidates[] = "do" . ucfirst(strtolower(str_replace(['_', '-'], '', $type)));
            }

            $found = false;
            foreach ($candidates as $function) {
                if (method_exists(self::class, $function)) {
                    try { Log::info("RunFlow::runNodeFunction invoking {$function} for node=".self::nodeID($node)); } catch (\Throwable $_) {}
                    self::{$function}($node);
                    $found = true;
                    break;
                }
            }

            if (! $found) {
                self::$returnData['errors'][] = 'function for node type '.$type.' does not exist';
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
        // Pull request/submission from provided run-time data. Be defensive about types so static analysis doesn't warn.
        $request = self::$data->get('request') ?? [];
        $submission = self::$data->get('submission') ?? null;
        /** @var \App\Models\Submission|null $submission */

        $existing = [];
        $incoming = [];
        if ($submission !== null && (is_array($submission) || is_object($submission))) {
            // if submission is an object with ->data, prefer that
            if (is_object($submission) && isset($submission->data)) $existing = $submission->data ?? [];
            elseif (is_array($submission) && array_key_exists('data', $submission)) $existing = $submission['data'] ?? [];
        }
        if (is_array($request)) $incoming = $request['data'] ?? [];
        // Defensive normalization: older client bundles sometimes sent submit buttons with the
        // key `field_null` (when the client fell back to `field_${null}`). Normalize that
        // into the expected `submit_button` key so downstream code sees the intended value.
        if (is_array($incoming)) {
            if (array_key_exists('field_null', $incoming) && !array_key_exists('submit_button', $incoming)) {
                $incoming['submit_button'] = $incoming['field_null'];
            }
            // also tolerate legacy `field_unknown` -> keep as-is (no overwrite)
        }
        try { Log::debug('RunFlow::doFormSubmit incoming normalized', $incoming); } catch (\Throwable $_) {}
        $merged = array_merge($existing, $incoming);

        // Persist changes only when we have a proper model object that supports those properties/methods
        if ($submission !== null && is_object($submission) && method_exists($submission, 'save')) {
            // try to write attributes defensively
            try {
                if (property_exists($submission, 'data') || isset($submission->data)) $submission->data = $merged;
                if (isset($request['step'])) $submission->step = $request['step'];
                if (isset($request['flow_id'])) $submission->flow_id = $request['flow_id'];

                $upEmail = $request['email'] ?? ($request['data']['email'] ?? null);
                $upPhone = $request['phone'] ?? ($request['data']['phone'] ?? null);
                if ($upEmail !== null) $submission->email = $upEmail;
                if ($upPhone !== null) $submission->phone = $upPhone;
                $submission->data = $merged;

                $submission->save();
                dd($submission);
                // Refresh session submission_id in case it wasn't already present or to extend its life
                session()->put('submission_id', $submission->id ?? null);

                self::$returnData = ['success' => true, 'submission_id' => $submission->id ?? null, 'submission' => $submission];
            } catch (\Throwable $ex) {
                // fallback if we can't persist submission
                self::$returnData = ['success' => true, 'submission_id' => $submission->id ?? null, 'submission' => $submission];
            }
        } else {
            // No submission object available; still return success but no persisted submission
            self::$returnData = ['success' => true, 'submission_id' => null, 'submission' => $submission];
        }

        // clear runtime data reference
        //self::$data = null;




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
        try { Log::info("RunFlow::doWebhook start - node=".self::nodeID($node)); } catch (\Throwable $_) {}
         $edges = self::$edges;
         $nodes = self::$nodes;

        // Safely read node data to avoid undefined index notices when node.data is missing
        $nodeData = $node->first()['data'] ?? [];
        if (!is_array($nodeData)) $nodeData = [];
        $url = $nodeData['url'] ?? "";
        $method = $nodeData['method'] ?? 'POST';
        $fields = $nodeData['hookFields'] ?? [];
        if (!is_array($fields)) $fields = [];
        $headers = $nodeData['headers'] ?? [];
        $sendAsJson = $nodeData['sendAsJson'] ?? false;
        $isSoap = $nodeData['isSoap'] ?? false;
        $mappings = $nodeData['mappings'] ?? [];

        $data = [];

        /*We need to get all the fields that the user has filled in so far*/

        $answers = self::$data->get('request')['data'] ?? [];




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
                    $data[$field['key']] = $answers[$field['name']] ?? "";
                }
            }
        }

        //dd($data);

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


        // Compute the actual HTTP request body string we'll send (useful to persist exactly what was sent).
        $requestBody = null;
        if (isset($parameters['body'])) {
            $requestBody = (string)$parameters['body'];
        } elseif (isset($parameters['json'])) {
            // JSON payload
            $requestBody = json_encode($parameters['json']);
        } elseif (isset($parameters['form_params'])) {
            // form-encoded body
            // store as urlencoded string for compactness
            $requestBody = http_build_query($parameters['form_params']);
        } elseif (isset($parameters['query'])) {
            // GET query string
            $requestBody = http_build_query($parameters['query']);
        }

        $responseHeaders = null;
        $result = null;
        $status = null;
        $durationMs = null;
        try {
            $startTime = microtime(true);
            $res = $client->request($method, $url, $parameters);
            $durationMs = round((microtime(true) - $startTime) * 1000, 2);
            $status = $res->getStatusCode();
            $result = $res->getBody()->getContents();
            // collect response headers if present
            $responseHeaders = [];
            foreach ($res->getHeaders() as $k => $v) {
                $responseHeaders[$k] = $v;
            }
        } catch (\GuzzleHttp\Exception\GuzzleException $e) {
            // Use JSON-encoded error for consistency with later json_decode attempts
            $result = json_encode(['error' => $e->getMessage()]);
            $responseHeaders = [];
            $durationMs = isset($startTime) ? round((microtime(true) - $startTime) * 1000, 2) : null;
        }

        // Keep response body raw (could be HTML/XML/JSON). Also attempt to decode JSON where appropriate.
        $decodedResult = null;
        if (is_string($result) && str_starts_with(trim($result), '<?xml')) {
            // leave XML as raw string; optionally we could store a json-encoded form but prefer raw
            $decodedResult = $result;
        } else {
            // try to decode JSON into associative array/object; if not JSON, keep raw string
            $maybeJson = json_decode($result, true);
            if (json_last_error() === JSON_ERROR_NONE && $maybeJson !== null) {
                $decodedResult = $maybeJson;
            } else {
                $decodedResult = $result;
            }
        }

        self::$nodeOutputs[$node->first()['id'].'-response'] = $decodedResult;
        // Process mappings: extract configured values and store them in nodeOutputs and optionally as variables
        foreach ($mappings as $mapping) {
            $mappingId = $mapping['id'] ?? null;
            $path = $mapping['path'] ?? null;
            $varName = $mapping['variableName'] ?? null;
            $mapType = $mapping['type'] ?? 'any';
            $handleKey = ($node->first()['id'] ?? '') . '-' . ($mappingId ?? '') . '-mapping';
            if ($mappingId && $path) {
                // prefer parsed/decoded result when extracting mapping values (supports JSON responses)
                $sourceForExtraction = $decodedResult ?? $result;
                $value = self::extractValueFromResult($sourceForExtraction, $path);
                // coerce according to mapping type
                switch ($mapType) {
                    case 'boolean':
                        if (is_string($value)) {
                            $s = strtolower(trim($value));
                            $value = ($s === 'true' || $s === '1' || $s === 'yes');
                        } else {
                            $value = (bool)$value;
                        }
                        break;
                    case 'number':
                        if (is_numeric($value)) {
                            // cast to int if integer-like, else float
                            $value = strpos((string)$value, '.') === false ? (int)$value : (float)$value;
                        } else {
                            $value = null;
                        }
                        break;
                    case 'string':
                        if ($value === null) {
                            $value = null;
                        } else {
                            $value = (string)$value;
                        }
                        break;
                    case 'any':
                    default:
                        // leave as-is
                        break;
                }
                self::$nodeOutputs[$handleKey] = $value;
                if (!empty($varName)) {
                    self::setVariable($varName, $value);
                }
            }
        }


        //dd($result);

        $output_edges = $edges->where('source', self::nodeID($node))->where('sourceHandle',
            self::nodeID($node).'-response');
        if (!empty($output_edges->first()['target'])) {
            foreach ($output_edges as $output_edge) {
                $output_node = $nodes->where('id', $output_edge['target']);
                if ($output_node->first()['type'] == 'SetVariable') {
                    self::setVariable($output_node->first()['data']['variableName'], $decodedResult);
                }
            }
        }

        // Record an Action for this webhook invocation
        try {
            $submissionId = self::$data->get('submission')->id ?? null;
            $email = self::$data->get('submission')->email ?? (self::$data->get('request')['email'] ?? null);
        } catch (\Throwable $ex) {
            $submissionId = null;
            $email = null;
        }

        try {
            $act = Action::create([
                 'submission_id' => $submissionId,
                 'email' => $email,
                 'flow_id' => self::$data->get('request')['flow_id'] ?? null,
                 'node_id' => $node->first()['id'] ?? null,
                 'event' => 'webhook_request',
                 'request_body' => $requestBody,
                 'request_headers' => $headers_array ?? [],
                 'response_body' => is_string($result) ? $result : json_encode($result),
                 'response_headers' => $responseHeaders ?? [],
                 'sent_values' => $data ?? [],
                 'meta' => ['url' => $url, 'method' => $method, 'status' => $status, 'duration_ms' => $durationMs]
             ]);
            try { Log::info('RunFlow::doWebhook - Action saved id=' . ($act->id ?? 'n/a')); } catch (\Throwable $_) {}
         } catch (\Throwable $ex) {
             // log failures so developers can see why actions aren't saved
             try { Log::error('RunFlow::doWebhook - Action::create failed: '.$ex->getMessage()); } catch (\Throwable $_) {}
         }

        $next_edge = self::getNextEdge($node);
        if ($next_node = self::getNextNode($next_edge)) {
            self::runNodeFunction($next_node);
        }
    }

    /**
     * Extract a value from a result (array/object) using a dot/bracket path like 'data.lead.id' or 'items[0].id'
     */
    public static function extractValueFromResult($result, ?string $path)
    {
        if ($path === null || $path === '') return null;
        // normalize JSON strings to associative arrays/objects already handled earlier
        $current = $result;
        // convert bracket indexes like [0] into dot notation .0 and also handle string keys
        $normalized = str_replace(['[', ']'], ['.', ''], $path);
        $parts = explode('.', $normalized);
        foreach ($parts as $part) {
            if ($part === '') continue;
            if (is_array($current) && array_key_exists($part, $current)) {
                $current = $current[$part];
            } elseif (is_object($current) && isset($current->{$part})) {
                $current = $current->{$part};
            } elseif (is_array($current) && array_key_exists((int)$part, $current)) {
                $idx = (int)$part;
                $current = $current[$idx];
            } else {
                // not found
                return null;
            }
        }
        return $current;
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
        return self::$edges->where('target', self::nodeID($node))->where('targetHandle', $targetHandle);// ?? self::$edges->where('source', $node->first()['id'])->where('sourceHandle', $node->first()['id'] . '-next');
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
            // if the override source is a webhook mapping (sourceHandle points to webhook mapping handle) we can resolve it from nodeOutputs
            $sourceHandle = $OverrideEdge['sourceHandle'] ?? null;
            if ($sourceHandle && isset(self::$nodeOutputs[$sourceHandle])) {
                $booleanOverride = self::$nodeOutputs[$sourceHandle];
            } else {
                $booleanOverride = self::runReturnFunction($overrideNode);
            }
            //dd($booleanOverride);
            $branch_condition = $booleanOverride;


        } else {
            //dd($node->first());
            $branch_condition = $node->first()['data']['isTrue'] ?? false;
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
            $sourceHandle = $valueOverrideEdge['sourceHandle'] ?? null;
            if ($sourceHandle && isset(self::$nodeOutputs[$sourceHandle])) {
                $valueOverride = self::$nodeOutputs[$sourceHandle];
            } else {
                $valueOverride = self::runReturnFunction($valueOverrideNode);
            }
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
     * Console Log node runtime: log the incoming value (or static fallback) and expose it on a value handle.
     */
    static function doConsoleLog($node): void
    {
        // Determine value: prefer override edge into targetHandle 'value-override'
        $value = null;
        if ($valueOverrideEdge = self::getOverrideEdge($node, 'value-override')->first()) {
            $valueOverrideNode = self::$nodes->where('id', $valueOverrideEdge['source']);
            $sourceHandle = $valueOverrideEdge['sourceHandle'] ?? null;
            if ($sourceHandle && isset(self::$nodeOutputs[$sourceHandle])) {
                $value = self::$nodeOutputs[$sourceHandle];
            } else {
                $value = self::runReturnFunction($valueOverrideNode);
            }
        } else {
            $value = $node->first()['data']['staticValue'] ?? null;
        }

        // Log to PHP error log for server-side visibility
        try {
            Log::info("ConsoleLogNode (".self::nodeID($node).") value: ".print_r($value, true));
        } catch (\Throwable $ex) {
            // ignore logging failures
        }

        // expose on nodeOutputs so downstream override connections can read it
        $handleKey = self::nodeID($node).'-value';
        self::$nodeOutputs[$handleKey] = $value;

        // accumulate console logs in returnData so callers can inspect them
        if (!isset(self::$returnData['consoleLogs'])) self::$returnData['consoleLogs'] = [];
        self::$returnData['consoleLogs'][] = ['node' => self::nodeID($node), 'value' => $value];

        // Create an Action record for this console log
        try {
            // compute submission/email defensively
            try {
                $submissionId = self::$data->get('submission')->id ?? null;
                $email = self::$data->get('submission')->email ?? (self::$data->get('request')['email'] ?? null);
            } catch (\Throwable $ex) {
                $submissionId = null;
                $email = null;
            }

            if (!Schema::hasTable('actions')) {
                Log::warning('RunFlow::doConsoleLog - actions table does not exist. Did you run migrations?');
            }
            $act = Action::create([
                 'submission_id' => $submissionId,
                 'email' => $email,
                 'flow_id' => self::$data->get('request')['flow_id'] ?? null,
                 'node_id' => $node->first()['id'] ?? null,
                 'event' => 'console_log',
                 'request_body' => null,
                 'request_headers' => [],
                 'response_body' => is_string($value) ? $value : json_encode($value),
                 'response_headers' => [],
                 'sent_values' => ['value' => $value],
                 'meta' => []
             ]);
            try { Log::info('RunFlow::doConsoleLog - Action saved id=' . ($act->id ?? 'n/a')); } catch (\Throwable $_) {}
        } catch (\Throwable $ex) {
            try { Log::error('RunFlow::doConsoleLog - Action::create failed: '.$ex->getMessage()); } catch (\Throwable $_) {}
        }

        // continue to next node
        $next_edge = self::getNextEdge($node);
        if ($next_node = self::getNextNode($next_edge)) {
            self::runNodeFunction($next_node);
        }
    }

    /**
     * @param $node
     * @return mixed
     */
    public static function nodeID($node): mixed
    {
        // return the id of the provided node collection's first item, or null when unavailable
        if ($node && is_object($node) && method_exists($node, 'first')) {
            $first = $node->first();
            if (is_array($first) && array_key_exists('id', $first)) return $first['id'];
            if (is_object($first) && isset($first->id)) return $first->id;
            if (is_array($first) && isset($first['id'])) return $first['id'];
        }
        return null;
    }

}
