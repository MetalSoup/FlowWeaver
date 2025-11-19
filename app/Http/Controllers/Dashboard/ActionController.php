<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Action;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActionController extends Controller
{
    public function index(Request $request)
    {
        $query = Action::query()->orderBy('created_at', 'desc');

        // apply site/organization scoping if needed - actions may relate to submissions with site_id
        // We'll keep this simple and allow optional query filters.
        if ($request->filled('node_id')) {
            $query->where('node_id', $request->get('node_id'));
        }
        if ($request->filled('submission_id')) {
            $query->where('submission_id', $request->get('submission_id'));
        }
        if ($request->filled('email')) {
            $query->where('email', $request->get('email'));
        }

        $actions = $query->paginate(25);

        return Inertia::render('Dashboard/Actions/Index', [
            'actions' => $actions
        ]);
    }

    public function show(Action $action)
    {
        return Inertia::render('Dashboard/Actions/Show', [
            'action' => $action
        ]);
    }
}

