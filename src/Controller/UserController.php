<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use App\Exception\ApiException;
use App\Service\UserService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

final class UserController
{
    public function __construct(private UserService $userService) {}

    #[Route('/api/users', name: 'api_users_index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $users = $this->userService->listUsers();
        return new JsonResponse(['status' => true, 'error' => null, 'users' => $users]);
    }

    #[Route('/api/users/{id}', name: 'api_users_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $user = $this->userService->getUser($id);
        if (!$user instanceof User) {
            return new JsonResponse(['status' => false, 'error' => ['code' => 100, 'message' => 'User not found.']], 404);
        }

        return new JsonResponse(['status' => true, 'error' => null, 'user' => $user->toArray()]);
    }

    #[Route('/api/users', name: 'api_users_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = $request->toArray();
        try {
            $id = $this->userService->createUser($data);
            return new JsonResponse(['status' => true, 'error' => null, 'id' => $id], 201);
        } catch (ApiException $e) {
            return new JsonResponse(['status' => false, 'error' => ['code' => $e->errorCode, 'message' => $e->getMessage(), 'fields' => $e->fields]], $e->httpStatus);
        }
    }

    #[Route('/api/users/{id}', name: 'api_users_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $data = $request->toArray();
        try {
            $this->userService->updateUser($id, $data);
            return new JsonResponse(['status' => true, 'error' => null, 'id' => $id]);
        } catch (ApiException $e) {
            return new JsonResponse(['status' => false, 'error' => ['code' => $e->errorCode, 'message' => $e->getMessage(), 'fields' => $e->fields]], $e->httpStatus);
        }
    }

    #[Route('/api/users/{id}', name: 'api_users_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        try {
            $this->userService->deleteUser($id);
            return new JsonResponse(['status' => true, 'error' => null, 'id' => $id]);
        } catch (ApiException $e) {
            return new JsonResponse(['status' => false, 'error' => ['code' => $e->errorCode, 'message' => $e->getMessage()]], $e->httpStatus);
        }
    }

    #[Route('/api/users/bulk-action', name: 'api_users_bulk', methods: ['POST'])]
    public function bulkAction(Request $request): JsonResponse
    {
        $data = $request->toArray();
        $action = $data['action'] ?? null;
        $ids = $data['ids'] ?? [];

        try {
            $affected = $this->userService->bulkAction((string)$action, $ids);
            return new JsonResponse(['status' => true, 'error' => null, 'affected' => $affected]);
        } catch (ApiException $e) {
            return new JsonResponse(['status' => false, 'error' => ['code' => $e->errorCode, 'message' => $e->getMessage(), 'fields' => $e->fields ?? null]], $e->httpStatus);
        }
    }
}
