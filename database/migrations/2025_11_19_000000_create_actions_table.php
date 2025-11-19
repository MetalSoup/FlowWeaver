<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('actions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('submission_id')->nullable();
            $table->string('email')->nullable();
            $table->unsignedBigInteger('flow_id')->nullable();
            $table->string('node_id')->nullable();
            $table->string('event')->nullable();
            $table->text('request_body')->nullable();
            $table->json('request_headers')->nullable();
            $table->text('response_body')->nullable();
            $table->json('response_headers')->nullable();
            $table->json('sent_values')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('actions');
    }
};

