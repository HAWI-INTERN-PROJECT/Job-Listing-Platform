 $table->foreignId('employer_id')->constrained()->onDelete('cascade');
 $table->string('title');
 $table->text('description')->nullable();
 $table->string('location')->nullable();
 $table->enum('status', ['pending', 'approved', 'closed'])->default('pending');<?php

                                                                                use Illuminate\Database\Migrations\Migration;
                                                                                use Illuminate\Database\Schema\Blueprint;
                                                                                use Illuminate\Support\Facades\Schema;

                                                                                return new class extends Migration
                                                                                {
                                                                                    /**
                                                                                     * Run the migrations.
                                                                                     */
                                                                                    public function up(): void
                                                                                    {
                                                                                        Schema::create('job_posts', function (Blueprint $table) {
                                                                                            $table->id();
                                                                                            $table->foreignId('employer_id')->constrained()->onDelete('cascade');
                                                                                            $table->string('title');
                                                                                            $table->text('description')->nullable();
                                                                                            $table->string('location')->nullable();
                                                                                            $table->enum('status', ['pending', 'approved', 'closed'])->default('pending');
                                                                                            $table->timestamps();
                                                                                        });
                                                                                    }

                                                                                    /**
                                                                                     * Reverse the migrations.
                                                                                     */
                                                                                    public function down(): void
                                                                                    {
                                                                                        Schema::dropIfExists('job_posts');
                                                                                    }
                                                                                };
