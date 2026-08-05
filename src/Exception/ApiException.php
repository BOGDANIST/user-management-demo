<?php

declare(strict_types=1);

namespace App\Exception;

use RuntimeException;

final class ApiException extends RuntimeException
{
    public readonly int $errorCode;
    public readonly int $httpStatus;
    public readonly array $fields;

    public function __construct(int $errorCode, string $message, int $httpStatus = 400, array $fields = [])
    {
        $this->errorCode = $errorCode;
        $this->httpStatus = $httpStatus;
        $this->fields = $fields;
        parent::__construct($message);
    }
}
