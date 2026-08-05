<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'users')]
class User
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(name: 'first_name', length: 100)]
    private string $firstName;

    #[ORM\Column(name: 'last_name', length: 100)]
    private string $lastName;

    #[ORM\Column(name: 'is_active', type: 'boolean', options: ['default' => true])]
    private bool $isActive = true;

    #[ORM\Column(length: 10)]
    private string $role;

    public function __construct(string $firstName, string $lastName, bool $isActive, string $role)
    {
        $this->update($firstName, $lastName, $isActive, $role);
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function update(string $firstName, string $lastName, bool $isActive, string $role): void
    {
        $this->firstName = $firstName;
        $this->lastName = $lastName;
        $this->isActive = $isActive;
        $this->role = $role;
    }

    public function setActive(bool $isActive): void
    {
        $this->isActive = $isActive;
    }

    /** @return array{id: int|null, name_first: string, name_last: string, status: bool, role: string} */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name_first' => $this->firstName,
            'name_last' => $this->lastName,
            'status' => $this->isActive,
            'role' => $this->role,
        ];
    }
}
