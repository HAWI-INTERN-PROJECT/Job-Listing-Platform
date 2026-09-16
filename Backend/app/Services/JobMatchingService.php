<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\EmployeeProfile;
use App\Models\JobPost;

class JobMatchingService
{
    /**
     * Stop words excluded from title and keyword tokenization.
     *
     * @var list<string>
     */
    protected const STOP_WORDS = [
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
        'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
        'to', 'was', 'were', 'will', 'with', 'or', 'we', 'you', 'our',
    ];

    /**
     * Minimum score threshold to qualify as a recommended job match.
     */
    public const MATCH_THRESHOLD = 35;

    /**
     * Compute deterministic algorithmic match between a job post and an employee profile.
     *
     * @return array{is_match: bool, score: int, reasons: array<string, mixed>}
     */
    public function calculateMatch(JobPost $jobPost, EmployeeProfile $profile): array
    {
        $candidateSkills = array_values(array_filter(
            array_map('trim', (array) ($profile->skills ?? []))
        ));

        if (empty($candidateSkills) && empty($profile->headline)) {
            return [
                'is_match' => false,
                'score' => 0,
                'reasons' => [
                    'matched_skills' => [],
                    'title_similarity' => 0,
                    'category_match' => false,
                    'profile_incomplete' => true,
                ],
            ];
        }

        // 1. Skill Overlap Calculation
        $matchedSkills = $this->extractMatchedSkills($candidateSkills, $jobPost);
        $candidateSkillsCount = max(1, count($candidateSkills));
        $skillCoverage = count($matchedSkills) / $candidateSkillsCount;
        $skillScore = (int) round(min(1.0, $skillCoverage * 1.3) * 100);

        // Boost if multiple direct skills matched
        if (count($matchedSkills) >= 3) {
            $skillScore = max($skillScore, 75);
        } elseif (count($matchedSkills) >= 2) {
            $skillScore = max($skillScore, 55);
        } elseif (count($matchedSkills) === 1) {
            $skillScore = max($skillScore, 40);
        }

        // 2. Title & Role Overlap Calculation
        $titleScore = $this->calculateTitleSimilarity($profile->headline ?? '', $jobPost->title);

        // 3. Category, Location, & Preference Alignment
        $preferenceScore = $this->calculatePreferenceAlignment($profile, $jobPost);

        // 4. Composite Algorithmic Score
        // Weight: 55% Skills, 30% Role/Title Alignment, 15% Location/Preference
        $compositeScore = (int) round(
            ($skillScore * 0.55) +
            ($titleScore * 0.30) +
            ($preferenceScore * 0.15)
        );

        $compositeScore = max(0, min(100, $compositeScore));
        $isMatch = $compositeScore >= self::MATCH_THRESHOLD && (! empty($matchedSkills) || $titleScore >= 50);

        return [
            'is_match' => $isMatch,
            'score' => $compositeScore,
            'reasons' => [
                'matched_skills' => $matchedSkills,
                'title_similarity' => $titleScore,
                'category_match' => $this->checkCategoryMatch($profile, $jobPost),
                'is_remote' => (bool) $jobPost->is_remote,
                'matched_skills_count' => count($matchedSkills),
            ],
        ];
    }

    /**
     * Identify which of the candidate's skills appear in the job's title, requirements, responsibilities, or description.
     *
     * @param  list<string>  $candidateSkills
     * @return list<string>
     */
    protected function extractMatchedSkills(array $candidateSkills, JobPost $jobPost): array
    {
        $requirements = is_array($jobPost->requirements) ? implode(' ', $jobPost->requirements) : '';
        $responsibilities = is_array($jobPost->responsibilities) ? implode(' ', $jobPost->responsibilities) : '';

        $haystack = mb_strtolower(
            $jobPost->title . ' ' .
            $jobPost->description . ' ' .
            $requirements . ' ' .
            $responsibilities . ' ' .
            ($jobPost->category !== null ? $jobPost->category->name : '')
        );

        $matched = [];
        foreach ($candidateSkills as $skill) {
            $normalizedSkill = trim(mb_strtolower($skill));
            if ($normalizedSkill === '') {
                continue;
            }

            // Word-boundary or direct token occurrence match
            $escaped = preg_quote($normalizedSkill, '/');
            if (preg_match('/(?:\b|[\s\-_,\.\/]|^)' . $escaped . '(?:\b|[\s\-_,\.\/]|$)/i', $haystack)) {
                $matched[] = $skill;
            } elseif (str_contains($haystack, $normalizedSkill)) {
                $matched[] = $skill;
            }
        }

        return array_values(array_unique($matched));
    }

    /**
     * Calculate token-based Jaccard/overlap similarity between candidate headline and job title.
     */
    protected function calculateTitleSimilarity(string $headline, string $jobTitle): int
    {
        $headlineTokens = $this->tokenize($headline);
        $titleTokens = $this->tokenize($jobTitle);

        if (empty($headlineTokens) || empty($titleTokens)) {
            return 0;
        }

        $intersection = array_intersect($headlineTokens, $titleTokens);
        $overlapCount = count($intersection);

        if ($overlapCount === 0) {
            return 0;
        }

        $similarity = $overlapCount / count($titleTokens);

        return (int) round(min(1.0, $similarity * 1.5) * 100);
    }

    /**
     * Check preference alignment (remote compatibility, location, job type).
     */
    protected function calculatePreferenceAlignment(EmployeeProfile $profile, JobPost $jobPost): int
    {
        $score = 40; // Base baseline

        if ($jobPost->is_remote) {
            $score += 30;
        } elseif ($profile->location && $jobPost->location) {
            $candLoc = mb_strtolower(trim($profile->location));
            $jobLoc = mb_strtolower(trim($jobPost->location));
            if (str_contains($jobLoc, $candLoc) || str_contains($candLoc, $jobLoc)) {
                $score += 30;
            }
        }

        if ($profile->preferred_job_type !== null && $profile->preferred_job_type !== '') {
            $prefType = mb_strtolower(trim($profile->preferred_job_type));
            $jobTypeValue = mb_strtolower($jobPost->job_type->value);
            if ($prefType === $jobTypeValue) {
                $score += 30;
            }
        }

        return min(100, $score);
    }

    /**
     * Check if job category matches candidate bio or headline.
     */
    protected function checkCategoryMatch(EmployeeProfile $profile, JobPost $jobPost): bool
    {
        $categoryName = $jobPost->category?->name;
        if (! $categoryName) {
            return false;
        }

        $haystack = mb_strtolower(($profile->headline ?? '') . ' ' . ($profile->bio ?? ''));

        return str_contains($haystack, mb_strtolower($categoryName));
    }

    /**
     * Clean and split a string into lowercase distinct word tokens.
     *
     * @return list<string>
     */
    protected function tokenize(string $text): array
    {
        $clean = preg_replace('/[^\p{L}\p{N}]+/u', ' ', mb_strtolower($text));
        if (! $clean) {
            return [];
        }

        $tokens = array_filter(
            explode(' ', $clean),
            fn (string $t): bool => mb_strlen($t) >= 2 && ! in_array($t, self::STOP_WORDS, true)
        );

        return array_values(array_unique($tokens));
    }
}
