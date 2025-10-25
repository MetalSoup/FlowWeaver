<?php
namespace App;
use App\Models\Field;

$exampleFlow = '{"edges": [{"id": "xy-edge__entry_1next-form_scbk97kprevious", "source": "entry_1", "target": "form_scbk97k", "sourceHandle": "next", "targetHandle": "previous"}, {"id": "xy-edge__form_90i2pdnnext-form_htdxrhvprevious", "source": "form_90i2pdn", "target": "form_htdxrhv", "sourceHandle": "next", "targetHandle": "previous"}, {"id": "xy-edge__form_scbk97knext-branch_dv0zptkprevious", "source": "form_scbk97k", "target": "branch_dv0zptk", "sourceHandle": "next", "targetHandle": "previous"}, {"id": "xy-edge__branch_dv0zptktrueNext-form_90i2pdnprevious", "source": "branch_dv0zptk", "target": "form_90i2pdn", "sourceHandle": "trueNext", "targetHandle": "previous"}, {"id": "xy-edge__form_htdxrhvnext-rawhtml_ff4wz7mprevious", "source": "form_htdxrhv", "target": "rawhtml_ff4wz7m", "sourceHandle": "next", "targetHandle": "previous"}, {"id": "xy-edge__branch_dv0zptkfalseNext-rawhtml_ff4wz7mprevious", "source": "branch_dv0zptk", "target": "rawhtml_ff4wz7m", "sourceHandle": "falseNext", "targetHandle": "previous"}, {"id": "xy-edge__comparison_flz5sotboolean-value-branch_dv0zptkboolean-override", "source": "comparison_flz5sot", "target": "branch_dv0zptk", "sourceHandle": "boolean-value", "targetHandle": "boolean-override"}, {"id": "xy-edge__getvariable_4rnckndvalue-comparison_flz5sotrightComparand-override", "source": "getvariable_4rncknd", "target": "comparison_flz5sot", "sourceHandle": "value", "targetHandle": "rightComparand-override"}], "nodes": [{"id": "entry_1", "data": {"id": "entry", "label": "Starting point node", "isDeletable": false}, "type": "Entry", "dragging": false, "measured": {"width": 256, "height": 232}, "position": {"x": 100, "y": -220}, "selected": false, "deletable": false}, {"id": "form_scbk97k", "data": {"id": "form_scbk97k", "label": "Form node", "formFields": [{"id": "4bba18b4-6d6c-4462-a9bb-62d31908e738", "value": 2, "active": true}, {"id": "58a08298-0cfd-4bf8-bad6-2dd22c9118c2", "value": 3, "active": true}, {"id": "ca8fea93-3b39-40d3-9dd9-d9449dc4f2aa", "value": 4, "active": true}, {"id": "71b83584-cd14-458d-bf03-1d451accf314", "value": 5, "active": true}]}, "type": "Form", "dragging": false, "measured": {"width": 814, "height": 498}, "position": {"x": 540, "y": 120}, "selected": false}, {"id": "form_90i2pdn", "data": {"id": "form_90i2pdn", "label": "Form node", "formFields": [{"id": "c87792f3-02b5-4cd3-a9c1-65cd1a5ef843", "value": 7, "active": true}, {"id": "b3af4ea3-4f31-4ccf-849e-3b1d80f26bb3", "value": 8, "active": true}, {"id": "886f9a17-b671-4c9f-acb8-fac4f192e6fa", "value": 9, "active": true}, {"id": "6eeafa3b-bec7-4207-a267-604cab2709fa", "value": 10, "active": true}]}, "type": "Form", "dragging": false, "measured": {"width": 814, "height": 498}, "position": {"x": 1920, "y": -220}, "selected": false}, {"id": "form_htdxrhv", "data": {"id": "form_htdxrhv", "label": "Form node", "formFields": [{"id": "c87792f3-02b5-4cd3-a9c1-65cd1a5ef843", "value": 13, "active": true}, {"id": "b3af4ea3-4f31-4ccf-849e-3b1d80f26bb3", "value": 12, "active": true}, {"id": "886f9a17-b671-4c9f-acb8-fac4f192e6fa", "value": 14, "active": true}, {"id": "6eeafa3b-bec7-4207-a267-604cab2709fa", "value": 15, "active": true}]}, "type": "Form", "dragging": false, "measured": {"width": 814, "height": 498}, "position": {"x": 2960, "y": -160}, "selected": false}, {"id": "rawhtml_ff4wz7m", "data": {"id": "rawhtml_ff4wz7m", "html": "<div><h2>Thank you</h2></div>", "label": "RawHtml node"}, "type": "RawHtml", "dragging": false, "measured": {"width": 320, "height": 184}, "position": {"x": 4160, "y": 740}, "selected": false}, {"id": "branch_dv0zptk", "data": {"id": "branch_dv0zptk", "label": "Branch node", "details": {"fields": []}}, "type": "Branch", "dragging": false, "measured": {"width": 194, "height": 226}, "position": {"x": 1600, "y": 400}, "selected": false}, {"id": "comparison_flz5sot", "data": {"id": "comparison_flz5sot", "label": "Comparison node", "operator": ">", "leftComparand": "15", "rightComparand": null}, "type": "Comparison", "dragging": false, "measured": {"width": 264, "height": 336}, "position": {"x": 1160, "y": 760}, "selected": true}, {"id": "getvariable_4rncknd", "data": {"id": "getvariable_4rncknd", "label": "GetVariable node", "variableName": "80"}, "type": "GetVariable", "dragging": false, "measured": {"width": 264, "height": 204}, "position": {"x": 760, "y": 1060}, "selected": false}], "viewport": {"x": 222.43196641217776, "y": 254.1964761488657, "zoom": 0.28717458874925944}}';

// This is a simplified FlowCompiler that takes a flow definition in JSON format
// and compiles it into a sequence of executable steps.

class FlowCompiler
{
    protected $flowDefinition;
    protected $nodes;
    protected $edges;
    protected $compiledSteps = [];
    protected $displayedSteps = [];

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




        //return $this->compiledSteps;
    }

    protected function traverseNode($currentNode)
    {
        $this->compiledSteps[] = $currentNode;

        $outgoingEdges = $this->edges->where('source', $currentNode['id']);

        foreach ($outgoingEdges as $edge) {
            $nextNode = $this->nodes->firstWhere('id', $edge['target']);
            if ($nextNode) {
                $this->traverseNode($nextNode);
            }
        }
    }

    protected function result($compiledSteps)
    {

        foreach ($compiledSteps as $step) {

            if ($step['type'] == 'Form') {

                foreach ($step['data']['formFields'] as $field) {

                    //match field id to default fields
                    $defaultField = \App\DefaultFields::getFields()->firstWhere('id', $field['value']);
                    if (!$defaultField) {

                        $customField = Field::find($field['value']);

                    }
                    $this->displayedSteps[$step['id']]['fields'][] = [
                        'field_id' => $field['value'],
                        'label' => $defaultField['label'] ?? ($customField->label ?? 'Unknown'),
                        'name' => $defaultField['name'] ?? ($customField->name ?? 'unknown'),
                        'type' => $defaultField['type'] ?? $customField->type ?? 'default',
                        'active' => $field['active'],
                    ];
                }
            }

            else if ($step['type'] == 'RawHtml') {

                $this->displayedSteps[$step['id']]['html'] = $step['data']['html'];
            }


        }
        return $this->displayedSteps;
    }



}
