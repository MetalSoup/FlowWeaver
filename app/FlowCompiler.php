<?php
namespace App;

use App\Models\Field;

class FlowCompiler
{
    protected $flowDefinition;
    protected $nodes;
    protected $edges;
    protected $compiledSteps = [];
    protected $displayedSteps = [];
    protected $visited = [];

    public function __construct($flowJson)
    {
        $this->flowDefinition = json_decode($flowJson, true);
        $this->nodes = collect($this->flowDefinition['nodes']);
        $this->edges = collect($this->flowDefinition['edges']);
    }

    public function compile()
    {
        $startNode = $this->nodes->firstWhere('type', 'Entry');
        if (!$startNode) {
            throw new \Exception("No Entry node found in the flow.");
        }

        $this->traverseNode($startNode);

        return $this->result($this->compiledSteps);
    }

    protected function traverseNode($currentNode)
    {
        $nodeId = $currentNode['id'];

        if (isset($this->visited[$nodeId])) {
            return;
        }
        $this->visited[$nodeId] = true;

        $this->compiledSteps[] = $currentNode;

        $outgoingEdges = $this->edges->where('source', $nodeId);

        foreach ($outgoingEdges as $edge) {
            $nextNode = $this->nodes->firstWhere('id', $edge['target']);
            if ($nextNode) {
                $this->traverseNode($nextNode);
            }
        }
    }

    protected function getIncomingEdges($nodeId)
    {
        return $this->edges->where('target', $nodeId);
    }

    protected function result($compiledSteps)
    {
        $result = [];

        foreach ($compiledSteps as $step) {
            $type = $step['type'] ?? null;

            // Only include Form and RawHtml in final display array
            if ($type === 'Form') {
                $form = [
                    'id' => $step['data']['id'] ?? $step['id'],
                    'node_id' => $step['id'],
                    'type' => 'Form',
                    'fields' => [],
                ];

                foreach ($step['data']['formFields'] ?? [] as $field) {
                    // Prefer the explicit `name` set by the node; fall back to legacy `value` if present
                    $selectedName = $field['name'] ?? $field['value'] ?? null;

                    // Try to resolve against DefaultFields by name first (if available)
                    $defaultField = null;
                    if (method_exists(\App\DefaultFields::class, 'getFields') && $selectedName) {
                        $defaultField = \App\DefaultFields::getFields()->firstWhere('name', $selectedName);
                    }

                    // Try to resolve a persisted Field model. Prefer an explicit field_id stored in the node data.
                    $customField = null;
                    $explicitFieldId = $field['field_id'] ?? null;

                    if (!$defaultField) {
                        if (!empty($explicitFieldId)) {
                            $customField = Field::find($explicitFieldId);
                        } elseif ($selectedName) {
                            $customField = Field::where('name', $selectedName)->first();
                        }
                    }

                    // Build sensible fallbacks safely (avoid accessing properties on null)
                    $label = $field['label'] ??
                             ($defaultField['label'] ?? null) ??
                             ($customField ? $customField->label : null) ??
                             ($selectedName ? ucwords(str_replace('_', ' ', $selectedName)) : 'Unknown');

                    $nameResolved = $defaultField['name'] ?? ($customField ? $customField->name : ($selectedName ?? 'unknown'));

                    $fieldType = $defaultField['type'] ?? ($customField ? $customField->type : 'default');

                    $answers = null;
                    if (isset($defaultField['options']['answers'])) {
                        $answers = $defaultField['options']['answers'];
                    } elseif ($customField && isset($customField->options) && is_array($customField->options) && isset($customField->options['answers'])) {
                        $answers = $customField->options['answers'];
                    }

                    $resolvedFieldId = $customField ? $customField->id : ($explicitFieldId ?? null);

                    $form['fields'][] = [
                        'id' => $field['id'] ?? null,
                        'field_id' => $resolvedFieldId,
                        'label' => $label,
                        'name' => $nameResolved,
                        'type' => $fieldType,
                        'active' => $field['active'] ?? true,
                        'answers' => $answers,
                    ];
                }

                $result[] = $form;
            } elseif ($type === 'RawHtml') {
                $html = $step['data']['html'] ?? null;

                // If raw HTML not present, attempt to build fallback from incoming WebHook
                if (empty($html)) {
                    $incoming = $this->getIncomingEdges($step['id']);
                    foreach ($incoming as $edge) {
                        $sourceNode = $this->nodes->firstWhere('id', $edge['source']);
                        if ($sourceNode && ($sourceNode['type'] ?? '') === 'WebHook') {
                            $url = $sourceNode['data']['url'] ?? 'unknown';
                            $fields = $sourceNode['data']['hookFields'] ?? [];
                            $rows = '';
                            foreach ($fields as $f) {
                                $rows .= "<li>" . htmlspecialchars(($f['key'] ?? 'key')) . ": " . htmlspecialchars((string)($f['value'] ?? '')) . "</li>";
                            }
                            $html = "<div><h2>Webhook response preview</h2><p>Source: " . htmlspecialchars($url) . "</p><ul>{$rows}</ul></div>";
                            break;
                        }
                    }

                    // final fallback
                    if (empty($html)) {
                        $html = '<div><h2>Content received from another node</h2></div>';
                    }
                }

                $result[] = [
                    'id' => $step['data']['id'] ?? $step['id'],
                    'node_id' => $step['id'],
                    'type' => 'RawHtml',
                    'html' => $html,
                ];
            }

            // Other node types can be added if needed (WebHook, Branch, Comparison) to support more advanced compilation.
        }

        return $result;
    }
}
