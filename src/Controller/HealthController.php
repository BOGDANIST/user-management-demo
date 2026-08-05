<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

final class HealthController
{
    #[Route('/api/health', name: 'api_health', methods: ['GET'])]
    public function index(): JsonResponse
    {
        return new JsonResponse(['status' => true, 'error' => null, 'message' => 'API is available']);
    }
}
