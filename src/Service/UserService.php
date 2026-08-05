<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\User;
use App\Exception\ApiException;
use Doctrine\Persistence\ManagerRegistry;

final class UserService
{
    public function __construct(private ManagerRegistry $doctrine) {}

    /** @return array<int,mixed> */
    public function listUsers(): array
    {
        $repo = $this->doctrine->getRepository(User::class);
        return array_map(fn(User $u) => $u->toArray(), $repo->findBy([], ['id' => 'DESC']));
    }

    public function getUser(int $id): ?User
    {
        $repo = $this->doctrine->getRepository(User::class);
        return $repo->find($id);
    }

    public function createUser(array $data): int
    {
        [$firstName, $lastName, $isActive, $role] = $this->validateUserData($data);

        $em = $this->doctrine->getManager();
        $user = new User($firstName, $lastName, $isActive, $role);
        $em->persist($user);
        $em->flush();

        return $user->getId();
    }

    public function updateUser(int $id, array $data): void
    {
        $repo = $this->doctrine->getRepository(User::class);
        $user = $repo->find($id);
        if (!$user instanceof User) {
            throw new ApiException(100, 'User not found.', 404);
        }

        [$firstName, $lastName, $isActive, $role] = $this->validateUserData($data);

        $em = $this->doctrine->getManager();
        $user->update($firstName, $lastName, $isActive, $role);
        $em->flush();
    }

    public function deleteUser(int $id): void
    {
        $repo = $this->doctrine->getRepository(User::class);
        $user = $repo->find($id);
        if (!$user instanceof User) {
            throw new ApiException(100, 'User not found.', 404);
        }

        $em = $this->doctrine->getManager();
        $em->remove($user);
        $em->flush();
    }

    /**
     * Perform bulk action. Returns number of affected users.
     */
    public function bulkAction(string $action, array $ids): int
    {
        if (!in_array($action, ['set_active','set_not_active','delete'], true)) {
            throw new ApiException(102, 'Invalid bulk action.', 400);
        }

        if (!is_array($ids) || $ids === []) {
            throw new ApiException(101, 'Select at least one user.', 422, ['ids' => 'Select at least one user.']);
        }

        $em = $this->doctrine->getManager();
        $repo = $this->doctrine->getRepository(User::class);
        $users = [];
        foreach ($ids as $id) {
            $parsed = filter_var($id, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
            if ($parsed === false) {
                throw new ApiException(101, 'Invalid user identifier.', 422, ['ids' => 'Invalid user identifier.']);
            }
            $user = $repo->find((int)$parsed);
            if (!$user instanceof User) {
                throw new ApiException(100, 'User not found.', 404);
            }
            $users[] = $user;
        }

        foreach ($users as $user) {
            if ($action === 'delete') {
                $em->remove($user);
                continue;
            }
            $user->setActive($action === 'set_active');
        }
        $em->flush();

        return count($users);
    }

    /** @return array{string,string,bool,string} */
    private function validateUserData(array $data): array
    {
        $firstName = trim((string)($data['name_first'] ?? $data['first_name'] ?? ''));
        $lastName = trim((string)($data['name_last'] ?? $data['last_name'] ?? ''));
        $role = strtolower(trim((string)($data['role'] ?? '')));
        $status = $data['status'] ?? $data['is_active'] ?? null;
        $fields = [];

        if ($firstName === '') {
            $fields['name_first'] = 'First name is required.';
        }
        if ($lastName === '') {
            $fields['name_last'] = 'Last name is required.';
        }
        if (!in_array($role, ['admin','user'], true)) {
            $fields['role'] = 'Role must be admin or user.';
        }

        $isActive = filter_var($status, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if (!array_key_exists('status', $data) && !array_key_exists('is_active', $data)) {
            $fields['status'] = 'Status is required.';
        } elseif ($isActive === null) {
            $fields['status'] = 'Status must be true or false.';
        }

        if ($fields !== []) {
            throw new ApiException(101, 'Validation failed.', 422, $fields);
        }

        return [$firstName, $lastName, $isActive, $role];
    }
}
