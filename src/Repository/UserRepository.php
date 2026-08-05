<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\User;
use Doctrine\ORM\EntityRepository;

/** @extends EntityRepository<User> */
class UserRepository extends EntityRepository
{
    /** @return list<User> */
    public function findAllOrdered(): array
    {
        return $this->createQueryBuilder('user')
            ->orderBy('user.id', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
